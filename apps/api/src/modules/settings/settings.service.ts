import { db, settings } from '@saman-prefab/db';
import { eq, inArray } from 'drizzle-orm';
import type { UpdateSettingInput } from './settings.schema';

export async function getAllSettings() {
  return db.select().from(settings).orderBy(settings.key);
}

export async function getPublicSettings() {
  const PUBLIC_KEYS = [
    'site_name',
    'site_url',
    'site_phone',
    'site_email',
    'whatsapp_number',
    'gtm_id',
  ];
  const rows = await db
    .select()
    .from(settings)
    .where(inArray(settings.key, PUBLIC_KEYS));
  return rows;
}

export async function getSettingByKey(key: string) {
  return db.query.settings.findFirst({ where: eq(settings.key, key) });
}

export async function upsertSetting(input: UpdateSettingInput, updatedBy?: string) {
  const [row] = await db
    .insert(settings)
    .values({
      key: input.key,
      value: input.value,
      label: input.label,
      type: input.type ?? 'string',
      updatedBy: updatedBy ?? null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: input.value,
        ...(input.label ? { label: input.label } : {}),
        ...(input.type ? { type: input.type } : {}),
        updatedAt: new Date(),
        updatedBy: updatedBy ?? null,
      },
    })
    .returning();
  return row;
}

export async function bulkUpsertSettings(
  inputs: UpdateSettingInput[],
  updatedBy?: string
) {
  const results = await Promise.all(
    inputs.map((s) => upsertSetting(s, updatedBy))
  );
  return results;
}

export function toMap(rows: { key: string; value: string }[]): Record<string, string> {
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
