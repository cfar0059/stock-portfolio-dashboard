/**
 * Shared localStorage utilities for portfolio positions
 * Single source of truth for positions persistence across pages
 */

import type { Position } from "@/lib/types";

const POSITIONS_STORAGE_KEY = "portfolio-positions";

// Default empty portfolio state (no seed data)
const DEFAULT_POSITIONS: Position[] = [];

/**
 * Get positions from localStorage
 * Safe for client-side use only (called after hydration in useEffect)
 * @returns Position array
 */
export function getPositionsFromStorage(): Position[] {
  try {
    const stored = globalThis.localStorage.getItem(POSITIONS_STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored) as Position[];
      return parsed;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to read positions from localStorage", err);
  }

  return DEFAULT_POSITIONS;
}

/**
 * Save positions to localStorage
 * Called by Dashboard page when positions change
 * @param positions - Position array to persist
 */
export function savePositionsToStorage(positions: Position[]): void {
  try {
    const stringified = JSON.stringify(positions);

    globalThis.localStorage.setItem(POSITIONS_STORAGE_KEY, stringified);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to save positions to localStorage", err);
  }
}

/**
 * Get default positions (safe for server-side rendering)
 * Used during SSR before client hydration
 * @returns Default Position array
 */
export function getDefaultPositions(): Position[] {
  return DEFAULT_POSITIONS;
}

/**
 * Initialize positions on first mount
 * Useful for hooks that need to hydrate from localStorage
 * @returns Positions and setter from useState
 */
export { POSITIONS_STORAGE_KEY };
