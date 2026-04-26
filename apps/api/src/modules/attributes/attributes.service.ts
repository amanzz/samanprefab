import { db, productAttributes, attributeValues } from '@saman-prefab/db';
import { eq, asc, and } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateAttributeInput,
  UpdateAttributeInput,
  ListAttributesQuery,
  CreateAttributeValueInput,
  UpdateAttributeValueInput,
} from './attributes.schema';

export async function listAttributes(query: ListAttributesQuery) {
  const { type, isActive } = query;

  const conditions = [];
  if (type) conditions.push(eq(productAttributes.type, type));
  if (isActive !== undefined) conditions.push(eq(productAttributes.isActive, isActive));

  const attrs = await db
    .select()
    .from(productAttributes)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(productAttributes.sortOrder), asc(productAttributes.name));

  // Attach values for each attribute
  const vals = await db
    .select()
    .from(attributeValues)
    .orderBy(asc(attributeValues.sortOrder), asc(attributeValues.value));

  return attrs.map((a) => ({
    ...a,
    values: vals.filter((v) => v.attributeId === a.id),
  }));
}

export async function getAttributeById(id: string) {
  const attr = await db.query.productAttributes.findFirst({
    where: eq(productAttributes.id, id),
  });
  if (!attr) throw new AppError(404, 'Attribute not found', 'NOT_FOUND');
  const vals = await db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.attributeId, id))
    .orderBy(asc(attributeValues.sortOrder), asc(attributeValues.value));
  return { ...attr, values: vals };
}

// ─── Attribute Values ─────────────────────────────────────────────────────────

export async function listAttributeValues(attributeId: string) {
  await getAttributeById(attributeId);
  return db
    .select()
    .from(attributeValues)
    .where(eq(attributeValues.attributeId, attributeId))
    .orderBy(asc(attributeValues.sortOrder), asc(attributeValues.value));
}

export async function createAttributeValue(attributeId: string, input: CreateAttributeValueInput) {
  await getAttributeById(attributeId);
  const [val] = await db
    .insert(attributeValues)
    .values({
      attributeId,
      value: input.value,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return val;
}

export async function updateAttributeValue(id: string, input: UpdateAttributeValueInput) {
  const existing = await db.query.attributeValues.findFirst({ where: eq(attributeValues.id, id) });
  if (!existing) throw new AppError(404, 'Attribute value not found', 'NOT_FOUND');
  const [updated] = await db
    .update(attributeValues)
    .set(input)
    .where(eq(attributeValues.id, id))
    .returning();
  return updated;
}

export async function deleteAttributeValue(id: string) {
  const existing = await db.query.attributeValues.findFirst({ where: eq(attributeValues.id, id) });
  if (!existing) throw new AppError(404, 'Attribute value not found', 'NOT_FOUND');
  await db.delete(attributeValues).where(eq(attributeValues.id, id));
}

export async function createAttribute(input: CreateAttributeInput) {
  const [attr] = await db.insert(productAttributes).values(input).returning();
  return attr;
}

export async function updateAttribute(id: string, input: UpdateAttributeInput) {
  await getAttributeById(id);
  const [updated] = await db
    .update(productAttributes)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(productAttributes.id, id))
    .returning();
  return updated;
}

export async function deleteAttribute(id: string) {
  await getAttributeById(id);
  await db.delete(productAttributes).where(eq(productAttributes.id, id));
}
