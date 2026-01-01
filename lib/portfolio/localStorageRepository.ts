/**
 * LocalStorage Portfolio Repository Implementation
 * Delegates to existing storageUtils helpers
 * No behavioral changes - pure wrapper
 */

import type { Position } from "@/lib/types";
import type { PortfolioRepository } from "./repository";
import {
  getDefaultPositions,
  getPositionsFromStorage,
  savePositionsToStorage,
} from "@/lib/storageUtils";

/**
 * LocalStorage-backed portfolio repository
 * Uses existing storageUtils helpers for all operations
 */
export class LocalStoragePortfolioRepository implements PortfolioRepository {
  getPositions(): Position[] {
    return getPositionsFromStorage();
  }

  savePositions(positions: Position[]): void {
    savePositionsToStorage(positions);
  }

  getDefaultPositions(): Position[] {
    return getDefaultPositions();
  }
}

/**
 * Singleton instance for app-wide use
 */
export const localStoragePortfolioRepository =
  new LocalStoragePortfolioRepository();
