# Backend (NestJS + Prisma) Overview

## Scope (Phase 1)
- Backend lives under `apps/api`.
- Purpose: infrastructure scaffold only (NestJS, Prisma, Postgres, health check).
- Not wired to the frontend; safe to remove without breaking UI.

## Runtime
- Port: 4000 (configurable via `API_PORT`).
- CORS: enabled for `http://localhost:3000` in non-production.

## Health Endpoints

| Endpoint        | Purpose                              | Response                                       |
|-----------------|--------------------------------------|------------------------------------------------|
| `GET /health`   | Liveness probe                       | `{ ok: true }` (200)                           |
| `GET /health/ready` | Readiness probe (checks DB)      | `{ ok: true }` (200) or `{ ok: false, reason: "db" }` (503) |

## Production Patterns

### Request ID Middleware
- **File:** `apps/api/src/common/middleware/request-id.middleware.ts`
- Generates a UUID for each request using `crypto.randomUUID()`
- Stored on `req.requestId` for downstream access
- Sets `X-Request-Id` response header for client correlation

### Global Exception Filter
- **File:** `apps/api/src/common/filters/http-exception.filter.ts`
- Returns consistent JSON error shape:
```json
{
  "error": { "code": "NOT_FOUND", "message": "Resource not found", "requestId": "..." },
  "meta": { "path": "/api/...", "timestamp": "2026-01-05T12:00:00.000Z" }
}
```
- Maps HTTP status codes to semantic error codes
- Includes requestId for correlation

### Logging Interceptor
- **File:** `apps/api/src/common/interceptors/logging.interceptor.ts`
- Logs: `[METHOD] /path - statusCode durationMs (requestId)`
- Uses NestJS Logger for structured output

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
- `apps/api/src/main.ts` — bootstrap, CORS, port, Prisma shutdown hook, registers middleware/filters/interceptors.
- `apps/api/src/app.module.ts` — registers ConfigModule, PrismaModule, HealthModule, PortfolioModule.
- `apps/api/src/health/*` — health controller/module (liveness + readiness).
- `apps/api/src/prisma/*` — PrismaModule, PrismaService.
- `apps/api/src/common/middleware/` — Request ID middleware.
- `apps/api/src/common/filters/` — Global exception filter.
- `apps/api/src/common/interceptors/` — Logging interceptor.

## Testing
- **Unit tests:** `apps/api/src/**/*.spec.ts`
- **E2E tests:** `apps/api/test/*.e2e.spec.ts`
- Run: `cd apps/api && npm test`
- Run with coverage: `cd apps/api && npm test -- --coverage`

### Prerequisites for E2E tests
1. Start DB: `docker compose up -d db`
2. Ensure migrations are applied

## Local workflow
1) Start DB: `docker compose up -d db`
2) Env: `cp apps/api/.env.example apps/api/.env`
3) Install deps: `cd apps/api && npm install`
4) Generate client: `cd apps/api && npx prisma generate`
5) Migrate: `cd apps/api && npx prisma migrate dev --name init`
6) Run dev server: `cd apps/api && npm run start:dev`
7) Run tests: `cd apps/api && npm test`

## Notes
- No auth, users, or business endpoints in Phase 1.
- Backend is isolated from the frontend; keep UI persistence in localStorage.
