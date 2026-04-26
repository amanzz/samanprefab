# TASKS.md
## Saman Prefab Platform — Phase-wise Task Checklist

**Version:** 1.1.0
**Last Updated:** 2026-04-21

> **Legend:** ✅ Done | 🔄 In Progress | ⏳ Pending | ❌ Blocked

---

## Phase 1 — Foundation Setup ✅ COMPLETE

| # | Task | Status | Notes |
|---|---|---|---|
| 1.1 | Create root folder structure (`/docs`, `/apps`, `/packages`) | ✅ | Complete |
| 1.2 | Create `docs/PRD.md` | ✅ | Full product requirements |
| 1.3 | Create `docs/RULES.md` | ✅ | Engineering, design, SEO, agent rules |
| 1.4 | Create `docs/MEMORY.md` | ✅ | Agent working memory initialized |
| 1.5 | Create `docs/TASKS.md` | ✅ | This file |

---

## Phase 2 — Monorepo & Tooling Setup ✅ COMPLETE

| # | Task | Status | Notes |
|---|---|---|---|
| 2.1 | Create root `package.json` with workspaces config | ✅ | npm workspaces + Turborepo |
| 2.2 | Create `turbo.json` | ✅ | build, dev, lint, type-check, test, db:* |
| 2.3 | Initialize `apps/web` — Next.js 14 App Router, TypeScript, Tailwind | ✅ | layout, page, 404, Inter font |
| 2.4 | Initialize `apps/api` — Node.js/Express backend | ✅ | 4 modules, 4 middleware, rate limiting, JWT |
| 2.5 | Create `packages/ui` — Shared UI component library | ✅ | Button, Input, Card, Badge |
| 2.6 | Create `packages/db` — Drizzle ORM schema + DB client | ✅ | 7 tables, postgres driver |
| 2.7 | Create `packages/config` — Shared ESLint + Prettier + TS configs | ✅ | base, nextjs, node variants |
| 2.8 | Configure root `tsconfig.json` + per-app `tsconfig.json` | ✅ | Strict mode, extends shared config |
| 2.9 | Configure `.eslintrc.js` at root | ✅ | TypeScript-ESLint + Prettier |
| 2.10 | Configure `.prettierrc` at root | ✅ | Single quotes, ES5 trailing comma |
| 2.11 | Configure `tailwind.config.ts` with brand design tokens | ✅ | brand palette, Inter font, container |
| 2.12 | Create `.env.example` with all required env vars | ✅ | DB, JWT, SMTP, API, uploads, AI, CRM |
| 2.13 | Create root `README.md` — developer onboarding guide | ✅ | Setup, scripts, API table |

---

## Phase 3 — Database Schema ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 3.1 | Design `products` table schema | ⏳ | id, slug, name, description, category_id, specs, images, status |
| 3.2 | Design `product_categories` table schema | ⏳ | id, name, slug, parent_id, description |
| 3.3 | Design `product_variants` table schema | ⏳ | id, product_id, size, material, finish, price_range |
| 3.4 | Design `quotes` table schema | ⏳ | id, ref_id, product_id, city, contact info, status |
| 3.5 | Design `cities` table schema | ⏳ | id, name, slug, state, pincode, lat/lon |
| 3.6 | Design `city_pages` table schema | ⏳ | id, city_id, product_category, content, meta |
| 3.7 | Design `users` table schema | ⏳ | id, email, role, password_hash |
| 3.8 | Design `content_pages` table schema | ⏳ | id, slug, title, blocks (JSONB), status |
| 3.9 | Design `blog_posts` table schema | ⏳ | id, slug, title, content, category, status |
| 3.10 | Design `media` table schema | ⏳ | id, url, alt, file_type, size |
| 3.11 | Write Drizzle ORM schema files in `packages/db/schema/` | ⏳ | One file per table |
| 3.12 | Create initial migration file | ⏳ | `0001_initial_schema.sql` |
| 3.13 | Test database connection and migration apply | ⏳ | Verify all tables created |

---

## Phase 4 — Core API Layer ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 4.1 | Set up API routing structure | ⏳ | `/api/v1/products`, `/api/v1/quotes`, etc. |
| 4.2 | Products API: GET list, GET single, POST, PUT, DELETE | ⏳ | With Zod validation |
| 4.3 | Categories API: GET list, GET single, POST, PUT, DELETE | ⏳ | |
| 4.4 | Quote submission API: POST `/api/v1/quotes` | ⏳ | Generates ref ID, sends email |
| 4.5 | Quote management API (admin): GET, PATCH status | ⏳ | Role-protected |
| 4.6 | Cities API: GET all, GET single | ⏳ | Used for city page generation |
| 4.7 | Auth API: POST login, GET session, POST logout | ⏳ | JWT + HttpOnly cookie |
| 4.8 | Media upload API: POST `/api/v1/media` | ⏳ | Multipart form, store to disk/S3 |
| 4.9 | Google Merchant Feed: GET `/api/v1/feed/google-merchant` | ⏳ | XML output |
| 4.10 | Write API documentation in `docs/API.md` | ⏳ | Request/response format per endpoint |

