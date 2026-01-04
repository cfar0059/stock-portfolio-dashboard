/**
 * Centralized type definitions
 * Single source of truth for all types used across the application
 */

/**
 * Portfolio position data
 * Represents a single stock position held by the user
 */
export type Position = {
  id: string; // UUID or timestamp string
  symbol: string;
  shares: number;
  buyPrice: number;
  dca?: number; // Dollar Cost Averaging target price (optional)
};

/**
 * Stock market data
 * Contains current price, change, and user portfolio information
 */
export type Stock = {
  id?: string; // Unique identifier from position (used for React keys)
  symbol: string;
  price: number;
  change: number; // Point change
  changePercent: number; // Percentage change
  currency: string;
  source: "cache" | "live";
  shares?: number; // From position
  buyPrice?: number; // From position
  profit?: number; // Calculated
  dca?: number; // From position
};

/**
 * Collection of stocks
 */
export type StockResponse = Stock[];

/**
 * Profit/loss calculation result
 */
export type ProfitData = {
  amount: number; // Dollar amount of profit/loss
  percentage: number; // Percentage profit/loss
};

/**
 * Form validation error
 */
export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Cache entry for stock data
 * Used internally for caching stock prices
 */
export type CacheEntry = {
  data: Stock;
  expiresAt: number;
};

/**
 * Finnhub API response format
 * Used for parsing external API responses
 */
export type FinnhubQuoteResponse = {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high of the day
  l: number; // low of the day
  o: number; // open price
  pc: number; // previous close
  t: number; // timestamp
};
