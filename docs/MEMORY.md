# MEMORY.md
## Saman Prefab Platform — Agent Working Memory

**Last Updated:** 2026-04-24
**Current Phase:** AI Content Engine ✅ (Round 10) — Centralized, configurable, SEO-optimized AI engine across Products and Blog

---

## ✅ Completed

### Round 10 — AI Content Engine (2026-04-24) ✅ COMPLETE

#### DB (migration 0006_ai_engine.sql APPLIED ✓)
- Tables: `ai_settings` (context unique: global/product/blog), `ai_generation_log`
- `ai_context` enum: `global | product | blog`
- 3 rows seeded with default instructions per context
- Schema: `packages/db/src/schema/ai-settings.ts` → exported in schema/index.ts

#### API
- Module: `apps/api/src/modules/ai-settings/`
- `GET /api/v1/ai-settings` — list all (auth)
- `GET /api/v1/ai-settings/:context` — get by context (public, used by Next.js route)
- `PUT /api/v1/ai-settings/:context` — upsert (super_admin only)
- `POST /api/v1/ai-settings/log` — create generation log
- `GET /api/v1/ai-settings/logs` + `/stats` — usage monitoring

#### AI Engine (ai.service.ts REFACTORED)
- `buildSystemPrompt(settings, fallbackContext)` — dynamic prompt from admin settings
- `generateProductContent(ctx, adminSettings)` — full product: title/desc/specs/FAQs/SEO
- `generateBlogPost(ctx, adminSettings)` — full post: HTML content, headings, FAQs, SEO, internal links, CTA
- `generateSEO(ctx, adminSettings)` — SEO meta for both product and blog
- `generateFAQs(ctx, adminSettings)` — 6 Google-optimized FAQs
- `rewriteText(text, mode, adminSettings)` — rewrite | expand | seo_optimize modes
- `callAIByType(type, context, adminSettings)` — unified dispatcher

#### Route (app/api/ai/generate/route.ts UPGRADED)
- Fetches admin settings from backend by context before each generation
- Passes `adminSettings` to AI engine so prompts are always admin-configurable
- Logs every generation (success + failure) to `ai_generation_log` via API
- Returns `_meta: { settingsLoaded, settingsContext, durationMs }` in response

#### Frontend
- `apps/web/src/types/ai-settings.types.ts` — AISetting, ContentRules, AIGenerationLog, AILogStats
- `apps/web/src/services/ai-settings.service.ts` — getAll, getByContext, upsert, getLogs, getStats
- `apps/web/src/hooks/useAISettings.ts` — useAllAISettings, useAISetting, useUpdateAISetting, useAILogs, useAIStats
- `apps/web/src/lib/api.ts` — added `aiSettings: '/ai-settings'` endpoint

#### Admin AI Writing Page (`/admin/ai-settings`)
- 3-tab config: Product / Blog / Global
- Per-context: systemPrompt textarea, tone select, targetKeywords, language, contentRules checkboxes, minWordCount
- Live prompt preview (rendered system prompt as it will be sent to AI)
- Stats cards: total / success / failed / avg duration
- Usage logs table with action type, context, input summary, duration, status

#### AIPanel (UPGRADED — apps/web/src/components/products/AIPanel.tsx)
- New `context: "product" | "blog"` prop — single panel for both CMS types
- 3 tabs: Generate (✨ Content / ✨ Full Post) | SEO Optimize | Rewrite
- Rewrite modes: rewrite | expand | seo_optimize
- Blog result shows: title, excerpt, headings, internal link suggestions, FAQs, SEO preview
- Product result shows: title, shortDescription, specs, FAQs, SEO preview
- "✓ Admin settings loaded" indicator from `_meta.settingsLoaded` in response
- Passes `contentContext` to `/api/ai/generate` for correct settings selection

#### PostForm (UPGRADED — blog AI integration)
- AI button added to header bar (star icon, violet gradient)
- `handleAIApply` applies: title, excerpt, content (HTML), metaTitle, metaDescription, suggestedSlug
- Auto-switches to "content" or "seo" tab after apply
- `<AIPanel context="blog" />` with postTitle, postCategory, postTags, postExcerpt props

#### ProductForm (UPDATED)
- Passes `context="product"` to AIPanel

#### Sidebar
- "AI Writing" item added (star icon) → `/admin/ai-settings`

---

### Round 9 — Blog CMS (2026-04-23) ✅ COMPLETE

#### DB Schema
- New tables: `post_categories`, `post_tags`, `posts`, `post_category_map`, `post_tag_map`
- `post_status` enum: `draft | published`
- SEO fields on posts: metaTitle, metaDescription, canonicalUrl, OG + Twitter variants
- Self-referencing parentId on `post_categories` for nested hierarchy
- Migration `0005_blog_cms.sql` APPLIED ✓
- Schema file: `packages/db/src/schema/blog.ts` — exported from `schema/index.ts`

#### API (apps/api)
- `modules/posts/` — schema (Zod), service (slugify, attachRelations, syncRelations), controller, routes
- `modules/post-categories/` — CRUD, parentId support, slug uniqueness
- `modules/post-tags/` — CRUD, slug uniqueness
- Registered in `app.ts`: `/api/v1/posts`, `/api/v1/post-categories`, `/api/v1/post-tags`
- Auth: `super_admin` + `content_editor` for write ops; public GET

