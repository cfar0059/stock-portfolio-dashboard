"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Position } from "@/lib/types";
import {
  validateBuyPrice,
  validateDca,
  validateShares,
  validateSymbol,
} from "@/lib/validation";

/**
 * Normalize symbol for comparison: trim + uppercase
 */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

interface AddPositionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mode: 'create' for adding new position, 'edit' for updating existing */
  mode: "create" | "edit";
  /** Existing positions to check for duplicates */
  positions: Position[];
  /** Initial values when editing (must include id) */
  initialValues?: Position;
  /** Callback when submitting (add or update) */
  onSubmit: (position: Omit<Position, "id">, editingId?: string) => void;
}

/**
 * Position Dialog
 * Modal form for adding new stock positions or editing existing ones
 */
export function AddPositionDialog({
  open,
  onOpenChange,
  mode,
  positions,
  initialValues,
  onSubmit,
}: AddPositionDialogProps) {
  // Controlled form state
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [targetDca, setTargetDca] = useState("");

  // Error state
  const [symbolError, setSymbolError] = useState<string | null>(null);
  const [sharesError, setSharesError] = useState<string | null>(null);
  const [buyPriceError, setBuyPriceError] = useState<string | null>(null);
  const [dcaError, setDcaError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  // Derive existing symbols (normalized) from positions, excluding current position when editing
  const existingSymbols = positions
    .filter((p) => (mode === "edit" ? p.id !== initialValues?.id : true))
    .map((p) => normalizeSymbol(p.symbol));

  // Initialize form with values when opening in edit mode
  useEffect(() => {
    if (open && mode === "edit" && initialValues) {
      setSymbol(initialValues.symbol);
      setShares(String(initialValues.shares));
      setBuyPrice(String(initialValues.buyPrice));
      setTargetDca(initialValues.dca ? String(initialValues.dca) : "");
    } else if (open && mode === "create") {
      // Reset to empty for create mode
      setSymbol("");
      setShares("");
      setBuyPrice("");
      setTargetDca("");
    }
  }, [open, mode, initialValues]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSymbol("");
      setShares("");
      setBuyPrice("");
      setTargetDca("");
      setSymbolError(null);
      setSharesError(null);
      setBuyPriceError(null);
      setDcaError(null);
      setDuplicateError(null);
    }
  }, [open]);

  // Check for duplicate on symbol change (only in create mode)
  useEffect(() => {
    if (mode === "create") {
      const normalized = normalizeSymbol(symbol);
      if (normalized && existingSymbols.includes(normalized)) {
        setDuplicateError(
          "This symbol already exists in your portfolio. You can edit the existing position instead.",
        );
      } else {
        setDuplicateError(null);
      }
    } else {
      setDuplicateError(null);
    }
  }, [symbol, existingSymbols, mode]);

  const handleSymbolChange = (value: string) => {
    setSymbol(value.toUpperCase());
    // Clear validation error on change
    setSymbolError(null);
  };

  const handleSharesChange = (value: string) => {
    setShares(value);
    setSharesError(null);
  };

  const handleBuyPriceChange = (value: string) => {
    setBuyPrice(value);
    setBuyPriceError(null);
  };

  const handleDcaChange = (value: string) => {
    setTargetDca(value);
    setDcaError(null);
  };

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate symbol
    const symbolErr = validateSymbol(symbol);
    if (symbolErr) {
      setSymbolError(symbolErr);
      isValid = false;
    }

    // Validate shares (must be > 0)
    const sharesErr = validateShares(shares);
    if (sharesErr) {
      setSharesError(sharesErr);
      isValid = false;
    } else if (Number(shares) <= 0) {
      setSharesError("Shares must be greater than 0.");
      isValid = false;
    }

    // Validate buy price (must be > 0)
    const buyPriceErr = validateBuyPrice(buyPrice);
    if (buyPriceErr) {
      setBuyPriceError(buyPriceErr);
      isValid = false;
    } else if (Number(buyPrice) <= 0) {
      setBuyPriceError("Buy price must be greater than 0.");
      isValid = false;
    }

    // Validate DCA (optional, but if provided must be >= 0)
    const dcaErr = validateDca(targetDca);
    if (dcaErr) {
      setDcaError(dcaErr);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Final duplicate check on submit (only in create mode)
    if (mode === "create") {
      const normalized = normalizeSymbol(symbol);
      if (existingSymbols.includes(normalized)) {
        setDuplicateError(
          "This symbol already exists in your portfolio. You can edit the existing position instead.",
        );
        return;
      }
    }

    // Validate all fields
    if (!validateForm()) {
      return;
    }

    // Create position payload matching our Position type
    const positionData: Omit<Position, "id"> = {
      symbol: normalizeSymbol(symbol),
      shares: Number(shares),
      buyPrice: Number(buyPrice),
      dca: targetDca ? Number(targetDca) : undefined,
    };

    // Pass editing ID if in edit mode
    const editingId =
      mode === "edit" && initialValues ? initialValues.id : undefined;
    onSubmit(positionData, editingId);
    onOpenChange(false);
  };

  const hasErrors =
    !!duplicateError ||
    !!symbolError ||
    !!sharesError ||
    !!buyPriceError ||
    !!dcaError;
  const isFormEmpty = !symbol.trim() || !shares || !buyPrice;
  const isSubmitDisabled = hasErrors || isFormEmpty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {mode === "edit" ? "Edit Position" : "Add Position"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Symbol */}
          <div className="space-y-2">
            <label
              htmlFor="dialog-symbol"
              className="text-sm font-medium text-muted-foreground"
            >
              Symbol
            </label>
            <Input
              id="dialog-symbol"
              data-testid="input-symbol"
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              placeholder="e.g. AMD"
              disabled={mode === "edit"}
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 uppercase ${
                duplicateError || symbolError
                  ? "border-destructive/50 focus-visible:ring-destructive/30"
                  : ""
              } ${mode === "edit" ? "opacity-60 cursor-not-allowed" : ""}`}
            />
            {duplicateError && (
              <p className="text-sm text-destructive/90">{duplicateError}</p>
            )}
            {symbolError && !duplicateError && (
              <p className="text-sm text-destructive/90">{symbolError}</p>
            )}
          </div>

          {/* Shares and Buy Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="dialog-shares"
                className="text-sm font-medium text-muted-foreground"
              >
                Shares
              </label>
              <Input
                id="dialog-shares"
                data-testid="input-shares"
                type="number"
                step="any"
                value={shares}
                onChange={(e) => handleSharesChange(e.target.value)}
                placeholder="e.g. 10"
                className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 ${
                  sharesError
                    ? "border-destructive/50 focus-visible:ring-destructive/30"
                    : ""
                }`}
              />
              {sharesError && (
                <p className="text-sm text-destructive/90">{sharesError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="dialog-buyPrice"
                className="text-sm font-medium text-muted-foreground"
              >
                Buy Price
              </label>
              <Input
                id="dialog-buyPrice"
                data-testid="input-buy-price"
                type="number"
                step="any"
                value={buyPrice}
                onChange={(e) => handleBuyPriceChange(e.target.value)}
                placeholder="e.g. 120"
                className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 ${
                  buyPriceError
                    ? "border-destructive/50 focus-visible:ring-destructive/30"
                    : ""
                }`}
              />
              {buyPriceError && (
                <p className="text-sm text-destructive/90">{buyPriceError}</p>
              )}
            </div>
          </div>

          {/* Target DCA */}
          <div className="space-y-2">
            <label
              htmlFor="dialog-dca"
              className="text-sm font-medium text-muted-foreground"
            >
              Target DCA{" "}
              <span className="text-muted-foreground/50 font-normal">
                (optional)
              </span>
            </label>
            <Input
              id="dialog-dca"
              data-testid="input-dca"
              type="number"
              step="any"
              value={targetDca}
              onChange={(e) => handleDcaChange(e.target.value)}
              placeholder="e.g. 100"
              className={`bg-background border-border text-foreground placeholder:text-muted-foreground/50 ${
                dcaError
                  ? "border-destructive/50 focus-visible:ring-destructive/30"
                  : ""
              }`}
            />
            {dcaError && (
              <p className="text-sm text-destructive/90">{dcaError}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="save-position-button"
              disabled={isSubmitDisabled}
              className="min-w-[120px] cursor-pointer"
            >
              {mode === "edit" ? "Update Position" : "Add Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
