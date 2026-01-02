import React from "react";

export function SummaryCards() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Total Portfolio Value
        </p>
        <p className="mt-4 text-3xl font-semibold">€0.00</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Based on live prices
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Daily P/L
        </p>
        <p className="mt-4 text-3xl font-semibold text-primary">+€0.00</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          vs. previous close
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Open Positions
        </p>
        <p className="mt-4 text-3xl font-semibold">0</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Tracked in this dashboard
        </p>
      </div>
    </div>
  );
}
