"use client";

import {useEffect, useState} from "react";
import {X} from "lucide-react";
import type {Stock, StockResponse} from "@/lib/stockData";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {SourceIndicator} from "@/components/SourceIndicator";

interface StockDashboardProps {
  symbols: string[];
  refreshToken?: number;
  onRemovePosition?: (symbol: string) => void;
}

export function StockDashboard({
  symbols,
  refreshToken,
  onRemovePosition,
}: StockDashboardProps) {
  const [stocks, setStocks] = useState<StockResponse>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<keyof Stock | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    // Don't fetch if there are no symbols
    if (symbols.length === 0) {
      setLoading(false);
      setError(null);
      setStocks([]);
      return;
    }

    async function loadStocks() {
      try {
        setLoading(true);
        setError(null);

        const query = symbols.join(",");
        const res = await fetch(
          `/api/stocks?symbols=${encodeURIComponent(query)}`,
        );

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error || "Failed to load stocks");
        }

        const data: { stocks: StockResponse } = await res.json();
        setStocks(data.stocks);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadStocks();
  }, [symbols, refreshToken]);

  const handleSort = (column: keyof Stock) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    // Handle different types
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // String comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIndicator = (column: keyof Stock) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "↑" : "↓";
    }
    return "↕";
  };

  if (loading) {
    return <div>Loading stocks...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (stocks.length === 0) {
    return (
      <div className="text-slate-400">
        No positions added yet. Click &quot;Add Position&quot; to get started.
      </div>
    );
  }

  return (
    <Card className="border border-slate-800 bg-slate-900/60 text-slate-100">
      <CardHeader className="border-b border-slate-800 px-4 py-3">
        <CardTitle className="text-sm font-semibold tracking-wide text-slate-300">
          Stock Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full text-sm">
            <TableHeader>
              <TableRow className="border-b border-slate-800 bg-slate-900 hover:bg-slate-900">
                <TableHead
                  className="px-4 py-2 text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort("symbol")}
                >
                  Symbol <span className={sortColumn === "symbol" ? "text-slate-200" : "text-slate-500"}>{getSortIndicator("symbol")}</span>
                </TableHead>
                <TableHead
                  className="px-4 py-2 text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort("price")}
                >
                  Price <span className={sortColumn === "price" ? "text-slate-200" : "text-slate-500"}>{getSortIndicator("price")}</span>
                </TableHead>
                <TableHead
                  className="px-4 py-2 text-xs font-medium text-slate-400 cursor-pointer hover:text-slate-200"
                  onClick={() => handleSort("change")}
                >
                  Change <span className={sortColumn === "change" ? "text-slate-200" : "text-slate-500"}>{getSortIndicator("change")}</span>
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400 w-8">
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400 w-8">
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStocks.map((stock: Stock) => (
                <TableRow
                  key={stock.symbol}
                  className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/60"
                >
                  <TableCell className="px-4 py-2 font-medium text-slate-200">
                    {stock.symbol}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-slate-200">
                    {stock.price.toFixed(2)} <span className="text-xs text-slate-400">{stock.currency}</span>
                  </TableCell>
                  <TableCell
                    className={`px-4 py-2 ${
                      stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stock.change.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-2 py-2 w-8">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemovePosition?.(stock.symbol)}
                      className="hover:bg-red-500/20 hover:text-red-400"
                      aria-label={`Remove ${stock.symbol}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center w-8">
                    <SourceIndicator source={stock.source} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
