// filepath: /Users/carlfarrugiagalea/Documents/Dev/stock-portfolio-dashboard/app/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PositionsSection } from "@/components/PositionsSection";
import { AddPositionDialog } from "@/components/AddPositionDialog";
import { Position } from "@/lib/positions";
import { backendPortfolioRepository } from "@/lib/portfolio/backendRepository";
import { getOrCreatePortfolioId } from "@/lib/persistence/portfolioStore";
import {
  addPosition as apiAddPosition,
  deletePosition as apiDeletePosition,
  updatePosition as apiUpdatePosition,
} from "@/lib/api/portfolioApi";

export default function OverviewPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load positions from backend (with localStorage fallback) on first mount
  useEffect(() => {
    async function loadPositions() {
      try {
        const loaded = await backendPortfolioRepository.loadPositions();
        setPositions(loaded);
        setHasHydrated(true);
      } catch (error) {
        console.error("Failed to load positions:", error);
        // Fall back to default empty state
        setPositions([]);
        setHasHydrated(true);
      } finally {
        setIsLoading(false);
      }
    }
    loadPositions();
  }, []);

  // Persist positions to localStorage when they change (but only after hydration)
  useEffect(() => {
    if (!hasHydrated) return;
    backendPortfolioRepository.savePositions(positions);
  }, [positions, hasHydrated]);

  const symbols = Array.from(
    new Set(positions.map((p) => p.symbol.toUpperCase())),
  );

  // Handle modal submit (both add and edit)
  async function handleDialogSubmit(
    positionData: Omit<Position, "id">,
    editingId?: string,
  ) {
    try {
      const portfolioId = await getOrCreatePortfolioId();

      if (editingId) {
        // Update existing position via API
        const backendPosition = await apiUpdatePosition(
          portfolioId,
          editingId,
          {
            symbol: positionData.symbol,
            shares: positionData.shares,
            buyPrice: positionData.buyPrice,
            dcaPrice: positionData.dca ?? null,
          },
        );

        // Update local state
        setPositions((prev) =>
          prev.map((position) =>
            position.id === editingId
              ? {
                  id: backendPosition.id,
                  symbol: backendPosition.symbol,
                  shares: parseFloat(backendPosition.shares),
                  buyPrice: parseFloat(backendPosition.buyPrice),
                  dca: backendPosition.dcaPrice
                    ? parseFloat(backendPosition.dcaPrice)
                    : undefined,
                }
              : position,
          ),
        );
      } else {
        // Create new position via API
        const backendPosition = await apiAddPosition(portfolioId, {
          symbol: positionData.symbol,
          shares: positionData.shares,
          buyPrice: positionData.buyPrice,
          dcaPrice: positionData.dca ?? null,
        });

        // Add to local state
        const newPosition: Position = {
          id: backendPosition.id,
          symbol: backendPosition.symbol,
          shares: parseFloat(backendPosition.shares),
          buyPrice: parseFloat(backendPosition.buyPrice),
          dca: backendPosition.dcaPrice
            ? parseFloat(backendPosition.dcaPrice)
            : undefined,
        };
        setPositions((prev) => [...prev, newPosition]);
      }

      setRefreshToken((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to save position:", error);
      // Fall back to localStorage-only behavior
      if (editingId) {
        setPositions((prev) =>
          prev.map((position) =>
            position.id === editingId
              ? { ...position, ...positionData }
              : position,
          ),
        );
      } else {
        const newPosition: Position = {
          id: `${positionData.symbol}-${Date.now()}`,
          ...positionData,
        };
        setPositions((prev) => [...prev, newPosition]);
      }
      setRefreshToken((prev) => prev + 1);
    }
  }

  // Open modal in edit mode
  function handleEditPosition(position: Position) {
    setEditingPosition(position);
    setDialogMode("edit");
    setIsDialogOpen(true);
  }

  // Open modal in create mode
  function handleOpenAddDialog() {
    setEditingPosition(null);
    setDialogMode("create");
    setIsDialogOpen(true);
  }

  // Remove a position
  async function handleRemovePosition(symbol: string) {
    try {
      const portfolioId = await getOrCreatePortfolioId();
      const positionToDelete = positions.find((p) => p.symbol === symbol);

      if (positionToDelete) {
        // Delete via API
        await apiDeletePosition(portfolioId, positionToDelete.id);
      }

      // Update local state
      setPositions((prev) =>
        prev.filter((position) => position.symbol !== symbol),
      );
    } catch (error) {
      console.error("Failed to delete position:", error);
      // Fall back to local deletion only
      setPositions((prev) =>
        prev.filter((position) => position.symbol !== symbol),
      );
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen text-foreground px-6 py-8 flex items-center justify-center">
        <p className="text-muted-foreground">Loading positions...</p>
      </div>
    );
  }

  return (
    <>
      <div
        suppressHydrationWarning
        className="min-h-screen text-foreground px-6 py-8"
      >
        <PositionsSection
          symbols={symbols}
          positions={positions}
          refreshToken={refreshToken}
          onEditPosition={handleEditPosition}
          onRemovePosition={handleRemovePosition}
          onRefresh={() => setRefreshToken((prev) => prev + 1)}
          onToggleAdd={handleOpenAddDialog}
        />
      </div>

      {/* Unified Add/Edit Position Dialog */}
      <AddPositionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        positions={positions}
        initialValues={editingPosition || undefined}
        onSubmit={handleDialogSubmit}
      />
    </>
  );
}
