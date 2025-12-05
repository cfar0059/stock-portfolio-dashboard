import React from "react";

export function SummaryCards() {
  return (
    <div className="mb-8 grid gap-4 md:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Total Portfolio Value
        </p>
        <p className="mt-4 text-3xl font-semibold">€0.00</p>
        <p className="mt-1 text-xs text-slate-500">Based on live prices</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Daily P/L
        </p>
        <p className="mt-4 text-3xl font-semibold text-emerald-400">+€0.00</p>
        <p className="mt-1 text-xs text-slate-500">vs. previous close</p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">
          Open Positions
        </p>
        <p className="mt-4 text-3xl font-semibold">0</p>
        <p className="mt-1 text-xs text-slate-500">Tracked in this dashboard</p>
      </div>
    </div>
  );
}