#### Frontend (apps/web)
- `src/types/post.types.ts` — Post, PostCategory, PostTag, PostStatus enum, payloads
- `src/services/post.service.ts` — postService, postCategoryService, postTagService
- `src/hooks/usePosts.ts` — all CRUD hooks with debug logs + cache invalidation
- `src/lib/api.ts` — added `posts`, `postCategories`, `postTags` endpoints

#### Admin Pages
- `/admin/blog/posts` — list with search/filter, pagination, delete confirm
- `/admin/blog/posts/new` — new post creation
- `/admin/blog/posts/[id]/edit` — edit post with live data load
- `/admin/blog/categories` — CRUD with parent category + slug support
- `/admin/blog/tags` — CRUD with search, tag cloud table

#### PostForm Component (`components/blog/PostForm.tsx`)
- 5-tab editor: Basic Info | Content | Media | SEO | Social
- Basic: title, slug (auto-gen + manual), excerpt, multi-select categories + tags
- Content: TinyMCE `RichTextEditor` (dynamic import)
- Media: Featured image via `MediaLibrary` modal; OG/Twitter image pickers on Social tab
- SEO: live score (0–100) with suggestions, meta title/desc char bars, Google SERP preview, JSON-LD note
- Social: OG title/desc/image + Twitter title/desc/image (separate)
- Right sidebar: live stats (status, categories, tags, word count) + SEO score card
- Content stored as `{ html: "<htmlstring>" }` in JSONB; extracted on load

#### Sidebar
- Products group: All Products, Categories, Attributes
- Blog group (new): All Posts, Categories, Tags
- Uses `DocsIcon` for Blog group

#### Key Files (Round 9 new):
- `packages/db/src/schema/blog.ts`
- `packages/db/migrations/0005_blog_cms.sql` ← APPLIED ✓
- `apps/api/src/modules/posts/` (4 files)
- `apps/api/src/modules/post-categories/` (4 files)
- `apps/api/src/modules/post-tags/` (4 files)
- `apps/web/src/types/post.types.ts`
- `apps/web/src/services/post.service.ts`
- `apps/web/src/hooks/usePosts.ts`
- `apps/web/src/lib/api.ts` — 3 new endpoints
- `apps/web/src/components/blog/PostForm.tsx`
- `apps/web/src/app/admin/blog/posts/page.tsx`
- `apps/web/src/app/admin/blog/posts/new/page.tsx`
- `apps/web/src/app/admin/blog/posts/[id]/edit/page.tsx`
- `apps/web/src/app/admin/blog/categories/page.tsx`
- `apps/web/src/app/admin/blog/tags/page.tsx`
- `apps/web/src/layout/AppSidebar.tsx` — Blog group added

---

### Round 8 — Caching & Admin Fix Phase (2026-04-22) ✅ COMPLETE

#### IMPORTANT: Next.js version is 16.2.4 (not 14.2.4 as previously recorded)
- `revalidateTag(tag, profile)` requires 2 args in v16
- psql binary: `/opt/homebrew/Cellar/postgresql@15/15.14/bin/psql`

#### Fix 1: Global No-Cache at All Layers
- **QueryContext.tsx**: `staleTime: 0` (was 60s), `refetchOnWindowFocus: true` (was false)
- **fetch.ts**: Added `cache: 'no-store'` to all fetch calls
- **API app.ts**: Global middleware for all `/api/v1/*` routes: `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate` + `Pragma: no-cache` + `Expires: 0`

#### Fix 2: attribute_values DB Table
- New table: `attribute_values` (id, attribute_id FK→product_attributes, value, sort_order, created_at)
- Unique index on `(attribute_id, value)`
- Migration `0004_attribute_values.sql` APPLIED ✓
- Drizzle schema updated in `product-attributes.ts`

#### Fix 3: Attributes API — Value Endpoints
- `GET  /api/v1/attributes/:id/values` — list values for attribute
- `POST /api/v1/attributes/:id/values` — create value
- `PATCH /api/v1/attributes/:id/values/:valueId` — update value
- `DELETE /api/v1/attributes/:id/values/:valueId` — delete value
- Service: `createAttributeValue`, `updateAttributeValue`, `deleteAttributeValue`, `listAttributeValues`
- All `listAttributes` responses now include `values[]` array per attribute

#### Fix 4: Admin Attributes Page (WordPress-level)
- Route: `/admin/attributes`
- Split-panel UI: left = attribute list (click to select), right = values panel for selected attribute
- Inline value editing: click Edit → native input → Enter/Save/Escape
- Attribute modal with name, unit, type (text/number/select), isActive, sortOrder
- Full CRUD for both attributes and their values
- Added to sidebar nav

#### Fix 5: Global Cache Clear System
- Next.js route: `POST /api/admin/cache/clear` (cookie-guarded)
  - Calls `revalidatePath` on 5 public paths + `revalidateTag` on 6 tags
- **"Clear Website Cache"** button in Settings page under new "Website Cache" section
- Shows success/error feedback with paths+tags cleared count
- Debug log on success: `[Cache Clear] ISR cache cleared`

#### Fix 6: Debug Logs Added
- `useCategories`: `[useCreateCategory]`, `[useUpdateCategory]` success + settled logs
- `useAttributes`: all mutation hooks log success + cache invalidation
- `fetch.ts`: `cache: 'no-store'` on all requests

