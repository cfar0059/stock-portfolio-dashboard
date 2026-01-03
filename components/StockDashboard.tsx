"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import type { Stock, StockResponse } from "@/lib/stockData";
import type { Position } from "@/lib/positions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import LoadingIndicator from "@/components/ui/loading-indicator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SourceIndicator } from "@/components/SourceIndicator";
import { calculateProfit } from "@/lib/calculateProfit";
import { formatCurrency } from "@/lib/formatting";
import {
  getRowStyles,
  mergePositionsWithStocks,
  sortStocks,
} from "@/lib/stockLogic";

// Constants
// (mergePositionsWithStocks, sortStocks, isAtOrBelowDca imported from lib/stockLogic)

/**
 * Check if current price is within 2% ABOVE the DCA target
 * Shows alert when: price >= dca AND (price - dca) / dca <= 0.02
 */
function isDcaProximityAlert(price: number, dca: number | undefined): boolean {
  if (!dca || dca <= 0) return false;
  if (price < dca) return false; // Price is below DCA, not in proximity range

  const percentageAbove = (price - dca) / dca;
  return percentageAbove <= 0.02; // Within 2% above
}

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
    return <span className="text-muted-foreground text-xs sm:text-sm">-</span>;
  }

  const { amount, percentage } = calculateProfit(
    stock.price,
    stock.buyPrice || 0,
    stock.shares || 0,
  );

  // Use token-based colors via CSS classes
  const colorClass = amount >= 0 ? "text-primary" : "text-destructive";

  return (
    <div
      className={`flex flex-col text-right text-xs sm:text-sm leading-relaxed ${colorClass}`}
    >
      <span className="font-medium">${formatCurrency(amount)}</span>
      <span className="text-xs text-muted-foreground">
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

  // Apply sticky positioning to Symbol column on mobile
  const isSymbolColumn = column === "symbol";
  const stickyClasses = isSymbolColumn
    ? "lg:static sticky left-0 z-30 bg-card lg:shadow-none shadow-[2px_0_4px_rgba(0,0,0,0.1)]"
    : "";

  return (
    <TableHead
      className={`h-12 px-4 text-left align-middle cursor-pointer hover:bg-accent/50 transition-colors ${
        isNumeric ? "text-right" : ""
      } ${hasSeparator ? "border-r border-border/50" : ""} ${stickyClasses}`}
      onClick={() => onSort(column)}
    >
      {label}{" "}
      <span className={isActive ? "text-primary" : "opacity-50"}>
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
    return (
      <TooltipProvider>
        <Card suppressHydrationWarning className="border-0 shadow-none">
          <CardContent className="p-0">
            <Table
              suppressHydrationWarning
              className="w-full caption-bottom text-sm"
              style={{ color: "#fafafa" }}
            >
              <TableBody className="[&_tr:last-child]:border-0">
                <TableRow className="border-b transition-colors hover:bg-accent/30">
                  <TableCell
                    colSpan={8}
                    className="p-12 text-center align-middle"
                  >
                    <LoadingIndicator label="Loading stocks..." size="md" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TooltipProvider>
    );
  }

  if (error) {
    return (
      <div suppressHydrationWarning className="text-destructive">
        Error: {error}
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div suppressHydrationWarning className="py-16 px-6 text-center">
        <div className="inline-block text-left max-w-xs">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No positions yet
          </h3>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Your portfolio is empty. Begin by adding your first stock position
            to start tracking your investments.
          </p>
          <Button onClick={onToggleAdd} variant="outline" className="w-full">
            Add Position
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card suppressHydrationWarning className="border-0 shadow-none">
        <CardContent className="p-0">
          <Table
            suppressHydrationWarning
            className="w-full min-w-[760px] caption-bottom text-sm relative border-separate border-spacing-0"
            style={{ color: "#fafafa" }}
          >
            <TableHeader className="[&_tr]:border-b">
              <TableRow
                suppressHydrationWarning
                className="border-border hover:bg-transparent"
                style={{ color: "#fafafa" }}
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
                <TableHead className="h-12 px-4 text-left align-middle text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr:last-child]:border-0">
              {sortedStocks.map((stock: Stock) => {
                // Get styling decisions from centralized helper
                const { highlightRow } = getRowStyles(stock);

                // Use unique position ID for key, fallback to symbol if no position
                const rowKey = stock.id || stock.symbol;

                return (
                  <TableRow
                    suppressHydrationWarning
                    key={rowKey}
                    className={`border-b transition-colors data-[state=selected]:bg-muted ${
                      highlightRow
                        ? "bg-accent/50 hover:bg-accent/60"
                        : "border-border hover:bg-accent/30"
                    }`}
                    data-testid={`position-row-${stock.symbol}`}
                    data-dca-highlighted={highlightRow.toString()}
                  >
                    <TableCell
                      className={`p-4 align-middle font-medium text-xs sm:text-sm whitespace-nowrap border-r border-border/50 lg:static sticky left-0 z-20 lg:shadow-none shadow-[2px_0_4px_rgba(0,0,0,0.1)] ${
                        highlightRow ? "bg-accent" : "bg-card"
                      }`}
                    >
                      <SourceIndicator source={stock.source} />
                      {stock.symbol}
                    </TableCell>
                    <TableCell
                      className={`p-4 align-middle text-xs sm:text-sm text-right whitespace-nowrap ${highlightRow ? "text-primary" : ""}`}
                    >
                      {stock.price.toFixed(2)}{" "}
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {stock.currency}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold ${
                          stock.change >= 0
                            ? "text-primary"
                            : "text-destructive"
                        }`}
                        style={{
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        }}
                      >
                        {stock.change >= 0 ? "+" : ""}
                        {stock.change.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="p-4 align-middle text-xs sm:text-sm text-right">
                      {stock.shares}
                    </TableCell>
                    <TableCell className="p-4 align-middle text-xs sm:text-sm text-right">
                      {stock.buyPrice ? `${stock.buyPrice.toFixed(2)}` : "-"}{" "}
                      {stock.buyPrice && (
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {stock.currency}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="p-4 align-middle text-right">
                      <ProfitCell stock={stock} />
                    </TableCell>
                    <TableCell className="p-4 align-middle text-xs sm:text-sm text-right">
                      {stock.dca ? (
                        <span className="inline-flex items-center gap-2 justify-end">
                          {isDcaProximityAlert(stock.price, stock.dca) && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  variant="default"
                                  tabIndex={0}
                                  className="cursor-pointer"
                                >
                                  Alert
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Price is within 2% of your DCA level.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          <span>
                            {stock.dca.toFixed(2)}{" "}
                            <span className="text-[10px] sm:text-xs text-muted-foreground">
                              {stock.currency}
                            </span>
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const position = (positions || []).find(
                              (p) => p.symbol === stock.symbol,
                            );
                            if (position) {
                              onEditPosition?.(position);
                            }
                          }}
                          className="hover:bg-primary/20 hover:text-primary cursor-pointer"
                          aria-label={`Edit ${stock.symbol}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemovePosition?.(stock.symbol)}
                          className="hover:bg-destructive/20 hover:text-destructive cursor-pointer"
                          aria-label={`Remove ${stock.symbol}`}
                        >
                          <X className="w-4 h-4" />
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
    </TooltipProvider>
  );
}
