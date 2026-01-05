# Codex.md — v2  
**JustDCA · Phase 1 Execution Rules**

This document defines how humans and AI assistants (Copilot, Codex) collaborate on the JustDCA codebase.  
Its purpose is to protect Phase 1 scope, enforce consistency, and prevent accidental over-engineering.

If a change conflicts with this document, **this document wins**.

---

## 1. Product Intent (Read First)

JustDCA is a decision-support tool for beginner-to-intermediate investors using a Dollar Cost Averaging (DCA) strategy.

It exists to:
- Provide clarity, not predictions
- Provide context, not trading signals
- Reduce hesitation and noise around follow-up investment decisions

It is **not** a trading platform.

---

## 2. Phase 1 Scope Boundary (Non-Negotiable)

### In Scope (V1)
- Portfolio dashboard
- Positions table (add / edit / remove)
- Core portfolio metrics
- Benchmark comparison (index proxy)
- User-defined DCA levels
- Visual + email DCA proximity alerts
- Persistence via localStorage and/or backend API (Phase 1.1, anonymous `portfolioId`)

### Explicitly Out of Scope (Do NOT build)
- Buy / sell recommendations
- Market predictions or timing signals
- Technical indicators (RSI, MACD, Fibonacci, etc.)
- Automated DCA calculations
- Backtesting
- Trade execution
- Authentication, payments, subscriptions
- AI insights or summaries
- Charts beyond what already exists

If a request drifts toward the above, stop and propose it as Phase 2.

---

## 3. Design & UX Source of Truth

### Lovable
- Lovable is used for design exploration only
- It provides:
  - Visual direction
  - Layout ideas
  - Component intent
- Lovable code must never be copied verbatim

### Implementation Rules
All UI implementation must:
- Use shadcn/ui primitives
- Use Tailwind CSS tokens already defined
- Respect existing component boundaries
- Fit within the current layout system

If a Lovable design conflicts with the current system, adapt the design — do not refactor the system.

---

## 4. AI Guardrails (Critical)

When generating or modifying code, AI assistants must **not**:
- Introduce new UI libraries (MUI, Chakra, Ant, etc.)
- Introduce new state managers (Redux, Zustand, Jotai, etc.)
- Add authentication, user accounts, or payments
- Add charts unless explicitly requested
- Rename or reshuffle files without instruction
- Add trading signals, predictions, or technical indicators

Prefer small, reversible diffs over refactors.

### Phase 1 Backend Foundation Exception

AI assistants MAY introduce backend infrastructure under `apps/api`, provided that:

- Frontend behavior remains stable and data handling stays cautious
- No existing persistence logic is removed without replacing it within Phase 1.1 scope
- Stack stays NestJS + Postgres + Prisma with environment configuration
- No authentication, users, or accounts are introduced
- No business logic for trading signals, alerts, or calculations is moved server-side
- Persistence is keyed by an anonymous `portfolioId` kept in `localStorage`

### Phase 1.1 — Backend Persistence

- Backend MAY implement CRUD endpoints for portfolios/positions.
- Frontend MAY switch persistence from localStorage to backend API.
- Still NO authentication, NO users, NO payments, NO trading signals, NO predictions, NO technical indicators.
- Portfolio ownership is anonymous via a client-generated `portfolioId` stored in `localStorage` and used to scope backend data.

#### Recovery Code (Anonymous Portfolio Linking)

- Each portfolio may have an optional recovery code used to link the same portfolio across devices.
- Recovery codes are not user accounts and do not imply authentication.
- Recovery codes are treated as secrets and must never be stored in plaintext.
- Recovery codes enable: accessing the same portfolio from multiple devices (e.g., PC + phone) and restoring access if local storage is cleared.
- Recovery codes do NOT enable: user profiles, email-based login, password resets, or sessions/JWTs/OAuth.

---

## 5. Architecture & Code Ownership

### Frontend
- Next.js App Router
- React 19 + TypeScript (strict)
- Tailwind CSS v4
- shadcn/ui components only

### Code Separation
- UI components → `components/`
- Business logic → `lib/`
- Calculations never live in components
- Components should remain mostly presentational

### Persistence
- Frontend stores `portfolioId` in `localStorage`; portfolios/positions may persist via backend API keyed by that id.
- Persistence bugs are critical severity

---

## 6. Data & Reliability Assumptions

### External APIs (Finnhub)
- Treated as unreliable
- Must handle:
  - Missing data
  - Null values
  - Stale prices
  - Rate limits
- UI must degrade gracefully
- App must remain usable if prices fail to load

Never assume happy-path data.

---

## 7. Language, Tone & UX Rules

The product must not sound like a trading app or finfluencer tool.

### Avoid
- Urgency (“act now”, “don’t miss”)
- Financial promises
- Buy / sell language
- Alarmist phrasing

### Prefer
- Neutral, calm language
- Advisory wording
- Contextual cues (“near your DCA level”)

Goal: reduce anxiety, not trigger action.

---

## 8. Testing Expectations

### Unit Tests
- Required for any new logic in `lib/`
- Extend existing tests where possible

### E2E (Playwright)
Required for changes affecting:
- Add Position flow
- Persistence
- DCA highlighting logic
- Portfolio metrics

If tests are skipped, the PR must explain why.

---

## 9. CI Discipline

Before merge, the following must pass:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e` (when user flows are affected)

AI-generated code is held to the same bar as human code.

---

## 10. How to Work With This Repo

When unsure:
1. Re-read this document
2. Check existing patterns
3. Prefer the simplest implementation
4. Ask for clarification before adding complexity

---

## 11. Guiding Principle

> JustDCA succeeds when users hesitate less, not when the app does more.

Phase 1 is about trust, clarity, and discipline.  
Everything else comes later.