#### Key Files (Round 8 new/changed):
- `apps/web/src/context/QueryContext.tsx`
- `apps/web/src/lib/fetch.ts`
- `apps/api/src/app.ts` — global no-store middleware
- `packages/db/src/schema/product-attributes.ts` — added attributeValues table
- `packages/db/migrations/0004_attribute_values.sql` ← APPLIED ✓
- `apps/api/src/modules/attributes/` — all 4 files updated
- `apps/web/src/services/attribute.service.ts` — value CRUD methods
- `apps/web/src/hooks/useAttributes.ts` — value mutation hooks + debug logs
- `apps/web/src/app/admin/attributes/page.tsx` ← NEW
- `apps/web/src/layout/AppSidebar.tsx` — Attributes nav item
- `apps/web/src/app/api/admin/cache/clear/route.ts` ← NEW
- `apps/web/src/app/admin/settings/page.tsx` — ClearCacheButton + Website Cache section
- `apps/web/src/hooks/useCategories.ts` — debug logs

### Round 7 — Data Sync Fix Phase (2026-04-22) ✅ COMPLETE

#### Issue 1: Product Status Sync (root cause fixed)
- **Root cause:** `onSettled` used `refetchType: 'inactive'` — active list query never got server-side refetch after mutation. Optimistic update also wrote frontend status format (`ACTIVE`) directly to cache without remapping to backend format (`published`).
- **Fix:** Added `STATUS_TO_BACKEND` remap in `onMutate` normalized payload; changed `onSettled` to `refetchType: 'all'` in `useProducts.ts`.

#### Issue 2: Category Create/Update Delay (root cause fixed)
- **Root cause:** No optimistic UI — UI waited for 2 round-trips (mutation → invalidate → refetch) before updating.
- **Fix:** Full optimistic create/update/delete in `useCategories.ts` with snapshot rollback on error. Also set `staleTime: 0` on category queries.

#### Issue 3: Category Edit Blank Form (root cause fixed)
- **Root cause:** `CategoryModal` always mounted in JSX; `useState(category?.name)` only ran on first mount, never re-ran when `category` prop changed.
- **Fix:** Added `useEffect([isOpen, category])` in `CategoryModal` to sync form state whenever modal opens or category changes.

#### Issue 4: Validation Error Field-Level Display (root cause fixed)
- **Root cause:** `catch` blocks only read `err?.message`, ignoring `ApiError.details: [{field, message}]` already returned by backend Zod middleware.
- **Fix:** Added `fieldErrors` state in `CategoryModal`; `catch` block now parses `err?.details` array into a `field → message` map; each input renders its own `<p className="text-error-500">` below it.

#### Issue 5: Dynamic Attribute System (implemented from scratch)
- **New table:** `product_attributes` (id, name, unit, type: text|number|select, options JSONB, is_active, sort_order)
- **Migration:** `packages/db/migrations/0003_product_attributes.sql` — APPLIED ✓ (seeded 12 prefab-specific attributes)
- **API module:** `apps/api/src/modules/attributes/` (schema, service, controller, routes) — registered at `GET|POST|PATCH|DELETE /api/v1/attributes`
- **Frontend service:** `apps/web/src/services/attribute.service.ts`
- **Frontend hooks:** `apps/web/src/hooks/useAttributes.ts` (`useAttributes`, `useActiveAttributes`, `useCreateAttribute`, `useUpdateAttribute`, `useDeleteAttribute`)
- **ProductForm:** Specs tab replaced with `SpecsTab` component — shows predefined attribute dropdown (select type renders options dropdown, number type renders number input), custom label fallback for manual entry

#### Key Files Changed (Round 7):
- `apps/web/src/hooks/useProducts.ts` — status remap in onMutate + refetchType:all
- `apps/web/src/hooks/useCategories.ts` — full optimistic CRUD
- `apps/web/src/app/admin/categories/page.tsx` — useEffect form reset + field errors
- `packages/db/src/schema/product-attributes.ts` — NEW
- `packages/db/src/schema/index.ts` — exports product-attributes
- `packages/db/migrations/0003_product_attributes.sql` — APPLIED ✓
- `apps/api/src/modules/attributes/` — NEW module (4 files)
- `apps/api/src/app.ts` — registered `/api/v1/attributes`
- `apps/web/src/lib/api.ts` — added `attributes` endpoint
- `apps/web/src/services/attribute.service.ts` — NEW
- `apps/web/src/hooks/useAttributes.ts` — NEW
- `apps/web/src/components/products/ProductForm.tsx` — SpecsTab component + useActiveAttributes

### Phase 1 — Foundation Setup (2026-04-20)
- [x] Created root folder structure: `/docs`, `/apps`, `/packages`
- [x] Created `docs/PRD.md` — Full product requirements documented
- [x] Created `docs/RULES.md` — Engineering, design, SEO, and agent governance rules
- [x] Created `docs/MEMORY.md` — This file, agent working memory initialized
- [x] Created `docs/TASKS.md` — Phase-wise checklist initialized

### Phase 2 — Monorepo & Tooling Setup (2026-04-21)
- [x] Root `package.json` — npm workspaces + Turborepo scripts
- [x] `turbo.json` — task pipeline (build, dev, lint, type-check, test, db:*)
- [x] Root `tsconfig.json` — base config (files:[] = monorepo base, not compiled directly)
- [x] `.prettierrc` — code formatting rules
- [x] `.eslintrc.js` — TypeScript + Prettier linting rules
- [x] `.gitignore` — node_modules, .env, dist, .next, uploads
- [x] `.env.example` — all required env vars declared
- [x] `README.md` — full setup instructions, scripts, API table
- [x] `packages/config` — shared ESLint, Prettier, TypeScript base/nextjs/node configs
- [x] `packages/db` — Drizzle ORM schema (7 tables: products, categories, quotes, cities, users, content, media) + DB client
- [x] `packages/ui` — shared components: Button, Input, Card, Badge
- [x] `apps/api` — modular Express backend: 4 modules (auth, products, quotes, cities), 3 middleware layers, rate limiting, JWT auth
- [x] `apps/web` — Next.js 14 App Router skeleton: layout, homepage, 404, Tailwind, Inter font

