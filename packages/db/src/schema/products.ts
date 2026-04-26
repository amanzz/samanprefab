import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  jsonb,
  boolean,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { productCategories } from './categories';

export const productStatusEnum = pgEnum('product_status', ['draft', 'published', 'archived']);

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  sku: varchar('sku', { length: 100 }),
  shortDescription: varchar('short_description', { length: 200 }),
  description: text('description'),
  categoryId: uuid('category_id').references(() => productCategories.id),
  specifications: jsonb('specifications').default({}),
  features: jsonb('features').default([]),
  applications: jsonb('applications').default([]),
  images: jsonb('images').default([]),
  featuredImage: varchar('featured_image', { length: 500 }),
  documents: jsonb('documents').default([]),
  priceMin: integer('price_min'),
  priceMax: integer('price_max'),
  priceText: varchar('price_text', { length: 120 }),
  priceUnit: varchar('price_unit', { length: 50 }).default('unit'),
  leadTimeDays: jsonb('lead_time_days'),
  faqs: jsonb('faqs').default([]),
  customButtons: jsonb('custom_buttons').default([]),
  isFeatured: boolean('is_featured').default(false),
  showFeatures: boolean('show_features').default(true),
  showApplications: boolean('show_applications').default(true),
  showFaq: boolean('show_faq').default(true),
  status: productStatusEnum('status').default('draft'),
  sectionOrder: jsonb('section_order').default(['features', 'applications', 'faq']),
  deliveryTime: varchar('delivery_time', { length: 100 }),
  warranty: varchar('warranty', { length: 100 }),
  installationTime: varchar('installation_time', { length: 100 }),
  metaTitle: varchar('meta_title', { length: 65 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  focusKeyword: varchar('focus_keyword', { length: 100 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
