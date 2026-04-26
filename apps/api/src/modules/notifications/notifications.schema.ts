import { z } from 'zod';

export const createNotificationSchema = z.object({
  type: z.enum(['lead', 'quote', 'product', 'system']),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  data: z.record(z.any()).optional().default({}),
  actionUrl: z.string().url().optional(),
});

export const markAsReadSchema = z.object({
  ids: z.array(z.string().uuid()),
});

export const listNotificationsQuerySchema = z.object({
  type: z.enum(['lead', 'quote', 'product', 'system']).optional(),
  unreadOnly: z.coerce.boolean().optional().default(false),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type MarkAsReadInput = z.infer<typeof markAsReadSchema>;
export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;
