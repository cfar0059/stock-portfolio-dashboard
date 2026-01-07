# JustDCA

A beginner-friendly investment companion built with **Next.js 15.5.9**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

JustDCA helps new investors build confidence and discipline with their Dollar Cost Averaging (DCA) strategy. Track positions, monitor performance, and understand when you're buying high or low — all in a clean, focused interface.

---

## LLM Collaboration Snapshot (read this first)

- **Guardrails:** See `AGENTS.md` (Phase 1 scope; UI only with shadcn/Tailwind; no auth, predictions, or extra charts; backend allowed only as isolated infra under `apps/api`).
- **Environments:** Frontend uses `.env.local` for `FINNHUB_API_KEY`; backend uses `apps/api/.env` (sample in `apps/api/.env.example`) for `DATABASE_URL` and `API_PORT`.
- **Data contract:** Frontend persistence is **browser localStorage** in Phase 1. External data comes from Finnhub; handle nulls, stale data, and rate limits.
- **Key codepaths:** Next.js App Router under `app/`; stock fetcher at `app/api/stocks/route.ts`.
- **Backend scaffold:** NestJS API in `apps/api` with Prisma `Position` model (`apps/api/prisma/schema.prisma`), health check at `GET /health`, CORS for `http://localhost:3000`.
- **Infra:** `docker-compose.yml` provides Postgres (`db` service) on `localhost:5432` with env-driven credentials and a named volume.
- **Testing:** Unit tests required for new logic in `lib/`; Playwright E2E when persistence/Add Position/DCA highlighting/metrics change.

---

## Features

### Dashboard Overview
- **Real-time stock prices** via Finnhub API integration
- **Position management**: Add, edit, and delete stock positions
- **Profit/loss calculations** with green/red indicators
- **Fractional shares support** (up to 2 decimal places)
- **DCA tracking** with automatic highlighting when price is at or below target
- **Local persistence** using browser localStorage

### Profile Analytics
- **Key Performance Indicators (KPIs)**:
  - Total Invested (cost basis)
  - Current Portfolio Value
  - Unrealised Profit/Loss (USD and %)
  - Portfolio Success Rate
- **Holdings Allocation Table** showing capital distribution across positions
- **Responsive design** for desktop and mobile screens

### Modern UI/UX
- Dark theme optimized for market trading
- Smooth animations and transitions
- Fully accessible shadcn/ui components
- Professional table layouts with sorting and filtering ready
- Mobile-responsive grid system

---

## Quick Start

### Prerequisites

