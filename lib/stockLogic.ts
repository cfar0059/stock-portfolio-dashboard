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
 * Check if stock price is within 5% of DCA target
 * Used to highlight positions where the current price is close to the DCA target price
 * This signals: "Your DCA target is in range, now is the time to act"
 *
 * @param price - Current stock price (must be a number)
 * @param dcaTarget - Target DCA price set by user (must be a number)
 * @returns True if price is within ±5% of DCA target, false otherwise
 *
 * RULES:
 * - Both price and dcaTarget MUST be numbers, never strings or formatted values
 * - dcaTarget must be > 0 to perform meaningful comparison
 * - Threshold: price is within 5% range = dcaTarget * 0.95 <= price <= dcaTarget * 1.05
 * - This is a call-to-action signal: "DCA target is in reach, take action now"
 * - Only highlights if DCA target is explicitly set (not null/undefined)
 */
export const isAtOrBelowDca = (price: number, dcaTarget?: number): boolean => {
  // If no DCA target set, never highlight
  if (!dcaTarget || dcaTarget <= 0) {
    return false;
  }
  // Highlight if price is within ±5% of DCA target
  const lowerBound = dcaTarget * 0.95;
  const upperBound = dcaTarget * 1.05;
  return price >= lowerBound && price <= upperBound;
};

/**
 * Compute row styling for a stock position
 * Centralizes all styling decisions to ensure consistency and prevent regressions
 *
 * @param stock - Stock object with price, dca (target), and other data (all numbers)
 * @returns Object with CSS class strings for row and price text highlight
 *
 * STYLING RULES:
 * - Row highlight: Applied if price is within ±5% of DCA target
 * - Price text emphasis: Applied if price is within ±5% of DCA target (sky-blue highlight)
 * - Entire row highlight: Applied with sky-blue border + background
 * - Call-to-action signal: User's DCA target is in reach, take action now
 * - Only highlights if DCA target is explicitly set by user
 * - All inputs MUST be numbers; formatting happens only at render time
 *
 * EXPECTED INVARIANTS:
 * - If DCA target is set AND price within ±5%: Row + Price cell will have highlight styling (sky-blue)
 * - If DCA target is null/undefined: No highlight (user hasn't set a target)
 * - If price is outside ±5% range: No highlight (target not in reach yet)
 * - Base profitability colors (green/red) are separate from DCA emphasis
 */
export const getRowStyles = (stock: Stock) => {
  // Core DCA logic: check if price is within ±5% of DCA target
  const highlightRow = isAtOrBelowDca(stock.price, stock.dca);

  // Row container className
  // Applies highlight only if price is within range of DCA target
  const rowClass = `border-b last:border-b-0 hover:bg-slate-900/60 transition-colors ${
    highlightRow ? "border-sky-500/40 bg-slate-800/60" : "border-slate-800"
  }`;

  // Price cell text color: highlight if within ±5% of DCA target
  // This is the PRIMARY visual indicator that DCA action is warranted
  const priceTextClass = highlightRow ? "text-sky-400" : "text-slate-200";

  // DCA cell text color: Always neutral (displays the stored DCA target)
  // The DCA cell shows user's target value
  const dcaTextClass = "text-slate-200";

  return {
    rowClass,
    priceTextClass,
    dcaTextClass,
    highlightRow, // Boolean for conditional rendering if needed
  };
};
