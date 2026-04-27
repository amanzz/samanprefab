import { API_CONFIG, ApiError } from './api';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  const headers: Record<string, string> = {
    ...API_CONFIG.headers,
    ...(options.headers as Record<string, string>),
  };

  // Add Authorization header if token exists in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const defaultOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  };

  let retries = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  while (retries <= maxRetries) {
    try {
      const response = await fetch(url, defaultOptions);

      // Handle 429 rate limiting with exponential backoff
      if (response.status === 429 && retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries);
        await sleep(delay);
        retries++;
        continue;
      }

      if (response.status === 204) {
        return null as any;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError(`HTTP error! status: ${response.status}`, 'HTTP_ERROR');
        }
        return null as any;
      }

      const result = await response.json();

      // 1. Handle explicit API errors
      if (!response.ok) {
        const errorMsg = result?.error?.message || result?.message || `HTTP error! status: ${response.status}`;
        throw new ApiError(
          errorMsg,
          result?.error?.code || result?.code || 'UNKNOWN_ERROR',
          result?.error?.details || result?.details
        );
      }

      // 2. Handle ApiResponse structure { success, data, meta, error }
      if (typeof result === 'object' && result !== null && 'success' in result) {
        if (!result.success) {
          const errorMsg = result.error?.message || 'API Error';
          throw new ApiError(
            errorMsg,
            result.error?.code || 'API_ERROR',
            result.error?.details
          );
        }

        // Handle list normalization if meta and data array exist
        if (result.meta && Array.isArray(result.data)) {
          return {
            items: result.data,
            meta: result.meta,
          } as unknown as T;
        }

        return result.data as T;
      }

      // 3. Handle data-only structure { data, meta }
      if (typeof result === 'object' && result !== null && 'data' in result && !('success' in result)) {
        if (result.meta && Array.isArray(result.data)) {
          return {
            items: result.data,
            meta: result.meta,
          } as unknown as T;
        }
        return result.data as T;
      }

      // 4. Handle raw arrays or other direct objects
      return result as T;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        'NETWORK_ERROR'
      );
    }
  }

  throw new ApiError('API rate limit exceeded. Please try again later.', 'RATE_LIMIT_EXCEEDED');
}
