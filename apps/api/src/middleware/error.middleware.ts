import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorDetail } from '../types/index';

const STATUS_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'SLUG_CONFLICT',
  429: 'RATE_LIMITED',
};

export class AppError extends Error {
  public readonly code: string;

  constructor(
    public statusCode: number,
    message: string,
    code?: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code ?? STATUS_CODES[statusCode] ?? 'INTERNAL_ERROR';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public details: ApiErrorDetail[]
  ) {
    super(400, message, 'VALIDATION_ERROR');
  }
}

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: err.message, details: err.details },
    });
    return;
  }

  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      success: false,
      error: { code: err.code, message: err.message },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}
