import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from './error.middleware';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        received: e.code === 'invalid_type' ? (e as { received?: unknown }).received : undefined,
      }));
      next(new ValidationError('Validation failed', details));
      return;
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        received: e.code === 'invalid_type' ? (e as { received?: unknown }).received : undefined,
      }));
      next(new ValidationError('Validation failed', details));
      return;
    }
    req.query = result.data as typeof req.query;
    next();
  };
}
