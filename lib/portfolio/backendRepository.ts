/**
 * Backend-First Portfolio Repository Implementation
 * Uses NestJS API with localStorage fallback
 * Implements automatic migration from localStorage to backend
 */

import type { Position } from "@/lib/types";
import type { PortfolioRepository } from "./repository";
import { loadPortfolio, savePortfolio } from "@/lib/persistence/portfolioStore";
import { getDefaultPositions } from "@/lib/storageUtils";

/**
 * Backend-first portfolio repository
 * Attempts to use backend API, falls back to localStorage on failure
 */
export class BackendPortfolioRepository implements PortfolioRepository {
  private positions: Position[] | null = null;
  private isLoading = false;

  /**
   * Get positions from backend (with localStorage fallback)
   * This is async but we need to support the sync interface
   * Callers should use await loadPositions() for the async version
   */
  getPositions(): Position[] {
    // Return cached positions if available
    if (this.positions !== null) {
      return this.positions;
    }

    // Return default if still loading or no data
    return getDefaultPositions();
  }

  /**
   * Async version of getPositions
   * Loads from backend with localStorage fallback
   */
  async loadPositions(): Promise<Position[]> {
    if (this.isLoading) {
      // Wait a bit and return cached or default
      await new Promise((resolve) => setTimeout(resolve, 100));
      return this.getPositions();
    }

    this.isLoading = true;
    try {
      const positions = await loadPortfolio();
      this.positions = positions;
      return positions;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Save positions
   * For now, saves to localStorage as backup
   * Individual operations (add/update/delete) should call the API directly
   */
  savePositions(positions: Position[]): void {
    this.positions = positions;
    // Async save to backend/localStorage (fire and forget for now)
    savePortfolio(positions).catch((error) => {
      console.error("Failed to save positions:", error);
    });
  }

  /**
   * Update cached positions
   * Used when positions are modified via API calls
   */
  setCachedPositions(positions: Position[]): void {
    this.positions = positions;
  }

  getDefaultPositions(): Position[] {
    return getDefaultPositions();
  }
}

/**
 * Singleton instance for app-wide use
 */
export const backendPortfolioRepository = new BackendPortfolioRepository();
