// filepath: /Users/carlfarrugiagalea/Documents/Dev/stock-portfolio-dashboard/app/page.tsx
// app/page.tsx
"use client";

import { useEffect, useState } from "react";
// import { SummaryCards } from "@/components/SummaryCards";
import { PositionsSection } from "@/components/PositionsSection";
import { Position } from "@/lib/positions";

const POSITIONS_STORAGE_KEY = "portfolio-positions";

export default function HomePage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newShares, setNewShares] = useState("");
  const [newBuyPrice, setNewBuyPrice] = useState("");
  const [newDca, setNewDca] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);

  // Load positions from localStorage on first mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(POSITIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Position[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPositions(parsed);
      } else {
        // Seed with a basic default portfolio for now
        const defaultPositions: Position[] = [
          { id: "AMD-0", symbol: "AMD", shares: 0, buyPrice: 0 },
          { id: "GOOGL-0", symbol: "GOOGL", shares: 0, buyPrice: 0 },
          { id: "MSFT-0", symbol: "MSFT", shares: 0, buyPrice: 0 },
        ];
        setPositions(defaultPositions);
      }
    } catch (error) {
      console.error("Failed to load positions from localStorage", error);
    }
  }, []);

  // Persist positions to localStorage when they change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        POSITIONS_STORAGE_KEY,
        JSON.stringify(positions),
      );
    } catch (error) {
      console.error("Failed to save positions to localStorage", error);
    }
  }, [positions]);

  const symbols = Array.from(
    new Set(positions.map((p) => p.symbol.toUpperCase())),
  );

  function handleAddPosition() {
    setFormError(null);
    const trimmedSymbol = newSymbol.trim().toUpperCase();
    const sharesNumber = Number(newShares);
    const buyPriceNumber = Number(newBuyPrice);
    const dcaNumber = newDca ? Number(newDca) : undefined;

    if (!trimmedSymbol) {
      setFormError("Symbol is required.");
      return;
    }

    if (!Number.isFinite(sharesNumber) || sharesNumber < 0) {
      setFormError("Shares must be a non-negative number.");
      return;
    }

    if (!Number.isFinite(buyPriceNumber) || buyPriceNumber < 0) {
      setFormError("Buy price must be a non-negative number.");
      return;
    }

    if (
      dcaNumber !== undefined &&
      (!Number.isFinite(dcaNumber) || dcaNumber < 0)
    ) {
      setFormError("Target DCA must be a non-negative number.");
      return;
    }

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
    <main className="min-h-screen bg-[#020817] text-slate-100 px-6 py-8">
      {/*<SummaryCards />*/}

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
    </main>
  );
}
