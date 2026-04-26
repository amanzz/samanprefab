import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../../../../.env') });
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import * as schema from '../schema/index';

const {
  users,
  productCategories,
  products,
  productVariants,
  cities,
  settings,
} = schema;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('🌱 Starting seed...\n');

  // ──────────────────────────────────────────────────────────
  // 1. Admin user
  // ──────────────────────────────────────────────────────────
  console.log('👤 Seeding admin user...');
  const passwordHash = await bcrypt.hash('Admin@Saman2026!', 10);

  const [adminUser] = await db
    .insert(users)
    .values({
      email: 'admin@samanprefab.com',
      passwordHash,
      name: 'Saman Admin',
      role: 'super_admin',
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { passwordHash, isActive: true },
    })
    .returning({ id: users.id, email: users.email, role: users.role });

  console.log(`  ✅ Admin: ${adminUser?.email} (role: ${adminUser?.role})\n`);

  // ──────────────────────────────────────────────────────────
  // 2. Product categories (all 9 fixed slugs from CORE_SYSTEM_DESIGN.md §1.1)
  // ──────────────────────────────────────────────────────────
  console.log('📂 Seeding 9 product categories...');

  const categoryData = [
    { slug: 'portable-cabin',  name: 'Portable Cabin',   sortOrder: 1 },
    { slug: 'prefab-house',    name: 'Prefab House',      sortOrder: 2 },
    { slug: 'labour-camp',     name: 'Labour Camp',       sortOrder: 3 },
    { slug: 'site-office',     name: 'Site Office',       sortOrder: 4 },
    { slug: 'porta-cabin',     name: 'Porta Cabin',       sortOrder: 5 },
    { slug: 'school-building', name: 'School Building',   sortOrder: 6 },
    { slug: 'warehouse',       name: 'Warehouse',         sortOrder: 7 },
    { slug: 'security-cabin',  name: 'Security Cabin',    sortOrder: 8 },
    { slug: 'toilet-block',    name: 'Toilet Block',      sortOrder: 9 },
  ];

  const insertedCategories = await db
    .insert(productCategories)
    .values(categoryData)
    .onConflictDoNothing()
    .returning({ id: productCategories.id, slug: productCategories.slug });

  console.log(`  ✅ ${insertedCategories.length} categories inserted\n`);

  // ──────────────────────────────────────────────────────────
  // 3. Cities (2 sample)
  // ──────────────────────────────────────────────────────────
  console.log('🏙️  Seeding 2 cities...');

  const [puneCity, delhiCity] = await db
    .insert(cities)
    .values([
      {
        name: 'Pune',
        slug: 'pune',
        state: 'Maharashtra',
        stateSlug: 'maharashtra',
        zone: 'west',
        latitude: 18.5204,
        longitude: 73.8567,
        isActive: true,
      },
      {
        name: 'Delhi',
        slug: 'delhi',
        state: 'Delhi',
        stateSlug: 'delhi',
        zone: 'north',
        latitude: 28.7041,
        longitude: 77.1025,
        isActive: true,
      },
    ])
    .onConflictDoNothing()
    .returning({ id: cities.id, name: cities.name, zone: cities.zone });

  console.log(`  ✅ Cities: ${[puneCity, delhiCity].filter(Boolean).map(c => c?.name).join(', ') || 'already exist'}\n`);

  // ──────────────────────────────────────────────────────────
  // 4. Products (2 sample)
  // ──────────────────────────────────────────────────────────
  console.log('📦 Seeding 2 products...');

  const portableCabinCategory = insertedCategories.find(c => c.slug === 'portable-cabin')
    ?? { id: null };
  const securityCabinCategory = insertedCategories.find(c => c.slug === 'security-cabin')
    ?? { id: null };

  const [product1, product2] = await db
    .insert(products)
    .values([
      {
        slug: 'standard-portable-cabin-10x10',
        name: 'Standard Portable Cabin 10×10 ft',
        shortDescription: 'Durable MS frame portable cabin ideal for site offices and temporary accommodations.',
        description: 'Our Standard Portable Cabin is built with a heavy-duty MS (Mild Steel) frame and corrugated GI sheet cladding. It is fire-resistant, weather-proof, and can be assembled on site within hours. Suitable for construction sites, industrial use, and temporary residential needs.',
        categoryId: portableCabinCategory.id ?? undefined,
        specifications: {
          'Floor Area': '10×10 ft (100 sq ft)',
          'Frame': 'MS (Mild Steel)',
          'Cladding': 'Corrugated GI Sheet',
          'Roof': 'GI Trapezoidal Sheet',
          'Flooring': 'Anti-skid Chequered Plate',
          'Insulation': 'EPS/PUF (optional)',
          'Door': '2×7 ft MS Frame',
          'Windows': '2 Nos. (Aluminium sliding)',
        },
        images: ['https://placehold.co/800x600?text=Portable+Cabin'],
        documents: [],
        priceMin: 85000,
        priceMax: 130000,
        priceUnit: 'unit',
        leadTimeDays: { min: 7, max: 14 },
        isFeatured: true,
        status: 'published',
        metaTitle: 'Portable Cabin 10×10 ft | Buy Prefab Cabin | Saman Prefab',
        metaDescription: 'Standard Portable Cabin 10×10 ft — MS frame, GI cladding. Starting from ₹85,000. Fast delivery across India. Get instant quote.',
        focusKeyword: 'portable cabin 10x10 ft',
      },
      {
        slug: 'security-guard-cabin-6x6',
        name: 'Security Guard Cabin 6×6 ft',
        shortDescription: 'Compact prefab security cabin with GI frame, ideal for entry gates and checkpoints.',
        description: 'The Saman Prefab Security Guard Cabin is a compact, sturdy prefabricated structure designed for security posts, entry gates, toll booths, and checkpoints. Made with GI (Galvanized Iron) frame and colour-coated steel sheets for rust-free, long-lasting performance.',
        categoryId: securityCabinCategory.id ?? undefined,
        specifications: {
          'Floor Area': '6×6 ft (36 sq ft)',
          'Frame': 'GI (Galvanized Iron)',
          'Cladding': 'Colour Coated Steel Sheet',
          'Roof': 'GI Sheet with Overhang',
          'Flooring': 'Chequered Plate',
          'Door': '2×6 ft MS Frame',
          'Windows': '1 Sliding Window + 1 Ventilator',
        },
        images: ['https://placehold.co/800x600?text=Security+Cabin'],
        documents: [],
        priceMin: 35000,
        priceMax: 55000,
        priceUnit: 'unit',
        leadTimeDays: { min: 5, max: 10 },
        isFeatured: false,
        status: 'published',
        metaTitle: 'Security Guard Cabin 6×6 ft | Prefab Guard Cabin | Saman Prefab',
        metaDescription: 'Security Guard Cabin 6×6 ft — GI frame, colour coated. Starting from ₹35,000. ISI certified. Delivery across India. Get a free quote.',
        focusKeyword: 'security guard cabin 6x6',
      },
    ])
    .onConflictDoNothing()
    .returning({ id: products.id, name: products.name, priceMin: products.priceMin });

  console.log(`  ✅ Products inserted:`);
  [product1, product2].filter(Boolean).forEach(p => {
    console.log(`     • ${p?.name} — from ₹${p?.priceMin?.toLocaleString('en-IN')}`);
  });
  console.log('');

  // ──────────────────────────────────────────────────────────
  // 5. Product variants for product 1 (Standard Portable Cabin)
  // ──────────────────────────────────────────────────────────
  if (product1?.id) {
    console.log('🔧 Seeding variants for Portable Cabin...');
    await db
      .insert(productVariants)
      .values([
        {
          productId: product1.id,
          label: '10×10 ft, MS Frame',
          size: '10×10 ft',
          material: 'MS Frame',
          finish: 'Painted',
          priceMin: 85000,
          priceMax: 105000,
          unit: 'unit',
          isDefault: true,
          isActive: true,
          sortOrder: 1,
        },
        {
          productId: product1.id,
          label: '10×12 ft, MS Frame',
          size: '10×12 ft',
          material: 'MS Frame',
          finish: 'Painted',
          priceMin: 100000,
          priceMax: 130000,
          unit: 'unit',
          isDefault: false,
          isActive: true,
          sortOrder: 2,
        },
      ])
      .onConflictDoNothing();
    console.log('  ✅ 2 variants inserted\n');
  }

  // ──────────────────────────────────────────────────────────
  // 6. Settings (platform config)
  // ──────────────────────────────────────────────────────────
  console.log('⚙️  Seeding platform settings...');
  await db
    .insert(settings)
    .values([
      { key: 'site_phone',      value: '+91-9000000000', type: 'string', label: 'Site Phone Number' },
      { key: 'site_email',      value: 'info@samanprefab.com', type: 'string', label: 'Site Email' },
      { key: 'whatsapp_number', value: '919000000000', type: 'string', label: 'WhatsApp Number (with country code, no +)' },
      { key: 'site_name',       value: 'Saman Prefab', type: 'string', label: 'Site Name' },
      { key: 'site_url',        value: 'https://samanprefab.com', type: 'string', label: 'Production Site URL' },
      { key: 'gtm_id',          value: '', type: 'string', label: 'Google Tag Manager ID' },
    ])
    .onConflictDoNothing();
  console.log('  ✅ 6 settings inserted\n');

  // ──────────────────────────────────────────────────────────
  // Done
  // ──────────────────────────────────────────────────────────
  console.log('✅ Seed complete!\n');
  await client.end();
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
