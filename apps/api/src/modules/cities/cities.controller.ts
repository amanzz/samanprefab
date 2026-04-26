import type { Request, Response, NextFunction } from 'express';
import * as citiesService from './cities.service';
import type { ListCitiesQuery } from './cities.schema';

export async function listCities(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await citiesService.listCities(req.query as unknown as ListCitiesQuery);
    // No cache for admin, public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    }
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function getCity(req: Request, res: Response, next: NextFunction) {
  try {
    const city = await citiesService.getCityBySlug(req.params.slug);
    // No cache for admin, public cache for frontend
    const isAuthenticated = !!(req as any).user;
    if (isAuthenticated) {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    }
    res.json({ success: true, data: city });
  } catch (err) {
    next(err);
  }
}
