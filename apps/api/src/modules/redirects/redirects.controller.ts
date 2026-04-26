import type { Request, Response, NextFunction } from 'express';
import * as service from './redirects.service';
import type {
  CreateRedirectInput,
  UpdateRedirectInput,
  ListRedirectsQuery,
} from './redirects.schema';
import type { AuthenticatedRequest } from '../../types/index';

export async function listRedirects(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listRedirects(req.query as unknown as ListRedirectsQuery);
    res.set('Cache-Control', 'no-store, no-cache');
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function checkRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const fromPath = req.query.path as string;
    if (!fromPath) {
      res.json({ success: true, data: null });
      return;
    }
    const redirect = await service.findRedirectByPath(fromPath);
    if (redirect) {
      service.incrementHitCount(redirect.id).catch(() => null);
    }
    res.json({ success: true, data: redirect ?? null });
  } catch (err) {
    next(err);
  }
}

export async function createRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const redirect = await service.createRedirect(req.body as CreateRedirectInput, userId);
    res.status(201).json({ success: true, data: redirect });
  } catch (err) {
    next(err);
  }
}

export async function updateRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    const redirect = await service.updateRedirect(
      req.params.id,
      req.body as UpdateRedirectInput
    );
    res.json({ success: true, data: redirect });
  } catch (err) {
    next(err);
  }
}

export async function deleteRedirect(req: Request, res: Response, next: NextFunction) {
  try {
    await service.deleteRedirect(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
