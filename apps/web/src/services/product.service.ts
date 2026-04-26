import { customFetch } from '@/lib/fetch';
import { Product, ProductListResponse, ProductStatus } from '@/types/product.types';
import { API_CONFIG } from '@/lib/api';

export const productService = {
  getAll: (params?: Record<string, any>) => {
    const normalizedParams = { ...params };
    
    // Ensure status is always uppercase if present
    if (normalizedParams.status) {
      normalizedParams.status = String(normalizedParams.status).toUpperCase();
    }

    const searchParams = new URLSearchParams();
    Object.entries(normalizedParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `${API_CONFIG.endpoints.products}${queryString ? `?${queryString}` : ''}`;
    
    return customFetch<ProductListResponse>(endpoint);
  },

  getById: (id: string) => {
    return customFetch<Product>(`${API_CONFIG.endpoints.products}/${id}`);
  },

  getBySlug: (slug: string) => {
    return customFetch<Product>(`${API_CONFIG.endpoints.products}/${slug}`);
  },

  create: (data: Partial<Product>) => {
    return customFetch<Product>(API_CONFIG.endpoints.products, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: Partial<Product>) => {
    return customFetch<Product>(`${API_CONFIG.endpoints.products}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string) => {
    return customFetch<void>(`${API_CONFIG.endpoints.products}/${id}`, {
      method: 'DELETE',
    });
  },
};
