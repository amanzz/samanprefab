import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  jsonb,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { cities } from './cities';
import { productCategories } from './categories';

export const citySeoPages = pgTable('city_seo_pages', {
  id: uuid('id').primaryKey().defaultRandom(),
  cityId: uuid('city_id').notNull().references(() => cities.id),
  productCategoryId: uuid('product_category_id').notNull().references(() => productCategories.id),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 165 }),
  h1Override: varchar('h1_override', { length: 200 }),
  customBlocks: jsonb('custom_blocks'),
  aiGeneratedContent: text('ai_generated_content'),
  internalLinks: jsonb('internal_links'),
  priority: integer('priority').default(50),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  cityProductUniq: uniqueIndex('city_product_uniq').on(t.cityId, t.productCategoryId),
}));

export type CitySeoPage = typeof citySeoPages.$inferSelect;
export type NewCitySeoPage = typeof citySeoPages.$inferInsert;
