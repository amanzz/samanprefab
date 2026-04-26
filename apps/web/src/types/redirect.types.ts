import { BaseEntity } from './base.types';

export interface Redirect extends BaseEntity {
  fromPath: string;
  toPath: string;
  statusCode: number;
  isActive: boolean;
  notes?: string;
}

export interface RedirectListResponse {
  items: Redirect[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
