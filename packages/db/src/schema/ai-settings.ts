import { pgTable, uuid, text, varchar, boolean, integer, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const aiContextEnum = pgEnum('ai_context', ['global', 'product', 'blog']);

export const aiSettings = pgTable('ai_settings', {
  id:             uuid('id').primaryKey().defaultRandom(),
  context:        aiContextEnum('context').notNull().unique(),
  systemPrompt:   text('system_prompt').notNull().default(''),
  tone:           varchar('tone', { length: 100 }).default('professional'),
  targetKeywords: text('target_keywords').default(''),
  language:       varchar('language', { length: 50 }).default('English'),
  contentRules:   jsonb('content_rules').default({}),
  isActive:       boolean('is_active').default(true).notNull(),
  createdAt:      timestamp('created_at').defaultNow().notNull(),
  updatedAt:      timestamp('updated_at').defaultNow().notNull(),
});

export const aiGenerationLog = pgTable('ai_generation_log', {
  id:            uuid('id').primaryKey().defaultRandom(),
  context:       aiContextEnum('context').notNull(),
  actionType:    varchar('action_type', { length: 50 }).notNull(),
  inputSummary:  varchar('input_summary', { length: 500 }).default(''),
  outputPreview: text('output_preview').default(''),
  durationMs:    integer('duration_ms'),
  tokensUsed:    integer('tokens_used'),
  success:       boolean('success').default(true).notNull(),
  errorMessage:  text('error_message'),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
});

export type AISettingRow      = typeof aiSettings.$inferSelect;
export type NewAISetting      = typeof aiSettings.$inferInsert;
export type AIGenerationLogRow = typeof aiGenerationLog.$inferSelect;