---

## Phase 5 — Frontend: Public Site ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 5.1 | Global layout (Header, Footer, Nav) | ⏳ | Responsive, mobile-first |
| 5.2 | Homepage (`/`) | ⏳ | Hero, product highlights, CTA, testimonials |
| 5.3 | Product Catalog (`/products`) | ⏳ | Filter by category, search, pagination |
| 5.4 | Category Listing (`/products/[category]`) | ⏳ | |
| 5.5 | Product Detail (`/products/[category]/[slug]`) | ⏳ | Specs, images, CTA, JSON-LD |
| 5.6 | Quote Engine (`/quote`) | ⏳ | Multi-step form, 4 steps |
| 5.7 | Quote Confirmation (`/quote/[ref-id]`) | ⏳ | Show ref ID, next steps |
| 5.8 | City SEO Pages (`/prefab-[product]-in-[city]`) | ⏳ | Dynamic, auto-generated |
| 5.9 | Blog Listing (`/blog`) | ⏳ | |
| 5.10 | Blog Post (`/blog/[slug]`) | ⏳ | |
| 5.11 | About Page (`/about`) | ⏳ | |
| 5.12 | Contact Page (`/contact`) | ⏳ | |
| 5.13 | SEO metadata system (`generateMetadata` per page) | ⏳ | |
| 5.14 | Sitemap (`/sitemap.xml`) | ⏳ | Dynamic, includes all pages + city pages |
| 5.15 | Robots (`/robots.txt`) | ⏳ | |

---

## Phase 6 — Admin Panel ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 6.1 | Admin auth (login page + middleware route guard) | ⏳ | |
| 6.2 | Admin dashboard (`/admin`) | ⏳ | Stats: leads, products, recent activity |
| 6.3 | Product list + CRUD UI | ⏳ | |
| 6.4 | Quote inbox + detail view | ⏳ | Filter by status, city, date |
| 6.5 | City page manager | ⏳ | Bulk generate, edit meta |
| 6.6 | Block editor for content pages | ⏳ | Drag-and-drop blocks |
| 6.7 | Blog manager | ⏳ | Create, edit, publish |
| 6.8 | Media library | ⏳ | Upload, tag, organize |
| 6.9 | Settings panel | ⏳ | Site name, contact, SMTP config |
| 6.10 | User management | ⏳ | Create users, assign roles |

---

## Phase 7 — SEO Automation ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 7.1 | Source city data CSV (500+ Indian cities) | ⏳ | Name, state, slug, pincode |
| 7.2 | Seed cities table from CSV | ⏳ | |
| 7.3 | Auto city page generation script | ⏳ | |
| 7.4 | Dynamic sitemap including city pages | ⏳ | |
| 7.5 | JSON-LD per page type (Product, LocalBusiness, FAQ) | ⏳ | |
| 7.6 | Google Merchant Feed endpoint | ⏳ | |

---

## Phase 8 — AI Writer Integration ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 8.1 | Choose AI provider (OpenAI / Anthropic / Gemini) | ⏳ | Confirm with user |
| 8.2 | City page content generation prompt + API call | ⏳ | |
| 8.3 | Product description generation | ⏳ | |
| 8.4 | Blog post drafting | ⏳ | |
| 8.5 | Admin UI: AI Writer panel | ⏳ | Generate, review, apply to editor |

---

## Phase 9 — Integrations ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 9.1 | Email system: quote confirmation to user | ⏳ | SMTP or SendGrid |
| 9.2 | Email system: internal lead notification | ⏳ | |
| 9.3 | CRM webhook: push lead data on quote submit | ⏳ | |
| 9.4 | Google Analytics 4 setup | ⏳ | |
| 9.5 | WhatsApp notification (optional) | ⏳ | Confirm with user |

---

## Phase 10 — QA, Performance & Launch ⏳ PENDING

| # | Task | Status | Notes |
|---|---|---|---|
| 10.1 | Core Web Vitals audit (Lighthouse CI) | ⏳ | LCP < 2.5s target |
| 10.2 | Accessibility audit (axe-core / WAVE) | ⏳ | WCAG 2.1 AA |
| 10.3 | Security audit (Snyk / OWASP ZAP) | ⏳ | |
| 10.4 | End-to-end tests (Playwright) | ⏳ | Quote flow, admin CRUD |
| 10.5 | Staging environment deploy | ⏳ | |
| 10.6 | Production environment deploy | ⏳ | |
| 10.7 | Post-launch monitoring (Sentry, Uptime check) | ⏳ | |

---

*Document maintained by AI Agent. Last updated: 2026-04-20*
