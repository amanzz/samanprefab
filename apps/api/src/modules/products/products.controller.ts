import type { Request, Response, NextFunction } from 'express';
import * as productsService from './products.service';
import type { ListProductsQuery, CreateProductInput, UpdateProductInput } from './products.schema';

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await productsService.listProducts(req.query as unknown as ListProductsQuery);
    // No cache for authenticated users (admin panel), public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    }
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function listPublicProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = {
      ...(req.query as unknown as ListProductsQuery),
      status: 'published' as const,
    };
    const result = await productsService.listPublicProducts(query);
    res.set('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=60');
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const param = req.params.slug;
    // Support both slug-based (public) and UUID-based (admin) lookups
    const product = UUID_RE.test(param)
      ? await productsService.getProductById(param)
      : await productsService.getProductBySlug(param);
    // No cache for authenticated users (admin panel), public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function getPublicProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.getPublicProductBySlug(req.params.slug);
    res.set('Cache-Control', 'public, max-age=600, s-maxage=600');
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.createProduct(req.body as CreateProductInput);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await productsService.updateProduct(
      req.params.id,
      req.body as UpdateProductInput
    );
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    await productsService.deleteProduct(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
