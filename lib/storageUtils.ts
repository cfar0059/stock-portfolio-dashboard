/**
 * Shared localStorage utilities for portfolio positions
 * Single source of truth for positions persistence across pages
 */

import type { Position } from "@/lib/types";

const POSITIONS_STORAGE_KEY = "portfolio-positions";

// Default empty portfolio state (no seed data)
const DEFAULT_POSITIONS: Position[] = [];

/**
 * Normalize symbol for comparison: trim + uppercase
 */
function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

/**
 * Deduplicate positions by normalized symbol (keep first occurrence)
 * This is a hard guard to prevent duplicate entries
 * @param positions - Array of positions to dedupe
 * @returns Deduplicated array (first occurrence wins)
 */
function deduplicatePositions(positions: Position[]): Position[] {
  const seen = new Set<string>();
  return positions.filter((position) => {
    const normalized = normalizeSymbol(position.symbol);
    if (seen.has(normalized)) {
      return false; // Skip duplicate
    }
    seen.add(normalized);
    return true;
  });
}

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
 * INVARIANT: Deduplicates by normalized symbol to prevent duplicate entries
 * @param positions - Position array to persist
 */
export function savePositionsToStorage(positions: Position[]): void {
  try {
    // Hard guard: deduplicate before saving
    const dedupedPositions = deduplicatePositions(positions);
    const stringified = JSON.stringify(dedupedPositions);

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
