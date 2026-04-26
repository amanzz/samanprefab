import type { Request, Response, NextFunction } from 'express';
import { logNotFound } from '../modules/not-found-log/not-found-log.service';

export function notFoundMiddleware(req: Request, res: Response, _next: NextFunction) {
  logNotFound(req).catch(() => null);

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
