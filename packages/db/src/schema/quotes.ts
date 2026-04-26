import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { cities } from './cities';

export const quoteStatusEnum = pgEnum('quote_status', [
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'spam',
]);

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  refId: varchar('ref_id', { length: 20 }).notNull().unique(),

  cityId: uuid('city_id').references(() => cities.id),
  cityName: varchar('city_name', { length: 200 }),
  pincode: varchar('pincode', { length: 10 }),
  deliveryAddress: text('delivery_address'),

  timeline: varchar('timeline', { length: 50 }).default('flexible'),
  installationRequired: boolean('installation_required').default(false),
  notes: text('notes'),

  estimatedTotalMin: integer('estimated_total_min'),
  estimatedTotalMax: integer('estimated_total_max'),

  contactName: varchar('contact_name', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 20 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }),
  contactType: varchar('contact_type', { length: 50 }).default('individual'),
  companyName: varchar('company_name', { length: 200 }),

  status: quoteStatusEnum('status').default('new'),
  adminNotes: text('admin_notes'),

  pdfUrl: varchar('pdf_url', { length: 500 }),
  whatsappSent: boolean('whatsapp_sent').default(false),
  emailSent: boolean('email_sent').default(false),
  crmSynced: boolean('crm_synced').default(false),

  sourceUrl: varchar('source_url', { length: 500 }),
  utmSource: varchar('utm_source', { length: 100 }),
  utmMedium: varchar('utm_medium', { length: 100 }),
  utmCampaign: varchar('utm_campaign', { length: 100 }),

  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type NewQuote = typeof quotes.$inferInsert;
