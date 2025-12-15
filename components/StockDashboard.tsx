"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import type { Stock, StockResponse } from "@/lib/stockData";
import type { Position } from "@/lib/positions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SourceIndicator } from "@/components/SourceIndicator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { calculateProfit } from "@/lib/calculateProfit";
import { formatCurrency } from "@/lib/formatting";
import {
  getProfitColor,
  SORTABLE_HEAD_CLASS,
  TABLE_HEAD_CLASS,
} from "@/lib/styles";
import {
  isAtOrBelowDca,
  mergePositionsWithStocks,
  sortStocks,
} from "@/lib/stockLogic";

// Constants
// (mergePositionsWithStocks, sortStocks, isAtOrBelowDca imported from lib/stockLogic)

interface StockDashboardProps {
  symbols: string[];
  positions?: Position[];
  refreshToken?: number;
  onEditPosition?: (position: Position) => void;
  onRemovePosition?: (symbol: string) => void;
  onToggleAdd?: () => void;
}

// Profit Cell Component
interface ProfitCellProps {
  stock: Stock;
}

function ProfitCell({ stock }: Readonly<ProfitCellProps>) {
  if (!stock.buyPrice || !stock.shares || stock.shares <= 0) {
    return <span className="text-slate-400 text-xs sm:text-sm">-</span>;
  }

  const { amount, percentage } = calculateProfit(
    stock.price,
    stock.buyPrice || 0,
    stock.shares || 0,
  );
  const textColor = getProfitColor(amount);

  return (
    <div
      className={`${textColor} flex flex-col text-right text-xs sm:text-sm leading-relaxed`}
    >
      <span className="font-medium">${formatCurrency(amount)}</span>
      <span className="text-[10px] sm:text-xs opacity-90">
        ({percentage.toFixed(2)}%)
      </span>
    </div>
  );
}

// Table Header Cell Component
interface SortableHeaderProps {
  label: string;
  column: keyof Stock;
  sortColumn: keyof Stock | null;
  onSort: (column: keyof Stock) => void;
  getSortIndicator: (column: keyof Stock) => string;
  hasSeparator?: boolean;
}

function SortableHeader({
  label,
  column,
  sortColumn,
  onSort,
  getSortIndicator,
  hasSeparator = false,
}: Readonly<SortableHeaderProps>) {
  const isActive = sortColumn === column;
  const isNumeric = [
    "price",
    "change",
    "shares",
    "buyPrice",
    "profit",
    "dca",
  ].includes(column);

  return (
    <TableHead
      className={`${SORTABLE_HEAD_CLASS} ${isNumeric ? "text-right" : ""} ${
        hasSeparator ? "border-r border-slate-700/50" : ""
      }`}
      onClick={() => onSort(column)}
    >
      {label}{" "}
      <span className={isActive ? "text-slate-200" : "text-slate-500"}>
        {getSortIndicator(column)}
      </span>
    </TableHead>
  );
}

export function StockDashboard({
  symbols,
  positions = [],
  refreshToken,
  onEditPosition,
  onRemovePosition,
  onToggleAdd,
}: Readonly<StockDashboardProps>) {
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
        const mergedStocks = mergePositionsWithStocks(
          data.stocks,
          positions || [],
        );
        setStocks(mergedStocks);
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
  }, [symbols, refreshToken, positions]);

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

  const sortedStocks = sortStocks(stocks, sortColumn, sortDirection);

  const getSortIndicator = (column: keyof Stock) => {
    if (sortColumn === column) {
      return sortDirection === "asc" ? "↑" : "↓";
    }
    return "";
  };

  if (loading) {
    return <div suppressHydrationWarning>Loading stocks...</div>;
  }

  if (error) {
    return (
      <div suppressHydrationWarning className="text-red-500">
        Error: {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div suppressHydrationWarning className="py-16 px-6 text-center">
        <div className="inline-block text-left max-w-xs">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            No positions yet
          </h3>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            Your portfolio is empty. Begin by adding your first stock position
            to start tracking your investments.
          </p>
          <Button
            onClick={onToggleAdd}
            variant="outline"
            className="w-full border-slate-600 bg-slate-800/50 text-slate-200 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-100"
          >
            Add Position
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea suppressHydrationWarning>
      <Card
        suppressHydrationWarning
        className="bg-transparent border-0 text-slate-100"
      >
        <CardContent className="px-0 py-0">
          <Table
            suppressHydrationWarning
            className="w-full border-separate border-spacing-y-1"
          >
            <TableHeader>
              <TableRow
                suppressHydrationWarning
                className="border-b border-slate-800 bg-slate-900 hover:bg-slate-900"
              >
                <SortableHeader
                  label="Symbol"
                  column="symbol"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                  hasSeparator={true}
                />
                <SortableHeader
                  label="Price"
                  column="price"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <SortableHeader
                  label="Change"
                  column="change"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <SortableHeader
                  label="Shares"
                  column="shares"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <SortableHeader
                  label="Buy Price"
                  column="buyPrice"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <SortableHeader
                  label="Profit"
                  column="profit"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <SortableHeader
                  label="DCA"
                  column="dca"
                  sortColumn={sortColumn}
                  onSort={handleSort}
                  getSortIndicator={getSortIndicator}
                />
                <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedStocks.map((stock: Stock) => {
                const highlightRow = isAtOrBelowDca(stock.price, stock.dca);
                // Use unique position ID for key, fallback to symbol if no position
                const rowKey = stock.id || stock.symbol;

                return (
                  <TableRow
                    suppressHydrationWarning
                    key={rowKey}
                    className={`border-b last:border-b-0 hover:bg-slate-900/60 transition-colors ${
                      highlightRow
                        ? "border-sky-500/40 bg-slate-800/60"
                        : "border-slate-800"
                    }`}
                  >
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 font-medium text-slate-200 text-xs sm:text-sm whitespace-nowrap min-w-[90px] border-r border-slate-700/50">
                      <SourceIndicator source={stock.source} />
                      {stock.symbol}
                    </TableCell>
                    <TableCell
                      className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-right whitespace-nowrap min-w-[90px] ${
                        highlightRow ? "text-sky-400" : "text-slate-200"
                      }`}
                    >
                      {stock.price.toFixed(2)}{" "}
                      <span className="text-[10px] sm:text-xs text-slate-400">
                        {stock.currency}
                      </span>
                    </TableCell>
                    <TableCell
                      className={`px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-right min-w-[80px] ${
                        stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {stock.change.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 text-right min-w-[70px]">
                      {stock.shares}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 text-right min-w-[100px]">
                      {stock.buyPrice ? `${stock.buyPrice.toFixed(2)}` : "-"}{" "}
                      {stock.buyPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400">
                          {stock.currency}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 text-right min-w-[110px]">
                      <ProfitCell stock={stock} />
                    </TableCell>
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-slate-200 text-right min-w-[90px]">
                      {stock.dca ? `${stock.dca.toFixed(2)}` : "—"}{" "}
                      {stock.dca && (
                        <span className="text-[10px] sm:text-xs text-slate-400">
                          {stock.currency}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-2 py-1.5 sm:px-4 sm:py-2 text-right min-w-[80px]">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            const position = (positions || []).find(
                              (p) => p.symbol === stock.symbol,
                            );
                            if (position) {
                              onEditPosition?.(position);
                            }
                          }}
                          className="hover:bg-blue-500/20 hover:text-blue-400"
                          aria-label={`Edit ${stock.symbol}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onRemovePosition?.(stock.symbol)}
                          className="hover:bg-red-500/20 hover:text-red-400"
                          aria-label={`Remove ${stock.symbol}`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
