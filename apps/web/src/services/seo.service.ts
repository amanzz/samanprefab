import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import { CitySeoPage, CitySeoPageListResponse } from '@/types/seo.types';

export const seoService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
    }
    const queryString = searchParams.toString();
    const endpoint = `${API_CONFIG.endpoints.seo}${queryString ? `?${queryString}` : ''}`;
    return customFetch<CitySeoPageListResponse>(endpoint);
  },

  getById: (id: string) => {
    return customFetch<CitySeoPage>(`${API_CONFIG.endpoints.seo}/${id}`);
  },

  create: (data: Partial<CitySeoPage>) => {
    return customFetch<CitySeoPage>(API_CONFIG.endpoints.seo, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<CitySeoPage>) => {
    return customFetch<CitySeoPage>(`${API_CONFIG.endpoints.seo}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getBySlug: (citySlug: string, productSlug: string) => {
    return customFetch<CitySeoPage>(`${API_CONFIG.endpoints.seo}/slug/${citySlug}/${productSlug}`);
  },
};
