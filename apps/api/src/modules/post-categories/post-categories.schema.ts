import { z } from 'zod';

export const createPostCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().max(255).optional(),
  description: z.string().optional(),
  parentId: z.string().uuid().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updatePostCategorySchema = createPostCategorySchema.partial();

export const listPostCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(100),
});

export type CreatePostCategoryInput = z.infer<typeof createPostCategorySchema>;
export type UpdatePostCategoryInput = z.infer<typeof updatePostCategorySchema>;
export type ListPostCategoriesQuery = z.infer<typeof listPostCategoriesQuerySchema>;
