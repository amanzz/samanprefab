# CORE_SYSTEM_DESIGN.md
## Saman Prefab — Implementation-Ready System Architecture

**Version:** 2.0.0
**Date:** 2026-04-21
**Phase:** Design Locked ✅
**Author:** Principal System Architect / Principal Product Engineer

> **Purpose:** This document corrects and extends the Phase 2 scaffolding with concrete business logic,
> real data models, and implementation-ready specifications for every core system.
> No generic content. Every decision maps directly to a PRD requirement.

---

## AUDIT FINDINGS

### What Phase 2 Got Right
- Modular Express backend with clear separation of concerns
- Drizzle ORM schema covering the base tables
- Zod validation on all API inputs
- JWT + httpOnly cookie auth with role-based access
- Next.js 14 App Router skeleton

### Critical Gaps Identified

| Gap | Impact | Fix Required |
|---|---|---|
| `quotes` table is single-product only | Cannot handle multi-product quote requests | Add `quote_items` table; refactor quotes schema |
| No `city_seo_pages` table | Cannot track which city×product pages exist or their SEO content | Add table + API |
| No `redirects` / `not_found_log` table | 404s go untracked; no redirect management | Add both tables |
| No `product_variants` table | PRD requires size/material/finish variants | Add table |
| No `settings` table | No way to manage platform config from admin | Add key-value store |
| Admin is a separate app concept | Adds deployment complexity; admin should be a Next.js route group | Clarify: admin lives in `apps/web/(admin)` |
| SEO page generation not designed | 500+ city pages have no generation strategy | Full ISR + seeding strategy defined below |
| Block editor data model undefined | Cannot build admin UI without knowing the block schema | Fully defined below |
| PDF generation not specified | Quote PDF needed for user trust | Stack + template defined below |
| Price estimation logic missing | Quote engine cannot show estimates | Formula defined below |

---

## SYSTEM 1 — SEO ARCHITECTURE

### 1.1 URL Slug System

```
Public URL Patterns (canonical, registered in sitemap):

Homepage:              /
Product Catalog:       /products
Category Page:         /products/{category-slug}
Product Detail:        /products/{category-slug}/{product-slug}
City Landing Page:     /prefab-in-{city-slug}
City × Product Page:   /prefab-{product-category-slug}-in-{city-slug}
Quote Engine:          /get-quote
Quote Confirmation:    /get-quote/confirm/{ref-id}
Blog Listing:          /blog
Blog Post:             /blog/{post-slug}
About:                 /about
Contact:               /contact
Sitemap:               /sitemap.xml
Robots:                /robots.txt
```

**Slug Rules (enforced at creation time by Zod + slugify):**
- All lowercase, hyphenated
- No special characters except hyphens
- Automatically generated from name if not manually set
- Unique enforced at DB level (UNIQUE constraint)
- Max 100 characters

**Product Category Slugs (fixed set for SEO consistency):**
```
portable-cabin
prefab-house
labour-camp
site-office
porta-cabin
school-building
warehouse
security-cabin
toilet-block
```

**Example City × Product URLs:**
```
/prefab-portable-cabin-in-pune
/prefab-prefab-house-in-delhi
/prefab-warehouse-in-mumbai
/prefab-labour-camp-in-bangalore
```

---

### 1.2 City × Product Page Generation Strategy

**Scale:** ~500 cities × ~9 product categories = ~4,500 pages

**Approach: ISR (Incremental Static Regeneration)**
- `generateStaticParams` pre-builds the top 200 priority city×product combinations at build time
- Remaining pages rendered on first request and cached (ISR)
- Revalidation: `revalidate = 86400` (24 hours) — content changes daily via admin

**Next.js file location:**
```
apps/web/src/app/(public)/prefab-[productSlug]-in-[citySlug]/
  page.tsx      ← SSG + ISR page component
  loading.tsx   ← Skeleton while generating
```

**`generateStaticParams` strategy:**
```typescript
// Pre-build top 200 = top 20 cities × all 9 product categories (180)
// + manually prioritised combinations (20)
// Priority cities list in: packages/db/src/seeds/priority-cities.ts
```

**`city_seo_pages` DB record controls:**
- `status: 'active' | 'draft' | 'noindex'`
- `customContent`: JSONB blocks that override the default AI-generated template
- If no DB record exists for a city×product combo → page still renders using dynamic template
- If `status = 'noindex'` → page renders but with `<meta name="robots" content="noindex">`

---

### 1.3 Metadata System

Every page exports `generateMetadata`. Templates per page type:

**City × Product Page:**
```typescript
title:       `Prefab ${categoryName} in ${cityName} | Saman Prefab`
             // e.g., "Prefab Portable Cabin in Pune | Saman Prefab"
description: `Buy prefabricated ${categoryName.toLowerCase()} in ${cityName}, ${stateName}.
              Fast delivery, competitive pricing. Get a free quote today. ✓ ISI Certified`
             // 140–160 chars
canonical:   `https://samanprefab.com/prefab-${productCategorySlug}-in-${citySlug}`
og:image:    `/api/og?product=${productCategorySlug}&city=${citySlug}` ← Dynamic OG image
```

**Product Detail Page:**
```typescript
title:       `${productName} | Buy Prefab ${categoryName} | Saman Prefab`
description: `${productName} — ${specs summary}. Starting from ₹${priceMin}. 
              Available across India. Get instant quote.`
canonical:   `https://samanprefab.com/products/${categorySlug}/${productSlug}`
```

**Dynamic OG Image API (`apps/web/src/app/api/og/route.tsx`):**
- Uses `@vercel/og` (edge runtime)
- Renders a branded card with product image + city name
- Fallback to static default OG image

---

### 1.4 JSON-LD Schema Definitions

#### Product Page JSON-LD
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "{{product.name}}",
  "image": ["{{product.images[0]}}", "{{product.images[1]}}"],
  "description": "{{product.description}}",
  "sku": "{{product.slug}}",
  "brand": {
    "@type": "Brand",
    "name": "Saman Prefab"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "{{product.priceMin}}",
    "highPrice": "{{product.priceMax}}",
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Saman Prefab"
    }
  }
}
```

#### City × Product Page JSON-LD (two schemas injected)
```json
// Schema 1: LocalBusiness
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Saman Prefab — {{cityName}}",
  "description": "Prefab structure supplier serving {{cityName}}, {{stateName}}",
  "url": "https://samanprefab.com/prefab-{{productSlug}}-in-{{citySlug}}",
  "telephone": "+91-XXXXXXXXXX",
  "areaServed": {
    "@type": "City",
    "name": "{{cityName}}"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "{{cityName}}",
    "addressRegion": "{{stateName}}",
    "addressCountry": "IN"
  }
}

// Schema 2: FAQPage (3–5 FAQs per page, templated per product+city)
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does a prefab {{productCategory}} cost in {{cityName}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Prefab {{productCategory}} in {{cityName}} typically costs between ₹{{priceMin}} and ₹{{priceMax}} depending on size and specifications. Contact Saman Prefab for an accurate quote."
      }
    },
    {
      "@type": "Question",
      "name": "How long does delivery take to {{cityName}}?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We deliver prefab structures to {{cityName}} within 2–4 weeks of order confirmation, including installation."
      }
    }
  ]
}
```

#### BreadcrumbList (injected on all pages except homepage)
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://samanprefab.com" },
    { "@type": "ListItem", "position": 2, "name": "{{category}}", "item": "https://samanprefab.com/products/{{categorySlug}}" },
    { "@type": "ListItem", "position": 3, "name": "{{productName}}", "item": "https://samanprefab.com/products/{{categorySlug}}/{{productSlug}}" }
  ]
}
```

---

### 1.5 Sitemap Strategy

**File:** `apps/web/src/app/sitemap.ts` (Next.js native sitemap API)

Split into logical groups to stay under 50k URL limit per file:

```typescript
// Primary sitemap index at /sitemap.xml
// Delegates to sub-sitemaps:

