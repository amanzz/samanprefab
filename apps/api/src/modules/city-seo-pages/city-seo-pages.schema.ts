import { z } from 'zod';

export const createCitySeoPageSchema = z.object({
  cityId: z.string().uuid(),
  productCategoryId: z.string().uuid(),
  slug: z
    .string()
    .min(5)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  status: z.enum(['draft', 'published', 'noindex']).default('draft'),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(165).optional(),
  h1Override: z.string().max(200).optional(),
  customBlocks: z.array(z.record(z.unknown())).optional(),
  aiGeneratedContent: z.string().optional(),
  internalLinks: z.array(z.object({ text: z.string(), href: z.string() })).optional(),
  priority: z.number().int().min(0).max(100).optional().default(50),
});

export const updateCitySeoPageSchema = createCitySeoPageSchema.partial();

export const listCitySeoQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  cityId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  status: z.enum(['draft', 'published', 'noindex']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'slug']).default('priority'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const bulkActivateSchema = z.object({
  cityIds: z.array(z.string().uuid()).min(1).max(100),
  categoryIds: z.array(z.string().uuid()).min(1).max(20),
  statusTarget: z.enum(['published', 'draft']).default('published'),
});

export type CreateCitySeoPageInput = z.infer<typeof createCitySeoPageSchema>;
export type UpdateCitySeoPageInput = z.infer<typeof updateCitySeoPageSchema>;
export type ListCitySeoQuery = z.infer<typeof listCitySeoQuerySchema>;
export type BulkActivateInput = z.infer<typeof bulkActivateSchema>;
