// filepath: /Users/carlfarrugiagalea/Documents/Dev/stock-portfolio-dashboard/app/overview/page.tsx
"use client";

import { useEffect, useState } from "react";
import { PositionsSection } from "@/components/PositionsSection";
import { AddPositionDialog } from "@/components/AddPositionDialog";
import { Position } from "@/lib/positions";
import { localStoragePortfolioRepository } from "@/lib/portfolio/localStorageRepository";

export default function OverviewPage() {
  const [refreshToken, setRefreshToken] = useState(0);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
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

  // Handle modal submit (both add and edit)
  function handleDialogSubmit(
    positionData: Omit<Position, "id">,
    editingId?: string,
  ) {
    if (editingId) {
      // Update existing position
      setPositions((prev) =>
        prev.map((position) =>
          position.id === editingId
            ? { ...position, ...positionData }
            : position,
        ),
      );
    } else {
      // Create new position
      const newPosition: Position = {
        id: `${positionData.symbol}-${Date.now()}`,
        ...positionData,
      };
      setPositions((prev) => [...prev, newPosition]);
    }
    setRefreshToken((prev) => prev + 1);
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
  function handleRemovePosition(symbol: string) {
    setPositions((prev) =>
      prev.filter((position) => position.symbol !== symbol),
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