/sitemap-core.xml      → Static pages (home, about, contact, blog index, quote)
/sitemap-products.xml  → All product pages (max ~500)
/sitemap-cities.xml    → All city × product pages (max ~4,500 active entries)
/sitemap-blog.xml      → Blog posts (unlimited, regenerated on demand)
```

**Update trigger:**
- On product publish → `revalidatePath('/sitemap-products.xml')`
- On city page activation → `revalidatePath('/sitemap-cities.xml')`
- On blog post publish → `revalidatePath('/sitemap-blog.xml')`

**robots.txt** (`apps/web/src/app/robots.ts`):
```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /get-quote/confirm/
Sitemap: https://samanprefab.com/sitemap.xml
```

---

## SYSTEM 2 — DATABASE SCHEMA (CORRECTIONS + ADDITIONS)

### 2.1 Schema Changes Required

**Modify `quotes` table** — remove `productId`/`productName` direct fields, they move to `quote_items`.

**New tables to add to `packages/db/src/schema/`:**

#### `quote_items` table
```typescript
export const quoteItems = pgTable('quote_items', {
  id:          uuid('id').primaryKey().defaultRandom(),
  quoteId:     uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  productId:   uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: varchar('product_name', { length: 255 }).notNull(), // snapshot at time of quote
  variantId:   uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  variantLabel:varchar('variant_label', { length: 255 }),           // snapshot
  quantity:    integer('quantity').notNull().default(1),
  unit:        varchar('unit', { length: 50 }).notNull().default('unit'), // unit | sqft | piece
  estimatedPriceMin: integer('estimated_price_min'),                // in INR, calculated at submit
  estimatedPriceMax: integer('estimated_price_max'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});
```

#### `product_variants` table
```typescript
export const productVariants = pgTable('product_variants', {
  id:          uuid('id').primaryKey().defaultRandom(),
  productId:   uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  label:       varchar('label', { length: 255 }).notNull(), // "10×10 ft, MS Frame"
  size:        varchar('size', { length: 100 }),            // "10×10 ft"
  material:    varchar('material', { length: 100 }),        // "MS Frame", "GI Frame"
  finish:      varchar('finish', { length: 100 }),          // "Painted", "Galvanized"
  priceMin:    integer('price_min'),                        // INR
  priceMax:    integer('price_max'),                        // INR
  unit:        varchar('unit', { length: 50 }).notNull().default('unit'),
  isDefault:   boolean('is_default').default(false),
  isActive:    boolean('is_active').default(true),
  sortOrder:   integer('sort_order').default(0),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  updatedAt:   timestamp('updated_at').notNull().defaultNow(),
});
```

#### `city_seo_pages` table
```typescript
export const citySeoPages = pgTable('city_seo_pages', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  cityId:              uuid('city_id').notNull().references(() => cities.id),
  productCategoryId:   uuid('product_category_id').notNull().references(() => productCategories.id),
  slug:                varchar('slug', { length: 200 }).notNull().unique(),
                       // e.g., "prefab-portable-cabin-in-pune"
  status:              varchar('status', { length: 20 }).notNull().default('draft'),
                       // draft | active | noindex
  metaTitle:           varchar('meta_title', { length: 70 }),
  metaDescription:     varchar('meta_description', { length: 165 }),
  h1Override:          varchar('h1_override', { length: 200 }),
  customBlocks:        jsonb('custom_blocks'),              // Block[] — overrides default template
  aiGeneratedContent:  text('ai_generated_content'),       // fallback prose content
  internalLinks:       jsonb('internal_links'),             // [{text, href}]
  priority:            integer('priority').default(50),     // sitemap priority 0–100
  createdAt:           timestamp('created_at').notNull().defaultNow(),
  updatedAt:           timestamp('updated_at').notNull().defaultNow(),
}, (t) => ({
  cityProductUniq: uniqueIndex('city_product_uniq').on(t.cityId, t.productCategoryId),
}));
```

#### `redirects` table
```typescript
export const redirects = pgTable('redirects', {
  id:         uuid('id').primaryKey().defaultRandom(),
  fromPath:   varchar('from_path', { length: 500 }).notNull().unique(),
  toPath:     varchar('to_path', { length: 500 }).notNull(),
  statusCode: integer('status_code').notNull().default(301), // 301 | 302
  isActive:   boolean('is_active').default(true),
  hitCount:   integer('hit_count').default(0),
  createdBy:  uuid('created_by').references(() => users.id),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
});
```

#### `not_found_log` table
```typescript
export const notFoundLog = pgTable('not_found_log', {
  id:          uuid('id').primaryKey().defaultRandom(),
  path:        varchar('path', { length: 500 }).notNull(),
  count:       integer('count').default(1),
  referrer:    varchar('referrer', { length: 500 }),
  userAgent:   varchar('user_agent', { length: 500 }),
  lastSeenAt:  timestamp('last_seen_at').notNull().defaultNow(),
  resolvedAt:  timestamp('resolved_at'),                  // set when redirect created
}, (t) => ({
  pathIdx: index('not_found_path_idx').on(t.path),
}));
```

#### `settings` table (key-value store)
```typescript
export const settings = pgTable('settings', {
  key:        varchar('key', { length: 100 }).primaryKey(),
                // 'site_phone' | 'site_email' | 'whatsapp_number' | 'gtm_id' | etc.
  value:      text('value').notNull(),
  type:       varchar('type', { length: 20 }).default('string'), // string | json | boolean
  label:      varchar('label', { length: 200 }),
  updatedAt:  timestamp('updated_at').notNull().defaultNow(),
  updatedBy:  uuid('updated_by').references(() => users.id),
});
```

### 2.2 Modified `quotes` table structure

Remove `productId`, `productName` (moved to `quote_items`). Add:
```typescript
// New fields on quotes:
cityId:              uuid('city_id').references(() => cities.id),
cityName:            varchar('city_name', { length: 200 }),  // snapshot
pincode:             varchar('pincode', { length: 10 }),
deliveryAddress:     text('delivery_address'),
timeline:            varchar('timeline', { length: 50 }).default('flexible'),
                     // asap | one_month | three_months | flexible
installationRequired:boolean('installation_required').default(false),
estimatedTotalMin:   integer('estimated_total_min'),         // INR, sum of all items
estimatedTotalMax:   integer('estimated_total_max'),
pdfUrl:              varchar('pdf_url', { length: 500 }),    // stored PDF path/URL
whatsappSent:        boolean('whatsapp_sent').default(false),
emailSent:           boolean('email_sent').default(false),
crmSynced:           boolean('crm_synced').default(false),
sourceUrl:           varchar('source_url', { length: 500 }), // page where quote was initiated
utmSource:           varchar('utm_source', { length: 100 }),
utmMedium:           varchar('utm_medium', { length: 100 }),
utmCampaign:         varchar('utm_campaign', { length: 100 }),
```

---

## SYSTEM 3 — QUOTE ENGINE

### 3.1 Multi-Step Form State Machine

```
State: QuoteFormState {
  step:     1 | 2 | 3 | 4
  items:    QuoteItem[]          // step 1
  location: QuoteLocation        // step 2
  specs:    QuoteSpecs           // step 3
  contact:  QuoteContact         // step 4
  estimate: PriceEstimate | null // computed after step 1 + 2
}

QuoteItem {
  productId:    string
  productName:  string           // for display
  variantId:    string | null
  variantLabel: string | null
  quantity:     number           // min 1, max 500
  unit:         'unit' | 'sqft' | 'piece'
}

QuoteLocation {
  cityId:           string
  cityName:         string       // for display
  stateName:        string
  pincode:          string
  deliveryAddress:  string       // optional
}

QuoteSpecs {
  timeline:             'asap' | 'one_month' | 'three_months' | 'flexible'
  installationRequired: boolean
  notes:                string   // max 500 chars
}

QuoteContact {
  name:        string            // min 2 chars
  phone:       string            // Indian mobile: /^[6-9]\d{9}$/
  email:       string            // valid email
  companyName: string | null     // optional
}
```

### 3.2 Price Estimation Formula

Price is estimated client-side for instant UX, then recalculated server-side for storage.

```typescript
function estimatePrice(item: QuoteItem, city: City): { min: number; max: number } {
  const variant = item.variantId
    ? getVariant(item.variantId)
    : getDefaultVariant(item.productId);

  const baseMin = variant.priceMin ?? product.priceRangeMin;
  const baseMax = variant.priceMax ?? product.priceRangeMax;

  // Transport zone multiplier based on city region
  const zoneMultiplier = TRANSPORT_ZONE_MULTIPLIERS[city.zone ?? 'central'];
  // Zones: north=1.0, south=1.05, east=1.08, west=1.02, central=1.0, northeast=1.15

  const min = Math.round(baseMin * item.quantity * zoneMultiplier);
  const max = Math.round(baseMax * item.quantity * zoneMultiplier);

  return { min, max };
}

// Multi-item total:
const totalMin = items.reduce((sum, item) => sum + estimatePrice(item, city).min, 0);
const totalMax = items.reduce((sum, item) => sum + estimatePrice(item, city).max, 0);

// Display format: "₹3,50,000 – ₹4,80,000 (estimated)"
// IMPORTANT: Always label as "estimated" — NOT a binding price
```

**City zones stored in `cities` table** — add `zone` column:
```
zone: 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast'
```

### 3.3 Quote Reference ID Format

```typescript
function generateRefId(): string {
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth()+1).padStart(2,'0')}${String(date.getDate()).padStart(2,'0')}`;
  const rand = Math.floor(Math.random() * 9000 + 1000); // 4-digit random
  return `SP-${dateStr}-${rand}`;
  // e.g., SP-20260421-4823
}
```

### 3.4 Quote Submission API Flow

```
POST /api/v1/quotes
Body: { items, location, specs, contact, sourceUrl, utm* }

Server flow:
1. Validate all fields with Zod (see Zod schemas below)
2. Resolve cityId from location.cityId (verify exists in DB)
3. Resolve productId + variantId for each item (verify exist)
4. Recalculate price estimate server-side (do not trust client estimate)
5. Generate refId (SP-YYYYMMDD-XXXX)
6. Insert quote record
7. Insert quote_items records
8. Enqueue background jobs:
   a. sendQuoteConfirmationEmail(quoteId)
   b. sendSalesNotificationEmail(quoteId)
   c. sendWhatsAppNotification(quoteId)  — if configured
   d. pushToCrmWebhook(quoteId)          — if configured
   e. generateQuotePdf(quoteId)          — store and update pdfUrl
9. Return: { success: true, refId, estimatedMin, estimatedMax }
```

**Background job runner:** Use `pg-boss` (PostgreSQL-backed job queue) or simple async `setImmediate` for MVP. Define `QUEUE_BACKEND=pg-boss|simple` in `.env`.

### 3.5 PDF Generation

**Stack:** `@react-pdf/renderer` (server-side React to PDF)

**Template file:** `apps/api/src/modules/quotes/quote-pdf.template.tsx`

