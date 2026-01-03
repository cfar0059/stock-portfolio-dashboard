/**
 * Portfolio-level metrics calculations
 * Computes aggregate KPIs from positions and stock data
 */

import type { Position, Stock } from "@/lib/types";

export type PortfolioMetrics = {
  totalInvested: number;
  currentValue: number;
  unrealizedPL: number;
  successRate: number;
};

/**
 * Calculate portfolio-level metrics
 * @param positions - Array of user positions
 * @param stocks - Array of current stock data (with price and shares)
 * @returns Portfolio metrics object
 */
export const calculatePortfolioMetrics = (
  positions: Position[],
  stocks: Stock[],
): PortfolioMetrics => {
  let totalInvested = 0;
  let currentValue = 0;

  for (const position of positions) {
    // Cost basis for this position
    const costBasis = position.shares * position.buyPrice;
    totalInvested += costBasis;

    // Current value for this position
    const stock = stocks.find((s) => s.symbol === position.symbol);
    if (stock) {
      const positionValue = position.shares * stock.price;
      currentValue += positionValue;
    }
  }

  // Unrealised P/L
  const unrealizedPL = currentValue - totalInvested;

  // Portfolio Success Rate (avoid divide by zero)
  const successRate =
    totalInvested > 0 ? (currentValue / totalInvested - 1) * 100 : 0;

  return {
    totalInvested,
    currentValue,
    unrealizedPL,
    successRate,
  };
};

/**
 * Determine color class for a metric based on its value
 * @param value - The metric value
 * @returns CSS class for coloring (text-primary, text-destructive, or text-muted-foreground)
 */
export const getMetricColor = (value: number): string => {
  if (value > 0) return "text-primary";
  if (value < 0) return "text-destructive";
  return "text-muted-foreground";
};
