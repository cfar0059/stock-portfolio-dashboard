import type {
  CacheEntry,
  FinnhubQuoteResponse,
  Stock,
  StockResponse,
} from "@/lib/types";

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

  return results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<Stock>).value);
}

export async function fetchStockFromAPI(symbol: string): Promise<Stock> {
  const normalizedSymbol = symbol.toUpperCase();
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    throw new Error("FINNHUB_API_KEY is not set in environment variables.");
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
      throw new Error(
        `Finnhub API error (${res.status}) for symbol ${normalizedSymbol}`,
      );
    }

    const data: FinnhubQuoteResponse = await res.json();

    // Basic sanity check – Finnhub returns 0 if symbol is invalid or no data
    if (!data || typeof data.c !== "number") {
      throw new Error(`No valid quote data for symbol ${normalizedSymbol}`);
    }

    const stock: Stock = {
      symbol: normalizedSymbol,
      price: data.c,
      change: data.d ?? 0,
      currency: "USD",
      source: "live",
    };

    // 3. Store in cache
    stockCache.set(normalizedSymbol, {
      data: stock,
      expiresAt: now + STOCK_CACHE_TTL_MS,
    });

    return stock;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default {
  getStockData,
  fetchStockFromAPI,
};