**Quote PDF contents:**
```
[Header] Saman Prefab logo | Quote Reference: SP-20260421-4823
[Date] 21 April 2026
[To] Rahul Sharma | rahul@email.com | 9876543210
     [CompanyName if provided]

[Products Table]
| # | Product             | Variant        | Qty | Unit | Est. Range         |
|---|---------------------|----------------|-----|------|--------------------|
| 1 | Portable Cabin      | 10×10 ft, MS   |  2  | unit | ₹1,40,000–₹1,80,000|
| 2 | Security Cabin      | 6×6 ft, GI     |  1  | unit | ₹45,000–₹60,000    |

[Delivery Location] Pune, Maharashtra — 411001
[Timeline] Within 1 Month
[Installation] Required

[Estimated Total] ₹1,85,000 – ₹2,40,000 (indicative, subject to final measurement)

[Footer]
This is an indicative estimate only. Final pricing subject to site visit and order confirmation.
Saman Prefab | samanprefab.com | +91-XXXXXXXXXX
Valid for 7 days from issue date.
```

**PDF stored at:** `uploads/quotes/{refId}.pdf` — served via `/api/v1/quotes/{refId}/pdf`

### 3.6 WhatsApp + Email Templates

**WhatsApp message to sales team (plain text, 160 chars max for primary line):**
```
🔔 New Quote Request
ID: SP-20260421-4823
Product: Portable Cabin ×2, Security Cabin ×1
City: Pune, MH — 411001
Name: Rahul Sharma
Phone: 9876543210
Est: ₹1.85L – ₹2.4L
Timeline: 1 Month
View: https://samanprefab.com/admin/quotes/[id]
```

**Email to user (HTML template):**
- Subject: `Your Quote Request #SP-20260421-4823 — Saman Prefab`
- Contents: Summary table, estimated range, what-happens-next (24hr callback), CTA to track quote
- Template: `apps/api/src/modules/quotes/templates/quote-confirmation.html`

**Email to sales team:**
- Subject: `New Lead: Rahul Sharma, Pune — #SP-20260421-4823`
- Full details + link to admin panel

---

## SYSTEM 4 — ADMIN PANEL ARCHITECTURE

### 4.1 Structural Decision

The admin panel lives **inside `apps/web`** as a Next.js route group:

```
apps/web/src/app/
├── (public)/               ← All public pages
│   ├── page.tsx            ← Homepage
│   ├── products/
│   ├── prefab-[productSlug]-in-[citySlug]/
│   ├── blog/
│   └── ...
└── (admin)/                ← Admin route group — protected by middleware
    ├── layout.tsx          ← Admin shell (sidebar, header, auth guard)
    ├── dashboard/
    ├── products/
    ├── quotes/
    ├── cities/
    ├── content/
    ├── blog/
    ├── media/
    ├── redirects/
    └── settings/
```

**Auth protection:** `apps/web/src/middleware.ts` intercepts all `/admin/*` routes, verifies JWT cookie via internal API call, redirects to `/admin/login` if unauthenticated.

### 4.2 Product Creation — Required Fields

```typescript
// Minimum viable product form fields:

interface ProductFormData {
  // Core
  name:           string    // required, max 200 chars
  slug:           string    // auto-generated, editable, unique
  categoryId:     string    // required — from categories dropdown
  status:         'draft' | 'published' | 'archived'

  // Content
  shortDescription: string  // required, 100–200 chars — used in catalog cards
  description:    string    // required, rich text / markdown
  specifications: Record<string, string>  // key-value, e.g., {"Floor Area": "100 sqft", "Frame": "MS"}
  images:         string[]  // ordered URLs from media library, first = primary
  documents:      { label: string; url: string }[]  // PDFs (spec sheet, DWG)

  // Pricing
  priceMin:       number    // INR per unit (base, not variant-specific)
  priceMax:       number    // INR per unit
  priceUnit:      string    // 'unit' | 'sqft' | 'piece'

  // SEO
  metaTitle:      string    // max 65 chars
  metaDescription:string    // max 160 chars
  focusKeyword:   string    // primary target keyword, used in SEO score
  canonicalUrl:   string    // auto-filled, overridable

  // Lead time
  leadTimeDays:   { min: number; max: number }  // e.g., { min: 14, max: 28 }
}
```

### 4.3 Block Editor Data Model

Content pages and city SEO page overrides use a block-based content model stored as JSONB.

```typescript
type Block =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | CtaBlock
  | FaqBlock
  | TestimonialBlock
  | ProductGridBlock
  | StatsBlock
  | TwoColumnBlock

// Base (every block has):
interface BaseBlock {
  id:      string   // uuid
  type:    string
  visible: boolean
}

interface HeroBlock extends BaseBlock {
  type:         'hero'
  headline:     string
  subheadline:  string
  backgroundImage: string | null
  ctaPrimary:   { text: string; href: string } | null
  ctaSecondary: { text: string; href: string } | null
  variant:      'centered' | 'left-aligned'
}

interface TextBlock extends BaseBlock {
  type:      'text'
  content:   string   // markdown — rendered server-side
  alignment: 'left' | 'center'
}

interface ImageBlock extends BaseBlock {
  type:    'image'
  url:     string
  alt:     string
  caption: string | null
  width:   'full' | 'contained' | 'narrow'
}

interface CtaBlock extends BaseBlock {
  type:       'cta'
  headline:   string
  subtext:    string | null
  buttonText: string
  buttonHref: string
  variant:    'primary' | 'secondary' | 'dark'
}

interface FaqBlock extends BaseBlock {
  type:  'faq'
  title: string | null
  items: { question: string; answer: string }[]
  // Automatically generates FAQPage JSON-LD when rendered
}

interface TestimonialBlock extends BaseBlock {
  type:  'testimonials'
  title: string | null
  items: { name: string; company: string; text: string; avatarUrl: string | null }[]
}

interface ProductGridBlock extends BaseBlock {
  type:       'product_grid'
  title:      string | null
  productIds: string[]   // references products.id
  columns:    2 | 3 | 4
}

interface StatsBlock extends BaseBlock {
  type:  'stats'
  items: { value: string; label: string }[]
  // e.g., [{ value: "500+", label: "Cities Served" }, ...]
}

interface TwoColumnBlock extends BaseBlock {
  type:    'two_column'
  left:    TextBlock | ImageBlock
  right:   TextBlock | ImageBlock
  reverse: boolean   // swap on mobile
}
```

**Block storage format in DB:**
```json
{
  "version": 1,
  "blocks": [ { ...BlockObject }, ... ]
}
```

### 4.4 Redirect Manager

**Admin UI at `/admin/redirects`:**
- Table of all redirects: From Path | To Path | Type (301/302) | Hits | Active | Actions
- "Create from 404" button — shows list from `not_found_log`, one-click create redirect
- Bulk activate/deactivate
- Import via CSV

**Runtime enforcement:**
`apps/web/src/middleware.ts` checks `redirects` table on every request (cached in-memory with 5min TTL, or use Redis in production).

```typescript
// Middleware pseudo-code:
const redirect = redirectCache.get(pathname) ?? await fetchRedirect(pathname);
if (redirect?.isActive) {
  return NextResponse.redirect(redirect.toPath, redirect.statusCode);
}
```

### 4.5 Lead Management Dashboard

**Quote Inbox (`/admin/quotes`):**

Filters:
- Status: `new | contacted | qualified | won | lost | spam`
- Date range: today / this week / this month / custom
- City: dropdown from cities
- Product category: dropdown
- Source: direct / organic / paid / referral (from UTM)

Table columns:
```
RefID | Customer | Phone | City | Product(s) | Est. Value | Status | Date | Actions
```

Quote Detail Page (`/admin/quotes/[id]`):
- Full lead info with all items
- Timeline (submitted → contacted → quoted → won/lost)
- Status update dropdown
- Notes field (internal — not visible to customer)
- Download PDF button
- "Send to CRM" manual trigger button
- WhatsApp quick-reply button (opens wa.me link)

**Lead Value Tracking:**
```
Estimated Pipeline Value (current month) = SUM(estimatedTotalMax) WHERE status IN ('new','contacted','qualified')
Won Value = SUM(estimatedTotalMax) WHERE status = 'won'
Conversion Rate = won / (won + lost)
```

---

## SYSTEM 5 — ZOD VALIDATION SCHEMAS (COMPLETE)

All schemas live in their respective `[module].schema.ts` files.

```typescript
// Indian phone validation
const indianPhone = z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number');

// Indian pincode validation
const indianPincode = z.string().regex(/^[1-9][0-9]{5}$/, 'Enter a valid 6-digit pincode');

// Slug validation
const slug = z.string()
  .min(2).max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers and hyphens only');

// Quote submission schema (the most complex):
export const submitQuoteSchema = z.object({
  items: z.array(z.object({
    productId:   z.string().uuid(),
    variantId:   z.string().uuid().nullable().optional(),
    quantity:    z.number().int().min(1).max(500),
    unit:        z.enum(['unit', 'sqft', 'piece']),
  })).min(1, 'At least one product is required').max(10),

  location: z.object({
    cityId:          z.string().uuid(),
    pincode:         indianPincode.optional(),
    deliveryAddress: z.string().max(500).optional(),
  }),

  specs: z.object({
    timeline:             z.enum(['asap', 'one_month', 'three_months', 'flexible']),
    installationRequired: z.boolean(),
    notes:                z.string().max(500).optional(),
  }),

  contact: z.object({
    name:        z.string().min(2).max(100),
    phone:       indianPhone,
    email:       z.string().email(),
    companyName: z.string().max(200).optional(),
  }),

  sourceUrl:   z.string().url().optional(),
  utmSource:   z.string().max(100).optional(),
  utmMedium:   z.string().max(100).optional(),
  utmCampaign: z.string().max(100).optional(),
});

// Product creation schema:
export const createProductSchema = z.object({
  name:             z.string().min(3).max(200),
  slug:             slug.optional(), // auto-generated if omitted
  categoryId:       z.string().uuid(),
  shortDescription: z.string().min(20).max(200),
  description:      z.string().min(50),
  specifications:   z.record(z.string(), z.string()).optional().default({}),
  images:           z.array(z.string().url()).min(1).max(20),
  documents:        z.array(z.object({ label: z.string(), url: z.string().url() })).optional().default([]),
  priceMin:         z.number().int().positive(),
  priceMax:         z.number().int().positive(),
  priceUnit:        z.enum(['unit', 'sqft', 'piece']),
  metaTitle:        z.string().max(65).optional(),
  metaDescription:  z.string().max(160).optional(),
  focusKeyword:     z.string().max(100).optional(),
  leadTimeDays:     z.object({ min: z.number().int().positive(), max: z.number().int().positive() }).optional(),
  status:           z.enum(['draft', 'published', 'archived']).default('draft'),
}).refine(d => d.priceMax >= d.priceMin, { message: 'priceMax must be ≥ priceMin', path: ['priceMax'] });
```

