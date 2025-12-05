import React from "react";

interface AddPositionFormProps {
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  formError: string | null;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onSubmit: () => void;
}

export function AddPositionForm({
  newSymbol,
  newShares,
  newBuyPrice,
  formError,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onSubmit,
}: AddPositionFormProps) {
  return (
    <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">
        Add Position
      </h3>
      <div className="mb-3 grid gap-3 md:grid-cols-3">
        <div>
          <label
            htmlFor="symbol"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Symbol
          </label>
          <input
            id="symbol"
            value={newSymbol}
            onChange={(e) => onSymbolChange(e.target.value)}
            placeholder="e.g. AMD"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label
            htmlFor="shares"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Shares
          </label>
          <input
            id="shares"
            type="number"
            min="0"
            value={newShares}
            onChange={(e) => onSharesChange(e.target.value)}
            placeholder="e.g. 10"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
          />
        </div>
        <div>
          <label
            htmlFor="buyPrice"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Buy price
          </label>
          <input
            id="buyPrice"
            type="number"
            min="0"
            value={newBuyPrice}
            onChange={(e) => onBuyPriceChange(e.target.value)}
            placeholder="e.g. 120"
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
          />
        </div>
      </div>
      {formError && <p className="mb-3 text-xs text-red-400">{formError}</p>}
      <button
        type="button"
        onClick={onSubmit}
        className="rounded-md bg-slate-100 px-4 py-2 text-xs font-medium text-slate-900 cursor-pointer hover:bg-slate-200 transition-colors"
      >
        Save Position
      </button>
    </div>
  );
}
