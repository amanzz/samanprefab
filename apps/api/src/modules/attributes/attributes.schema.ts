import { z } from 'zod';

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  unit: z.string().max(50).optional(),
  type: z.enum(['text', 'number', 'select']).default('text'),
  options: z.array(z.string()).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateAttributeSchema = createAttributeSchema.partial();

export const listAttributesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(200).default(100),
  type: z.enum(['text', 'number', 'select']).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const createAttributeValueSchema = z.object({
  value: z.string().min(1, 'Value is required').max(200),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateAttributeValueSchema = createAttributeValueSchema.partial();

export type CreateAttributeInput = z.infer<typeof createAttributeSchema>;
export type UpdateAttributeInput = z.infer<typeof updateAttributeSchema>;
export type ListAttributesQuery = z.infer<typeof listAttributesQuerySchema>;
export type CreateAttributeValueInput = z.infer<typeof createAttributeValueSchema>;
export type UpdateAttributeValueInput = z.infer<typeof updateAttributeValueSchema>;
