import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import { Setting } from '@/types/settings.types';

export const settingsService = {
  getAll: () => {
    return customFetch<Setting[]>(API_CONFIG.endpoints.settings);
  },

  update: (key: string, value: any) => {
    return customFetch<Setting>(`${API_CONFIG.endpoints.settings}/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  },
};
