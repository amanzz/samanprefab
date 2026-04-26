import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const redirects = pgTable('redirects', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromPath: varchar('from_path', { length: 500 }).notNull().unique(),
  toPath: varchar('to_path', { length: 500 }).notNull(),
  statusCode: integer('status_code').notNull().default(301),
  isActive: boolean('is_active').default(true),
  hitCount: integer('hit_count').default(0),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Redirect = typeof redirects.$inferSelect;
export type NewRedirect = typeof redirects.$inferInsert;
