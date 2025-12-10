import React from "react";
import {Button} from "@/components/ui/button";
import {Check, X} from "lucide-react";

interface AddPositionFormProps {
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  formError: string | null;
  isEditing?: boolean;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function AddPositionForm({
  newSymbol,
  newShares,
  newBuyPrice,
  formError,
  isEditing = false,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onSubmit,
  onCancel,
}: Readonly<AddPositionFormProps>) {
  return (
    <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
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
            disabled={isEditing}
            className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400 disabled:opacity-60"
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
        <div className="flex flex-col">
          <label
            htmlFor="buyPrice"
            className="mb-1 block text-xs font-medium text-slate-400"
          >
            Buy price
          </label>
          <div className="flex gap-2 items-end">
            <input
              id="buyPrice"
              type="number"
              min="0"
              value={newBuyPrice}
              onChange={(e) => onBuyPriceChange(e.target.value)}
              placeholder="e.g. 120"
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400"
            />
            <Button
              type="button"
              onClick={onSubmit}
              variant="ghost"
              size="icon"
              className="hover:bg-emerald-500/20"
              aria-label="Save Position"
            >
              <Check className="h-4 w-4 text-emerald-500" />
            </Button>
            {isEditing && onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="ghost"
                size="icon"
                className="hover:bg-red-500/20"
                aria-label="Cancel"
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {formError && <p className="mb-0 text-xs text-red-400">{formError}</p>}
    </div>
  );
}