---

## SYSTEM 6 — SIMPLIFICATION DECISIONS

### Keep (Essential)
- Express API (`apps/api`) — handles quote submission, PDF gen, auth, media upload
- Next.js App Router (`apps/web`) — both public site and admin panel
- Drizzle ORM — right tool for this schema complexity
- Zod — non-negotiable for all API inputs
- JWT + httpOnly cookie — simpler than session stores for this scale

### Remove / Defer
- **No `apps/admin` as separate Next.js app** — merge admin into `apps/web` route group `(admin)`. Avoids duplicated layout code, shared auth middleware, shared API calls.
- **No `product_variants` for launch** — JSONB `specifications` field covers MVP. Add `product_variants` table in Phase 3.5 only if admin needs it.
- **No AI Writer for Phase 3** — design the `ai_generated_content` column now, implement generation in Phase 7. Do not build AI Writer UI before product and quote core is stable.
- **No Google Merchant Feed for Phase 3** — define the API endpoint route now (`/api/v1/feed/google-merchant`), implement in Phase 5 after products are live.
- **No Redis for MVP** — use in-memory LRU cache for redirect lookups. Swap to Redis when traffic exceeds 50k/day.
- **No `pg-boss` for MVP** — use async `setImmediate`-based job runner. Accept risk of job loss on crash at MVP stage. Add proper queue in Phase 9.

---

## SYSTEM 7 — API ENDPOINT REGISTRY (COMPLETE)

All API routes for `apps/api`. Must be reflected in `docs/API.md` (to be created).

```
AUTH
POST   /api/v1/auth/login          ← loginSchema
POST   /api/v1/auth/logout         ←
GET    /api/v1/auth/me             ← requireAuth
POST   /api/v1/auth/register       ← requireRole('super_admin'), registerSchema

PRODUCTS
GET    /api/v1/products            ← listProductsQuerySchema
GET    /api/v1/products/:slug      ←
POST   /api/v1/products            ← requireRole('super_admin','content_editor'), createProductSchema
PUT    /api/v1/products/:id        ← requireRole('super_admin','content_editor'), updateProductSchema
DELETE /api/v1/products/:id        ← requireRole('super_admin')

PRODUCT VARIANTS
GET    /api/v1/products/:id/variants
POST   /api/v1/products/:id/variants  ← requireRole('super_admin','content_editor')
PUT    /api/v1/variants/:id           ← requireRole('super_admin','content_editor')
DELETE /api/v1/variants/:id           ← requireRole('super_admin')

CATEGORIES
GET    /api/v1/categories
GET    /api/v1/categories/:slug
POST   /api/v1/categories          ← requireRole('super_admin')
PUT    /api/v1/categories/:id      ← requireRole('super_admin')

QUOTES
POST   /api/v1/quotes              ← quoteRateLimit, submitQuoteSchema
GET    /api/v1/quotes              ← requireRole('super_admin','sales_agent'), listQuotesQuerySchema
GET    /api/v1/quotes/:id          ← requireAuth
GET    /api/v1/quotes/ref/:refId   ← (public — for confirmation page)
GET    /api/v1/quotes/:refId/pdf   ← (public — for PDF download)
PATCH  /api/v1/quotes/:id/status   ← requireRole('super_admin','sales_agent')
PATCH  /api/v1/quotes/:id/notes    ← requireRole('super_admin','sales_agent')

CITIES
GET    /api/v1/cities              ← listCitiesQuerySchema
GET    /api/v1/cities/:slug

CITY SEO PAGES
GET    /api/v1/city-seo-pages      ← listCitySeoQuerySchema
GET    /api/v1/city-seo-pages/:slug
POST   /api/v1/city-seo-pages      ← requireRole('super_admin','content_editor')
PUT    /api/v1/city-seo-pages/:id  ← requireRole('super_admin','content_editor')
POST   /api/v1/city-seo-pages/bulk-activate ← requireRole('super_admin')

MEDIA
POST   /api/v1/media               ← requireAuth, multipart/form-data
GET    /api/v1/media               ← requireAuth
DELETE /api/v1/media/:id           ← requireRole('super_admin','content_editor')

REDIRECTS
GET    /api/v1/redirects           ← requireRole('super_admin')
POST   /api/v1/redirects           ← requireRole('super_admin')
PUT    /api/v1/redirects/:id       ← requireRole('super_admin')
DELETE /api/v1/redirects/:id       ← requireRole('super_admin')

NOT FOUND LOG
GET    /api/v1/not-found-log       ← requireRole('super_admin')
POST   /api/v1/not-found-log       ← (called by Next.js middleware — internal auth token)

SETTINGS
GET    /api/v1/settings            ← requireAuth
PUT    /api/v1/settings            ← requireRole('super_admin'), { key, value }

FEEDS
GET    /api/v1/feed/google-merchant ← (public — XML response)

REVALIDATION (internal)
POST   /api/v1/revalidate          ← internal token auth
       body: { paths: string[], tags: string[] }
```

---

## IMPLEMENTATION ORDER (REVISED PHASE 3+)

```
Phase 3 — Database
  3.1 Apply schema corrections (new tables + modified quotes)
  3.2 Generate + apply migration
  3.3 Seed: admin user, 9 product categories, 50 priority cities

Phase 4 — API Core
  4.1 Products CRUD + variants
  4.2 Categories CRUD
  4.3 Cities API
  4.4 Quote submission engine (multi-item, price calc, PDF, email)
  4.5 Auth (complete + test)
  4.6 Media upload
  4.7 City SEO pages API
  4.8 Redirects + 404 logger API
  4.9 Settings API
  4.10 Write docs/API.md

Phase 5 — Frontend Public Site
  5.1 Global layout: Header (nav, CTA) + Footer
  5.2 Product catalog + detail pages
  5.3 Quote Engine (4-step form) — the most important page
  5.4 Quote confirmation page
  5.5 City × Product SEO pages (ISR)
  5.6 City landing pages
  5.7 Sitemap + robots.txt
  5.8 JSON-LD injection

Phase 6 — Admin Panel
  6.1 Admin shell layout (sidebar navigation)
  6.2 Auth (login page + middleware guard)
  6.3 Dashboard (stats overview)
  6.4 Product CRUD with block-aware description editor
  6.5 Quote inbox + detail view
  6.6 City SEO page manager (bulk activate/edit)
  6.7 Block editor (for content pages)
  6.8 Redirect manager + 404 log
  6.9 Media library
  6.10 Settings panel

Phase 7 — Integrations
  7.1 Email (Nodemailer/SendGrid)
  7.2 WhatsApp notification
  7.3 CRM webhook
  7.4 Google Analytics 4
  7.5 AI Writer (city page content generation via OpenAI API)

Phase 8 — SEO Automation
  8.1 Seed 500+ cities (from public data source)
  8.2 Bulk city × product page generator script
  8.3 AI content generation for top 200 pages
  8.4 Google Merchant Feed implementation
  8.5 Dynamic OG image API

Phase 9 — QA + Launch
  9.1 Core Web Vitals audit
  9.2 WCAG 2.1 AA audit
  9.3 OWASP security review
  9.4 Staging deploy + stakeholder review
  9.5 Production deploy
```

---

## SYSTEM 8 — SEO SYSTEM (COMPLETE)

### 8.1 Internal Linking Strategy

Internal links are the backbone of SEO authority flow. Every link must be intentional.

#### Link Graph Rules

```
Product Detail Page links OUT to:
  → Category page (breadcrumb)
  → 5 related products (same category, different slug) — "Related Products" section
  → Top 5 city×product pages ("Available in: Pune, Mumbai, Delhi, Bangalore, Hyderabad")
  → Quote Engine (pre-filled with productId)

City × Product Page links OUT to:
  → Product detail page ("View Full Specifications →")
  → Other product categories in same city ("Also available in {cityName}: ...")
  → Nearby city pages ("Serving cities near {cityName}: {city1}, {city2}, {city3}")
  → Blog posts tagged with same product category (max 3)
  → Quote Engine (pre-filled with productId + cityId)

Category Page links OUT to:
  → All published products in category
  → Top 10 cities for that product category
  → Blog posts tagged with category

Blog Post links OUT to:
  → Product pages mentioned in post (editorial, max 3 per post)
  → Relevant city pages if city is mentioned
  → Other blog posts (max 3 "Read also" links at bottom)

Homepage links OUT to:
  → All product categories
  → Top 5 city pages (most traffic per analytics)
  → Quote Engine
  → Latest 3 blog posts

Footer links (site-wide, constant):
  → Products: all category pages (max 9)
  → Cities: top 20 cities grouped by region (North / South / East / West)
  → Resources: About, Blog, Contact, Privacy, Terms
```