**⚠️ NEXT REQUIRED ACTION:** Run `npm install` from project root before any dev work.

### Architecture Correction Phase (2026-04-21)
- [x] Audited Phase 2 scaffolding against PRD.md + RULES.md
- [x] Identified 10 critical gaps (single-product quotes, missing tables, undefined block model, etc.)
- [x] Created `docs/CORE_SYSTEM_DESIGN.md` — full implementation-ready design document covering:
  - SEO architecture (slugs, ISR strategy, metadata templates, JSON-LD schemas, sitemap)
  - DB schema corrections (6 new/modified tables)
  - Quote engine (multi-product, price formula, PDF, WhatsApp, email)
  - Admin panel structure (route group inside apps/web, block editor data model)
  - Complete Zod validation schemas
  - Simplification decisions (no separate admin app, defer AI Writer, no Redis for MVP)
  - Full API endpoint registry (50+ endpoints)
  - Revised implementation order (Phases 3–9)

**⚠️ CRITICAL: Read `docs/CORE_SYSTEM_DESIGN.md` before implementing ANY Phase 3+ code.**

### Design Lock Phase (2026-04-21)
- [x] Added Systems 8–12 to `docs/CORE_SYSTEM_DESIGN.md` (v2.0.0)
  - System 8: SEO complete — internal linking graph, anchor text rules, nearby cities (earthdistance), canonical edge cases, pagination rules, city page content template (7 sections), breadcrumb utility function
  - System 9: Admin panel UX — product form (5 tabs, all fields), SEO panel with live score + SERP preview, block editor layout + `useReducer` actions, media upload pipeline (sharp → 4 sizes + blurDataUrl)
  - System 10: Quote engine UX — step-by-step flow (entry points, 2-col layout), step validation rules, error handling (inline + draft save + duplicate guard), post-submit WhatsApp + PDF flow
  - System 11: API contract standard — request format, success/error response format, HTTP status codes, error code registry (12 codes), query param standard, Drizzle list query pattern
  - System 12: Performance — ISR revalidation times per route, on-demand revalidation API, API Cache-Control headers, LRU redirect cache, sharp image pipeline, Next.js image config, Nginx CDN config, lazy loading rules (6 rules)
- [x] Document marked DESIGN LOCKED v2.0 — 24 systems fully specified

**⚠️ SYSTEM IS NOW DESIGN LOCKED. No architecture decisions needed until Phase 9.**
**⚠️ All implementation must follow CORE_SYSTEM_DESIGN.md — no improvisation.**

### Phase 3 — Database Schema & Migrations (2026-04-20) ✅ COMPLETE
- [x] Ran `npm install` at project root (571 packages)
- [x] Upgraded `drizzle-orm` → 0.45.2, `drizzle-kit` → 0.31.10 (resolved monorepo hoisting conflict)
- [x] Added `drizzle-orm` + `drizzle-kit` to root `devDependencies` so drizzle-kit can resolve drizzle-orm
- [x] Created PostgreSQL database: `saman_prefab` (user: OS peer auth, no password)
- [x] Configured `.env` with `DATABASE_URL=postgresql://amandubey@localhost:5432/saman_prefab`
- [x] Applied schema corrections from CORE_SYSTEM_DESIGN.md §2:
  - [x] Rewrote `quotes.ts` — removed productId/productName/city varchar, added cityId FK + cityName snapshot, deliveryAddress, installationRequired, estimatedTotals, pdfUrl, whatsapp/email/crm flags, UTM fields; updated status enum to `won/spam` (was `converted`)
  - [x] Updated `cities.ts` — added `zone` column (varchar 20, default 'central')
  - [x] Updated `products.ts` — priceMin/priceMax now integer, added focusKeyword, documents, leadTimeDays, canonicalUrl
  - [x] Created `product-variants.ts` — new table
  - [x] Created `quote-items.ts` — new table (cascade delete from quotes)
  - [x] Created `city-seo-pages.ts` — new table with unique index on cityId+productCategoryId
  - [x] Created `redirects.ts` — new table
  - [x] Created `not-found-log.ts` — new table with path index
  - [x] Created `settings.ts` — key-value store table
  - [x] Updated `schema/index.ts` — exports all 13 schema files
- [x] Generated migration: `migrations/0000_damp_vapor.sql` (14 tables, all FKs/indexes)
- [x] Applied migration: all 14 tables created in PostgreSQL
- [x] Created seed script: `packages/db/src/seeds/seed.ts`
- [x] Seeded: 1 admin user, 9 product categories, 2 cities (Pune/Delhi with zones), 2 products, 2 variants, 6 settings
- [x] Validated: all tables created, FK constraints active, enums correct, data integrity confirmed

**DB State After Phase 3:**
- `users`: 1 row (admin@samanprefab.com, super_admin)
- `product_categories`: 9 rows (all fixed slugs from CORE_SYSTEM_DESIGN.md §1.1)
- `products`: 2 rows (Portable Cabin, Security Cabin — published, integer prices)
- `product_variants`: 2 rows (for Portable Cabin)
- `cities`: 2 rows (Pune/west zone, Delhi/north zone)
- `settings`: 6 rows (site_phone, site_email, whatsapp_number, site_name, site_url, gtm_id)

