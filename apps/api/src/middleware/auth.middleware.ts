import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index';
import { AppError } from './error.middleware';
import type { AuthenticatedRequest } from '../types/index';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
  avatar?: string;
}

export function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  const cookieToken = (req as AuthenticatedRequest & { cookies?: Record<string, string> }).cookies
    ?.token;
  const headerToken = req.headers.authorization?.split(' ')[1];
  const token = cookieToken ?? headerToken;

  if (!token) {
    next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role as 'super_admin' | 'content_editor' | 'sales_agent',
      name: payload.name,
      avatar: payload.avatar,
    };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'INVALID_TOKEN'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions', 'FORBIDDEN'));
      return;
    }
    next();
  };
}
