import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';

export interface City {
  id: string;
  name: string;
  slug: string;
  state: string;
}

export interface CityListResponse {
  items: City[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}

export const cityService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.cities}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<CityListResponse>(endpoint);
  },
};
