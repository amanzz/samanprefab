import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryListResponse {
  items: Category[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}

export const categoryService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.categories}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<CategoryListResponse>(endpoint);
  },

  create: (data: { name: string; slug: string; description?: string; parentId?: string }) =>
    customFetch<Category>(API_CONFIG.endpoints.categories, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Category>) =>
    customFetch<Category>(`${API_CONFIG.endpoints.categories}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    customFetch<void>(`${API_CONFIG.endpoints.categories}/${id}`, {
      method: 'DELETE',
    }),
};
