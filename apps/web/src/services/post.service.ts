import { customFetch } from '@/lib/fetch';
import { API_CONFIG } from '@/lib/api';
import type { Post, PostCategory, PostTag, CreatePostPayload, PostListResult } from '@/types/post.types';

// ─── Posts ─────────────────────────────────────────────────────────────────────

export const postService = {
  getAll: (params?: Record<string, any>): Promise<PostListResult> => {
    const searchParams = new URLSearchParams(
      Object.fromEntries(Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    const endpoint = `${API_CONFIG.endpoints.posts}${searchParams ? `?${searchParams}` : ''}`;
    return customFetch<PostListResult>(endpoint);
  },

  getBySlug: (slug: string): Promise<Post> =>
    customFetch<Post>(`${API_CONFIG.endpoints.posts}/${slug}`),

  getById: (id: string): Promise<Post> =>
    customFetch<Post>(`${API_CONFIG.endpoints.posts}/${id}`),

  create: (data: CreatePostPayload): Promise<Post> =>
    customFetch<Post>(API_CONFIG.endpoints.posts, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<CreatePostPayload>): Promise<Post> =>
    customFetch<Post>(`${API_CONFIG.endpoints.posts}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    customFetch<void>(`${API_CONFIG.endpoints.posts}/${id}`, { method: 'DELETE' }),
};

// ─── Post Categories ────────────────────────────────────────────────────────────

export const postCategoryService = {
  getAll: (): Promise<PostCategory[]> =>
    customFetch<PostCategory[]>(API_CONFIG.endpoints.postCategories),

  create: (data: { name: string; slug?: string; description?: string; parentId?: string; sortOrder?: number }): Promise<PostCategory> =>
    customFetch<PostCategory>(API_CONFIG.endpoints.postCategories, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; slug: string; description: string; parentId: string; sortOrder: number }>): Promise<PostCategory> =>
    customFetch<PostCategory>(`${API_CONFIG.endpoints.postCategories}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    customFetch<void>(`${API_CONFIG.endpoints.postCategories}/${id}`, { method: 'DELETE' }),
};

// ─── Post Tags ─────────────────────────────────────────────────────────────────

export const postTagService = {
  getAll: (): Promise<PostTag[]> =>
    customFetch<PostTag[]>(API_CONFIG.endpoints.postTags),

  create: (data: { name: string; slug?: string }): Promise<PostTag> =>
    customFetch<PostTag>(API_CONFIG.endpoints.postTags, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<{ name: string; slug: string }>): Promise<PostTag> =>
    customFetch<PostTag>(`${API_CONFIG.endpoints.postTags}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    customFetch<void>(`${API_CONFIG.endpoints.postTags}/${id}`, { method: 'DELETE' }),
};
