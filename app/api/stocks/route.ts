import { NextRequest, NextResponse } from "next/server";
import { getStockData, StockResponse } from "@/lib/stockData";

// Security: Symbol validation constants
const MAX_SYMBOL_LENGTH = 10;
const MAX_SYMBOLS_PER_REQUEST = 50;
const SYMBOL_REGEX = /^[A-Z0-9.]+$/; // Alphanumeric and dots only (e.g., BRK.A)

/**
 * Validate a single stock symbol
 * @param symbol - Uppercase trimmed symbol
 * @returns true if valid, false otherwise
 */
function isValidSymbol(symbol: string): boolean {
  return (
    symbol.length > 0 &&
    symbol.length <= MAX_SYMBOL_LENGTH &&
    SYMBOL_REGEX.test(symbol)
  );
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  console.log("[API /api/stocks] Request received");
  console.log("[API /api/stocks] Full URL:", req.url);

  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");

  console.log("[API /api/stocks] symbolsParam:", symbolsParam);

  if (!symbolsParam) {
    console.log("[API /api/stocks] ERROR: Missing symbols param");
    return NextResponse.json(
      { error: 'Missing "symbols" query parameter. Use ?symbols=AAPL,MSFT' },
      { status: 400 },
    );
  }

  // Security: Normalize and validate symbols
  const rawSymbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  console.log("[API /api/stocks] rawSymbols:", rawSymbols);

  // Security: Limit number of symbols per request
  if (rawSymbols.length > MAX_SYMBOLS_PER_REQUEST) {
    console.log("[API /api/stocks] ERROR: Too many symbols");
    return NextResponse.json(
      {
        error: `Too many symbols. Maximum ${MAX_SYMBOLS_PER_REQUEST} allowed.`,
      },
      { status: 400 },
    );
  }

  // Security: Validate each symbol format
  const symbols = rawSymbols.filter(isValidSymbol);

  console.log("[API /api/stocks] Validated symbols:", symbols);

  if (symbols.length === 0) {
    console.log("[API /api/stocks] ERROR: No valid symbols after validation");
    return NextResponse.json(
      {
        error:
          "No valid stock symbols provided. Use alphanumeric symbols only.",
      },
      { status: 400 },
    );
  }

  try {
    console.log("[API /api/stocks] Calling getStockData with:", symbols);
    const data: StockResponse = await getStockData(symbols);
    console.log(
      "[API /api/stocks] getStockData returned:",
      JSON.stringify(data),
    );
    console.log("[API /api/stocks] Number of stocks returned:", data.length);

    return NextResponse.json({ stocks: data }, { status: 200 });
  } catch (error) {
    console.error("[API /api/stocks] ERROR in getStockData:", error);
    console.error(
      "[API /api/stocks] Error message:",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Failed to fetch stock data." },
      { status: 500 },
    );
  }
}
