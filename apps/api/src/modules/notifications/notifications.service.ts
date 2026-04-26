import { db, notifications } from '@saman-prefab/db';
import { eq, desc, and, count } from 'drizzle-orm';
import type {
  CreateNotificationInput,
  MarkAsReadInput,
  ListNotificationsQuery,
} from './notifications.schema';

export async function createNotification(input: CreateNotificationInput) {
  const [notification] = await db
    .insert(notifications)
    .values({
      type: input.type,
      title: input.title,
      description: input.description,
      data: input.data,
      actionUrl: input.actionUrl,
      read: false,
    })
    .returning();
  return notification;
}

export async function listNotifications(query: ListNotificationsQuery) {
  const { type, unreadOnly, limit, offset } = query;

  const conditions = [];
  if (type) conditions.push(eq(notifications.type, type));
  if (unreadOnly) conditions.push(eq(notifications.read, false));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, [{ value: total }]] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(notifications).where(whereClause),
  ]);

  const totalNum = Number(total);
  return {
    items: rows,
    meta: {
      limit,
      offset,
      total: totalNum,
      hasMore: offset + limit < totalNum,
    },
  };
}

export async function getUnreadCount() {
  const [result] = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(eq(notifications.read, false));
  return result?.count ?? 0;
}

export async function markAsRead(input: MarkAsReadInput) {
  if (input.ids.length === 0) return { success: true };

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, input.ids[0]));

  for (let i = 1; i < input.ids.length; i++) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, input.ids[i]));
  }

  return { success: true };
}

export async function markAllAsRead() {
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.read, false));
  return { success: true };
}
