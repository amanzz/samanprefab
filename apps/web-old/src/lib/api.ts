export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code: string = 'UNKNOWN_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string; details?: unknown[] };
}

const API_BASE =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000') + '/api/v1'
    : '/api'; // Use Next.js proxy for client-side (same-origin, cookies work)

async function apiFetch<T>(
  path: string,
  init?: RequestInit & { cookies?: string }
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string>),
  };

  if (init?.cookies) {
    headers['cookie'] = init.cookies;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers,
  });

  const json = (await res.json()) as ApiResponse<T> | ApiErrorResponse;

  if (!res.ok || !json.success) {
    const err = json as ApiErrorResponse;
    throw new ApiError(
      res.status,
      err.error?.message ?? 'Request failed',
      err.error?.code ?? 'UNKNOWN_ERROR'
    );
  }

  return json as ApiResponse<T>;
}

export const api = {
  get: <T>(path: string, cookies?: string) =>
    apiFetch<T>(path, { method: 'GET', cookies }),

  post: <T>(path: string, body: unknown, cookies?: string) =>
    apiFetch<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      cookies,
    }),

  put: <T>(path: string, body: unknown, cookies?: string) =>
    apiFetch<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      cookies,
    }),

  patch: <T>(path: string, body: unknown, cookies?: string) =>
    apiFetch<T>(path, {
      method: 'PATCH',
      body: JSON.stringify(body),
      cookies,
    }),

  del: <T>(path: string, cookies?: string) =>
    apiFetch<T>(path, { method: 'DELETE', cookies }),
};
