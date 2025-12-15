/**
 * Shared localStorage utilities for portfolio positions
 * Single source of truth for positions persistence across pages
 */

import type { Position } from "@/lib/types";

const POSITIONS_STORAGE_KEY = "portfolio-positions";
const DEBUG_POSITIONS = false; // Set to true to enable debug logs

// Default empty portfolio state (no seed data)
const DEFAULT_POSITIONS: Position[] = [];

/**
 * Helper to log debug info with consistent format
 */
function debugLog(
  action:
    | "READ"
    | "WRITE"
    | "READ_PARSED"
    | "READ_ERROR"
    | "READ_DEFAULT"
    | "WRITE_SUCCESS"
    | "WRITE_ERROR",
  source: string,
  value?: string | null | Error | Position[],
  parsed?: Position[],
) {
  if (!DEBUG_POSITIONS) return;

  const pathname =
    typeof globalThis !== "undefined" && globalThis.window
      ? globalThis.window.location.pathname
      : "[server-side]";
  const timestamp = new Date().toISOString();

  let rawValue = "";
  if (typeof value === "string") {
    rawValue = value;
  } else if (value instanceof Error) {
    rawValue = value.message;
  } else if (value === null) {
    rawValue = "null";
  } else {
    rawValue = JSON.stringify(value);
  }

  const parsedLength =
    typeof parsed === "object" && Array.isArray(parsed)
      ? parsed.length
      : "invalid";

  console.log(
    `[positions][${action}][${source}] pathname=${pathname} raw="${rawValue.substring(0, 50)}${rawValue.length > 50 ? "..." : ""}" parsedLength=${parsedLength} ts=${timestamp}`,
  );
}

/**
 * Get positions from localStorage
 * Safe for client-side use only (called after hydration in useEffect)
 * @returns Position array
 */
export function getPositionsFromStorage(): Position[] {
  try {
    const stored = globalThis.localStorage.getItem(POSITIONS_STORAGE_KEY);
    debugLog("READ", "getPositionsFromStorage", stored);

    if (stored) {
      const parsed = JSON.parse(stored) as Position[];
      debugLog("READ_PARSED", "getPositionsFromStorage", stored, parsed);
      return parsed;
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to read positions from localStorage", err);
    debugLog("READ_ERROR", "getPositionsFromStorage", err);
  }

  debugLog("READ_DEFAULT", "getPositionsFromStorage", DEFAULT_POSITIONS);
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
    debugLog("WRITE", "savePositionsToStorage", stringified, positions);

    globalThis.localStorage.setItem(POSITIONS_STORAGE_KEY, stringified);
    debugLog("WRITE_SUCCESS", "savePositionsToStorage", stringified, positions);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to save positions to localStorage", err);
    debugLog("WRITE_ERROR", "savePositionsToStorage", err);
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
