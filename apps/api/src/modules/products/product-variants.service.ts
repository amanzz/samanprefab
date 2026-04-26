import { db, productVariants } from '@saman-prefab/db';
import { eq, and, count, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type { CreateVariantInput, UpdateVariantInput } from './products.schema';
import { getProductById } from './products.service';

export async function listVariants(productId: string) {
  await getProductById(productId);
  const rows = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
    .orderBy(asc(productVariants.sortOrder));
  return rows;
}

export async function createVariant(productId: string, input: CreateVariantInput) {
  await getProductById(productId);

  if (input.isDefault) {
    await db
      .update(productVariants)
      .set({ isDefault: false })
      .where(eq(productVariants.productId, productId));
  }

  const [variant] = await db
    .insert(productVariants)
    .values({
      productId,
      label: input.label,
      size: input.size,
      material: input.material,
      finish: input.finish,
      priceMin: input.priceMin,
      priceMax: input.priceMax,
      unit: input.unit ?? 'unit',
      isDefault: input.isDefault ?? false,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return variant;
}

export async function getVariantById(id: string) {
  const variant = await db.query.productVariants.findFirst({
    where: eq(productVariants.id, id),
  });
  if (!variant) throw new AppError(404, 'Variant not found', 'NOT_FOUND');
  return variant;
}

export async function updateVariant(id: string, input: UpdateVariantInput) {
  const variant = await getVariantById(id);

  if (input.isDefault === true) {
    await db
      .update(productVariants)
      .set({ isDefault: false })
      .where(eq(productVariants.productId, variant.productId));
  }

  const [updated] = await db
    .update(productVariants)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(productVariants.id, id))
    .returning();
  return updated;
}

export async function deleteVariant(id: string) {
  const variant = await getVariantById(id);

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(productVariants)
    .where(
      and(eq(productVariants.productId, variant.productId), eq(productVariants.isActive, true))
    );

  if (Number(total) <= 1) {
    throw new AppError(400, 'Cannot delete the last active variant', 'VALIDATION_ERROR');
  }

  await db.delete(productVariants).where(eq(productVariants.id, id));
}
