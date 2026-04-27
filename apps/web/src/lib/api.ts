export const API_CONFIG = {
  baseURL: (() => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return url.endsWith('/api/v1') ? url.replace(/\/$/, '') : `${url}/api/v1`;
  })(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  endpoints: {
    products: '/products',
    quotes: '/quotes',
    seo: '/city-seo-pages',
    media: '/media',
    settings: '/settings',
    redirects: '/redirects',
    cities: '/cities',
    categories: '/categories',
    attributes: '/attributes',
    notFoundLog: '/not-found-log',
    posts: '/posts',
    postCategories: '/post-categories',
    postTags: '/post-tags',
    aiSettings: '/ai-settings',
  },
  assetUrl: (path: string | null | undefined): string => {
    if (!path || path.trim() === '') return '/placeholder.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // For development: use rewrite rule (/uploads/* proxied to API)
    // For production: use full absolute URL
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && path.startsWith('/uploads/')) {
      return path; // Use rewrite rule in next.config.ts
    }

    // Production: Always return full absolute URL
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/v1\/?$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  }
};

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}
