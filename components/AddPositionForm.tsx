import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { INPUT_CLASS, INPUT_DISABLED_CLASS, LABEL_CLASS } from "@/lib/styles";

interface AddPositionFormProps {
  newSymbol: string;
  newShares: string;
  newBuyPrice: string;
  newDca: string;
  formError: string | null;
  isEditing?: boolean;
  onSymbolChange: (value: string) => void;
  onSharesChange: (value: string) => void;
  onBuyPriceChange: (value: string) => void;
  onDcaChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
}

export function AddPositionForm({
  newSymbol,
  newShares,
  newBuyPrice,
  newDca,
  formError,
  isEditing = false,
  onSymbolChange,
  onSharesChange,
  onBuyPriceChange,
  onDcaChange,
  onSubmit,
  onCancel,
}: Readonly<AddPositionFormProps>) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <form onSubmit={handleFormSubmit}>
        <div className="mb-3 grid gap-3 md:grid-cols-4">
          <div>
            <label htmlFor="symbol" className={LABEL_CLASS}>
              Symbol
            </label>
            <input
              id="symbol"
              value={newSymbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              placeholder="e.g. AMD"
              disabled={isEditing}
              className={`${INPUT_CLASS} ${INPUT_DISABLED_CLASS}`}
            />
          </div>
          <div>
            <label htmlFor="shares" className={LABEL_CLASS}>
              Shares
            </label>
            <input
              id="shares"
              type="number"
              min="0"
              step="0.01"
              value={newShares}
              onChange={(e) => onSharesChange(e.target.value)}
              placeholder="e.g. 10"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="buyPrice" className={LABEL_CLASS}>
              Buy Price
            </label>
            <input
              id="buyPrice"
              type="number"
              min="0"
              step="0.01"
              value={newBuyPrice}
              onChange={(e) => onBuyPriceChange(e.target.value)}
              placeholder="e.g. 120"
              className={INPUT_CLASS}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="dca" className={LABEL_CLASS}>
              Target DCA
            </label>
            <div className="flex gap-2 items-end">
              <input
                id="dca"
                type="number"
                min="0"
                step="0.01"
                value={newDca}
                onChange={(e) => onDcaChange(e.target.value)}
                placeholder="e.g. 100"
                className={INPUT_CLASS}
              />
              <Button
                type="submit"
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
      </form>
    </div>
  );
}
