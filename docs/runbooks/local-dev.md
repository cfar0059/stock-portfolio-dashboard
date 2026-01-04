# Local Development Runbook

## Frontend (Next.js)
1) Install deps: `npm install`
2) Env: `cp .env.local.example .env.local` and set `FINNHUB_API_KEY`
3) Start dev server: `npm run dev`
4) Tests: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e` (when flows change)

## Backend (NestJS scaffold in `apps/api`)
1) Start Postgres: `docker compose up -d db`
2) Env: `cp apps/api/.env.example apps/api/.env` and set `DATABASE_URL`, `API_PORT` (default 4000)
3) Install deps: `cd apps/api && npm install`
4) Generate client: `cd apps/api && npx prisma generate`
5) Run migrations: `cd apps/api && npx prisma migrate dev --name init`
6) Start dev server: `cd apps/api && npm run start:dev`

## Database (Docker Compose)
- Service: `db` in `docker-compose.yml`, exposed on `localhost:5432`
- Env-driven creds: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- Data persists via named volume `pgdata`
- Healthcheck uses `pg_isready` against `POSTGRES_DB`

## Troubleshooting
- **P1001 (Prisma cannot reach DB):** ensure `docker compose up -d db` is running, `DATABASE_URL` matches compose env (host `localhost`, port `5432`), and network/firewall allows local connections.
- **Finnhub errors:** check `FINNHUB_API_KEY`, handle nulls/rate limits; free tier is rate-limited.
- **LLM context drift:** re-read `AGENTS.md` and `docs/llm-guide.md` before making changes.