**Key package.json changes:**
- Root `package.json`: added `drizzle-orm ^0.45.2` + `drizzle-kit ^0.31.10` to devDependencies
- `packages/db/package.json`: added `db:seed` script, `bcryptjs`, `tsx`, `dotenv` deps

---

## ✅ ADMIN PANEL COMPLETE — PHASES 7 + 8

### Phase 9 — Admin UX, Editor & Polish (COMPLETE ✅ 2026-04-20)
- [x] **Toast system** — `ToastProvider` + `useToast` hook; bottom-right stack; success/error/info/warning; auto-dismiss 4s; close button; slide-in animation
- [x] **TipTap rich text editor** — `RichTextEditor` component; toolbar: Bold, Italic, Strike, H1/H2/H3, Bullet list, Ordered list, Image insert (URL); undo/redo; `@tiptap/react`, `starter-kit`, `extension-image`, `extension-placeholder` installed
- [x] **SEO Preview** — `SeoPreview` component; live Google SERP mockup; char-count bars for title (65) + description (160); color coding (green/amber/red)
- [x] **ProductForm upgraded** — description field replaced with RichTextEditor; SEO section now 2-col with live SeoPreview; inline error banner with animation; toast on save/error
- [x] **Toast wired everywhere** — products (delete), quotes (status update, notes), settings (save), redirects (create/edit/delete/resolve), SEO pages (edit/bulk activate), media (upload/delete)
- [x] **Shell layout** — `ToastProvider` wraps entire admin shell; all pages get toast context
- [x] **Tailwind animations** — keyframes: slide-in-from-right, slide-in-from-top, fade-in; used by toasts and form banners
- [x] **`apps/web/package.json`** — added `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-placeholder`

**New files:**
- `components/admin/ToastProvider.tsx` — context provider + Toaster UI
- `components/admin/ui/RichTextEditor.tsx` — TipTap editor with full toolbar
- `components/admin/ui/SeoPreview.tsx` — Google SERP preview + char counters

---

## 🌐 PUBLIC WEBSITE — PHASE 10

### Phase 10 — Public Website (IN PROGRESS 🚀 2026-04-20)
- [x] **Routing Structure** — `(public)` route group with: `/`, `/products`, `/products/[category]/[slug]`, `/prefab-[product]-in-[city]`, `/blog`, `/blog/[slug]`, `/contact`, `/get-quote`
- [x] **Public Layout** — `Header.tsx` (sticky, responsive, WhatsApp CTA), `Footer.tsx` (links, cities, contact), shared layout with SEO metadata
- [x] **Homepage** — Hero (gradient, ISI badge, dual CTAs), Trust Indicators (4 stats), Product Categories grid, Featured Products carousel, Benefits section (4 cards), Testimonials (3 cards), Final CTA section
- [x] **Product Listing** — `/products` with sidebar filters (category, search), product grid with cards (image, name, specs preview, price), SEO CollectionPage schema
- [x] **Product Detail** — Breadcrumbs, image gallery (main + thumbs), product info (price, lead time), CTA buttons (Quote, WhatsApp), description (prose), specifications table, related cities links, JSON-LD Product + Breadcrumb schemas
- [x] **City SEO Pages (CRITICAL)** — Dynamic route `/prefab-[productSlug]-in-[citySlug]` with `generateStaticParams` (top 20 cities × 5 products = 100 pre-built), ISR (24hr revalidate), LocalBusiness + Product + FAQPage schemas, city-specific content with nearby cities sidebar
- [x] **Quote Form** — Multi-step wizard (4 steps: Personal, Product, Requirements, Review), URL param pre-fill (`?product= &city=`), API integration, success screen with Ref ID + WhatsApp deep link
- [x] **Blog** — Listing page with categories, article cards (cover, meta), newsletter CTA; Detail page with prose content, Article schema, related posts
- [x] **Contact Page** — Contact form, info cards (phone, email, address, hours), map placeholder, service areas, ContactPage schema
- [x] **SEO Implementation** — `generateMetadata` on all pages, JSON-LD schemas (Website, Organization, Product, CollectionPage, Article, LocalBusiness, FAQPage, ContactPage, BreadcrumbList), canonical URLs, OpenGraph tags

**New files:**
- `lib/types/public.ts` — Public-facing TypeScript types
- `components/public/Header.tsx` — Navigation with mobile menu
- `components/public/Footer.tsx` — Site links, cities, contact info
- `app/(public)/layout.tsx` — Root layout with metadata
- `app/(public)/page.tsx` — Homepage with full sections
- `app/(public)/products/page.tsx` — Product catalog with filters
- `app/(public)/products/[category]/[slug]/page.tsx` — Product detail
- `app/(public)/prefab-[productSlug]-in-[citySlug]/page.tsx` — City SEO pages with ISR
- `app/(public)/get-quote/page.tsx` — Multi-step quote form
- `app/(public)/blog/page.tsx` — Blog listing
- `app/(public)/blog/[slug]/page.tsx` — Blog post detail
- `app/(public)/contact/page.tsx` — Contact page

