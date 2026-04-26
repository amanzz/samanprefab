import {
  pgTable,
  uuid,
  varchar,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { products } from './products';

export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 255 }).notNull(),
  size: varchar('size', { length: 100 }),
  material: varchar('material', { length: 100 }),
  finish: varchar('finish', { length: 100 }),
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  unit: varchar('unit', { length: 50 }).notNull().default('unit'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
