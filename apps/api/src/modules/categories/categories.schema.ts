import { z } from 'zod';

const slugPattern = z
  .string()
  .min(2)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only');

export const createCategorySchema = z.object({
  slug: slugPattern,
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const listCategoriesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>;
