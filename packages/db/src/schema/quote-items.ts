import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { quotes } from './quotes';
import { products } from './products';
import { productVariants } from './product-variants';

export const quoteItems = pgTable('quote_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  variantLabel: varchar('variant_label', { length: 255 }),
  quantity: integer('quantity').notNull().default(1),
  unit: varchar('unit', { length: 50 }).notNull().default('unit'),
  estimatedPriceMin: integer('estimated_price_min'),
  estimatedPriceMax: integer('estimated_price_max'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type QuoteItem = typeof quoteItems.$inferSelect;
export type NewQuoteItem = typeof quoteItems.$inferInsert;
