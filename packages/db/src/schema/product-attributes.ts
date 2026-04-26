import {
  pgTable,
  uuid,
  varchar,
  integer,
  jsonb,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const attributeTypeEnum = pgEnum('attribute_type', ['text', 'number', 'select']);

export const productAttributes = pgTable('product_attributes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  unit: varchar('unit', { length: 50 }),
  type: attributeTypeEnum('type').default('text').notNull(),
  options: jsonb('options').default([]),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const attributeValues = pgTable('attribute_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  attributeId: uuid('attribute_id').notNull().references(() => productAttributes.id, { onDelete: 'cascade' }),
  value: varchar('value', { length: 200 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ProductAttribute = typeof productAttributes.$inferSelect;
export type NewProductAttribute = typeof productAttributes.$inferInsert;
export type AttributeValue = typeof attributeValues.$inferSelect;
export type NewAttributeValue = typeof attributeValues.$inferInsert;
