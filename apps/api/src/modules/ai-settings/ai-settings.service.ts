import { db, aiSettings, aiGenerationLog } from '@saman-prefab/db';
import { eq, desc } from 'drizzle-orm';
import type { UpsertAISettingInput, CreateLogInput } from './ai-settings.schema';

export async function getAllAISettings() {
  return db.select().from(aiSettings).orderBy(aiSettings.context);
}

export async function getAISettingByContext(context: 'global' | 'product' | 'blog') {
  return db.query.aiSettings.findFirst({ where: eq(aiSettings.context, context) });
}

export async function upsertAISetting(
  context: 'global' | 'product' | 'blog',
  input: UpsertAISettingInput
) {
  const [row] = await db
    .insert(aiSettings)
    .values({
      context,
      systemPrompt: input.systemPrompt,
      tone: input.tone,
      targetKeywords: input.targetKeywords,
      language: input.language,
      contentRules: input.contentRules,
      isActive: input.isActive ?? true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: aiSettings.context,
      set: {
        systemPrompt: input.systemPrompt,
        tone: input.tone,
        targetKeywords: input.targetKeywords,
        language: input.language,
        contentRules: input.contentRules,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      },
    })
    .returning();
  return row;
}

export async function createLog(input: CreateLogInput) {
  const [row] = await db.insert(aiGenerationLog).values({
    context: input.context,
    actionType: input.actionType,
    inputSummary: input.inputSummary,
    outputPreview: input.outputPreview,
    durationMs: input.durationMs,
    tokensUsed: input.tokensUsed,
    success: input.success ?? true,
    errorMessage: input.errorMessage,
  }).returning();
  return row;
}

export async function getGenerationLogs(limit = 50) {
  return db
    .select()
    .from(aiGenerationLog)
    .orderBy(desc(aiGenerationLog.createdAt))
    .limit(limit);
}

export async function getLogStats() {
  const rows = await db.select().from(aiGenerationLog).orderBy(desc(aiGenerationLog.createdAt)).limit(500);
  const total   = rows.length;
  const success = rows.filter((r) => r.success).length;
  const failed  = total - success;
  const byContext = rows.reduce((acc, r) => {
    acc[r.context] = (acc[r.context] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const byAction = rows.reduce((acc, r) => {
    acc[r.actionType] = (acc[r.actionType] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const avgDuration = rows.filter((r) => r.durationMs).reduce((s, r) => s + (r.durationMs ?? 0), 0) / (success || 1);
  return { total, success, failed, byContext, byAction, avgDurationMs: Math.round(avgDuration) };
}