#### Anchor Text Rules (enforced in content guidelines)
```
✅ "Prefab portable cabin in Pune"   — descriptive, keyword-rich
✅ "Get a free quote for warehouses" — action-oriented
✅ "View portable cabin specifications"
❌ "Click here"
❌ "Read more"
❌ "Learn more" (unless no alternative)
```

#### Nearby Cities Logic (DB-driven)
```typescript
// In cities table, add: latitude DECIMAL(9,6), longitude DECIMAL(9,6)
// Nearby = cities within 150km radius of current city
// Stored as computed field or queried at render via Haversine formula

// SQL for nearby cities (run once, cache result):
SELECT name, slug, state
FROM cities
WHERE earth_distance(
  ll_to_earth(latitude, longitude),
  ll_to_earth($lat, $lng)
) < 150000  -- 150km in meters
  AND id != $currentCityId
  AND is_active = true
ORDER BY earth_distance(...) ASC
LIMIT 6;
```
> Note: PostgreSQL `earthdistance` extension required. Add to migration: `CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;`

---

### 8.2 Canonical Rules

Every page sets a self-referencing canonical. Rules for edge cases:

| Scenario | Canonical Rule |
|---|---|
| `/products?category=portable-cabin` | Redirect 301 → `/products/portable-cabin` (query param version should not exist) |
| `/products/portable-cabin?page=2` | canonical = same URL (`/products/portable-cabin?page=2`), NOT stripped to page 1 |
| `/Products/Portable-Cabin` (wrong case) | Middleware 301 → `/products/portable-cabin` |
| `/products/portable-cabin/` (trailing slash) | Middleware 301 → `/products/portable-cabin` |
| City page generated but `status = 'draft'` | `<meta name="robots" content="noindex, nofollow">` + NO canonical |
| City page with `status = 'noindex'` | `<meta name="robots" content="noindex, follow">` + self canonical |
| Blog post in multiple categories | canonical = primary slug URL only (no category URL variant) |
| Product in multiple categories | Not allowed — product belongs to exactly one category (enforced at DB level: `categoryId NOT NULL`) |

**Canonical implementation in Next.js:**
```typescript
// In generateMetadata for every page type:
alternates: {
  canonical: `https://samanprefab.com${pathname}`,
}
// pathname must NEVER include query strings (except page= for paginated)
// pathname must NEVER include trailing slash
```

---

### 8.3 Pagination SEO Rules

Applies to: Product catalog (`/products/[category]`), Blog listing (`/blog`).

```
URL format:
  Page 1:  /products/portable-cabin          (no ?page=1 — redirect to clean URL)
  Page 2+: /products/portable-cabin?page=2

Meta rules per page:
  title:       "Portable Cabin — Page 2 | Saman Prefab"
  description: "Browse portable cabin options — page 2 of 5. [unique copy, not same as page 1]"
  canonical:   self

Link rel (in <head> via Next.js metadata.alternates):
  Page 2+: rel="prev" → /products/portable-cabin?page=1 (or ?page=N-1)
  Page 1–N-1: rel="next" → /products/portable-cabin?page=N+1

robots: index, follow on ALL paginated pages (do NOT noindex paginated product pages)

Pagination component must:
  - Render <a> tags (not buttons) for crawlability
  - Show numbered pages + prev/next arrows
  - Max 20 products per page (not configurable by URL param — security)
```

---

### 8.4 Dynamic City Page Content Generation

The default template (used when no `customBlocks` are set in `city_seo_pages`):

```
Section 1 — Hero
H1: "Prefab {categoryName} in {cityName}, {stateName}"
Subtext: "High-quality prefabricated {categoryName.toLowerCase()} delivered to {cityName}.
          Fast installation, ISI-certified materials, competitive pricing."
CTA: "Get Free Quote for {cityName}"  → /get-quote?city={citySlug}&product={categorySlug}

Section 2 — Why Choose Saman Prefab in {cityName}
[3-column grid — static content, branded]
• Pan-{stateName} Coverage
• Delivery to {cityName} within {leadTimeDays.min}–{leadTimeDays.max} working days
• Installation team available in {cityName}

Section 3 — Product Overview (from product data)
H2: "{categoryName} Specifications"
Table: pulls from products in this category (top 3 by sort_order)
Columns: Model | Size | Material | Price Range | Lead Time

Section 4 — Price in {cityName}
H2: "{categoryName} Price in {cityName}"
Text: "The cost of a prefab {categoryName.toLowerCase()} in {cityName} typically ranges
       from ₹{priceMin formatted} to ₹{priceMax formatted}, depending on size,
       material and customisation. Transport to {cityName}, {stateName} may affect
       the final price."
CTA: "Get Exact Quote for {cityName}"

Section 5 — FAQ (5 questions, templated + JSON-LD)
Q1: "What is the price of a prefab {categoryName} in {cityName}?"
Q2: "How long does delivery to {cityName} take?"
Q3: "Do you provide installation in {cityName}?"
Q4: "Is GST included in the price?"
Q5: "Can the {categoryName} be customised for {cityName}'s climate?"

Section 6 — Nearby Cities (internal links)
H2: "Also serving cities near {cityName}"
Links: [{nearbyCity.name} → /prefab-{categorySlug}-in-{nearbyCity.slug}] × 6

Section 7 — CTA Banner
"Ready to order in {cityName}? Get a free quote today."
```

**Template variables resolved at render time from DB:**
- `{cityName}`, `{stateName}`, `{citySlug}`: from `cities` table
- `{categoryName}`, `{categorySlug}`: from `product_categories` table
- `{priceMin}`, `{priceMax}`: MIN/MAX across all published products in category
- `{leadTimeDays}`: MIN/MAX across all published products in category
- `{nearbyCity.*}`: from nearby cities query (Section 8.1)

**AI-assisted content (Phase 7):** When admin triggers "Generate Content" for a city page,
the AI fills `ai_generated_content` with custom prose for sections 2 and 4 using the
above context as prompt variables. This overrides the static template text for those sections.

---

### 8.5 Breadcrumb Schema Strategy

Every page injects `BreadcrumbList` JSON-LD. Implementation via shared utility:

```typescript
// packages/db-free shared util: apps/web/src/lib/seo/breadcrumbs.ts

type BreadcrumbItem = { name: string; href: string };

function buildBreadcrumbs(items: BreadcrumbItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://samanprefab.com${item.href}`,
    })),
  };
}

// Usage per page type:

// Product page:
buildBreadcrumbs([
  { name: 'Home', href: '/' },
  { name: categoryName, href: `/products/${categorySlug}` },
  { name: productName, href: `/products/${categorySlug}/${productSlug}` },
])

// City × Product page:
buildBreadcrumbs([
  { name: 'Home', href: '/' },
  { name: categoryName, href: `/products/${categorySlug}` },
  { name: `${categoryName} in ${cityName}`, href: `/prefab-${categorySlug}-in-${citySlug}` },
])

// Blog post:
buildBreadcrumbs([
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: postTitle, href: `/blog/${postSlug}` },
])
```

Breadcrumb UI component (`apps/web/src/components/Breadcrumb.tsx`) mirrors the JSON-LD items,
renders as `<nav aria-label="Breadcrumb">` with `>` separators.
Both the visual component AND the JSON-LD must always be in sync (both generated from the same `items` array).

---

## SYSTEM 9 — ADMIN PANEL UX

### 9.1 Product Form UI Structure

Product create/edit page at `/admin/products/[id]`. Implemented as a **tabbed form** with unsaved-change detection.

```
┌─────────────────────────────────────────────────────┐
│ ← Back to Products      [Save Draft]  [Publish ▾]  │
│ Status: ● Draft                                     │
├──────────┬──────────┬──────────┬──────────┬─────────┤
│ Basic    │ Content  │ Images   │ Variants │  SEO    │
│ Info     │          │ & Docs   │          │         │
└──────────┴──────────┴──────────┴──────────┴─────────┘
```

**Tab 1 — Basic Info**
```
Product Name*          [___________________________]  65/200
Slug*                  [___________________________]  ↺ Regenerate
Category*              [Dropdown: 9 categories    ▾]
Status                 ○ Draft  ○ Published  ○ Archived
Short Description*     [___________________________]  Char: 0/200
                       (used in catalog cards, must be 80–200 chars)
Price Range (INR)*     From [________] To [________]  per [unit ▾]
Lead Time (days)*      Min [__] Max [__]
```

**Tab 2 — Content**
```
Full Description*
┌─────────────────────────────────────────────────────┐
│ B  I  U  H2  H3  • 1.  ─  [Link]  [Table]  [Code] │
│─────────────────────────────────────────────────────│
│ (Markdown-based rich text — rendered as HTML)       │
└─────────────────────────────────────────────────────┘

Specifications  [+ Add Row]
┌────────────────────┬────────────────────┬──────┐
│ Key                │ Value              │      │
├────────────────────┼────────────────────┼──────┤
│ Floor Area         │ 100 sqft           │  ✕   │
│ Frame Material     │ MS (Mild Steel)    │  ✕   │
│ Wall Material      │ PUF Sandwich Panel │  ✕   │
│ Roof               │ Colour-coated GI   │  ✕   │
└────────────────────┴────────────────────┴──────┘

