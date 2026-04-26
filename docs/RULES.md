# RULES.md
## Saman Prefab Platform — Engineering & Agent Governance Rules

**Version:** 1.0.0
**Date:** 2026-04-20
**Enforced By:** All developers and AI agents working on this project

---

## 1. Anti-Hallucination Rules

These rules exist to prevent AI agents and developers from inventing facts, APIs, or functionality that do not exist.

| Rule ID | Rule |
|---|---|
| AH-01 | NEVER reference a library, package, or API without verifying it exists and is compatible with the stack |
| AH-02 | NEVER fabricate database fields, schema columns, or API endpoints that have not been explicitly defined |
| AH-03 | NEVER assume a feature is built unless it is marked ✅ DONE in TASKS.md |
| AH-04 | NEVER invent city names, population data, or business facts for SEO pages without a verified data source |
| AH-05 | NEVER assume environment variables exist — they must be declared in `.env.example` before use |
| AH-06 | If a requirement is unclear, ASK first. Do not infer and implement silently |
| AH-07 | ALL database schema changes must be reflected in migration files — never alter production schema manually |
| AH-08 | ALL new API routes must be documented in `/docs/API.md` before being considered complete |

---

## 2. Coding Standards

### 2.1 General

- Language: **TypeScript** strictly — no plain `.js` files in `/apps`
- Formatter: **Prettier** with project-level `.prettierrc`
- Linter: **ESLint** with `@typescript-eslint` rules
- All functions must have explicit return type annotations
- No `any` type — use `unknown` with type guards instead
- No unused imports — enforced by ESLint

### 2.2 Next.js (Frontend)

- Use **App Router** exclusively — no Pages Router
- Server Components by default; add `"use client"` only when required
- All data fetching must happen in Server Components or Route Handlers
- Dynamic routes must use `generateStaticParams` for SSG where applicable
- Image optimization: always use `next/image` — never raw `<img>` tags
- Fonts: always use `next/font` — never external font `<link>` tags
- All pages must export `generateMetadata` for SEO

### 2.3 Node.js (Backend / API)

- Use **Express** or **Next.js Route Handlers** — document the choice
- All routes must validate input with **Zod** schema before processing
- All DB queries must use **Drizzle ORM** or **Prisma** — no raw SQL unless in migrations
- No secrets in source code — use `process.env` exclusively
- All async functions must have proper error handling (try/catch or Result types)

### 2.4 Database (PostgreSQL)

- All schema changes must be tracked in `/apps/backend/migrations/`
- Use `snake_case` for all table and column names
- Every table must have: `id` (UUID), `created_at`, `updated_at`
- Soft deletes: use `deleted_at` instead of hard `DELETE`
- Index all foreign keys and commonly filtered columns

### 2.5 File & Folder Naming

- Folders: `kebab-case`
- React components: `PascalCase.tsx`
- Utilities / hooks: `camelCase.ts`
- Constants: `SCREAMING_SNAKE_CASE`
- API route files: `route.ts` inside named folders (App Router convention)

### 2.6 Git

- Branch naming: `feature/[ticket-id]-short-description`
- Commit format: `[type]: short message` — types: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
- No direct commits to `main` — all changes via Pull Request
- PR must pass lint, type-check, and tests before merge

---

## 3. Design Rules

| Rule ID | Rule |
|---|---|
| D-01 | Mobile-first design — design for 375px width first, then scale up |
| D-02 | Color palette must be defined in `tailwind.config.ts` — no inline hex colors in JSX |
| D-03 | Typography scale must follow Tailwind's `text-*` classes — no arbitrary font sizes |
| D-04 | All interactive elements must have visible focus states (accessibility) |
| D-05 | Minimum touch target size: 44×44px for all buttons and links |
| D-06 | Loading states must be implemented for all async operations (skeleton or spinner) |
| D-07 | Error states must display human-readable messages — no raw error object dumps |
| D-08 | All images must have `alt` text — empty `alt=""` only for decorative images |
| D-09 | CTA buttons must use brand primary color; secondary actions use outlined/ghost style |
| D-10 | Form inputs must show inline validation errors below the relevant field |
| D-11 | Page layouts must use a consistent max-width container (e.g., `max-w-7xl mx-auto px-4`) |
| D-12 | Spacing must use Tailwind spacing scale — no arbitrary pixel values |

---

## 4. SEO Rules

| Rule ID | Rule |
|---|---|
| SEO-01 | Every page must have a unique `<title>` tag (50–60 characters) |
| SEO-02 | Every page must have a unique `<meta name="description">` (140–160 characters) |
| SEO-03 | H1 must appear exactly once per page |
| SEO-04 | Heading hierarchy must be sequential: H1 → H2 → H3 (no skipping) |
| SEO-05 | All city pages must include LocalBusiness + BreadcrumbList JSON-LD |
| SEO-06 | All product pages must include Product JSON-LD |
| SEO-07 | Canonical URL must be set on every page |
| SEO-08 | Internal links must use descriptive anchor text — no "click here" |
| SEO-09 | Sitemap must be updated whenever new pages or city pages are published |
| SEO-10 | Core Web Vitals must be measured before every production deploy |

---

## 5. Agent Behavior Rules

These rules govern how AI agents operate on this codebase.

| Rule ID | Rule |
|---|---|
| AG-01 | Read MEMORY.md at the start of every session before taking any action |
| AG-02 | Update MEMORY.md after every completed step |
| AG-03 | Update TASKS.md after every completed task item |
| AG-04 | Do not create files outside the defined project structure without documenting the reason |
| AG-05 | Do not delete or overwrite existing files without explicit instruction |
| AG-06 | When uncertain, write a question in MEMORY.md under "Open Questions" and ask the user |
| AG-07 | Never mark a task as DONE unless it is verified working (code runs, tests pass) |
| AG-08 | Always use absolute paths when creating or referencing files |
| AG-09 | All created files must be immediately runnable or clearly documented as stubs |
| AG-10 | Never invent data (product names, prices, city names) without a provided data source |

---

*Document maintained by AI Agent. Last updated: 2026-04-20*
