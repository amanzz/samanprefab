import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import { Redirect, RedirectListResponse } from '@/types/redirect.types';

export const redirectService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.redirects}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<RedirectListResponse>(endpoint);
  },

  create: (data: Partial<Redirect>) => {
    return customFetch<Redirect>(API_CONFIG.endpoints.redirects, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<Redirect>) => {
    return customFetch<Redirect>(`${API_CONFIG.endpoints.redirects}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string) => {
    return customFetch<void>(`${API_CONFIG.endpoints.redirects}/${id}`, {
      method: 'DELETE',
    });
  },
};