Downloads  [+ Add Document]
┌────────────────┬───────────────────────────┬──────┐
│ Label          │ File URL                  │      │
├────────────────┼───────────────────────────┼──────┤
│ Spec Sheet     │ /uploads/docs/spec.pdf    │  ✕   │
└────────────────┴───────────────────────────┴──────┘
```

**Tab 3 — Images & Docs**
```
┌────────────────────────────────────────────────────┐
│         Drop images here or click to upload        │
│         Accepts: JPG, PNG, WEBP — max 5MB each     │
└────────────────────────────────────────────────────┘
[img1 ★] [img2] [img3] [img4]  ← drag to reorder, ★ = primary
Click image → set alt text | remove
★ = primary image (used in catalog cards + OG image)
```

**Tab 4 — Variants**
```
[+ Add Variant]
┌──────────────────┬──────────┬──────────┬────────┬──────────┬──────────┬────────┬─────┐
│ Label            │ Size     │ Material │ Finish │ Min (₹)  │ Max (₹)  │ Deflt  │     │
├──────────────────┼──────────┼──────────┼────────┼──────────┼──────────┼────────┼─────┤
│ 10×10 ft, MS     │ 10×10 ft │ MS Frame │Painted │  85,000  │ 1,10,000 │  ★     │  ✕  │
│ 10×12 ft, MS     │ 10×12 ft │ MS Frame │Painted │  95,000  │ 1,25,000 │        │  ✕  │
│ 10×10 ft, GI     │ 10×10 ft │ GI Frame │  GI    │  95,000  │ 1,20,000 │        │  ✕  │
└──────────────────┴──────────┴──────────┴────────┴──────────┴──────────┴────────┴─────┘
★ = default variant (shown first on product page and quote engine)
```

**Tab 5 — SEO (see Section 9.2)**

---

### 9.2 SEO Panel UI

```
┌─────────────── SEO Settings ──────────────────────┐
│                                                    │
│ Focus Keyword  [portable cabin 10x10          ]    │
│                                                    │
│ Meta Title     [Portable Cabin 10×10 ft | Saman ] │
│                ████████████████████▓░░░  48/65    │
│                ● Good length                       │
│                                                    │
│ Meta Description                                   │
│ [Buy portable cabin 10×10 ft — MS frame, PUF    ] │
│ [panels. Starting ₹85,000. Pan-India delivery.  ] │
│                ██████████████████████░░  142/160   │
│                ● Good length                       │
│                                                    │
│ Canonical URL  [https://samanprefab.com/products/] │
│                [portable-cabin/portable-cabin-10x10│
│                                                    │
│ OG Image       [Primary product image ▾]           │
│                                                    │
├─────────── Google Preview ─────────────────────────│
│ [Mobile ▾] [Desktop]                               │
│                                                    │
│ samanprefab.com › products › portable-cabin        │
│ Portable Cabin 10×10 ft | Saman Prefab             │
│ Buy portable cabin 10×10 ft — MS frame, PUF        │
│ panels. Starting ₹85,000. Pan-India delivery.      │
│                                                    │
├─────────── SEO Score ──────────────────────────────│
│ ✅ Focus keyword in title                          │
│ ✅ Focus keyword in slug                           │
│ ✅ Meta title is good length (48 chars)            │
│ ✅ Meta description is good length (142 chars)     │
│ ⚠️  Focus keyword not in meta description          │
│ ✅ Product has at least 1 image                    │
│ ⚠️  Description under 300 words                   │
└────────────────────────────────────────────────────┘
```

**SEO score checks (client-side, no external API):**
```typescript
const checks = [
  { label: 'Focus keyword in title', pass: title.toLowerCase().includes(keyword) },
  { label: 'Focus keyword in slug', pass: slug.includes(slugify(keyword)) },
  { label: 'Title length 30–65 chars', pass: title.length >= 30 && title.length <= 65 },
  { label: 'Description length 120–160 chars', pass: desc.length >= 120 && desc.length <= 160 },
  { label: 'Focus keyword in description', pass: desc.toLowerCase().includes(keyword) },
  { label: 'At least 1 image uploaded', pass: images.length > 0 },
  { label: 'Description at least 300 words', pass: wordCount(description) >= 300 },
];
// ✅ = pass (green), ⚠️ = fail (amber), ❌ = critical fail (red)
// Score = passed / total × 100
```

---

### 9.3 Block Editor UX Flow

Block editor is used in: Content Pages (`/admin/content/[id]`) and City SEO Page custom block overrides.

```
Editor layout (desktop):

┌──────────────────┬────────────────────────────────────────┐
│  Block Palette   │  Canvas                                │
│  ─────────────── │  ──────────────────────────────────    │
│  + Hero          │  [≡] Hero Block                    [✕] │
│  + Text          │      Headline: [________________]      │
│  + Image         │      Subheadline: [_____________]      │
│  + CTA           │      CTA: [text] → [href]             │
│  + FAQ           │                                        │
│  + Testimonials  │  [≡] Text Block                    [✕] │
│  + Product Grid  │      [Markdown editor]                 │
│  + Stats         │                                        │
│  + Two Column    │  [≡] CTA Block                     [✕] │
│                  │      ...                               │
│                  │                                        │
│                  │  [+ Add Block]                         │
│                  │                                        │
├──────────────────┴────────────────────────────────────────┤
│  [← Preview]              [Save Draft]  [Publish Page]    │
└───────────────────────────────────────────────────────────┘
```

**UX Interactions:**
- `[≡]` drag handle — reorder blocks via drag-and-drop (`@dnd-kit/core`)
- `[✕]` — remove block (with undo toast: "Block removed. Undo?")
- Click block header to collapse/expand
- "Add Block" opens a modal picker with block type cards + descriptions
- Preview mode: overlay that renders the full page using actual Next.js components
- Autosave: every 30 seconds if dirty, using `debounce(saveDraft, 30000)`

**Block editor state (`useState` + `useReducer`):**
```typescript
type EditorAction =
  | { type: 'ADD_BLOCK'; blockType: BlockType; position: number }
  | { type: 'REMOVE_BLOCK'; blockId: string }
  | { type: 'UPDATE_BLOCK'; blockId: string; data: Partial<Block> }
  | { type: 'REORDER_BLOCKS'; fromIndex: number; toIndex: number }
  | { type: 'TOGGLE_VISIBILITY'; blockId: string }
  | { type: 'LOAD_BLOCKS'; blocks: Block[] }
```

---

### 9.4 Media Upload & Optimization Flow

```
Client → POST /api/v1/media (multipart/form-data, field: 'file')

Server pipeline (apps/api/src/modules/media/):
  1. Validate: MIME type must be image/jpeg | image/png | image/webp | image/gif
                File size must be ≤ 5MB
  2. Generate filename: {uuid}-{timestamp}.webp
  3. sharp pipeline:
     a. thumbnail: resize({ width: 300 }).webp({ quality: 80 })
        → saved: uploads/media/{year}/{month}/{uuid}-300w.webp
     b. medium:    resize({ width: 800 }).webp({ quality: 82 })
        → saved: uploads/media/{year}/{month}/{uuid}-800w.webp
     c. large:     resize({ width: 1600 }).webp({ quality: 85 })
        → saved: uploads/media/{year}/{month}/{uuid}-1600w.webp
     d. blur:      resize({ width: 10 }).webp({ quality: 50 })
        → base64 string stored as blurDataUrl in DB
  4. Insert media record to DB
  5. Return:
     {
       id, filename,
       urls: { thumbnail, medium, large },
       blurDataUrl,       // base64 10px placeholder for Next.js Image blur
       width, height,     // from sharp metadata of large
       mimeType: 'image/webp',
       sizeBytes
     }
```

**Media library UI (`/admin/media`):**
```
Filter: [All ▾] [Search by filename...] [Sort: Newest ▾]

[img] [img] [img] [img] [img] [img]   ← 6-column grid
[img] [img] [img] [img] [img] [img]   ← lazy loaded

Click image:
  Slide-out panel:
  ┌────────────────────────────┐
  │ [large image preview]      │
  │ Filename: cabin-front.webp │
  │ Size: 284 KB               │
  │ Dimensions: 1600×1067      │
  │ Uploaded: 2026-04-21       │
  │ Alt text: [______________] │
  │ URLs:                      │
  │   Thumbnail [Copy URL]     │
  │   Medium    [Copy URL]     │
  │   Large     [Copy URL]     │
  │ [Use in Editor]  [Delete]  │
  └────────────────────────────┘
```

---

## SYSTEM 10 — QUOTE ENGINE UX FLOW

### 10.1 Frontend Step-by-Step Flow

**Entry points:**
- From product page: `?product={productId}&variant={variantId}` — Step 1 pre-filled, user arrives at Step 2
- From city×product page: `?product={categorySlug}&city={citySlug}` — Step 1 pre-filled with category, Step 2 pre-filled with city
- Direct `/get-quote`: Step 1 with empty state

**Visual structure (desktop: 2-col, mobile: 1-col full-screen wizard):**
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1 ──── Step 2 ──── Step 3 ──── Step 4                │
│  [Products]  [Location]  [Details]   [Contact]              │
├──────────────────────────────────┬──────────────────────────┤
│  FORM AREA                       │  SUMMARY PANEL           │
│                                  │  ─────────────           │
│  (step content renders here)     │  Selected Products       │
│                                  │  Portable Cabin ×2       │
│                                  │  Security Cabin ×1       │
│                                  │                          │
│                                  │  Est. Total              │
│                                  │  ₹1,85,000 – ₹2,40,000  │
│                                  │  (indicative only)       │
│                                  │                          │
│                  [Next →]        │                          │
└──────────────────────────────────┴──────────────────────────┘
```

---

### 10.2 Step Details + Validation

**Step 1 — Select Products**
```
UI:
  Search bar: [Search products...]  ← filters product cards below
  Product cards (grid 2-col mobile, 3-col desktop):
    [image] Product Name
            Category
            ₹85,000–₹1,10,000 / unit
            [+ Add to Quote]

  On "Add to Quote":
    → Product appears in "Your Quote" list below
    → Variant selector dropdown appears (if variants exist)
    → Quantity input (default: 1, min: 1, max: 500, +/- buttons)
    → Unit selector (unit/sqft/piece)
    → Remove (✕) button

  Bottom of step: [Continue to Location →]

Validation (checked on "Continue"):
  - items.length >= 1 — "Add at least one product to continue"
  - Every item: quantity >= 1 — "Quantity must be at least 1"

Price estimate updates: live, on every quantity/variant change
  → Calls estimatePrice() client-side, updates summary panel instantly
```

**Step 2 — Location**
```
UI:
  City*
    [Search city name...]   ← typeahead, debounced 300ms
    API: GET /api/v1/cities?search={q}&limit=10
    Shows: City Name, State below it
    On select: cityId + cityName + stateName stored in state

  Pincode (optional)
    [______]  ← 6 digits, validated on blur
    Helper: "Helps us estimate transport accurately"

  Do you need installation?
    [✅ Yes, include installation]  [❌ No, delivery only]
    (Large toggle-style buttons)

  [← Back]  [Continue to Requirements →]

Validation:
  - cityId required — "Please select a delivery city"
  - pincode if entered: /^[1-9][0-9]{5}$/ — "Enter a valid 6-digit pincode"
```

**Step 3 — Requirements**
```
UI:
  When do you need it?
  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
  │  ASAP    │ │ 1 Month  │ │ 3 Months │ │ Flexible │
  │ 🚀       │ │ 📅       │ │ 🗓️       │ │ ⏱️       │
  └──────────┘ └──────────┘ └──────────┘ └──────────┘
  (radio-style large cards)

  Additional Notes (optional)
  [__________________________________________________]
  [__________________________________________________]
  Max 500 characters. 0/500

  [← Back]  [Continue to Contact →]

Validation:
  - timeline required — "Please select a timeline"
  - notes.length <= 500 (enforced by maxLength, no error needed)
```

**Step 4 — Contact Details**
```
UI:
  Full Name*          [_______________________________]
  Mobile Number*      [+91] [__________________________]
  Email Address*      [_______________________________]
  Company (optional)  [_______________________________]
                      Helper: "For B2B orders — skip if personal"

  ☑ I agree to be contacted by Saman Prefab regarding my quote request.
    [Privacy Policy]

  [← Back]  [Submit Quote Request →]
             (disabled until all fields valid + checkbox checked)

Validation (inline, on blur):
  - name: min 2 chars
  - phone: /^[6-9]\d{9}$/ — "Enter a valid 10-digit mobile number"
  - email: standard email regex
  - checkbox: must be checked to enable submit button
```

---

### 10.3 Error Handling UX

```
Inline field error (on blur or submit attempt):
  → Red border on input
  → Error message below input in red (text-red-600, text-sm)
  → Input gets aria-invalid="true" aria-describedby="field-error-id"

Step-level error (when user hits "Continue" with incomplete step):
  → Red banner at top of step:
    "Please fix the following before continuing:"
    • [error 1]
    • [error 2]
  → Page scrolls to top of step

Submission network error:
  Toast notification (bottom-right, 8 seconds):
  ┌─────────────────────────────────────────────┐
  │ ❌ Submission failed                         │
  │ Don't worry — your data is saved.            │
  │ [Try Again]  [Dismiss]                       │
  └─────────────────────────────────────────────┘
  Implementation: localStorage key 'quote_draft' stores FormState JSON.
  On page load: if draft exists + older than 24h → show "Resume your quote?" banner.

Server validation error (API returns 400):
  → Map Zod error details back to form fields
  → Show inline errors on relevant fields
  → Step navigator jumps back to the step containing the first error

Duplicate submission guard:
  → After successful submit, store refId in localStorage
  → If user tries to submit again within 1 hour from same browser:
    "You already submitted a quote (#{refId}). Check your email for confirmation."
    [View Quote Status]  — links to /get-quote/confirm/{refId}

Rate limit hit (429 from API):
  "Too many requests. Please wait 15 minutes before submitting again."
```

---

### 10.4 Post-Submission WhatsApp Flow

```
Confirmation Page (/get-quote/confirm/{refId}):

┌──────────────────────────────────────────────────────┐
│  ✅ Quote Submitted Successfully!                    │
│                                                      │
│  Your Quote ID: SP-20260421-4823                     │
│  We'll contact you within 24 hours.                  │
│                                                      │
│  📧 Confirmation sent to rahul@email.com             │
│                                                      │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💬 Get instant update on WhatsApp            │    │
│  │ Connect with our sales team now              │    │
│  │ [Open WhatsApp Chat]                         │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  [Download Quote PDF]   [Browse More Products]       │
└──────────────────────────────────────────────────────┘

"Open WhatsApp Chat" button:
  href="https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%20just%20submitted%20quote%20SP-20260421-4823.%20Can%20you%20confirm%20receipt%3F"
  target="_blank"
  rel="noopener noreferrer"
  Note: Replace XXXXXXXXXX with settings.get('whatsapp_number') at render time

"Download Quote PDF" button:
  href="/api/v1/quotes/SP-20260421-4823/pdf"
  download
  Only enabled after PDF is generated (poll status via GET /api/v1/quotes/ref/{refId})

If WhatsApp Business API is configured (settings.whatsapp_api_token exists):
  → On quote submit server-side, send template message to customer's number:
    Template: "Hello {name}, your quote #{refId} for {product} has been received.
               Our team will contact you within 24 hours. — Saman Prefab"
  → WhatsApp button on confirmation page still shown (for direct chat)
```

---

## SYSTEM 11 — API CONTRACT STANDARD

### 11.1 Request Format

All API requests follow these rules:

```
POST / PUT / PATCH:
  Content-Type: application/json
  Body: JSON object matching the Zod schema for that endpoint

GET:
  No body
  Filters via query params (see 11.3)

File upload (POST /api/v1/media):
  Content-Type: multipart/form-data
  Fields:
    file: File (required)
    altText: string (optional)

Authentication:
  Primary:   Cookie header → token={jwt}  (httpOnly, set by /auth/login)
  Fallback:  Authorization: Bearer {jwt}  (for mobile / server-to-server)
  Internal:  X-Internal-Token: {INTERNAL_API_SECRET}  (for /revalidate, /not-found-log)
```

### 11.2 Success Response Format

```typescript
// Single resource:
{
  "success": true,
  "data": { ...resource }
}

// Paginated list:
{
  "success": true,
  "data": [ ...items ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 147,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}

// Mutation success (create / update / delete):
{
  "success": true,
  "data": { ...updatedResource }
  // For DELETE: "data": { "id": "uuid-of-deleted" }
}

// Async job started (quote PDF, bulk actions):
{
  "success": true,
  "data": { "jobId": "...", "message": "Processing. Check status shortly." }
}
```

**HTTP status codes:**
```
200 OK          — GET success, PUT/PATCH success
201 Created     — POST success (resource created)
204 No Content  — DELETE success (no body)
400 Bad Request — Validation error, malformed request
401 Unauthorized — Missing or invalid token
403 Forbidden   — Valid token but insufficient role
404 Not Found   — Resource not found
409 Conflict    — Unique constraint violation (e.g., duplicate slug)
429 Too Many    — Rate limit exceeded
500 Internal    — Unhandled server error
```

### 11.3 Error Response Format

```typescript
// All errors:
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",       // machine-readable, screaming snake case
    "message": "Human-readable error summary",
    "details": [                // optional — only for VALIDATION_ERROR
      {
        "field": "contact.phone",
        "message": "Enter a valid 10-digit Indian mobile number",
        "received": "12345"     // optional — the value that failed
      }
    ],
    "retryAfter": 900           // optional — only for RATE_LIMITED (seconds)
  }
}
```

**Error codes registry:**
```
VALIDATION_ERROR      400  — Zod schema rejected input
INVALID_JSON          400  — Request body is not valid JSON
MISSING_FIELD         400  — Required field absent (not caught by Zod)
UNAUTHORIZED          401  — No auth token or token expired
INVALID_TOKEN         401  — Token signature invalid
FORBIDDEN             403  — Authenticated but wrong role
NOT_FOUND             404  — Resource does not exist
SLUG_CONFLICT         409  — Slug already exists (product/city page creation)
EMAIL_CONFLICT        409  — Email already registered (user creation)
RATE_LIMITED          429  — Too many requests
PDF_NOT_READY         202  — PDF generation in progress, retry in N seconds
INTERNAL_ERROR        500  — Unhandled exception (log and return generic message)
```

### 11.4 Query Parameter Standard (GET list endpoints)

```
Pagination:
  ?page=1          default: 1
  ?limit=20        default: 20, max: 100

Filtering:
  ?status=published|draft|archived
  ?categoryId={uuid}
  ?cityId={uuid}
  ?search={string}   — full-text search on name/title/slug (ILIKE '%term%')
  ?from=2026-01-01   — ISO date, filter by createdAt >=
  ?to=2026-12-31     — ISO date, filter by createdAt <=

Sorting:
  ?sortBy=createdAt|name|price|updatedAt   default: createdAt
  ?sortOrder=asc|desc                       default: desc

Field selection (admin list views):
  ?fields=id,name,slug,status   — comma-separated, limits response fields
```

### 11.5 Drizzle Query Pattern (standard for all list queries)

```typescript
// Standard pattern used across all service files:
async function listProducts(query: ListProductsQuery) {
  const { page = 1, limit = 20, status, categoryId, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;

  const conditions: SQL[] = [];
  if (status)     conditions.push(eq(products.status, status));
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (search)     conditions.push(ilike(products.name, `%${search}%`));

  const [items, [{ count }]] = await Promise.all([
    db.select().from(products)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sortOrder === 'desc' ? desc(products[sortBy]) : asc(products[sortBy]))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)` }).from(products)
      .where(conditions.length ? and(...conditions) : undefined),
  ]);

  return {
    items,
    meta: {
      page, limit,
      total: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
      hasNext: page * limit < Number(count),
      hasPrev: page > 1,
    },
  };
}
```

---

## SYSTEM 12 — PERFORMANCE SYSTEM

### 12.1 Caching Strategy

**Next.js ISR revalidation times:**
```
/                                   revalidate: 3600   (1 hour — homepage changes infrequently)
/products                           revalidate: 1800   (30 min)
/products/[category]                revalidate: 1800
/products/[category]/[slug]         revalidate: 3600   (product data changes rarely)
/prefab-[product]-in-[city]         revalidate: 86400  (24 hours — city pages are stable)
/blog                               revalidate: 1800
/blog/[slug]                        revalidate: 3600
/about, /contact                    revalidate: 86400
/sitemap.xml                        revalidate: 3600   (via Next.js sitemap API)
```

**On-demand revalidation (immediate, after admin publish):**
```typescript
// Called by apps/api POST /api/v1/revalidate → triggers Next.js /api/revalidate
// apps/web/src/app/api/revalidate/route.ts

