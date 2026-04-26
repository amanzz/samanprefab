import type { Request, Response, NextFunction } from 'express';
import * as service from './city-seo-pages.service';
import type {
  CreateCitySeoPageInput,
  UpdateCitySeoPageInput,
  ListCitySeoQuery,
  BulkActivateInput,
} from './city-seo-pages.schema';

export async function listCitySeoPages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listCitySeoPages(req.query as unknown as ListCitySeoQuery);
    res.set('Cache-Control', 'no-store, no-cache');
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getCitySeoPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await service.getCitySeoPageBySlug(req.params.slug);
    // No cache for admin, public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function createCitySeoPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await service.createCitySeoPage(req.body as CreateCitySeoPageInput);
    res.status(201).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function updateCitySeoPage(req: Request, res: Response, next: NextFunction) {
  try {
    const page = await service.updateCitySeoPage(
      req.params.id,
      req.body as UpdateCitySeoPageInput
    );
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

export async function bulkActivateCitySeoPages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.bulkActivateCitySeoPages(req.body as BulkActivateInput);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
