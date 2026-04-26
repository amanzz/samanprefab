import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';

export interface NotFoundEntry {
  id: string;
  path: string;
  count: number;
  referrer: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  resolvedAt: string | null;
}

export interface NotFoundListResponse {
  items: NotFoundEntry[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}

export const notFoundLogService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.notFoundLog}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<NotFoundListResponse>(endpoint);
  },

  resolve: (id: string) => {
    return customFetch<void>(`${API_CONFIG.endpoints.notFoundLog}/${id}/resolve`, {
      method: 'PATCH',
    });
  },
};
