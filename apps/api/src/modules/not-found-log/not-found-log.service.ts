import { db, notFoundLog } from '@saman-prefab/db';
import { eq, desc, count, sql } from 'drizzle-orm';
import type { Request } from 'express';

export async function logNotFound(req: Request) {
  const path = req.path;

  const existing = await db.query.notFoundLog.findFirst({
    where: eq(notFoundLog.path, path),
  });

  if (existing) {
    await db
      .update(notFoundLog)
      .set({
        count: sql`${notFoundLog.count} + 1`,
        referrer: req.get('referer') ?? existing.referrer,
        userAgent: req.get('user-agent') ?? existing.userAgent,
        lastSeenAt: new Date(),
      })
      .where(eq(notFoundLog.id, existing.id));
  } else {
    await db.insert(notFoundLog).values({
      path,
      referrer: req.get('referer') ?? null,
      userAgent: req.get('user-agent') ?? null,
      lastSeenAt: new Date(),
    });
  }
}

export async function listNotFoundLog(page = 1, limit = 50) {
  const offset = (page - 1) * limit;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(notFoundLog)
      .orderBy(desc(notFoundLog.count))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notFoundLog),
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

export async function markResolved(id: string) {
  await db
    .update(notFoundLog)
    .set({ resolvedAt: new Date() })
    .where(eq(notFoundLog.id, id));
}
