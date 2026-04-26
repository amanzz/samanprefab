import { db, productCategories } from '@saman-prefab/db';
import { eq, ilike, and, isNull, count, asc } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ListCategoriesQuery,
} from './categories.schema';

export async function listCategories(query: ListCategoriesQuery) {
  const { page, limit, search, parentId } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(productCategories.name, `%${search}%`));
  if (parentId === null) {
    conditions.push(isNull(productCategories.parentId));
  } else if (parentId) {
    conditions.push(eq(productCategories.parentId, parentId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(productCategories)
      .where(whereClause)
      .orderBy(asc(productCategories.sortOrder), asc(productCategories.name))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(productCategories).where(whereClause),
  ]);

  const totalNum = Number(total);
  return {
    items: rows,
    meta: {
      page,
      limit,
      total: totalNum,
      totalPages: Math.ceil(totalNum / limit),
      hasNext: page * limit < totalNum,
      hasPrev: page > 1,
    },
  };
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.query.productCategories.findFirst({
    where: eq(productCategories.slug, slug),
  });
  if (!category) throw new AppError(404, 'Category not found', 'NOT_FOUND');
  return category;
}

export async function getCategoryById(id: string) {
  const category = await db.query.productCategories.findFirst({
    where: eq(productCategories.id, id),
  });
  if (!category) throw new AppError(404, 'Category not found', 'NOT_FOUND');
  return category;
}

export async function createCategory(input: CreateCategoryInput) {
  const existing = await db.query.productCategories.findFirst({
    where: eq(productCategories.slug, input.slug),
  });
  if (existing) throw new AppError(409, 'A category with this slug already exists', 'SLUG_CONFLICT');

  const [category] = await db.insert(productCategories).values(input).returning();
  return category;
}

export async function deleteCategory(id: string) {
  await getCategoryById(id);
  await db.delete(productCategories).where(eq(productCategories.id, id));
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id);

  if (input.slug) {
    const existing = await db.query.productCategories.findFirst({
      where: eq(productCategories.slug, input.slug),
    });
    if (existing && existing.id !== id) {
      throw new AppError(409, 'A category with this slug already exists', 'SLUG_CONFLICT');
    }
  }

  const [updated] = await db
    .update(productCategories)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(productCategories.id, id))
    .returning();
  return updated;
}
