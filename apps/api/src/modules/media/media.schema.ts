import { z } from 'zod';

export const uploadMediaSchema = z.object({
  altText: z.string().max(255).optional(),
  folder: z.string().max(100).optional().default('general'),
});

export const listMediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  folder: z.string().optional(),
  sortBy: z.enum(['createdAt', 'filename', 'sizeBytes']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type ListMediaQuery = z.infer<typeof listMediaQuerySchema>;
