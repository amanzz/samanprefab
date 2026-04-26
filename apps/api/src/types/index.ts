import type { Request } from 'express';
import type { User } from '@saman-prefab/db';

export interface AuthenticatedRequest extends Request {
  user?: Pick<User, 'id' | 'email' | 'role' | 'name' | 'avatar'>;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
  received?: unknown;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  retryAfter?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
}

export interface ListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: ListMeta;
}
