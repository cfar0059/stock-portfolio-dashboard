import React from "react";
import { StockDashboard } from "@/components/StockDashboard";
import { AddPositionForm } from "@/components/AddPositionForm";

interface PositionsSectionProps {
  isAddOpen: boolean;
  symbols: string[];
  refreshToken: number;
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  formError: string | null;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onAddPosition: () => void;
  onRemovePosition: (symbol: string) => void;
}

export function PositionsSection({
  isAddOpen,
  symbols,
  refreshToken,
  newSymbol,
  newShares,
  newBuyPrice,
  formError,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onAddPosition,
  onRemovePosition,
}: PositionsSectionProps) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      <h2 className="mb-2 text-lg font-semibold">Positions</h2>

      {isAddOpen && (
        <AddPositionForm
          newSymbol={newSymbol}
          newShares={newShares}
          newBuyPrice={newBuyPrice}
          formError={formError}
          onSymbolChange={onSymbolChange}
          onSharesChange={onSharesChange}
          onBuyPriceChange={onBuyPriceChange}
          onSubmit={onAddPosition}
        />
      )}
      <StockDashboard
        symbols={symbols}
        refreshToken={refreshToken}
        onRemovePosition={onRemovePosition}
      />
    </section>
  );
}
