// filepath: /Users/carlfarrugiagalea/Documents/Dev/stock-portfolio-dashboard/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Position, Stock } from "@/lib/types";
import {
  calculatePortfolioMetrics,
  getMetricColor,
} from "@/lib/portfolioMetrics";
import { formatCurrency, formatPercentage } from "@/lib/formatting";
import { backendPortfolioRepository } from "@/lib/portfolio/backendRepository";

interface KPICardProps {
  label: string;
  value: string;
  valueColor?: string;
}

/**
 * KPI Card component for displaying portfolio metrics
 */
function KPICard({ label, value, valueColor }: KPICardProps) {
  return (
    <Card className="bg-card border-border rounded-lg">
      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`text-lg sm:text-2xl font-semibold ${valueColor || "text-foreground"}`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface HoldingsAllocationTableProps {
  activePositions: Position[];
  stocks: Stock[];
  totalCurrentValue: number;
}

/**
 * Holdings Allocation Table - shows capital allocation across positions
 */
function HoldingsAllocationTable({
  activePositions,
  stocks,
  totalCurrentValue,
}: HoldingsAllocationTableProps) {
  // Build rows with calculated values
  const rows = activePositions.map((position) => {
    const stock = stocks.find((s) => s.symbol === position.symbol);
    const currentPrice = stock?.price ?? 0;

    const costBasis = position.shares * position.buyPrice;
    const currentValue = position.shares * currentPrice;
    const weight =
      totalCurrentValue > 0 ? (currentValue / totalCurrentValue) * 100 : 0;

    // Success Rate for this position: ((currentValue / costBasis) - 1) * 100
    const positionSuccessRate =
      costBasis > 0 ? (currentValue / costBasis - 1) * 100 : 0;

    return {
      ticker: position.symbol,
      quantity: position.shares,
      avgCost: position.buyPrice,
      costBasis,
      currentValue,
      weight,
      successRate: positionSuccessRate,
    };
  });

  return (
    <div className="rounded-lg border border-border bg-card/30 overflow-hidden">
      <div className="overflow-x-auto">
        <Table suppressHydrationWarning className="w-full">
          <TableHeader>
            <TableRow
              suppressHydrationWarning
              className="border-b border-border bg-card/50 hover:bg-card/50"
            >
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ticker
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Quantity
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Avg Cost
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Cost Basis
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Current Value
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Weight (%)
              </TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Success Rate (%)
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                suppressHydrationWarning
                key={row.ticker}
                className="border-b border-border hover:bg-accent/40 transition-colors"
              >
                <TableCell className="px-4 py-3 text-sm font-medium text-foreground">
                  {row.ticker}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-right text-foreground">
                  {row.quantity}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-right text-foreground">
                  ${formatCurrency(row.avgCost)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-right text-foreground">
                  ${formatCurrency(row.costBasis)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-right text-foreground">
                  ${formatCurrency(row.currentValue)}
                </TableCell>
                <TableCell className="px-4 py-3 text-sm text-right text-foreground">
                  {formatPercentage(row.weight)}
                </TableCell>
                <TableCell
                  className={`px-4 py-3 text-sm text-right font-medium ${getMetricColor(row.successRate)}`}
                >
                  {formatPercentage(row.successRate)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);

  async function fetchStocks(symbols: string[]) {
    try {
      const query = symbols.join(",");
      const res = await fetch(
        `/api/stocks?symbols=${encodeURIComponent(query)}`,
      );

      if (res.ok) {
        const data: { stocks: Stock[] } = await res.json();
        setStocks(data.stocks);
      }
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    }
  }

  // Load positions from backend (with localStorage fallback) and fetch stock data
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await backendPortfolioRepository.loadPositions();
        setPositions(stored);

        // Fetch stock data for all positions with shares > 0
        const activeSymbols = stored
          .filter((p: Position) => p.shares > 0)
          .map((p: Position) => p.symbol.toUpperCase());

        if (activeSymbols.length > 0) {
          void fetchStocks(activeSymbols);
        }
      } catch (error) {
        console.error("Failed to load positions:", error);
      }
    }
    loadData();
  }, []);

  // Calculate active positions (shares > 0)
  const activePositions = positions.filter((p) => p.shares > 0);
  const hasPositions = activePositions.length > 0;

  // Calculate metrics only if we have positions with data
  const metrics = hasPositions
    ? calculatePortfolioMetrics(activePositions, stocks)
    : null;

  return (
    <div suppressHydrationWarning className="min-h-screen px-6 py-8">
      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-slate-100">Profile</h1>
        <p className="text-sm text-slate-400 mt-2">
          Capital efficiency and portfolio performance overview
        </p>
      </div>

      {/* KPI Cards Section */}
      {hasPositions && metrics ? (
        <div className="space-y-8">
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Total Invested */}
            <KPICard
              label="Total Invested"
              value={`$${formatCurrency(metrics.totalInvested)}`}
              valueColor="text-slate-100"
            />

            {/* Current Value */}
            <KPICard
              label="Current Value"
              value={`$${formatCurrency(metrics.currentValue)}`}
              valueColor="text-slate-100"
            />

            {/* Unrealised P/L */}
            <KPICard
              label="Unrealised P/L"
              value={`$${formatCurrency(Math.abs(metrics.unrealizedPL))}`}
              valueColor={getMetricColor(metrics.unrealizedPL)}
            />

            {/* Portfolio Success Rate */}
            <KPICard
              label="Success Rate"
              value={formatPercentage(metrics.successRate)}
              valueColor={getMetricColor(metrics.successRate)}
            />
          </div>

          {/* Holdings Allocation Table */}
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">
              Holdings Allocation
            </h2>
            <HoldingsAllocationTable
              activePositions={activePositions}
              stocks={stocks}
              totalCurrentValue={metrics.currentValue}
            />
          </div>
        </div>
      ) : (
        // Empty State
        <div className="py-20 px-6 text-center">
          <div className="inline-block text-left max-w-md">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              No positions yet
            </h2>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              Your portfolio performance overview will appear here once you add
              your first stock position. Start building your portfolio to track
              capital efficiency and growth.
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full border-border bg-card text-foreground hover:border-ring hover:bg-accent hover:text-foreground"
              >
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
