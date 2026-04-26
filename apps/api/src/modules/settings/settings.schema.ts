import { z } from 'zod';

export const updateSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
  label: z.string().max(200).optional(),
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  category: z.string().max(50).optional(),
});

export const bulkUpdateSettingsSchema = z.object({
  settings: z.array(updateSettingSchema).min(1).max(50),
});

export type UpdateSettingInput = z.infer<typeof updateSettingSchema>;
export type BulkUpdateSettingsInput = z.infer<typeof bulkUpdateSettingsSchema>;
