import { NextRequest, NextResponse } from "next/server";
import { getStockData, StockResponse } from "@/lib/stockData";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json(
      { error: 'Missing "symbols" query parameter. Use ?symbols=AAPL,MSFT' },
      { status: 400 },
    );
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "No valid stock symbols provided." },
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
