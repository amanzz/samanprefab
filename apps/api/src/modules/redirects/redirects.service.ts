import { db, redirects } from '@saman-prefab/db';
import { eq, ilike, and, count, desc, asc, sql } from 'drizzle-orm';
import { AppError } from '../../middleware/error.middleware';
import type {
  CreateRedirectInput,
  UpdateRedirectInput,
  ListRedirectsQuery,
} from './redirects.schema';

export async function listRedirects(query: ListRedirectsQuery) {
  const { page, limit, search, isActive, sortBy, sortOrder } = query;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(redirects.fromPath, `%${search}%`));
  if (isActive !== undefined) conditions.push(eq(redirects.isActive, isActive));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const orderCol = redirects[sortBy as keyof typeof redirects] ?? redirects.createdAt;
  const orderFn = sortOrder === 'asc' ? asc : desc;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(redirects)
      .where(whereClause)
      .orderBy(orderFn(orderCol as Parameters<typeof asc>[0]))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(redirects).where(whereClause),
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

export async function findRedirectByPath(fromPath: string) {
  return db.query.redirects.findFirst({
    where: and(eq(redirects.fromPath, fromPath), eq(redirects.isActive, true)),
  });
}

export async function createRedirect(input: CreateRedirectInput, createdBy?: string) {
  const existing = await db.query.redirects.findFirst({
    where: eq(redirects.fromPath, input.fromPath),
  });
  if (existing) {
    throw new AppError(409, `A redirect from '${input.fromPath}' already exists`, 'SLUG_CONFLICT');
  }
  const [redirect] = await db
    .insert(redirects)
    .values({ ...input, createdBy: createdBy ?? null })
    .returning();
  return redirect;
}

export async function updateRedirect(id: string, input: UpdateRedirectInput) {
  const existing = await db.query.redirects.findFirst({ where: eq(redirects.id, id) });
  if (!existing) throw new AppError(404, 'Redirect not found', 'NOT_FOUND');

  if (input.fromPath && input.fromPath !== existing.fromPath) {
    const conflict = await db.query.redirects.findFirst({
      where: eq(redirects.fromPath, input.fromPath),
    });
    if (conflict) {
      throw new AppError(409, `A redirect from '${input.fromPath}' already exists`, 'SLUG_CONFLICT');
    }
  }

  const [updated] = await db
    .update(redirects)
    .set(input)
    .where(eq(redirects.id, id))
    .returning();
  return updated;
}

export async function deleteRedirect(id: string) {
  const existing = await db.query.redirects.findFirst({ where: eq(redirects.id, id) });
  if (!existing) throw new AppError(404, 'Redirect not found', 'NOT_FOUND');
  await db.delete(redirects).where(eq(redirects.id, id));
  return { id };
}

export async function incrementHitCount(id: string) {
  await db
    .update(redirects)
    .set({ hitCount: sql`${redirects.hitCount} + 1` })
    .where(eq(redirects.id, id));
}
