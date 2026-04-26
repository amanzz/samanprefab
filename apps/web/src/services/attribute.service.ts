import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';

export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  sortOrder: number;
  createdAt?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  unit?: string | null;
  type: 'text' | 'number' | 'select';
  options?: string[];
  isActive: boolean;
  sortOrder: number;
  values?: AttributeValue[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAttributePayload {
  name: string;
  unit?: string;
  type?: 'text' | 'number' | 'select';
  options?: string[];
  isActive?: boolean;
  sortOrder?: number;
}

export const attributeService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.attributes}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<ProductAttribute[]>(endpoint);
  },

  create: (data: CreateAttributePayload) =>
    customFetch<ProductAttribute>(API_CONFIG.endpoints.attributes, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreateAttributePayload>) =>
    customFetch<ProductAttribute>(`${API_CONFIG.endpoints.attributes}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    customFetch<void>(`${API_CONFIG.endpoints.attributes}/${id}`, {
      method: 'DELETE',
    }),

  // ─── Attribute Values ───────────────────────────────────────────────
  getValues: (attributeId: string) =>
    customFetch<AttributeValue[]>(`${API_CONFIG.endpoints.attributes}/${attributeId}/values`),

  createValue: (attributeId: string, data: { value: string; sortOrder?: number }) =>
    customFetch<AttributeValue>(`${API_CONFIG.endpoints.attributes}/${attributeId}/values`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateValue: (attributeId: string, valueId: string, data: { value?: string; sortOrder?: number }) =>
    customFetch<AttributeValue>(`${API_CONFIG.endpoints.attributes}/${attributeId}/values/${valueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteValue: (attributeId: string, valueId: string) =>
    customFetch<void>(`${API_CONFIG.endpoints.attributes}/${attributeId}/values/${valueId}`, {
      method: 'DELETE',
    }),
};
