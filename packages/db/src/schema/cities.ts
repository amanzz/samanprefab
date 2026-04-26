import { pgTable, uuid, varchar, boolean, timestamp, real } from 'drizzle-orm/pg-core';

export const cities = pgTable('cities', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  state: varchar('state', { length: 100 }).notNull(),
  stateSlug: varchar('state_slug', { length: 100 }).notNull(),
  zone: varchar('zone', { length: 20 }).default('central'),
  pincode: varchar('pincode', { length: 10 }),
  latitude: real('latitude'),
  longitude: real('longitude'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
