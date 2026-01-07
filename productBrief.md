# Product Brief — JustDCA

## Current Status

**V1 Delivery Progress:**
- Core dashboard and navigation — *shipped*
- Position management (add, edit, delete) — *shipped*
- Portfolio metrics (total value, invested, P/L) — *shipped*
- DCA level tracking with visual highlighting — *shipped*
- Local persistence (browser localStorage) — *shipped*
- Cross-device sync via recovery codes — *in progress*
- Portfolio benchmarking vs index — *not started*
- DCA proximity notifications — *not started* (deferred; requires notification infrastructure)

**Current Phase:** V1 core functionality with anonymous persistence (no accounts/auth).

---

## Introduction

JustDCA is a product designed for beginner-to-intermediate retail investors who feel overwhelmed by market noise and lack a simple, trustworthy way to understand their portfolio and make confident Dollar Cost Averaging (DCA) decisions.

The product prioritises clarity over complexity. It signals when a position aligns with a user’s DCA strategy and valuation expectations, helping users act with confidence instead of second-guessing.

JustDCA is not built to compete with professional trading platforms. Its purpose is to lower the barrier to entry for investors who want structure, consistency, and confidence while building long-term positions.

## Problem Statement

Beginner and early-stage retail investors struggle to make consistent follow-on investment decisions because existing tools expose market data without connecting it to personal portfolio context or planned entry levels. This gap leads to hesitation, overthinking, and missed reinvestment opportunities even when prices align with the user’s intended DCA strategy.

## Target User

### Primary User

JustDCA is built for beginner-to-intermediate retail investors who have already bought one or more stocks but are unsure how to manage follow-on decisions. These users are not trying to trade actively or outperform the market; they want confidence that their actions make sense within a disciplined, long-term DCA approach. They value clarity, structure, and reassurance over speed or complexity.

### What They Use Today

Today, these users typically rely on a mix of:

* Custom Excel or Google Sheets to manually track positions  
* Broker-provided interfaces optimised for execution and activity rather than portfolio-level context

While these tools display prices and balances, they do not help users understand whether current prices align with planned DCA levels or a broader portfolio strategy, often encouraging reactive behaviour.

### Who JustDCA Is Not For

JustDCA is intentionally not designed for:

* Active traders or short-term investors  
* Professional or semi-professional investors  
* Users seeking execution, automation, or trading signals  
* Users who already rely heavily on advanced trading workflows and tooling

These users already have access to sophisticated systems that exceed the scope and intent of JustDCA.

## Value Proposition

JustDCA provides a focused decision-support layer that existing tools do not. Instead of exposing users to broad, feature-heavy platforms optimised for trading activity, it narrows the problem space to what matters most for long-term investing: knowing when and why to add capital.

The product organises a user’s portfolio around planned DCA entry points and highlights moments that warrant attention only when prices align with the user’s predefined strategy. By removing technical indicators, trading jargon, and unnecessary noise, JustDCA replaces reactive decision-making with consistency and discipline.

Unlike spreadsheets or broker dashboards, JustDCA frames progress in context. Individual positions are benchmarked against simple alternatives such as major index funds, allowing users to quickly understand whether their stock-level approach is outperforming, tracking, or lagging a passive baseline.

Ultimately, JustDCA reduces overthinking, encourages repeatable behaviour, and helps users build long-term confidence without attempting to predict markets or provide financial advice.

## Success Metrics

Success for JustDCA is measured through observable user behaviour and decision confidence rather than short-term performance or trading activity.

### Early Signals — Activation & Confidence

* Users successfully add and maintain their first stock positions within JustDCA  
* Users define DCA levels and act on highlighted opportunities instead of hesitating  
* Reduced time between a price reaching a DCA level and the user taking action

### Decision Quality — Guardrails & Discipline

* Users pause, delay, or reassess entries after receiving contextual warnings  
* Fewer emotionally driven entries during short-term price spikes  
* Increased consistency in how users apply their own DCA rules over time

### Long-Term Validation — Outcome Context

* Users can clearly see whether their stock-level DCA approach is:  
  * Outperforming  
  * Tracking  
  * Underperforming simple index benchmarks (e.g. S\&P 500\)  
* Matching index performance with reduced stress and clearer decision-making is considered a successful outcome

In aggregate, JustDCA is succeeding when users move from hesitation to disciplined action, apply their strategy consistently, and gain clear visibility into how their approach compares to passive alternatives.

## Non-Goals

