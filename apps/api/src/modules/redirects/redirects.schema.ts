import { z } from 'zod';

const pathField = z
  .string()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith('/'), { message: 'Path must start with /' });

export const createRedirectSchema = z.object({
  fromPath: pathField,
  toPath: z.string().min(1).max(500),
  statusCode: z.literal(301).or(z.literal(302)).default(301),
  isActive: z.boolean().default(true),
});

export const updateRedirectSchema = createRedirectSchema.partial();

export const listRedirectsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(50),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'hitCount', 'fromPath']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateRedirectInput = z.infer<typeof createRedirectSchema>;
export type UpdateRedirectInput = z.infer<typeof updateRedirectSchema>;
export type ListRedirectsQuery = z.infer<typeof listRedirectsQuerySchema>;