async function POST(req: Request) {
  const { paths, tags, token } = await req.json();
  if (token !== process.env.REVALIDATION_SECRET) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await Promise.all([
    ...paths.map((p: string) => revalidatePath(p)),
    ...tags.map((t: string) => revalidateTag(t)),
  ]);
  return Response.json({ revalidated: true });
}

// Trigger examples:
// Product published:  paths=['/products', '/products/portable-cabin', '/products/portable-cabin/my-product']
//                     tags=['products', 'product-my-product']
// City page activated: paths=['/prefab-portable-cabin-in-pune', '/sitemap-cities.xml']
// Blog published:     paths=['/blog', '/blog/my-post'], tags=['blog']
```

**API response caching (Express + `Cache-Control` headers):**
```
GET /api/v1/cities          Cache-Control: public, max-age=86400, s-maxage=86400
GET /api/v1/categories      Cache-Control: public, max-age=3600, s-maxage=3600
GET /api/v1/products        Cache-Control: public, max-age=300, s-maxage=300, stale-while-revalidate=60
GET /api/v1/products/:slug  Cache-Control: public, max-age=600, s-maxage=600
GET /api/v1/settings        Cache-Control: private, max-age=60      (auth required)
POST /api/v1/quotes         Cache-Control: no-store
All admin endpoints:        Cache-Control: no-store, no-cache
```

**In-memory cache for redirect lookups (apps/web/src/lib/redirect-cache.ts):**
```typescript
import LRU from 'lru-cache';                // 'lru-cache' package
const cache = new LRU<string, RedirectRecord | null>({ max: 1000, ttl: 1000 * 60 * 5 }); // 5 min TTL, 1000 entries
// Fetch from DB on miss, store result (including null = "no redirect") to prevent DB hammering
```

---

### 12.2 Image Optimization Pipeline

**Upload → storage (server-side, apps/api):**
```
Input: any JPEG/PNG/WEBP/GIF (max 5MB)
Tool: sharp (npm package, native bindings, fast)

