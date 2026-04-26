import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import { Quote, QuoteStatus, QuoteListResponse } from '@/types/quote.types';

export const quoteService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.quotes}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<QuoteListResponse>(endpoint);
  },

  getById: (id: string) => {
    return customFetch<Quote>(`${API_CONFIG.endpoints.quotes}/${id}`);
  },

  create: (data: any) => {
    return customFetch<Quote>(API_CONFIG.endpoints.quotes, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: (id: string, status: QuoteStatus) => {
    return customFetch<Quote>(`${API_CONFIG.endpoints.quotes}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  updateNotes: (id: string, adminNotes: string) => {
    return customFetch<Quote>(`${API_CONFIG.endpoints.quotes}/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNotes }),
    });
  },
};
