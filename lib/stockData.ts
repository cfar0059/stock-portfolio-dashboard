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
  console.log("[getStockData] Called with symbols:", symbols);

  const results = await Promise.allSettled(
    symbols.map((symbol) => fetchStockFromAPI(symbol)),
  );

  console.log("[getStockData] Promise.allSettled results:");
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      console.log(
        `[getStockData] Symbol ${symbols[index]}: FULFILLED -`,
        JSON.stringify(result.value),
      );
    } else {
      console.log(
        `[getStockData] Symbol ${symbols[index]}: REJECTED -`,
        result.reason?.message || result.reason,
      );
    }
  });

  const fulfilled = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<Stock>).value);

  console.log("[getStockData] Fulfilled count:", fulfilled.length);
  return fulfilled;
}

export async function fetchStockFromAPI(symbol: string): Promise<Stock> {
  const normalizedSymbol = symbol.toUpperCase();

  console.log(`[fetchStockFromAPI] Symbol: ${normalizedSymbol}`);

  // Use centralized env getter with Amplify SSR support
  let apiKey: string;
  try {
    apiKey = getFinnhubApiKey();
    console.log(
      `[fetchStockFromAPI] FINNHUB_API_KEY present: YES (length: ${apiKey.length})`,
    );
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
    console.log(`[fetchStockFromAPI] Cache HIT for ${normalizedSymbol}`);
    return { ...cached.data, source: "cache" };
  }

  console.log(
    `[fetchStockFromAPI] Cache MISS for ${normalizedSymbol}, fetching from Finnhub...`,
  );

  // Security: Construct URL with allowlisted host only
  const url = `${FINNHUB_API_HOST}/api/v1/quote?symbol=${encodeURIComponent(
    normalizedSymbol,
  )}&token=${apiKey}`;

  // Log URL without exposing full API key
  console.log(
    `[fetchStockFromAPI] Request URL: ${FINNHUB_API_HOST}/api/v1/quote?symbol=${normalizedSymbol}&token=***${apiKey.slice(-4)}`,
  );

  // Security: Add timeout to prevent hanging requests
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    console.log(
      `[fetchStockFromAPI] Starting fetch for ${normalizedSymbol}...`,
    );
    const res = await fetch(url, { signal: controller.signal });

    console.log(
      `[fetchStockFromAPI] Response status: ${res.status} ${res.statusText}`,
    );
    console.log(
      `[fetchStockFromAPI] Response headers:`,
      Object.fromEntries(res.headers.entries()),
    );

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

    console.log(
      `[fetchStockFromAPI] Finnhub response data for ${normalizedSymbol}:`,
      JSON.stringify(data),
    );

    // Basic sanity check – Finnhub returns 0 if symbol is invalid or no data
    if (!data || typeof data.c !== "number") {
      console.error(
        `[fetchStockFromAPI] Invalid quote data for ${normalizedSymbol}: data.c is not a number`,
      );
      throw new Error(`No valid quote data for symbol ${normalizedSymbol}`);
    }

    // Additional check: Finnhub returns c=0 for invalid/unknown symbols
    if (data.c === 0 && data.h === 0 && data.l === 0 && data.o === 0) {
      console.warn(
        `[fetchStockFromAPI] All values are 0 for ${normalizedSymbol} - symbol may be invalid or market is closed`,
      );
    }

    const stock: Stock = {
      symbol: normalizedSymbol,
      price: data.c,
      change: data.d ?? 0,
      currency: "USD",
      source: "live",
    };

    console.log(
      `[fetchStockFromAPI] Successfully built stock object:`,
      JSON.stringify(stock),
    );

    // 3. Store in cache
    stockCache.set(normalizedSymbol, {
      data: stock,
      expiresAt: now + STOCK_CACHE_TTL_MS,
    });

    console.log(
      `[fetchStockFromAPI] Cached ${normalizedSymbol}, expires at ${new Date(now + STOCK_CACHE_TTL_MS).toISOString()}`,
    );

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
