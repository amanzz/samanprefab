import type { Request, Response, NextFunction } from 'express';
import * as service from './not-found-log.service';
import { AppError } from '../../middleware/error.middleware';
import { config } from '../../config/index';

export async function listNotFoundLog(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10), 200);
    const result = await service.listNotFoundLog(page, limit);
    res.set('Cache-Control', 'no-store, no-cache');
    res.json({ success: true, data: result.items, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

export async function logNotFoundExternal(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['x-internal-token'];
    if (token !== config.internal.apiSecret) {
      throw new AppError(401, 'Invalid internal token', 'UNAUTHORIZED');
    }
    const { path, referrer, userAgent } = req.body as {
      path: string;
      referrer?: string;
      userAgent?: string;
    };
    if (!path) throw new AppError(400, 'path is required', 'VALIDATION_ERROR');

    const fakeReq = {
      path,
      get: (h: string) => {
        if (h === 'referer') return referrer;
        if (h === 'user-agent') return userAgent;
        return undefined;
      },
    } as unknown as Request;

    await service.logNotFound(fakeReq);
    res.json({ success: true, data: { logged: path } });
  } catch (err) {
    next(err);
  }
}

export async function markResolved(req: Request, res: Response, next: NextFunction) {
  try {
    await service.markResolved(req.params.id);
    res.json({ success: true, data: { id: req.params.id, resolvedAt: new Date() } });
  } catch (err) {
    next(err);
  }
}