- **Node.js 18+** (or 20+)
- **npm** or **yarn** (npm recommended)
- **Finnhub API Key** (free tier available at [finnhub.io](https://finnhub.io))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stock-portfolio-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your Finnhub API key:
   ```env
   FINNHUB_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Usage

### Adding a Stock Position

1. Click **"Add Position"** on the Overview page
2. Enter stock details:
   - **Symbol**: Stock ticker (e.g., AAPL, MSFT)
   - **Shares**: Quantity (supports decimals, e.g., 0.5)
   - **Buy Price**: Price per share when purchased
   - **Target DCA** (optional): Dollar Cost Averaging target price
3. Click the **green checkmark** to save

### Editing a Position

1. Click the **pencil icon** on any row in the Positions table
2. Update the values in the form above
3. Click the **green checkmark** to confirm

### Deleting a Position

1. Click the **X icon** on any row in the Positions table
2. Position is removed immediately

### Viewing Analytics

1. Navigate to the **Profile** page
2. View KPI cards showing portfolio metrics
3. Review the Holdings Allocation table for capital distribution
4. Success Rate indicators (green/red) show position-level performance

---

## Development

### Available Scripts

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run typecheck

# Linting
npm run lint
```

### Continuous Integration

This project uses GitHub Actions for automated testing and validation.

**CI Pipeline runs on:**
- Every push to `main` branch
- Every pull request to `main` branch

**CI Steps:**
1. Install dependencies (`npm ci`)
2. Run ESLint (`npm run lint`)
3. Type check TypeScript (`npm run typecheck`)
4. Build production bundle (`npm run build`)

**Node.js versions tested:** 18.x, 20.x

All steps must pass before code can be merged. The CI workflow is defined in `.github/workflows/ci.yml`.

### Project Structure

```
justdca/
├── app/                      # Next.js App Router
│   ├── api/stocks/          # API route for fetching stock data
│   ├── profile/             # Profile/analytics page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard/overview page
├── components/              # React components
│   ├── AppSidebar.tsx       # Desktop navigation
│   ├── PositionsSection.tsx # Positions management
│   ├── AddPositionForm.tsx  # Add/edit position form
│   ├── StockDashboard.tsx   # Positions table
│   ├── ui/                  # shadcn/ui primitives
│   └── ...                  # Other components
├── lib/                     # Utilities & helpers
│   ├── types.ts             # TypeScript types
│   ├── validation.ts        # Form validation
│   ├── stockData.ts         # API integration
│   ├── portfolioMetrics.ts  # Calculations
│   ├── storageUtils.ts      # localStorage management
│   ├── env.ts               # Environment validation
│   └── ...                  # Other utilities
├── public/                  # Static assets
├── SECURITY.md              # Security documentation
└── package.json             # Dependencies
```

### Key Technologies

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15.5.9 (App Router) |
| **Runtime** | React 19 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Components** | shadcn/ui |
| **Icons** | Lucide React |
| **External API** | Finnhub (stock prices) |
| **State** | React hooks + localStorage |

---

## Security

### Key Security Features

- ✅ **Input validation** on all forms (API and client-side)
- ✅ **XSS protection** via React's built-in escaping
- ✅ **SSRF prevention** with hardcoded API allowlist
- ✅ **Fetch timeout** (10s) on external API calls
- ✅ **Environment secrets** never exposed to browser
- ✅ **No authentication required** (local storage only)

For detailed security information, see [SECURITY.md](./SECURITY.md).

---

## Pre-Production Checklist

Before deploying to production, run:

```bash
# 1. Type checking
npm run typecheck

# 2. Linting
npm run lint

# 3. Production build
npm run build

# 4. Dependency audit
npm audit
```

All should pass with exit code 0. See [SECURITY.md](./SECURITY.md) for full pre-prod checklist.

---

## Deployment

### Vercel (Recommended)

The easiest way to deploy is on [Vercel](https://vercel.com):

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect Vercel**
   - Visit [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Add environment variable: `FINNHUB_API_KEY`
   - Deploy

3. **Access your app**
   - Vercel provides a production URL
   - Domain can be configured in project settings

### Other Platforms

This app can be deployed to any Node.js-compatible platform:
- **Netlify** (with serverless functions)
- **Railway**
- **Render**
- **AWS (EC2, Lambda)**
- **Docker** (containerization)

See [Next.js Deployment Docs](https://nextjs.org/docs/app/building-your-application/deploying) for detailed guides.

---

## Troubleshooting

### "Missing FINNHUB_API_KEY" Error

**Solution**: 
- Ensure `.env.local` exists in the project root
- Add your API key: `FINNHUB_API_KEY=your_key_here`
- Restart the dev server

### Positions Not Persisting After Refresh

**Solution**:
- Check browser console for localStorage errors
- Ensure cookies/storage are enabled in browser settings
- Try incognito mode to rule out browser extensions

### Stock Prices Show as "N/A"

**Solution**:
- Verify your Finnhub API key is valid
- Check network tab in DevTools for API call failures
- Ensure symbol is valid (e.g., AAPL, not APPLE)
- API rate limits: free tier allows ~60 requests/minute

### Build Fails with TypeScript Errors

**Solution**:
- Run `npm run typecheck` to see detailed errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)

---

## Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Finnhub API Docs](https://finnhub.io/docs/api)

---

## License

This project is private. Please contact the maintainers for usage permissions.

---

## Contributing

For internal team members:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run `npm run lint` and `npm run typecheck`
4. Commit with clear messages: `git commit -m "feat: add feature"`
5. Push and open a pull request

---

## Support

For issues, questions, or feature requests, contact the development team or open an issue in the repository.

---

Built with care for beginner investors who want clarity, not complexity.
## Local Postgres via Docker Compose

Spin up a local database for development:

- `docker compose up -d`
- `docker compose down`

The service is defined in `docker-compose.yml` and exposes Postgres on `localhost:5432` with a persistent volume.
Set `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, and `POSTGRES_PORT` before running compose (copy `.env.example` to `.env` or export them in your shell).

## Backend API (NestJS)

Location: `apps/api`

1) Start Postgres: `docker compose up -d`
2) Copy env: `cp apps/api/.env.example apps/api/.env`
3) Install deps: `cd apps/api && npm install`
4) Run migrations: `cd apps/api && npx prisma migrate dev --name init`
5) Start dev server on port 4000: `cd apps/api && npm run start:dev`

## Additional Docs
- `docs/llm-guide.md` — how to use LLMs safely on this repo
- `docs/architecture.md` — high-level system layout
- `docs/runbooks/local-dev.md` — quick steps for frontend/backend + DB
- `docs/api/backend.md` — NestJS/Prisma scaffold details
