import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const notFoundLog = pgTable('not_found_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  path: varchar('path', { length: 500 }).notNull(),
  count: integer('count').default(1),
  referrer: varchar('referrer', { length: 500 }),
  userAgent: varchar('user_agent', { length: 500 }),
  lastSeenAt: timestamp('last_seen_at').notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at'),
}, (t) => ({
  pathIdx: index('not_found_path_idx').on(t.path),
}));

export type NotFoundLog = typeof notFoundLog.$inferSelect;
export type NewNotFoundLog = typeof notFoundLog.$inferInsert;
