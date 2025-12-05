"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Stock, StockResponse } from "@/lib/stockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Symbol
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Price
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Change
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Currency
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Source
                </TableHead>
                <TableHead className="px-4 py-2 text-xs font-medium text-slate-400">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock: Stock) => (
                <TableRow
                  key={stock.symbol}
                  className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/60"
                >
                  <TableCell className="px-4 py-2 font-medium text-slate-200">
                    {stock.symbol}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-slate-200">
                    {stock.price.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={`px-4 py-2 ${
                      stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {stock.change.toFixed(2)}
                  </TableCell>
                  <TableCell className="px-4 py-2 text-slate-300">
                    {stock.currency}
                  </TableCell>
                  <TableCell
                    className={`px-4 py-2 ${
                      stock.source === "cache"
                        ? "text-yellow-400"
                        : "text-blue-400"
                    }`}
                  >
                    {stock.source}
                  </TableCell>
                  <TableCell className="px-4 py-2">
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
