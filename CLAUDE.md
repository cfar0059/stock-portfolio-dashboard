# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product Vision

**JustDCA** is a beginner-friendly investment companion that helps new investors build confidence and discipline. The goal is not to tell users what to buy, but to help them understand *when* and *how* they're buying.

**Core Value:** Clear visualization, gentle guidance, and DCA discipline for investors who want to learn without being overwhelmed.

**Target Users:** Beginner-to-intermediate retail investors who want a focused, educational tool - not the complexity of full brokerage platforms.

**What JustDCA Is:**
- Portfolio tracking with context (are you buying high or low?)
- DCA guidance and discipline tools
- Educational insights that build investing confidence
- Clean, focused UI that doesn't overwhelm

**What JustDCA Is NOT:**
- Not a stock picker or recommendation engine
- Not a trading platform (no buy/sell execution)
- Not for active traders or advanced users

**Future Direction (beyond V1):**
- Price zone indicators (historically high/low regions)
- DCA schedule tracking and reminders
- Position health scores (concentration risk, cost basis analysis)
- Educational tooltips explaining metrics
- Contextual guidance ("Is now a good time to add to this position?")

See `productBrief.md` for full product strategy and scope.

## Project Overview

**JustDCA** — beginner-friendly DCA investment companion built with Next.js 15 (App Router), React 19, TypeScript, and Tailwind CSS v4. Features real-time stock prices via Finnhub API, position management, and DCA tracking. Backend API (NestJS/Prisma) in `apps/api` for persistence.

## Commands

### Frontend (root directory)
```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript strict checking
npm test             # Vitest unit tests
npm run test:watch   # Vitest watch mode
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright UI mode
```

### Backend (apps/api)
```bash
cd apps/api
npm run start:dev           # Dev server (port 4000)
npm test                    # Jest tests
npx prisma migrate dev      # Run migrations
npx prisma generate         # Regenerate Prisma client
```

### Infrastructure
```bash
docker compose up -d    # Start Postgres (port 5432)
docker compose down     # Stop Postgres
```

## Architecture

### Monorepo Structure
- **Frontend**: Root directory - Next.js App Router
- **Backend**: `apps/api` - NestJS with Prisma ORM

### Frontend Key Paths
- `app/` - Next.js App Router pages and API routes
- `app/api/stocks/route.ts` - Server route fetching Finnhub quotes
- `lib/types.ts` - Shared TypeScript types (Position, Stock, etc.)
- `lib/portfolio/repository.ts` - Repository interface for position persistence
- `lib/portfolio/localStorageRepository.ts` - Browser localStorage implementation
- `lib/portfolio/backendRepository.ts` - Backend API implementation
- `components/` - React components (shadcn/ui primitives in `components/ui/`)

### Backend Key Paths
- `apps/api/src/main.ts` - NestJS bootstrap
- `apps/api/src/portfolio/` - Portfolio/Position CRUD endpoints
- `apps/api/src/health/` - Health check endpoints (`GET /health`, `GET /health/ready`)
- `apps/api/prisma/schema.prisma` - Prisma schema (Portfolio, Position models)

### Data Flow
1. Frontend stores `portfolioId` in localStorage
2. Positions can persist via localStorage (Phase 1) or backend API
3. Stock prices fetched from Finnhub via `app/api/stocks/route.ts`
4. Backend uses anonymous portfolio linking via recovery codes (hashed, never stored plaintext)

### Environment Files
- `.env.local` - Frontend: `FINNHUB_API_KEY`
- `apps/api/.env` - Backend: `DATABASE_URL`, `API_PORT`

## Testing Conventions

- Unit tests in `__tests__/` (Vitest) - required for new `lib/` logic
- E2E tests in `e2e/` (Playwright) - required when changing Add Position, persistence, DCA highlighting, or metrics
- Backend tests colocated with source (`.spec.ts` files) - Jest

Run a single test file:
```bash
npx vitest run __tests__/lib/validation.test.ts
npx playwright test e2e/smoke.spec.ts
cd apps/api && npx jest src/health/health.controller.spec.ts
```

## Important Patterns

- **Repository Pattern**: `PortfolioRepository` interface abstracts storage (localStorage vs backend)
- **Path Alias**: `@/*` maps to project root
- **Strict TypeScript**: Both frontend and backend use strict mode
- **Recovery Codes**: Generated on portfolio creation, hashed before storage, shown once to user
- **CORS**: Backend allows `http://localhost:3000` in non-production

## Guardrails (from project constraints)

- Phase 1 is UI-only with localStorage persistence
- Backend exists under `apps/api` but is isolated infrastructure
- No auth, predictions, or extra charts in Phase 1
- Handle Finnhub nulls, stale data, and rate limits gracefully
