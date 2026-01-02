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
        <h2 className="text-xl font-semibold text-foreground">Positions</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh positions"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={onToggleAdd}
            aria-label={isAddOpen ? "Close form" : "Add position"}
            data-testid="add-position-toggle"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            {isAddOpen ? "Close" : "Add"}
          </Button>
        </div>
      </div>

      {/* Add Position Form with smooth drag-out animation using CSS Grid rows */}
      <div
        className={`grid will-change-[grid-template-rows,opacity,transform] ${
          isAddOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        style={{
          transition:
            "grid-template-rows 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          className={`overflow-hidden min-h-0 ${
            isAddOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
          style={{
            transition:
              "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          aria-hidden={!isAddOpen}
        >
          <div className="mb-4">
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
          </div>
        </div>
      </div>

      {/* Table container with modern border */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <StockDashboard
          symbols={symbols}
          positions={positions}
          refreshToken={refreshToken}
          onEditPosition={onEditPosition}
          onRemovePosition={onRemovePosition}
          onToggleAdd={onToggleAdd}
        />
      </div>
    </section>
  );
}
