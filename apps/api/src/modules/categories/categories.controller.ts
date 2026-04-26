import type { Request, Response, NextFunction } from 'express';
import * as categoriesService from './categories.service';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from './categories.schema';

export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await categoriesService.listCategories(
      req.query as unknown as ListCategoriesQuery
    );
    // No cache for admin, public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.getCategoryBySlug(req.params.slug);
    // No cache for admin, public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.createCategory(req.body as CreateCategoryInput);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoriesService.updateCategory(
      req.params.id,
      req.body as UpdateCategoryInput
    );
    res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    await categoriesService.deleteCategory(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
