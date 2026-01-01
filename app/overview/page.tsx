// filepath: /Users/carlfarrugiagalea/Documents/Dev/stock-portfolio-dashboard/app/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PositionsSection } from "@/components/PositionsSection";
import { Position } from "@/lib/positions";
import { validatePosition } from "@/lib/validation";
import { localStoragePortfolioRepository } from "@/lib/portfolio/localStorageRepository";

export default function OverviewPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");
  const [newDca, setNewDca] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Load positions from localStorage on first mount
  useEffect(() => {
    const stored = localStoragePortfolioRepository.getPositions();
    setPositions(stored);
    setHasHydrated(true);
  }, []);

  // Persist positions to localStorage when they change (but only after hydration)
  useEffect(() => {
    if (!hasHydrated) return;
    localStoragePortfolioRepository.savePositions(positions);
  }, [positions, hasHydrated]);

  const symbols = Array.from(
    new Set(positions.map((p) => p.symbol.toUpperCase())),
  );

  function handleAddPosition() {
    setFormError(null);

    // Validate all fields at once
    const validationError = validatePosition(
      newSymbol,
      newShares,
      newBuyPrice,
      newDca,
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    // All validations passed, safe to convert to numbers
    const trimmedSymbol = newSymbol.trim().toUpperCase();
    const sharesNumber = Number(newShares);
    const buyPriceNumber = Number(newBuyPrice);
    const dcaNumber = newDca ? Number(newDca) : undefined;

    if (editingPosition) {
      // Update existing position
      setPositions((prev) =>
        prev.map((position) =>
          position.id === editingPosition.id
            ? {
                ...position,
                symbol: trimmedSymbol,
                shares: sharesNumber,
                buyPrice: buyPriceNumber,
                dca: dcaNumber,
              }
            : position,
        ),
      );
    } else {
      // Create new position
      const newPosition: Position = {
        id: `${trimmedSymbol}-${Date.now()}`,
        symbol: trimmedSymbol,
        shares: sharesNumber,
        buyPrice: buyPriceNumber,
        dca: dcaNumber,
      };
      setPositions((prev) => [...prev, newPosition]);
    }

    // Clear form and exit edit mode
    setNewSymbol("");
    setNewShares("");
    setNewBuyPrice("");
    setNewDca("");
    setEditingPosition(null);
    setIsAddOpen(false);
    setRefreshToken((prev) => prev + 1);
  }

  function handleEditPosition(position: Position) {
    setEditingPosition(position);
    setNewSymbol(position.symbol);
    setNewShares(String(position.shares));
    setNewBuyPrice(String(position.buyPrice));
    setNewDca(position.dca ? String(position.dca) : "");
    setIsAddOpen(true);
    setFormError(null);
  }

  function handleCancelEdit() {
    setEditingPosition(null);
    setNewSymbol("");
    setNewShares("");
    setNewBuyPrice("");
    setNewDca("");
    setFormError(null);
  }

  function handleRemovePosition(symbol: string) {
    setPositions((prev) =>
      prev.filter((position) => position.symbol !== symbol),
    );
  }

  return (
    <div
      suppressHydrationWarning
      className="min-h-screen text-slate-100 px-6 py-8"
    >
      <PositionsSection
        isAddOpen={isAddOpen}
        symbols={symbols}
        positions={positions}
        refreshToken={refreshToken}
        newSymbol={newSymbol}
        newShares={newShares}
        newBuyPrice={newBuyPrice}
        newDca={newDca}
        formError={formError}
        editingPosition={editingPosition}
        onSymbolChange={setNewSymbol}
        onSharesChange={setNewShares}
        onBuyPriceChange={setNewBuyPrice}
        onDcaChange={setNewDca}
        onAddPosition={handleAddPosition}
        onEditPosition={handleEditPosition}
        onCancelEdit={handleCancelEdit}
        onRemovePosition={handleRemovePosition}
        onRefresh={() => setRefreshToken((prev) => prev + 1)}
        onToggleAdd={() => setIsAddOpen((prev) => !prev)}
      />
    </div>
  );
}
