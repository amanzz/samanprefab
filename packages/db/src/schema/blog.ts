import {
  pgTable,
  uuid,
  varchar,
  text,
  jsonb,
  integer,
  timestamp,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const postStatusEnum = pgEnum('post_status', ['draft', 'published']);

// ─── Posts ─────────────────────────────────────────────────────────────────────

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: jsonb('content').default({}),
  excerpt: text('excerpt'),
  featuredImage: varchar('featured_image', { length: 500 }),
  status: postStatusEnum('status').default('draft').notNull(),
  authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
  // SEO
  metaTitle: varchar('meta_title', { length: 65 }),
  metaDescription: varchar('meta_description', { length: 160 }),
  canonicalUrl: varchar('canonical_url', { length: 500 }),
  // Open Graph
  ogTitle: varchar('og_title', { length: 200 }),
  ogDescription: varchar('og_description', { length: 300 }),
  ogImage: varchar('og_image', { length: 500 }),
  // Twitter
  twitterTitle: varchar('twitter_title', { length: 200 }),
  twitterDescription: varchar('twitter_description', { length: 300 }),
  twitterImage: varchar('twitter_image', { length: 500 }),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Post Categories ────────────────────────────────────────────────────────────

export const postCategories = pgTable('post_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Post Tags ─────────────────────────────────────────────────────────────────

export const postTags = pgTable('post_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Post ↔ Category Map ────────────────────────────────────────────────────────

export const postCategoryMap = pgTable(
  'post_category_map',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => postCategories.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.categoryId] })]
);

// ─── Post ↔ Tag Map ────────────────────────────────────────────────────────────

export const postTagMap = pgTable(
  'post_tag_map',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => postTags.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.postId, t.tagId] })]
);

// ─── Types ─────────────────────────────────────────────────────────────────────

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type PostCategory = typeof postCategories.$inferSelect;
export type NewPostCategory = typeof postCategories.$inferInsert;
export type PostTag = typeof postTags.$inferSelect;
export type NewPostTag = typeof postTags.$inferInsert;
