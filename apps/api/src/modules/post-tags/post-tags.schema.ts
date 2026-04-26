import { z } from 'zod';

export const createPostTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().max(100).optional(),
});

export const updatePostTagSchema = createPostTagSchema.partial();

export type CreatePostTagInput = z.infer<typeof createPostTagSchema>;
export type UpdatePostTagInput = z.infer<typeof updatePostTagSchema>;
