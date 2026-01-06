/**
 * Unit tests for portfolioStore
 * Tests backend-first strategy with localStorage fallback
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Position } from "@/lib/types";
import * as portfolioApi from "@/lib/api/portfolioApi";
import * as storageUtils from "@/lib/storageUtils";
import {
  getOrCreatePortfolioId,
  loadPortfolio,
} from "@/lib/persistence/portfolioStore";

// Mock modules
vi.mock("@/lib/api/portfolioApi");
vi.mock("@/lib/storageUtils");

describe("portfolioStore", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Mock localStorage with a Map for proper state tracking
    const storage = new Map<string, string>();
    const localStorageMock = {
      getItem: vi.fn((key: string) => storage.get(key) || null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      }),
      clear: vi.fn(() => {
        storage.clear();
      }),
      key: vi.fn(),
      length: 0,
    } as Storage;

    // Set both global.localStorage and window.localStorage
    global.localStorage = localStorageMock;
    Object.defineProperty(global, "window", {
      value: { localStorage: localStorageMock },
      writable: true,
      configurable: true,
    });
  });

  describe("loadPortfolio", () => {
    it("should return backend data when fetch succeeds", async () => {
      // Setup
      const mockPortfolioId = "portfolio-123";
      const mockBackendPositions = [
        {
          id: "pos-1",
          symbol: "AAPL",
          shares: "10",
          buyPrice: "150",
          dcaPrice: "140",
          portfolioId: mockPortfolioId,
          createdAt: "2026-01-06T00:00:00Z",
          updatedAt: "2026-01-06T00:00:00Z",
        },
      ];

      // Mock localStorage has portfolioId and migration flag
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === "portfolio-id") return mockPortfolioId;
        if (key === "portfolio-backend-migrated") return "true";
        return null;
      });

      // Mock API calls
      vi.mocked(portfolioApi.getPortfolio).mockResolvedValue({
        id: mockPortfolioId,
        recoveryCodeHash: "hash",
        recoveryCodeSalt: "salt",
        recoveryCodeLookup: "lookup",
        createdAt: "2026-01-06T00:00:00Z",
        updatedAt: "2026-01-06T00:00:00Z",
        positions: mockBackendPositions,
      });

      // Execute
      const result = await loadPortfolio();

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "pos-1",
        symbol: "AAPL",
        shares: 10,
        buyPrice: 150,
        dca: 140,
      });
      expect(portfolioApi.getPortfolio).toHaveBeenCalledWith(mockPortfolioId);
    });

    it("should return localStorage data when backend fetch fails", async () => {
      // Setup
      const mockLocalPositions: Position[] = [
        {
          id: "local-1",
          symbol: "MSFT",
          shares: 5,
          buyPrice: 300,
          dca: 280,
        },
      ];

      const mockPortfolioId = "portfolio-123";

      // Mock localStorage
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === "portfolio-id") return mockPortfolioId;
        return null;
      });

      // Mock API failure
      vi.mocked(portfolioApi.getPortfolio).mockRejectedValue(
        new portfolioApi.ApiError("Network error", 0),
      );

      // Mock localStorage fallback
      vi.mocked(storageUtils.getPositionsFromStorage).mockReturnValue(
        mockLocalPositions,
      );

      // Execute
      const result = await loadPortfolio();

      // Verify
      expect(result).toEqual(mockLocalPositions);
      expect(storageUtils.getPositionsFromStorage).toHaveBeenCalled();
    });

    it("should migrate localStorage data to backend when backend is empty", async () => {
      // Setup
      const mockPortfolioId = "portfolio-123";
      const mockLocalPositions: Position[] = [
        {
          id: "local-1",
          symbol: "AMD",
          shares: 25,
          buyPrice: 120,
          dca: 110,
        },
      ];

      // Mock localStorage (no migration flag yet)
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === "portfolio-id") return mockPortfolioId;
        if (key === "portfolio-backend-migrated") return null; // Not migrated yet
        return null;
      });

      // Mock localStorage data
      vi.mocked(storageUtils.getPositionsFromStorage).mockReturnValue(
        mockLocalPositions,
      );

      // Mock initial backend call (empty portfolio)
      vi.mocked(portfolioApi.getPortfolio)
        .mockResolvedValueOnce({
          id: mockPortfolioId,
          recoveryCodeHash: "hash",
          recoveryCodeSalt: "salt",
          recoveryCodeLookup: "lookup",
          createdAt: "2026-01-06T00:00:00Z",
          updatedAt: "2026-01-06T00:00:00Z",
          positions: [], // Empty backend
        })
        // Second call after migration
        .mockResolvedValueOnce({
          id: mockPortfolioId,
          recoveryCodeHash: "hash",
          recoveryCodeSalt: "salt",
          recoveryCodeLookup: "lookup",
          createdAt: "2026-01-06T00:00:00Z",
          updatedAt: "2026-01-06T00:00:00Z",
          positions: [
            {
              id: "backend-1",
              symbol: "AMD",
              shares: "25",
              buyPrice: "120",
              dcaPrice: "110",
              portfolioId: mockPortfolioId,
              createdAt: "2026-01-06T00:00:00Z",
              updatedAt: "2026-01-06T00:00:00Z",
            },
          ],
        });

      // Mock addPosition call
      vi.mocked(portfolioApi.addPosition).mockResolvedValue({
        id: "backend-1",
        symbol: "AMD",
        shares: "25",
        buyPrice: "120",
        dcaPrice: "110",
        portfolioId: mockPortfolioId,
        createdAt: "2026-01-06T00:00:00Z",
        updatedAt: "2026-01-06T00:00:00Z",
      });

      // Execute
      const result = await loadPortfolio();

      // Verify migration happened - dca is truthy so it should be passed as the value, not null
      expect(portfolioApi.addPosition).toHaveBeenCalledWith(mockPortfolioId, {
        symbol: "AMD",
        shares: 25,
        buyPrice: 120,
        dcaPrice: 110,
      });

      // Verify migration flag was set
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "portfolio-backend-migrated",
        "true",
      );

      // Verify result
      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe("AMD");
    });
  });

  describe("getOrCreatePortfolioId", () => {
    it("should return existing portfolioId if present", async () => {
      const existingId = "portfolio-456";

      // Mock localStorage to return existing ID
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === "portfolio-id") return existingId;
        return null;
      });

      const result = await getOrCreatePortfolioId();

      expect(result).toBe(existingId);
      expect(portfolioApi.createPortfolio).not.toHaveBeenCalled();
    });

    it("should create new portfolio if no portfolioId exists", async () => {
      const newPortfolioId = "portfolio-789";
      const recoveryCode = "xxxx-xxxx-xxxx-xxxx";

      // Mock localStorage to return null initially
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        if (key === "portfolio-id") return null;
        return null;
      });

      // Mock createPortfolio API call
      vi.mocked(portfolioApi.createPortfolio).mockResolvedValue({
        portfolioId: newPortfolioId,
        recoveryCode,
      });

      const result = await getOrCreatePortfolioId();

      expect(result).toBe(newPortfolioId);
      expect(portfolioApi.createPortfolio).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "portfolio-id",
        newPortfolioId,
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "portfolio-recovery-code",
        recoveryCode,
      );
    });
  });
});