JustDCA is intentionally opinionated about what it does not attempt to solve.

* It is not a trading platform and does not provide financial advice, stock recommendations, or prescriptive buy/sell instructions.  
* It does not attempt to predict market direction, short-term price movements, or optimal market timing.  
* Automated execution, trading bots, and active trading strategies are explicitly out of scope.  
* The product is not designed for day traders, short-term speculators, or users seeking frequent transactional activity.  
* JustDCA does not guarantee returns or protect users from losses; investment risk always remains with the user.

The product's role is to support disciplined decision-making, not to control outcomes. JustDCA provides structure, context, and reminders that help users apply their own strategy consistently and responsibly.

## Cross-Device Access (Recovery Codes)

JustDCA deliberately avoids user accounts and authentication in V1. Instead, cross-device access is provided through anonymous recovery codes.

**How it works:**
1. When a user first creates a portfolio, a unique recovery code is generated and shown once
2. The user saves this code (the app does not store the plaintext)
3. On a new device, the user enters the code to restore their portfolio
4. The code links to a `portfolioId` stored server-side; the code itself is hashed before storage

**Design rationale:**
* Removes friction of account creation for a simple tool
* Preserves privacy (no email, no personal data)
* Encourages the user to take ownership of their access
* Aligns with the product philosophy of simplicity and discipline

**Limitations (intentional for V1):**
* No code regeneration or recovery if lost
* No email-based backup
* User is responsible for saving the code

This approach trades convenience for privacy and simplicity. Future versions may introduce optional account linking for users who want it.

## Risks & Trade-offs

The primary trade-off in building JustDCA this way is prioritising clarity, trust, and long-term user value over immediate monetisation. Version one is deliberately not optimised for revenue generation, favouring habit formation and confidence-building instead of short-term financial returns.

This approach trades early commercial upside for long-term positioning. By focusing on education, discipline, and repeatable behaviour, JustDCA aims to become a trusted entry point for new investors. The risk is that without a clear early monetisation path, operational costs such as market data, infrastructure, and ongoing development must be carefully managed.

Another risk lies in intentional scope restraint. By remaining narrowly focused, JustDCA may initially appeal to a smaller audience compared to broader, feature-rich platforms. However, this constraint is a conscious choice to avoid overwhelming users and diluting the core value proposition.

In summary, JustDCA makes a deliberate bet that credibility and consistent user value should come first, with monetisation and expansion introduced only after behaviour change and long-term usefulness are clearly validated.

## V1 Scope vs Future Bets

### V1 — Must-have, Non-negotiable

Version one of JustDCA focuses exclusively on delivering clarity, structure, and confidence at the moments when users need to decide whether to add capital.

Core V1 capabilities include:

* A simple, intuitive dashboard with clear navigation
* Core portfolio metrics, including:
  * Individual positions
  * Total portfolio value
  * Total invested capital and unrealised profit/loss
* A positions table displaying:
  * Symbol
  * Current price and daily change
  * Shares held
  * Buy price
  * Profit/loss
  * User-defined DCA level with visual highlighting when price is at or below target
  * Basic position actions (add, edit, remove)
* A clear and lightweight Add Position flow
* Cross-device portfolio access via recovery codes (no account required)
* A profile or summary view consolidating portfolio performance

These features collectively enable users to track their portfolio, understand context, and act deliberately when opportunities arise.

### V1.1 — Planned Extensions (Post-Core)

These features remain part of V1 but are sequenced after core functionality is stable:

* Portfolio benchmarking against a major index fund (e.g. S&P 500)
* DCA proximity notifications (requires notification infrastructure — email or push)

### Future Bets — Explicitly Not V1

The following ideas are intentionally deferred to avoid premature complexity, cost, and behavioural overload. They are potential extensions of the product once core adoption and behaviour change are validated:

* Automated DCA calculations based on technical analysis (e.g. Fibonacci S2–S3 ranges)  
* System-generated warnings indicating that a stock is trading in an objectively expensive valuation region  
* User-defined upside review alerts to prompt reassessment when positions reach predefined profit thresholds  
* Dedicated stock-level views exposing valuation metrics such as P/E and forward P/E  
* Interactive price and performance charts (deferred due to market data cost, rendering complexity, and performance considerations)  
* AI-powered insights, summaries, or decision-support explanations

These capabilities may add value over time but are intentionally excluded from V1 to preserve focus, manage cost, and ensure the product earns user trust before introducing additional complexity.

