# Architecture Overview

## Frontend (Phase 1)
- **Framework:** Next.js App Router (app/)
- **Language:** TypeScript (strict), React 19
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Persistence:** Browser localStorage (single source of truth in Phase 1)
- **External API:** Finnhub for quotes (treat as unreliable)
- **Key modules:**
  - `app/api/stocks/route.ts` — server route to fetch quotes
  - `lib/types.ts` — shared types
  - `lib/stockData.ts` — Finnhub fetch/caching
  - `components/StockDashboard.tsx` — positions table UI

## Backend (Infrastructure scaffold only)
- **Location:** `apps/api`
- **Framework:** NestJS (port 4000), CORS for `http://localhost:3000` in non-prod
- **Env:** `@nestjs/config` with zod validation (`apps/api/src/config/env.schema.ts`)
- **Health:** `GET /health` (no business endpoints)
- **ORM:** Prisma
  - Schema: `apps/api/prisma/schema.prisma` with `Position` model
  - Connection: `DATABASE_URL` env (Postgres)
- **Important:** Backend is not wired to the frontend in Phase 1; safe to remove without breaking UI.

## Infrastructure
- **Postgres:** Docker Compose `db` service on `localhost:5432` (env-driven credentials, named volume).
- **Env files:**
  - Frontend: `.env.local` (template `.env.local.example`) — `FINNHUB_API_KEY`
  - Backend: `apps/api/.env` (template `apps/api/.env.example`) — `DATABASE_URL`, `API_PORT`

## Data model (backend)
`Position` (Prisma):
- `id` (cuid, primary key)
- `symbol` (string)
- `shares` (Decimal)
- `buyPrice` (Decimal)
- `dcaPrice` (Decimal, optional)
- `createdAt` (DateTime, default now)
- `updatedAt` (DateTime, @updatedAt)

## Testing
- Unit tests expected for new logic in `lib/`.
- Playwright E2E required when changing Add Position flow, persistence, DCA highlighting, or portfolio metrics.

## Deployment
- Frontend: standard Next.js pipeline (see README).
- Backend: Nest dev server via `npm run start:dev` in `apps/api`; migrations via `npx prisma migrate dev`.
