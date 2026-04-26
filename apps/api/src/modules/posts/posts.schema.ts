import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().max(255).optional(),
  content: z.record(z.any()).optional().default({}),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().max(500).optional(),
  status: z.enum(['draft', 'published']).default('draft'),
  metaTitle: z.string().max(65).optional(),
  metaDescription: z.string().max(160).optional(),
  canonicalUrl: z.string().max(500).optional(),
  ogTitle: z.string().max(200).optional(),
  ogDescription: z.string().max(300).optional(),
  ogImage: z.string().max(500).optional(),
  twitterTitle: z.string().max(200).optional(),
  twitterDescription: z.string().max(300).optional(),
  twitterImage: z.string().max(500).optional(),
  categoryIds: z.array(z.string().uuid()).optional().default([]),
  tagIds: z.array(z.string().uuid()).optional().default([]),
});

export const updatePostSchema = createPostSchema.partial();

export const listPostsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['draft', 'published']).optional(),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  tagId: z.string().uuid().optional(),
  sortBy: z.enum(['createdAt', 'publishedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;
