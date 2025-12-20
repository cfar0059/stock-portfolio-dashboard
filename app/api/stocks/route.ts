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
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
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

  // Security: Limit number of symbols per request
  if (rawSymbols.length > MAX_SYMBOLS_PER_REQUEST) {
    return NextResponse.json(
      {
        error: `Too many symbols. Maximum ${MAX_SYMBOLS_PER_REQUEST} allowed.`,
      },
      { status: 400 },
    );
  }

  // Security: Validate each symbol format
  const symbols = rawSymbols.filter(isValidSymbol);

  if (symbols.length === 0) {
    return NextResponse.json(
      {
        error:
          "No valid stock symbols provided. Use alphanumeric symbols only.",
      },
      { status: 400 },
    );
  }

  try {
    const data: StockResponse = await getStockData(symbols);

    return NextResponse.json({ stocks: data }, { status: 200 });
  } catch (error) {
    console.error("Error in GET /api/stocks", error);
    return NextResponse.json(
      { error: "Failed to fetch stock data." },
      { status: 500 },
    );
  }
}
