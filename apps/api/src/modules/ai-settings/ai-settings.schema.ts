import { z } from 'zod';

export const aiContextSchema = z.enum(['global', 'product', 'blog']);

export const upsertAISettingSchema = z.object({
  systemPrompt:   z.string().max(5000).default(''),
  tone:           z.string().max(100).default('professional'),
  targetKeywords: z.string().max(500).default(''),
  language:       z.string().max(50).default('English'),
  contentRules:   z.record(z.any()).optional().default({}),
  isActive:       z.boolean().optional().default(true),
});

export const createLogSchema = z.object({
  context:      aiContextSchema,
  actionType:   z.string().max(50),
  inputSummary: z.string().max(500).optional().default(''),
  outputPreview:z.string().optional().default(''),
  durationMs:   z.number().int().optional(),
  tokensUsed:   z.number().int().optional(),
  success:      z.boolean().default(true),
  errorMessage: z.string().optional(),
});

export type UpsertAISettingInput = z.infer<typeof upsertAISettingSchema>;
export type CreateLogInput       = z.infer<typeof createLogSchema>;
