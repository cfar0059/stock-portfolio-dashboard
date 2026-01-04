# LLM Guide

Read this first before using an LLM on the project. Keep responses aligned with product scope and guardrails.

## Must-know constraints
- Source of truth: `AGENTS.md` (Phase 1 scope, UI rules, backend infra-only under `apps/api`).
- No auth, no trading signals/predictions, no extra charts, no new state managers or UI kits.
- Frontend persistence is **localStorage** (Phase 1); Finnhub is the only external price source and may be unreliable.
- Backend is scaffold-only (NestJS, Prisma, Postgres) and not wired to the frontend yet.

## Key files to read
- `AGENTS.md` — scope, guardrails, testing expectations.
- `README.md` — project overview, env setup, commands, backend notes.
- `app/api/stocks/route.ts` — stock fetch API (Finnhub).
- `lib/types.ts` — shared types (Stock, Position, etc.).
- `apps/api/prisma/schema.prisma` — backend data model (Position).
- `apps/api/src/main.ts` — Nest bootstrap (port, CORS).
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

