/**
 * Stock data manipulation and business logic
 * Pure functions for merging, sorting, and analyzing stock data
 */

import type { Position, Stock } from "@/lib/types";
import { calculateProfit } from "@/lib/calculateProfit";

/**
 * Merge stock market data with user position information
 * Enriches stocks with user holdings and profit/loss calculations
 *
 * @param stocks - Array of stock market data
 * @param positions - Array of user positions
 * @returns Enriched stocks with position and profit data
 */
export const mergePositionsWithStocks = (
  stocks: Stock[],
  positions: Position[],
): Stock[] =>
  stocks.map((stock) => {
    const position = positions.find((p) => p.symbol === stock.symbol);
    const shares = position?.shares || 0;
    const buyPrice = position?.buyPrice || 0;
    const dca = position?.dca;

    let profit = 0;
    if (buyPrice && shares > 0) {
      const { amount } = calculateProfit(stock.price, buyPrice, shares);
      profit = amount;
    }

    return {
      ...stock,
      id: position?.id, // Include position ID for React key uniqueness
      shares,
      buyPrice,
      profit,
      dca,
    };
  });

/**
 * Sort stocks by a given column and direction
 * Handles both numeric and string comparisons
 *
 * @param stocks - Array of stocks to sort
 * @param column - Column key to sort by (null = no sort)
 * @param direction - Sort direction ("asc" or "desc")
 * @returns Sorted array (original array unchanged)
 */
export const sortStocks = (
  stocks: Stock[],
  column: keyof Stock | null,
  direction: "asc" | "desc",
): Stock[] => {
  if (!column) return stocks;

  return [...stocks].sort((a, b) => {
    const aValue = a[column];
    const bValue = b[column];

    // Numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // String comparison (case-insensitive)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr);
    return direction === "asc" ? comparison : -comparison;
  });
};

/**
 * Check if stock price is at or below DCA (Dollar Cost Averaging) target
 * Used to highlight stocks that have reached their DCA threshold
 *
 * @param price - Current stock price
 * @param dca - Target DCA price (optional)
 * @returns True if price <= DCA and DCA is set, false otherwise
 */
export const isAtOrBelowDca = (price: number, dca?: number): boolean =>
  dca != null && dca > 0 && price <= dca;
