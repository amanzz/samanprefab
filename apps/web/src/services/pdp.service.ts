import 'server-only';

import type { PdpProduct, PublicListResponse, PublicSettingsMap } from '@/types/pdp-product.types';

const API_BASE = (() => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
})();
const DEFAULT_REVALIDATE = 300;

type ApiEnvelope<T> = {
  success?: boolean;
  data: T;
  meta?: PublicListResponse<unknown>['meta'];
};

function buildUrl(path: string, params?: Record<string, string | number | undefined>) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

async function fetchApi<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    next: { revalidate: DEFAULT_REVALIDATE },
  });

  if (!response.ok) {
    const error = new Error(`API request failed: ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const result = (await response.json()) as ApiEnvelope<T>;
  return result.data;
}

export async function getPublicProductBySlug(slug: string): Promise<PdpProduct> {
  return fetchApi<PdpProduct>(`/products/public/${slug}`);
}

export async function listPublicProducts(params?: Record<string, string | number | undefined>) {
  const response = await fetch(buildUrl('/products/public', params), {
    next: { revalidate: DEFAULT_REVALIDATE },
  });

  if (!response.ok) {
    const error = new Error(`API request failed: ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const result = (await response.json()) as ApiEnvelope<PdpProduct[]> & {
    meta: PublicListResponse<PdpProduct>['meta'];
  };

  return {
    items: result.data,
    meta: result.meta,
  } satisfies PublicListResponse<PdpProduct>;
}

export async function getPublicSettings(): Promise<PublicSettingsMap> {
  return fetchApi<PublicSettingsMap>('/settings/public');
}
