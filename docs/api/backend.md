# Backend (NestJS + Prisma) Overview

## Scope (Phase 1)
- Backend lives under `apps/api`.
- Purpose: infrastructure scaffold only (NestJS, Prisma, Postgres, health check).
- Not wired to the frontend; safe to remove without breaking UI.

## Runtime
- Port: 4000 (configurable via `API_PORT`).
- CORS: enabled for `http://localhost:3000` in non-production.
- Health: `GET /health` returns `{ ok: true }`.

## Env & Validation
- Config: `@nestjs/config` + zod validator at `apps/api/src/config/env.schema.ts`.
- Env file: `apps/api/.env` (template `apps/api/.env.example`):
  - `API_PORT=4000`
  - `DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/<db>`

## Prisma
- Schema: `apps/api/prisma/schema.prisma`
  - Model `Position`: `id (cuid)`, `symbol (string)`, `shares (Decimal)`, `buyPrice (Decimal)`, `dcaPrice (Decimal?)`, `createdAt`, `updatedAt`
- Client generation: `npx prisma generate`
- Migration: `npx prisma migrate dev --name init`
- Connection: uses `DATABASE_URL`
- Shutdown: PrismaService ties into `process.beforeExit` to close Nest app cleanly.

## Modules
- `apps/api/src/main.ts` — bootstrap, CORS, port, Prisma shutdown hook.
- `apps/api/src/app.module.ts` — registers ConfigModule, PrismaModule, HealthModule.
- `apps/api/src/health/*` — health controller/module.
- `apps/api/src/prisma/*` — PrismaModule, PrismaService.

## Local workflow
1) Start DB: `docker compose up -d db`
2) Env: `cp apps/api/.env.example apps/api/.env`
3) Install deps: `cd apps/api && npm install`
4) Generate client: `cd apps/api && npx prisma generate`
5) Migrate: `cd apps/api && npx prisma migrate dev --name init`
6) Run dev server: `cd apps/api && npm run start:dev`

## Notes
- No auth, users, or business endpoints in Phase 1.
- Backend is isolated from the frontend; keep UI persistence in localStorage.
