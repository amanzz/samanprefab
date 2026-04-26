import { z } from 'zod';

export const listCitiesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  state: z.string().optional(),
  zone: z.enum(['north', 'south', 'east', 'west', 'central', 'northeast']).optional(),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.enum(['name', 'state', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type ListCitiesQuery = z.infer<typeof listCitiesQuerySchema>;
