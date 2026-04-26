# Saman Prefab Platform

High-performance, SEO-first, lead-generation web platform for prefabricated construction products. Serving 500+ cities across India.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Node.js, Express 4, TypeScript |
| Database | PostgreSQL 15+, Drizzle ORM |
| Monorepo | Turborepo + npm Workspaces |

## Project Structure

```
saman-prefab/
├── apps/
│   ├── web/          # Next.js 14 — public site (product catalog, quote engine, SEO pages)
│   └── api/          # Node.js/Express — backend API (products, quotes, auth, cities)
├── packages/
│   ├── ui/           # Shared React component library (Button, Input, Card, Badge)
│   ├── db/           # Drizzle ORM schema + PostgreSQL client
│   └── config/       # Shared ESLint, Prettier, TypeScript base configs
└── docs/
    ├── PRD.md        # Product requirements document
    ├── RULES.md      # Engineering & agent governance rules
    ├── MEMORY.md     # Agent working memory (read before every session)
    └── TASKS.md      # Phase-wise task checklist
```

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 15

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your actual database URL, JWT secret, SMTP, etc.
```

### 3. Set up the database

```bash
# Create the database in PostgreSQL first:
# createdb saman_prefab

# Generate and apply migrations
npm run db:generate
npm run db:migrate
```

### 4. Start development servers

```bash
npm run dev
```

This starts all apps concurrently via Turborepo:

| App | URL |
|---|---|
| Frontend (web) | http://localhost:3000 |
| Backend (api) | http://localhost:4000 |
| API Health Check | http://localhost:4000/health |

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start all apps in development mode |
| `npm run build` | Build all apps for production |
| `npm run lint` | Lint all packages |
| `npm run type-check` | Type-check all packages |
| `npm run db:generate` | Generate Drizzle ORM migrations |
| `npm run db:migrate` | Apply pending migrations to database |
| `npm run db:studio` | Open Drizzle Studio (visual DB GUI) |

## API Endpoints (v1)

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/auth/login` | Admin login |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/products` | List products |
| GET | `/api/v1/products/:slug` | Get product |
| POST | `/api/v1/products` | Create product (admin) |
| PUT | `/api/v1/products/:id` | Update product (admin) |
| DELETE | `/api/v1/products/:id` | Delete product (admin) |
| POST | `/api/v1/quotes` | Submit quote (public) |
| GET | `/api/v1/quotes/ref/:refId` | Get quote by reference ID |
| GET | `/api/v1/quotes` | List quotes (admin) |
| PATCH | `/api/v1/quotes/:id/status` | Update quote status (admin) |
| GET | `/api/v1/cities` | List cities |
| GET | `/api/v1/cities/:slug` | Get city |

## Documentation

- `docs/PRD.md` — Full product requirements and feature list
- `docs/RULES.md` — Coding standards, design rules, SEO rules
- `docs/MEMORY.md` — Agent working memory (current progress)
- `docs/TASKS.md` — Phase-wise checklist (10 phases, 60+ tasks)

## Contributing

1. Read `docs/RULES.md` before making any changes
2. Branch naming: `feature/[ticket-id]-short-description`
3. Commit format: `feat: short message` | `fix:` | `docs:` | `refactor:`
4. Open PR against `main` — must pass lint + type-check
