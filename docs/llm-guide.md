# LLM Guide

Read this first before using an LLM on the project. Keep responses aligned with product scope and guardrails.

## Must-know constraints
- Source of truth: `AGENTS.md` (Phase 1 scope, UI rules, backend persistence rules under `apps/api`).
- No auth, no trading signals/predictions, no extra charts, no new state managers or UI kits.
- Persistence uses an anonymous `portfolioId` stored in `localStorage`; frontend may persist portfolio/positions via backend API (Phase 1.1).
- Backend is NestJS + Prisma + Postgres under `apps/api`; allowed endpoints are health + portfolio/position CRUD with server-side validation.

## Allowed backend endpoints (Phase 1.1)
- `GET /health` — liveness probe.
- `GET /health/ready` — readiness probe (checks DB connectivity).
- CRUD endpoints for portfolios/positions scoped by client-generated `portfolioId` (read/create/update/delete).
- Validate inputs: require `portfolioId`, trim/upper-case symbols, enforce positive numeric fields, and reject missing/null payloads gracefully.

## Backend production patterns
- **Request ID:** Every request gets a UUID via middleware; available on `req.requestId` and `X-Request-Id` header.
- **Error responses:** Consistent JSON shape `{ error: { code, message, requestId }, meta: { path, timestamp } }`.
- **Logging:** HTTP requests logged with method, path, status, duration, requestId.

## Key files to read
- `AGENTS.md` — scope, guardrails, testing expectations.
- `README.md` — project overview, env setup, commands, backend notes.
- `app/api/stocks/route.ts` — stock fetch API (Finnhub).
- `lib/types.ts` — shared types (Stock, Position, etc.).
- `apps/api/prisma/schema.prisma` — backend data model (Position).
- `apps/api/src/main.ts` — Nest bootstrap (port, CORS, middleware, filters, interceptors).
- `apps/api/src/common/` — production patterns (request-id, exception filter, logging).
- `apps/api/test/` — E2E tests for health endpoints.
- `docker-compose.yml` — local Postgres service.

## Environments
- Frontend env: `.env.local` (use `.env.local.example` as template) with `FINNHUB_API_KEY`.
- Backend env: `apps/api/.env` (template at `apps/api/.env.example`) with `DATABASE_URL`, `API_PORT`.

## Testing expectations
- Unit tests for new logic in `lib/`.
- Playwright E2E required when changing persistence/Add Position/DCA highlighting/metrics.

## Coding principles
- Keep diffs small and reversible; preserve existing layout/components.
- Use shadcn/ui + Tailwind tokens; avoid new libraries/state managers.
- Handle Finnhub failures gracefully (nulls, stale data, rate limits).

## Deployment/dev commands (common)
- Frontend dev: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Playwright: `npm run test:e2e`
- Backend dev: see `docs/runbooks/local-dev.md`
- Backend tests: `cd apps/api && npm test`
