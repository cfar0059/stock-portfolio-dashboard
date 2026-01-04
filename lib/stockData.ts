import type {
  CacheEntry,
  FinnhubQuoteResponse,
  Stock,
  StockResponse,
} from "@/lib/types";
import { getFinnhubApiKey } from "@/lib/env";

// Re-export types for backwards compatibility
export type { Stock, StockResponse };

const stockCache = new Map<string, CacheEntry>();

// TTL in milliseconds (e.g. 30 seconds)
const STOCK_CACHE_TTL_MS = 30_000;

// Security: Fetch timeout to prevent hanging requests
const FETCH_TIMEOUT_MS = 10_000;

// Security: Allowlisted API host (prevents SSRF)
const FINNHUB_API_HOST = "https://finnhub.io";

// ...existing code...

export async function getStockData(symbols: string[]): Promise<StockResponse> {
  const results = await Promise.allSettled(
    symbols.map((symbol) => fetchStockFromAPI(symbol)),
  );

  const fulfilled = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<Stock>).value);

  return fulfilled;
}

export async function fetchStockFromAPI(symbol: string): Promise<Stock> {
  const normalizedSymbol = symbol.toUpperCase();

  // Use centralized env getter with Amplify SSR support
  let apiKey: string;
  try {
    apiKey = getFinnhubApiKey();
  } catch (error) {
    console.error(
      `[fetchStockFromAPI] FINNHUB_API_KEY not found:`,
      error instanceof Error ? error.message : error,
    );
    throw error;
  }

  // 1. Try cache first
  const cached = stockCache.get(normalizedSymbol);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return { ...cached.data, source: "cache" };
  }

  // Security: Construct URL with allowlisted host only
  const url = `${FINNHUB_API_HOST}/api/v1/quote?symbol=${encodeURIComponent(
    normalizedSymbol,
  )}&token=${apiKey}`;

  // Security: Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[fetchStockFromAPI] Finnhub API error response body:`,
        errorText,
      );
      throw new Error(
        `Finnhub API error (${res.status}) for symbol ${normalizedSymbol}`,
      );
    }

    const data: FinnhubQuoteResponse = await res.json();

    // Basic sanity check – Finnhub returns 0 if symbol is invalid or no data
    if (!data || typeof data.c !== "number") {
      console.error(
        `[fetchStockFromAPI] Invalid quote data for ${normalizedSymbol}: data.c is not a number`,
      );
      throw new Error(`No valid quote data for symbol ${normalizedSymbol}`);
    }

    const stock: Stock = {
      symbol: normalizedSymbol,
      price: data.c,
      change: data.d ?? 0,
      changePercent: typeof data.dp === "number" ? data.dp : 0,
      currency: "USD",
      source: "live",
    };

    // 3. Store in cache
    stockCache.set(normalizedSymbol, {
      data: stock,
      expiresAt: now + STOCK_CACHE_TTL_MS,
    });

    return stock;
  } catch (error) {
    console.error(
      `[fetchStockFromAPI] ERROR for ${normalizedSymbol}:`,
      error instanceof Error ? error.message : error,
    );
    if (error instanceof Error && error.name === "AbortError") {
      console.error(
        `[fetchStockFromAPI] Request timed out after ${FETCH_TIMEOUT_MS}ms`,
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

const stockDataModule = {
  getStockData,
  fetchStockFromAPI,
};

export default stockDataModule;
