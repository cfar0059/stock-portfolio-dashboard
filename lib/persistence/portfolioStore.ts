/**
 * Portfolio Store - Persistence Adapter
 * Implements backend-first strategy with localStorage fallback
 * Handles one-time migration from localStorage to backend
 */

import type { Position } from "@/lib/types";
import {
  getPositionsFromStorage,
  savePositionsToStorage,
} from "@/lib/storageUtils";
import {
  addPosition as apiAddPosition,
  type BackendPosition,
  createPortfolio as apiCreatePortfolio,
  getPortfolio as apiGetPortfolio,
} from "@/lib/api/portfolioApi";

// LocalStorage keys
const PORTFOLIO_ID_KEY = "portfolio-id";
const RECOVERY_CODE_KEY = "portfolio-recovery-code";
const BACKEND_MIGRATED_KEY = "portfolio-backend-migrated";

/**
 * Convert backend position (Decimals as strings) to UI position (numbers)
 */
function backendPositionToUI(backendPos: BackendPosition): Position {
  return {
    id: backendPos.id,
    symbol: backendPos.symbol,
    shares: parseFloat(backendPos.shares),
    buyPrice: parseFloat(backendPos.buyPrice),
    dca: backendPos.dcaPrice ? parseFloat(backendPos.dcaPrice) : undefined,
  };
}

/**
 * Convert UI position to backend DTO format
 */
function uiPositionToBackendDto(position: Position): {
  symbol: string;
  shares: number;
  buyPrice: number;
  dcaPrice?: number | null;
} {
  return {
    symbol: position.symbol,
    shares: position.shares,
    buyPrice: position.buyPrice,
    dcaPrice: position.dca ?? null,
  };
}

/**
 * Get or create portfolio ID
 * Returns existing portfolioId from localStorage or creates a new one
 */
export async function getOrCreatePortfolioId(): Promise<string> {
  // Check if we already have a portfolio ID
  const existingId =
    typeof window !== "undefined"
      ? window.localStorage.getItem(PORTFOLIO_ID_KEY)
      : null;

  if (existingId) {
    return existingId;
  }

  // Create new portfolio via API
  try {
    const { portfolioId, recoveryCode } = await apiCreatePortfolio();

    // Store portfolio ID and recovery code
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PORTFOLIO_ID_KEY, portfolioId);
      window.localStorage.setItem(RECOVERY_CODE_KEY, recoveryCode);
    }

    return portfolioId;
  } catch (error) {
    // If API fails, we can't create a portfolio
    // For now, throw the error (caller should handle fallback)
    throw error;
  }
}

/**
 * Load portfolio from backend with localStorage fallback
 * Automatically migrates localStorage data to backend on first load
 */
export async function loadPortfolio(): Promise<Position[]> {
  try {
    // Get or create portfolio ID
    const portfolioId = await getOrCreatePortfolioId();

    // Fetch from backend
    const backendPortfolio = await apiGetPortfolio(portfolioId);

    // Convert backend positions to UI format
    const backendPositions =
      backendPortfolio.positions.map(backendPositionToUI);

    // Check if migration is needed
    const shouldMigrate = await shouldMigrateToBackend(backendPositions);

    if (shouldMigrate) {
      return await migrateLocalToBackend(portfolioId);
    }

    return backendPositions;
  } catch (error) {
    // Backend failed - fall back to localStorage
    console.warn("Backend fetch failed, falling back to localStorage:", error);
    return getPositionsFromStorage();
  }
}

/**
 * Check if we should migrate localStorage data to backend
 */
async function shouldMigrateToBackend(
  backendPositions: Position[],
): Promise<boolean> {
  // Check migration flag
  const migrated =
    typeof window !== "undefined"
      ? window.localStorage.getItem(BACKEND_MIGRATED_KEY)
      : null;

  if (migrated === "true") {
    return false; // Already migrated
  }

  // Check if backend is empty
  if (backendPositions.length > 0) {
    return false; // Backend has data, no migration needed
  }

  // Check if localStorage has data
  const localPositions = getPositionsFromStorage();
  if (localPositions.length === 0) {
    return false; // No data to migrate
  }

  return true; // Should migrate
}

/**
 * Migrate localStorage positions to backend
 * Only called once per portfolio
 */
async function migrateLocalToBackend(portfolioId: string): Promise<Position[]> {
  const localPositions = getPositionsFromStorage();

  if (localPositions.length === 0) {
    return [];
  }

  console.log(`Migrating ${localPositions.length} positions to backend...`);

  // Add each position sequentially
  const migratedPositions: Position[] = [];
  for (const position of localPositions) {
    try {
      const dto = uiPositionToBackendDto(position);
      const backendPosition = await apiAddPosition(portfolioId, dto);
      migratedPositions.push(backendPositionToUI(backendPosition));
    } catch (error) {
      console.error(`Failed to migrate position ${position.symbol}:`, error);
      // Continue with other positions
    }
  }

  // Set migration flag
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BACKEND_MIGRATED_KEY, "true");
  }

  console.log(
    `Migration complete. Migrated ${migratedPositions.length} positions.`,
  );

  // Reload from backend to get fresh data
  try {
    const backendPortfolio = await apiGetPortfolio(portfolioId);
    return backendPortfolio.positions.map(backendPositionToUI);
  } catch {
    // If reload fails, return what we migrated
    return migratedPositions;
  }
}

/**
 * Save positions to backend with localStorage fallback
 */
export async function savePortfolio(positions: Position[]): Promise<void> {
  try {
    // For now, we still save to localStorage as backup
    // The actual backend sync happens through individual add/update/delete operations
    savePositionsToStorage(positions);
  } catch (_error) {
    console.error("Failed to save positions:", _error);
    throw _error;
  }
}

/**
 * Get portfolio ID from localStorage (if exists)
 * Returns null if not found or if running on server
 */
export function getStoredPortfolioId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(PORTFOLIO_ID_KEY);
}

/**
 * Get recovery code from localStorage (if exists)
 */
export function getStoredRecoveryCode(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(RECOVERY_CODE_KEY);
}

/**
 * Clear all portfolio data from localStorage
 * Use with caution - this will reset the entire portfolio
 */
export function clearPortfolioData(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(PORTFOLIO_ID_KEY);
  window.localStorage.removeItem(RECOVERY_CODE_KEY);
  window.localStorage.removeItem(BACKEND_MIGRATED_KEY);
  // Note: We don't clear positions here - that's handled by storageUtils
}
