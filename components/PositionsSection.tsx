import React from "react";
import {StockDashboard} from "@/components/StockDashboard";
import {AddPositionForm} from "@/components/AddPositionForm";
import type {Position} from "@/lib/positions";

interface PositionsSectionProps {
  isAddOpen: boolean;
  symbols: string[];
  positions: Position[];
  refreshToken: number;
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  formError: string | null;
  editingPosition: Position | null;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onAddPosition: () => void;
  onEditPosition: (position: Position) => void;
  onCancelEdit: () => void;
  onRemovePosition: (symbol: string) => void;
}

export function PositionsSection({
  isAddOpen,
  symbols,
  positions,
  refreshToken,
  newSymbol,
  newShares,
  newBuyPrice,
  formError,
  editingPosition,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onAddPosition,
  onEditPosition,
  onCancelEdit,
  onRemovePosition,
}: Readonly<PositionsSectionProps>) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="mb-2 text-lg font-semibold">Positions</h2>

      {isAddOpen && (
        <AddPositionForm
          newSymbol={newSymbol}
          newShares={newShares}
          newBuyPrice={newBuyPrice}
          formError={formError}
          isEditing={editingPosition !== null}
          onSymbolChange={onSymbolChange}
          onSharesChange={onSharesChange}
          onBuyPriceChange={onBuyPriceChange}
          onSubmit={onAddPosition}
          onCancel={onCancelEdit}
        />
      )}
      <StockDashboard
        symbols={symbols}
        positions={positions}
        refreshToken={refreshToken}
        onEditPosition={onEditPosition}
        onRemovePosition={onRemovePosition}
      />
    </section>
  );
}
