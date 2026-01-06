# Backend (NestJS + Prisma) Overview

## Scope
- Backend lives under `apps/api`.
- Purpose: Production-grade NestJS + Prisma API for portfolio management.
- Database: PostgreSQL via Prisma ORM.
- Authentication: Recovery code based (no user accounts; portfolioId is unguessable cuid).

## Runtime
- Port: 4000 (configurable via `API_PORT`).
- CORS: enabled for `http://localhost:3000` in non-production.

## API Endpoints

### Health Endpoints

| Endpoint        | Purpose                              | Response                                       |
|-----------------|--------------------------------------|------------------------------------------------|
| `GET /health`   | Liveness probe                       | `{ ok: true }` (200)                           |
| `GET /health/ready` | Readiness probe (checks DB)      | `{ ok: true }` (200) or `{ ok: false, reason: "db" }` (503) |

### Portfolio Endpoints

| Method | Endpoint | Purpose | Request Body | Response |
|--------|----------|---------|--------------|----------|
| `POST` | `/portfolios` | Create new portfolio | `{}` | `{ portfolioId: string, recoveryCode: string }` |
| `POST` | `/portfolios/link` | Link to existing portfolio via recovery code | `{ recoveryCode: string }` | `{ portfolioId: string }` |
| `GET` | `/portfolios/:id` | Get portfolio with all positions | — | `{ id, recoveryCodeHash, ..., positions: [...] }` |
| `POST` | `/portfolios/:id/positions` | Add position to portfolio | `{ symbol, shares, buyPrice, dcaPrice? }` | `{ id, symbol, shares, buyPrice, dcaPrice, portfolioId, ... }` |
| `PATCH` | `/portfolios/:id/positions/:positionId` | Update position (partial) | `{ symbol?, shares?, buyPrice?, dcaPrice? }` | `{ id, symbol, shares, buyPrice, dcaPrice, ... }` |
| `DELETE` | `/portfolios/:id/positions/:positionId` | Delete position | — | `{ deleted: true }` |

### Validation Rules

**Position fields:**
- `symbol`: trimmed, uppercased, non-empty
- `shares`: must be > 0 (supports decimals for fractional shares)
- `buyPrice`: must be > 0
- `dcaPrice`: optional, must be > 0 if present

**Error responses:** All validation errors return 400 with structured error message.

**Security:**
- Position updates/deletes verify that the position belongs to the specified portfolioId (prevents cross-portfolio writes).
- No authentication required; portfolioId is unguessable (cuid).

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
- Handles ZodError validation errors (returns 400)
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
  - Model `Portfolio`: `id (cuid)`, `recoveryCodeHash`, `recoveryCodeSalt`, `recoveryCodeLookup`, `createdAt`, `updatedAt`, `positions[]`
  - Model `Position`: `id (cuid)`, `symbol (string)`, `shares (Decimal)`, `buyPrice (Decimal)`, `dcaPrice (Decimal?)`, `portfolioId`, `createdAt`, `updatedAt`
- Client generation: `npx prisma generate`
- Migration: `npx prisma migrate dev --name <name>`
- Connection: uses `DATABASE_URL`
- Shutdown: PrismaService ties into `process.beforeExit` to close Nest app cleanly.

## Modules
- `apps/api/src/main.ts` — bootstrap, CORS, port, Prisma shutdown hook, registers middleware/filters/interceptors.
- `apps/api/src/app.module.ts` — registers ConfigModule, PrismaModule, HealthModule, PortfolioModule.
- `apps/api/src/health/*` — health controller/module (liveness + readiness).
- `apps/api/src/portfolio/*` — portfolio controller/service/module (CRUD).
- `apps/api/src/portfolio/dto/*` — Zod-based DTOs for position create/update.
- `apps/api/src/prisma/*` — PrismaModule, PrismaService.
- `apps/api/src/recovery/*` — Recovery code generation/hashing/verification.
- `apps/api/src/common/middleware/` — Request ID middleware.
- `apps/api/src/common/filters/` — Global exception filter.
- `apps/api/src/common/interceptors/` — Logging interceptor.

## Testing
- **Unit tests:** `apps/api/src/**/*.spec.ts`
- **E2E tests:** `apps/api/test/*.e2e.spec.ts`
  - `test/health.e2e.spec.ts` — Health endpoint tests
  - `test/portfolio.e2e.spec.ts` — Portfolio + Position CRUD tests
- Run: `cd apps/api && npm test`
- Run specific suite: `cd apps/api && npm test -- --testPathPattern=portfolio`
- Run with coverage: `cd apps/api && npm test -- --coverage`

### Prerequisites for E2E tests
1. Start DB: `docker compose up -d db`
2. Ensure migrations are applied: `cd apps/api && npx prisma migrate dev`

## Local workflow
1) Start DB: `docker compose up -d db`
2) Env: `cp apps/api/.env.example apps/api/.env`
3) Install deps: `cd apps/api && npm install`
4) Generate client: `cd apps/api && npx prisma generate`
5) Migrate: `cd apps/api && npx prisma migrate dev`
6) Run dev server: `cd apps/api && npm run start:dev`
7) Run tests: `cd apps/api && npm test`
8) Build: `cd apps/api && npm run build`

## Notes
- Portfolio access is scoped by portfolioId (unguessable cuid).
- Recovery codes use secure hashing (scrypt) with per-portfolio salt.
- No user accounts or sessions; recovery code is the only authentication mechanism.
- Frontend can continue using localStorage OR migrate to this API gradually.