### Phase 7 — Admin Panel Foundation (COMPLETE ✅ 2026-04-20)
- [x] `next.config.mjs` — renamed from .ts for Next.js 14.2.4 compatibility
- [x] `src/middleware.ts` — JWT cookie guard for `/admin/*`
- [x] `src/lib/api.ts` — typed `apiFetch` (server + client, `NEXT_PUBLIC_API_URL` for client-side)
- [x] `src/lib/auth.ts` — `AdminUser` type, login/logout/getCurrentUser
- [x] `app/api/auth/login|logout|me/route.ts` — server-side proxy handlers
- [x] UI Components: Button, Input, Card, Badge, Skeleton, Table, StatCard, Modal, Pagination, Select, Textarea
- [x] Shell: Sidebar (dark fixed w-64) + Topbar (fixed left-64)
- [x] `app/admin/(shell)/layout.tsx` — server: token verify + user fetch

### Phase 8 — Admin Core Functionality (COMPLETE ✅ 2026-04-20)
- [x] `lib/types/admin.ts` — Product, Quote, City, CitySeoPage, Redirect, NotFoundLog, Setting, MediaFile types
- [x] Dashboard: live stats (4 cards: quotes, products, redirects, media) + recent quotes list
- [x] Products list: fetch + search + status/category filter + pagination + delete confirm modal
- [x] Products form (`ProductForm.tsx`): name, slug (auto-gen), category, status, shortDesc, desc, pricing, lead time, specifications (key-value editor), images (URL list), SEO fields; used by new/edit pages
- [x] Products new page: `/admin/products/new`
- [x] Products edit page: `/admin/products/[slug]/edit` — fetches product by slug, renders form
- [x] Quotes: fetch + status filter pills + inline status dropdown (PATCH /status) + notes modal (PATCH /notes) + PDF link
- [x] Settings: live fetch + per-group Save (PATCH /settings/bulk) + saved toast
- [x] Redirects: live list + toggle active/inactive + create/edit modal + delete + 404 log with create-redirect & resolve actions
- [x] SEO pages: live list + pagination + stat cards + edit modal + bulk-activate modal (category + city multi-select)
- [x] Media: drag-and-drop upload + grid gallery + copy URL + delete

#### Auth Flow
1. Login form → POST `/api/auth/login` (Next.js route handler, proxies to Express, forwards Set-Cookie)
2. `(shell)/layout.tsx` reads cookie server-side, calls `/api/v1/auth/me`, redirects if invalid
3. Middleware does fast cookie-existence check before page render

#### Key env vars
- `API_URL=http://localhost:4000` — server-side (layout, route handlers)
- `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` — client-side (all 'use client' pages)

---

## ✅ BACKEND COMPLETE — ALL PHASES 1–6

### Phase 6 — Final Backend Systems (COMPLETE ✅ 2026-04-20)

#### ✅ STEP 1 — Redirect System
- [x] `redirects/` module: CRUD (GET, POST, PUT, DELETE) + `GET /check?path=` public lookup
- [x] `findRedirectByPath()` + `incrementHitCount()` (SQL increment, no race)
- [x] Auth: all write ops `super_admin` only; check endpoint is public (for Next.js middleware)
- [x] Conflict guard: 409 if `fromPath` already exists

#### ✅ STEP 2 — 404 Logger
- [x] `not-found-log/` module: list (admin), external POST (internal token), PATCH /:id/resolve
- [x] `middleware/not-found.middleware.ts` — catch-all after all routes; upserts path with count++
- [x] Registered last before `errorMiddleware` in `app.ts`
- [x] Returns proper `{ success: false, error: { code: 'NOT_FOUND', ... } }` JSON

#### ✅ STEP 3 — Settings API
- [x] `settings/` module: `GET /` (auth), `PUT /` (super_admin, upsert), `PATCH /bulk` (multi-upsert)
- [x] `onConflictDoUpdate` — safe upsert by primary key
- [x] `Cache-Control: private, max-age=60` on GET
- [x] Seeded settings: site_name, site_url, site_phone, site_email, whatsapp_number, gtm_id

#### ✅ STEP 4 — Revalidation System
- [x] `revalidate/` module: `POST /api/v1/revalidate` — X-Internal-Token auth
- [x] Calls `{NEXT_PUBLIC_SITE_URL}/api/revalidate` with paths + tags + REVALIDATION_SECRET
- [x] Graceful fallback: logs warning if REVALIDATION_SECRET not set, returns `{ revalidated: false }`
- [x] 10s timeout via `AbortSignal.timeout()`

#### ✅ STEP 5 — Google Merchant Feed
- [x] `feed/` module: `GET /api/v1/feed/google-merchant`
- [x] RSS 2.0 + Google Base namespace (`xmlns:g`)
- [x] Fields: id, title, description, link, image_link, price (INR), availability, condition, brand, product_type, shipping, identifier_exists
- [x] Cache-Control: public, max-age=3600

---

### Phase 5 — Critical Services Layer (COMPLETE ✅ 2026-04-20)

#### ✅ STEP 1 — Media System
- [x] `packages/db/src/schema/media.ts` — added `urls` (jsonb), `blurDataUrl` (text), `width`, `height` (int), `folder` (varchar)
- [x] `packages/db/migrations/0001_media_urls.sql` — applied ALTER TABLE migration
- [x] `sharp` + `pdfkit` + `@types/pdfkit` installed in `apps/api`
- [x] `media/media.service.ts` — processes image → 4 WebP variants (300w q80, 800w q82, 1600w q85, orig q90) + base64 blurDataUrl via sharp; saves to `uploads/media/{YYYY}/{MM}/{uuid}-{size}w.webp`
- [x] `media/media.controller.ts` + `media/media.routes.ts` — POST / (upload), GET / (list), DELETE /:id
- [x] `uploads/media/` and `uploads/pdfs/` directories created
- [x] Static file serving mounted at `/uploads` in `app.ts`