Output:
  300w  webp q80  → thumbnail (catalog cards, admin library)
  800w  webp q82  → medium   (product page gallery, blog)
  1600w webp q85  → large    (full-screen views, OG image source)
  10px  webp q50  → base64 blurDataUrl (Next.js Image placeholder)

Storage path: uploads/media/{YYYY}/{MM}/{uuid}-{size}w.webp
CDN path:     https://cdn.samanprefab.com/media/{YYYY}/{MM}/{uuid}-{size}w.webp
```

**Frontend usage with Next.js `<Image>`:**
```tsx
// Catalog card (thumbnail):
<Image src={urls.thumbnail} width={300} height={200} alt={alt} loading="lazy" />

// Hero / product detail (large, LCP element):
<Image src={urls.large} width={1600} height={1067} alt={alt} priority={true}
       placeholder="blur" blurDataURL={blurDataUrl} />

// Blog header:
<Image src={urls.medium} width={800} height={533} alt={alt}
       placeholder="blur" blurDataURL={blurDataUrl} loading="lazy" />
```

**Next.js image config (`next.config.ts`):**
```typescript
images: {
  domains: ['cdn.samanprefab.com', 'localhost'],
  formats: ['image/avif', 'image/webp'],   // avif first, webp fallback
  deviceSizes: [375, 640, 750, 828, 1080, 1200, 1600],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 300],
  minimumCacheTTL: 2592000,  // 30 days
}
```

---

### 12.3 CDN Usage

**MVP (XAMPP/VPS):**
```
Static assets served by Nginx directly (bypass Node.js)
Cloudflare (free tier) in front:
  - Uploads:         /uploads/* → Cache TTL: 30 days
  - Next.js static:  /_next/static/* → Cache TTL: 1 year (immutable, content-hashed)
  - Pages:           / → Cache TTL: respect Cache-Control from Next.js
  - API:             /api/* → Bypass cache (Cache-Control: no-store)
  - Admin:           /admin/* → Bypass cache
```

**Nginx config snippet (production):**
```nginx
location /uploads/ {
  alias /var/www/saman-prefab/apps/api/uploads/;
  expires 30d;
  add_header Cache-Control "public, immutable";
  add_header Vary "Accept-Encoding";
  gzip_static on;
}
location /_next/static/ {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

**CDN subdomain:** `cdn.samanprefab.com` CNAME → origin server.
Set in `.env`: `CDN_BASE_URL=https://cdn.samanprefab.com` (empty string for local dev → falls back to `/uploads/...`).

---

### 12.4 Lazy Loading Rules

```typescript
// Rule 1: Hero images are NEVER lazy-loaded
<Image src={heroImage} priority={true} />  // ← always priority on LCP images

// Rule 2: First N items in catalog are priority, rest lazy
items.map((product, index) => (
  <ProductCard key={product.id} image={product.images[0]}
    priority={index < 3} />  // first 3 cards = priority, rest = lazy
))

// Rule 3: Heavy admin components use dynamic import
const BlockEditor = dynamic(() => import('@/components/admin/BlockEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-96 w-full" />,
});

const RichTextEditor = dynamic(() => import('@/components/admin/RichTextEditor'), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const MediaLibraryModal = dynamic(() => import('@/components/admin/MediaLibraryModal'), {
  ssr: false,
});

// Rule 4: Charts (admin dashboard) always dynamic
const DashboardCharts = dynamic(() => import('@/components/admin/DashboardCharts'), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
});

// Rule 5: Below-fold sections on marketing pages use Intersection Observer
// next/dynamic wrapping is sufficient — Next.js handles chunk splitting
// Do NOT use loading="lazy" on <img> tags — always use <Image> from next/image

// Rule 6: Google Maps / embeds (Contact page) — lazy load via IntersectionObserver
const MapEmbed = dynamic(() => import('@/components/MapEmbed'), { ssr: false });
```

---

## DESIGN LOCK SUMMARY

**All systems are now fully specified. No implementation should require revisiting this document
for design decisions — only for reference.**

| System | Status |
|---|---|
| SEO Architecture (slugs, ISR, metadata, JSON-LD, sitemap) | ✅ Locked |
| SEO Internal Linking Strategy | ✅ Locked |
| SEO Canonical + Pagination Rules | ✅ Locked |
| SEO City Page Content Template | ✅ Locked |
| SEO Breadcrumb Schema | ✅ Locked |
| Database Schema (all tables, all fields) | ✅ Locked |
| Quote Engine (state machine, pricing, refId, PDF, comms) | ✅ Locked |
| Quote Engine UX (step flow, validation, errors, WhatsApp) | ✅ Locked |
| Admin Panel Structure (route group in apps/web) | ✅ Locked |
| Admin Product Form UI (5 tabs, all fields) | ✅ Locked |
| Admin SEO Panel UI (preview, score checks) | ✅ Locked |
| Admin Block Editor UX (8 block types, interactions) | ✅ Locked |
| Admin Media Upload + Optimization Pipeline | ✅ Locked |
| API Contract (request, response, error formats) | ✅ Locked |
| API Error Code Registry | ✅ Locked |
| API Query Parameter Standard | ✅ Locked |
| Drizzle Query Pattern (standard list query) | ✅ Locked |
| Performance: ISR + On-demand Revalidation | ✅ Locked |
| Performance: Image Pipeline (sharp + WebP + blur) | ✅ Locked |
| Performance: CDN + Nginx Strategy | ✅ Locked |
| Performance: Lazy Loading Rules | ✅ Locked |
| Simplification Decisions | ✅ Locked |
| Full API Endpoint Registry (50+ endpoints) | ✅ Locked |
| Implementation Phase Order (3–9) | ✅ Locked |

**Next action:** Implement Phase 3 — run `npm install`, apply corrected DB schema, generate migration, seed data.

---

*Document status: DESIGN LOCKED v2.0 — No further architecture decisions required before Phase 9*
*Last updated: 2026-04-21*
