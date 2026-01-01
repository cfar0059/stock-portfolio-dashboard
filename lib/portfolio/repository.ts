import type { Position } from "@/lib/types";

export interface PortfolioRepository {
  getPositions(): Position[];
  savePositions(positions: Position[]): void;
  getDefaultPositions(): Position[];
}