#### ✅ STEP 2 — PDF Generation
- [x] `lib/pdf/quote-pdf.service.ts` — generates styled A4 PDF using pdfkit: header, customer info, items table, estimated total, T&C footer; saves to `uploads/pdfs/{refId}.pdf`
- [x] `GET /api/v1/quotes/:refId/pdf` — public route, generates on first request, serves cached on repeat
- [x] `quotes.service.ts` — `generateQuotePdf()` called via `setImmediate` after quote submit (fire-and-forget)
- [x] `quotes.pdfUrl` updated in DB after generation

#### ✅ STEP 3 — Notification System
- [x] `lib/notifications/email.service.ts` — `sendQuoteConfirmation()` (HTML email to customer) + `sendNewQuoteAlert()` (to admin); falls back to console.log mock if SMTP_HOST not configured
- [x] `lib/notifications/whatsapp.service.ts` — `generateCustomerWhatsAppLink()`, `generateAdminWhatsAppLink()`, `buildWhatsAppTemplateMessage()` (pure wa.me URL builders, no API key needed)
- [x] Both triggered via `setImmediate` after quote submission

#### ✅ STEP 4 — City SEO Pages API
- [x] `city-seo-pages/` module: schema, service, controller, routes
- [x] Service includes `buildGeneratedMeta()` for template-driven SEO metadata per System 8.4
- [x] `GET /api/v1/city-seo-pages` + `GET /api/v1/city-seo-pages/:slug` (includes city, category, priceRange, generated meta)
- [x] `POST /api/v1/city-seo-pages/bulk-activate` — auto-generates `prefab-{category}-in-{city}` slugs

#### ✅ STEP 5 — Sitemap + Robots.txt
- [x] `GET /sitemap.xml` — dynamic XML: static pages + all categories + published products + published city pages; Cache 3600s
- [x] `GET /robots.txt` — disallows /admin, /api, confirmation pages

#### ✅ Config Updates
- [x] `config/index.ts` — added `cdn.baseUrl`, `whatsapp.number`, `internal.apiSecret`, `site.url/name`

#### ⏳ Phase 5 Still Pending
- [ ] Remaining Phase 4 APIs: Redirects, 404 logger, Settings API, `docs/API.md`
- [ ] CRM webhook integration
- [ ] On-demand revalidation endpoint (`POST /api/v1/revalidate`)
- [ ] Google Merchant Feed (`GET /api/v1/feed/google-merchant`)

---

### Phase 4 — Core API Layer (COMPLETE ✅)

#### ✅ Infrastructure (complete)
- [x] `types/index.ts` — System 11 `ApiResponse` shape with nested `error: { code, message, details? }`
- [x] `error.middleware.ts` — `AppError` with auto-derived error codes, `ValidationError` subclass, `new.target.prototype` fix for `instanceof` chain
- [x] `validate.middleware.ts` — `VALIDATION_ERROR` with `details[]` array (field, message, received)
- [x] `auth.middleware.ts` — explicit `UNAUTHORIZED`, `INVALID_TOKEN`, `FORBIDDEN` codes
- [x] `auth.service.ts` — `EMAIL_CONFLICT` on duplicate registration

#### ✅ Products API (complete)
- [x] `products.schema.ts` — System 5 exact spec: `priceMin/Max` integers, `specifications`, `documents`, `leadTimeDays`, `focusKeyword`, `canonicalUrl`, slug optional + auto-generated
- [x] `products.service.ts` — `slugify()` auto-gen, `sortBy/sortOrder` dynamic, `meta` response shape with `hasNext/hasPrev`
- [x] `products.controller.ts` — Cache-Control headers (300s for list, 600s for single), 204 for DELETE
- [x] `product-variants.controller.ts` + `product-variants.service.ts` — full CRUD for variants
- [x] `products.routes.ts` — variant sub-routes added: `GET /:id/variants`, `POST /:id/variants`, `PUT /variants/:id`, `DELETE /variants/:id`

#### ✅ Quotes API (complete)
- [x] `quotes.schema.ts` — System 5 multi-item nested schema (items/location/specs/contact), Indian phone/pincode regex, correct status enum (`won/spam`), `updateQuoteNotesSchema`
- [x] `quotes.service.ts` — System 3.3 refId (`SP-YYYYMMDD-XXXX`), System 3.2 price calc (zone multipliers), city + product + variant lookups, `quote_items` insert, new list filters (cityId/search/from/to)
- [x] `quotes.controller.ts` — `no-store` cache header, submits return `{ refId, id, estimatedTotalMin, estimatedTotalMax }`, meta response shape
- [x] `quotes.routes.ts` — added `PATCH /:id/notes`

#### ✅ Cities API (complete)
- [x] `cities.schema.ts` — added `zone` enum filter, `isActive`, `sortBy/sortOrder`
- [x] `cities.service.ts` — zone/isActive filters, dynamic sort, `meta` shape
- [x] `cities.controller.ts` — Cache-Control 86400s on all city endpoints

#### ✅ Categories API (complete — new module)
- [x] `categories/categories.schema.ts` — create/update/list schemas
- [x] `categories/categories.service.ts` — CRUD with SLUG_CONFLICT guard, optional parentId filter
- [x] `categories/categories.controller.ts` — Cache-Control 3600s
- [x] `categories/categories.routes.ts` — `GET /`, `GET /:slug`, `POST /` (super_admin), `PUT /:id` (super_admin)
- [x] `app.ts` — registered at `/api/v1/categories`

