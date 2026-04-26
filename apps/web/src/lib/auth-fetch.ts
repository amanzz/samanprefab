interface FetchOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function authFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const { skipRefresh = false, ...fetchOptions } = options;

  const response = await fetch(url, {
    credentials: 'include',
    ...fetchOptions,
  });

  if (response.status === 401 && !skipRefresh) {
    try {
      const refreshRes = await fetch('/api/admin/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        return authFetch(url, { ...fetchOptions, skipRefresh: true });
      } else {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/login';
        }
        return response;
      }
    } catch {
      return response;
    }
  }

  return response;
}
