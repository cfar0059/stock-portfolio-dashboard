"use client";

import {useEffect, useState} from "react";
import {Pencil, X} from "lucide-react";
import type {Stock, StockResponse} from "@/lib/stockData";
import type {Position} from "@/lib/positions";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {SourceIndicator} from "@/components/SourceIndicator";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {calculateProfit} from "@/lib/calculateProfit";

// Constants
const TABLE_HEAD_CLASS = "px-1 py-1 text-sm font-medium text-slate-400";
const SORTABLE_HEAD_CLASS = `${TABLE_HEAD_CLASS} cursor-pointer hover:text-slate-200`;
const formatCurrency = (value: number): string =>
    value.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});

const getProfitColor = (profit: number): string =>
    profit >= 0 ? "text-emerald-400" : "text-red-400";

const mergePositionsWithStocks = (stocks: Stock[], positions: Position[]): Stock[] =>
    stocks.map((stock) => {
        const position = positions.find((p) => p.symbol === stock.symbol);
        return {
            ...stock,
            shares: position?.shares || 0,
            buyPrice: position?.buyPrice || 0,
        };
    });

const sortStocks = (stocks: Stock[], column: keyof Stock | null, direction: "asc" | "desc"): Stock[] => {
    if (!column) return stocks;

    return [...stocks].sort((a, b) => {
        const aValue = a[column];
        const bValue = b[column];

        if (typeof aValue === "number" && typeof bValue === "number") {
            return direction === "asc" ? aValue - bValue : bValue - aValue;
        }

        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        const comparison = aStr.localeCompare(bStr);
        return direction === "asc" ? comparison : -comparison;
    });
};

interface StockDashboardProps {
    symbols: string[];
    positions?: Position[];
    refreshToken?: number;
    onEditPosition?: (position: Position) => void;
    onRemovePosition?: (symbol: string) => void;
}

// Profit Cell Component
interface ProfitCellProps {
    stock: Stock;
}

function ProfitCell({stock}: Readonly<ProfitCellProps>) {
    if (!stock.buyPrice || stock.shares <= 0) {
        return <span className="text-slate-400">-</span>;
    }

    const {amount, percentage} = calculateProfit(
        stock.price,
        stock.buyPrice || 0,
        stock.shares || 0
    );
    const textColor = getProfitColor(amount);

    return (
        <div className={`${textColor} flex flex-col text-sm leading-tight`}>
            <span>${formatCurrency(amount)}</span>
            <span className="text-xs">({percentage.toFixed(2)}%)</span>
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
}

function SortableHeader({
                            label,
                            column,
                            sortColumn,
                            onSort,
                            getSortIndicator,
                        }: Readonly<SortableHeaderProps>) {
    const isActive = sortColumn === column;
    return (
        <TableHead
            className={SORTABLE_HEAD_CLASS}
            onClick={() => onSort(column)}
        >
            {label} <span className={isActive ? "text-slate-200" : "text-slate-500"}>{getSortIndicator(column)}</span>
        </TableHead>
    );
}

export function StockDashboard({
                                   symbols,
                                   positions = [],
                                   refreshToken,
                                   onEditPosition,
                                   onRemovePosition,
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
                const mergedStocks = mergePositionsWithStocks(data.stocks, positions || []);
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
        <ScrollArea>
            <Card className="border border-slate-800 bg-slate-900/60 text-slate-100">
                <CardContent className="px-0 py-0">
                    <Table className="w-full text-sm table-auto">
                        <TableHeader>
                            <TableRow className="border-b border-slate-800 bg-slate-900 hover:bg-slate-900">
                                <SortableHeader
                                    label="Symbol"
                                    column="symbol"
                                    sortColumn={sortColumn}
                                    onSort={handleSort}
                                    getSortIndicator={getSortIndicator}
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
                                <TableHead className={TABLE_HEAD_CLASS}>
                                    Profit
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedStocks.map((stock: Stock) => (
                                <TableRow
                                    key={stock.symbol}
                                    className="border-b border-slate-800 last:border-b-0 hover:bg-slate-900/60"
                                >
                                    <TableCell
                                        className="px-1 py-1 font-medium text-slate-200 flex items-center gap-1 text-sm">
                                        <SourceIndicator source={stock.source}/>
                                        {stock.symbol}
                                    </TableCell>
                                    <TableCell className="px-1 py-1 text-sm text-slate-200 whitespace-nowrap">
                                        {stock.price.toFixed(2)} <span
                                        className="text-xs text-slate-400">{stock.currency}</span>
                                    </TableCell>
                                    <TableCell
                                        className={`px-1 py-1 text-sm ${
                                            stock.change >= 0 ? "text-emerald-400" : "text-red-400"
                                        }`}
                                    >
                                        {stock.change.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="px-1 py-1 text-sm text-slate-200">
                                        {stock.shares}
                                    </TableCell>
                                    <TableCell className="px-1 py-1 text-sm text-slate-200">
                                        {stock.buyPrice ? `${stock.buyPrice.toFixed(2)} ` : "-"}
                                        {stock.buyPrice &&
                                            <span className="text-xs text-slate-400">{stock.currency}</span>}
                                    </TableCell>
                                    <TableCell className="px-1 py-1 text-sm">
                                        <ProfitCell stock={stock}/>
                                    </TableCell>
                                    <TableCell className="px-1 py-1 flex justify-end gap-0.5">                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => {
                                                const position = (positions || []).find((p) => p.symbol === stock.symbol);
                                                if (position) {
                                                    onEditPosition?.(position);
                                                }
                                            }}
                                            className="hover:bg-blue-500/20 hover:text-blue-400"
                                            aria-label={`Edit ${stock.symbol}`}
                                        >
                                            <Pencil className="h-3 w-3"/>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => onRemovePosition?.(stock.symbol)}
                                            className="hover:bg-red-500/20 hover:text-red-400"
                                            aria-label={`Remove ${stock.symbol}`}
                                        >
                                            <X className="h-3 w-3"/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    );
}
