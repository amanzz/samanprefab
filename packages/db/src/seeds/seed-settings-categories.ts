import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../schema/index';

const { settings } = schema;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('🌱 Seeding Settings categories (SEO, Email, API)...\n');

  const rows = [
    // ── SEO ──────────────────────────────────────────────────────────────
    {
      key: 'default_meta_title',
      value: 'Best Portable Cabins & Prefab Structures | Saman Prefab',
      type: 'string' as const,
      label: 'Default Meta Title',
      category: 'seo',
    },
    {
      key: 'default_meta_description',
      value: 'Top-quality prefab cabins, portable offices, and labour camps delivered pan-India. Get an instant quote from Saman Prefab.',
      type: 'string' as const,
      label: 'Default Meta Description',
      category: 'seo',
    },
    {
      key: 'og_image_url',
      value: '',
      type: 'string' as const,
      label: 'OG / Social Share Image URL',
      category: 'seo',
    },
    {
      key: 'google_site_verification',
      value: '',
      type: 'string' as const,
      label: 'Google Search Console Verification Code',
      category: 'seo',
    },

    // ── EMAIL / SMTP ──────────────────────────────────────────────────────
    {
      key: 'smtp_host',
      value: 'smtp.gmail.com',
      type: 'string' as const,
      label: 'SMTP Host',
      category: 'email',
    },
    {
      key: 'smtp_port',
      value: '587',
      type: 'string' as const,
      label: 'SMTP Port',
      category: 'email',
    },
    {
      key: 'smtp_user',
      value: '',
      type: 'string' as const,
      label: 'SMTP Username / Email',
      category: 'email',
    },
    {
      key: 'smtp_password',
      value: '',
      type: 'string' as const,
      label: 'SMTP Password / App Password',
      category: 'email',
    },
    {
      key: 'email_from_name',
      value: 'Saman Prefab',
      type: 'string' as const,
      label: 'From Name',
      category: 'email',
    },
    {
      key: 'email_from_address',
      value: 'info@samanprefab.com',
      type: 'string' as const,
      label: 'From Address',
      category: 'email',
    },
    {
      key: 'email_to_leads',
      value: 'leads@samanprefab.com',
      type: 'string' as const,
      label: 'Lead Notification Recipients (comma-separated)',
      category: 'email',
    },

    // ── API KEYS ──────────────────────────────────────────────────────────
    {
      key: 'google_tag_manager_id',
      value: '',
      type: 'string' as const,
      label: 'Google Tag Manager ID',
      category: 'api',
    },
    {
      key: 'google_analytics_id',
      value: '',
      type: 'string' as const,
      label: 'Google Analytics 4 Measurement ID',
      category: 'api',
    },
    {
      key: 'google_maps_api_key',
      value: '',
      type: 'string' as const,
      label: 'Google Maps API Key',
      category: 'api',
    },
    {
      key: 'whatsapp_api_key',
      value: '',
      type: 'string' as const,
      label: 'WhatsApp Cloud API Key',
      category: 'api',
    },
    {
      key: 'recaptcha_site_key',
      value: '',
      type: 'string' as const,
      label: 'reCAPTCHA v3 Site Key',
      category: 'api',
    },
    {
      key: 'recaptcha_secret_key',
      value: '',
      type: 'string' as const,
      label: 'reCAPTCHA v3 Secret Key',
      category: 'api',
    },
  ];

  const inserted = await db
    .insert(settings)
    .values(rows)
    .onConflictDoNothing()
    .returning({ key: settings.key, category: settings.category });

  console.log(`✅ Inserted ${inserted.length} new settings rows:\n`);
  inserted.forEach(r => console.log(`   • [${r.category}] ${r.key}`));

  console.log('\n✅ Done!\n');
  await client.end();
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