#### ⏳ Still pending in Phase 4
- [ ] Media upload API (`POST /api/v1/media/upload`)
- [ ] PDF generation + quote PDF route (`GET /api/v1/quotes/:refId/pdf`)
- [ ] Email notification stubs (quote confirmation, sales notification)
- [ ] WhatsApp notification stub

---

## ⏳ Pending

### Phase 5 — Frontend: Public Site
- [ ] Homepage
- [ ] Product Catalog page
- [ ] Product Detail page
- [ ] Quote Engine (multi-step form)
- [ ] City SEO pages (dynamic)
- [ ] Blog listing and post pages
- [ ] About and Contact pages
- [ ] Global layout (header, footer, nav)
- [ ] SEO metadata system (generateMetadata)
- [ ] Sitemap + robots.txt

### Phase 6 — Admin Panel
- [ ] Admin auth (login, role guard)
- [ ] Dashboard overview
- [ ] Product CRUD UI
- [ ] Quote inbox and detail view
- [ ] City page manager
- [ ] Block editor for content pages
- [ ] Blog manager
- [ ] Media library
- [ ] Settings panel
- [ ] User management

### Phase 7 — SEO Automation
- [ ] City data seeding (500+ cities)
- [ ] Auto city page generation
- [ ] Dynamic sitemap generation
- [ ] Google Merchant Feed export
- [ ] Structured data (JSON-LD) per page type

### Phase 8 — AI Writer Integration
- [ ] AI content generation for city pages
- [ ] AI product description generation
- [ ] AI blog post drafting
- [ ] Admin UI for AI writer

### Phase 9 — Integrations
- [ ] Email system (SMTP/SendGrid) for quote confirmations
- [ ] CRM webhook for lead export
- [ ] Google Analytics 4 integration
- [ ] WhatsApp notification (optional)

### Phase 10 — QA, Performance & Launch
- [ ] Core Web Vitals audit
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit (OWASP Top 10)
- [ ] End-to-end testing
- [ ] Staging deploy
- [ ] Production deploy
- [ ] Post-launch monitoring setup

---

## 📋 Key Decisions

| Decision | Rationale | Date |
|---|---|---|
| Next.js App Router for frontend | Best-in-class SSR/SSG, native SEO support, Server Components reduce JS bundle | 2026-04-20 |
| PostgreSQL for database | Relational structure needed for products, quotes, cities; strong ecosystem | 2026-04-20 |
| Monorepo structure (`/apps`, `/packages`) | Code sharing between web, admin, and API; single deployment pipeline | 2026-04-20 |
| Lead generation (not e-commerce) | Primary business goal is qualified leads, not direct sales | 2026-04-20 |
| 500+ city SEO pages | Key organic growth strategy for regional prefab searches | 2026-04-20 |
| Separate Node.js/Express backend (`apps/api`) | Complex quote engine, SEO engine, admin CMS require scalable dedicated API; future SaaS expansion | 2026-04-21 |
| JWT + cookie auth for API | httpOnly cookie prevents XSS; fallback Authorization header for mobile | 2026-04-21 |
| Drizzle ORM with `postgres` driver | Lightweight, type-safe, close to SQL; no ORM magic | 2026-04-21 |

---

## ❓ Open Questions

*None at this time. Add questions here if agent is uncertain about requirements.*

---

## 📁 Project Structure (Current State)

```
saman-prefab/
├── apps/
│   ├── api/                          ✅ Node.js/Express backend
│   │   ├── src/
│   │   │   ├── config/index.ts
│   │   │   ├── middleware/           (error, auth, validate, rate-limit)
│   │   │   ├── modules/
│   │   │   │   ├── auth/             (schema, service, controller, routes)
│   │   │   │   ├── products/         (schema, service, controller, routes, variants service+controller)
│   │   │   │   ├── quotes/           (schema, service, controller, routes — multi-item, quote_items)
│   │   │   │   ├── cities/           (schema, service, controller, routes)
│   │   │   │   └── categories/       (schema, service, controller, routes) ← NEW Phase 4
│   │   │   ├── types/index.ts
│   │   │   ├── app.ts
│   │   │   └── index.ts
│   │   ├── uploads/.gitkeep
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                          ✅ Next.js 14 App Router
│       ├── src/app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── not-found.tsx
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.js
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── config/                       ✅ Shared configs
│   │   ├── eslint/index.js
│   │   ├── prettier/index.js
│   │   └── typescript/ (base, nextjs, node)
│   ├── db/                           ✅ Drizzle ORM
│   │   ├── src/
│   │   │   ├── schema/ (14 tables)
│   │   │   ├── client.ts
│   │   │   └── index.ts
│   │   └── drizzle.config.ts
│   └── ui/                           ✅ Shared components
│       └── src/components/ (Button, Input, Card, Badge)
├── docs/
│   ├── PRD.md                        ✅
│   ├── RULES.md                      ✅
│   ├── MEMORY.md                     ✅ (this file)
│   └── TASKS.md                      ✅
├── .env.example                      ✅
├── .eslintrc.js                      ✅
├── .gitignore                        ✅
├── .prettierrc                       ✅
├── package.json                      ✅ (npm workspaces + Turborepo)
├── README.md                         ✅
├── tsconfig.json                     ✅ (base config)
└── turbo.json                        ✅
```

---

*Document maintained by AI Agent. Read this file at the start of every session.*
