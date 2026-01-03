import React from "react";
import { StockDashboard } from "@/components/StockDashboard";
import { Button } from "@/components/ui/button";
import { Plus, RotateCcw } from "lucide-react";
import type { Position } from "@/lib/positions";

interface PositionsSectionProps {
  symbols: string[];
  positions: Position[];
  refreshToken: number;
  onEditPosition: (position: Position) => void;
  onRemovePosition: (symbol: string) => void;
  onRefresh?: () => void;
  onToggleAdd?: () => void;
}

export function PositionsSection({
  symbols,
  positions,
  refreshToken,
  onEditPosition,
  onRemovePosition,
  onRefresh,
  onToggleAdd,
}: Readonly<PositionsSectionProps>) {
  return (
    <section className="space-y-4">
      {/* Header with title and action buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Positions</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            aria-label="Refresh positions"
            className="cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={onToggleAdd}
            aria-label="Add position"
            data-testid="add-position-toggle"
            className="gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Table container with modern border */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <StockDashboard
          symbols={symbols}
          positions={positions}
          refreshToken={refreshToken}
          onEditPosition={onEditPosition}
          onRemovePosition={onRemovePosition}
          onToggleAdd={onToggleAdd}
        />
      </div>
    </section>
  );
}
