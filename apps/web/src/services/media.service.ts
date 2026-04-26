import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import { MediaFile, MediaListResponse } from '@/types/media.types';

export const mediaService = {
  getAll: (params?: Record<string, any>) => {
    const searchParams = new URLSearchParams(params).toString();
    const endpoint = `${API_CONFIG.endpoints.media}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<MediaListResponse>(endpoint);
  },

  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // When using FormData, fetch automatically sets the correct Content-Type header with boundary
    // So we need to ensure we don't force application/json
    return customFetch<MediaFile>(API_CONFIG.endpoints.media, {
      method: 'POST',
      body: formData,
      headers: {
        // Let browser set the boundary for multipart/form-data
      },
    });
  },

  delete: (id: string) => {
    return customFetch<void>(`${API_CONFIG.endpoints.media}/${id}`, {
      method: 'DELETE',
    });
  },

  updateMetadata: (id: string, data: { altText?: string; title?: string; caption?: string }) => {
    return customFetch<MediaFile>(`${API_CONFIG.endpoints.media}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
