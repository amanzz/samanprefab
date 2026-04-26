import { pgTable, uuid, varchar, integer, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  urls: jsonb('urls').default({}),
  blurDataUrl: text('blur_data_url'),
  width: integer('width'),
  height: integer('height'),
  folder: varchar('folder', { length: 255 }).default('general'),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  altText: varchar('alt_text', { length: 255 }),
  uploadedBy: uuid('uploaded_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
