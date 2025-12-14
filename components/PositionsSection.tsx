import React from "react";
import { StockDashboard } from "@/components/StockDashboard";
import { AddPositionForm } from "@/components/AddPositionForm";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import type { Position } from "@/lib/positions";

interface PositionsSectionProps {
  isAddOpen: boolean;
  symbols: string[];
  positions: Position[];
  refreshToken: number;
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  newDca: string;
  formError: string | null;
  editingPosition: Position | null;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onDcaChange: (value: string) => void;
  onAddPosition: () => void;
  onEditPosition: (position: Position) => void;
  onCancelEdit: () => void;
  onRemovePosition: (symbol: string) => void;
  onRefresh?: () => void;
  onToggleAdd?: () => void;
}

export function PositionsSection({
  isAddOpen,
  symbols,
  positions,
  refreshToken,
  newSymbol,
  newShares,
  newBuyPrice,
  newDca,
  formError,
  editingPosition,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onDcaChange,
  onAddPosition,
  onEditPosition,
  onCancelEdit,
  onRemovePosition,
  onRefresh,
  onToggleAdd,
}: Readonly<PositionsSectionProps>) {
  return (
    <section className="space-y-4">
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Positions</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-100 hover:cursor-pointer"
            aria-label="Refresh positions"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleAdd}
            className="border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-100 hover:cursor-pointer"
            aria-label={isAddOpen ? "Close form" : "Add position"}
          >
            <Plus className="h-4 w-4 mr-1" />
            {isAddOpen ? "Close" : "Add"}
          </Button>
        </div>
      </div>

      {isAddOpen && (
        <AddPositionForm
          newSymbol={newSymbol}
          newShares={newShares}
          newBuyPrice={newBuyPrice}
          newDca={newDca}
          formError={formError}
          isEditing={editingPosition !== null}
          onSymbolChange={onSymbolChange}
          onSharesChange={onSharesChange}
          onBuyPriceChange={onBuyPriceChange}
          onDcaChange={onDcaChange}
          onSubmit={onAddPosition}
          onCancel={onCancelEdit}
        />
      )}

      {/* Table container with modern border and subtle glow */}
      <div
        className="relative rounded-lg border border-slate-700 bg-slate-900/30 overflow-hidden shadow-lg"
        style={{
          boxShadow: `
               0 0 20px rgba(148, 163, 184, 0.05),
               inset 0 1px 0 rgba(148, 163, 184, 0.1),
               0 0 0 1px rgba(148, 163, 184, 0.05)
             `,
        }}
      >
        {/* Subtle glow overlay for top-left corner */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle glow overlay for bottom-right corner */}
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-slate-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Table content */}
        <div className="relative z-10">
          <StockDashboard
            symbols={symbols}
            positions={positions}
            refreshToken={refreshToken}
            onEditPosition={onEditPosition}
            onRemovePosition={onRemovePosition}
          />
        </div>
      </div>
    </section>
  );
}
