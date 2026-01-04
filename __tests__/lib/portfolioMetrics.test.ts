import { describe, expect, it } from "vitest";
import {
  calculatePortfolioMetrics,
  getMetricColor,
} from "@/lib/portfolioMetrics";
import type { Position, Stock } from "@/lib/types";

describe("calculatePortfolioMetrics", () => {
  describe("all winners (positive performance)", () => {
    it("should calculate metrics for all profitable positions", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10,
          buyPrice: 100,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "MSFT",
          shares: 5,
          buyPrice: 200,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "MSFT",
          price: 300,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(2000); // 1000 + 1000
      expect(result.currentValue).toBe(3000); // 1500 + 1500
      expect(result.unrealizedPL).toBe(1000);
      expect(result.successRate).toBe(50);
    });
  });

  describe("all losers (negative performance)", () => {
    it("should calculate metrics for all losing positions", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10,
          buyPrice: 200,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "MSFT",
          shares: 5,
          buyPrice: 400,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 100,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "MSFT",
          price: 200,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(4000); // 2000 + 2000
      expect(result.currentValue).toBe(2000); // 1000 + 1000
      expect(result.unrealizedPL).toBe(-2000);
      expect(result.successRate).toBe(-50);
    });
  });

  describe("mixed outcomes", () => {
    it("should calculate metrics for mixed profitable and losing positions", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "WINNER",
          shares: 10,
          buyPrice: 100,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "LOSER",
          shares: 10,
          buyPrice: 200,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "WINNER",
          price: 200,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "LOSER",
          price: 100,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(3000); // 1000 + 2000
      expect(result.currentValue).toBe(3000); // 2000 + 1000
      expect(result.unrealizedPL).toBe(0);
      expect(result.successRate).toBe(0);
    });

    it("should calculate metrics when overall portfolio is slightly positive", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10,
          buyPrice: 100,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "MSFT",
          shares: 10,
          buyPrice: 100,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 110,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "MSFT",
          price: 95,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(2000);
      expect(result.currentValue).toBe(2050); // 1100 + 950
      expect(result.unrealizedPL).toBe(50);
      expect(result.successRate).toBeCloseTo(2.5, 10);
    });
  });

  describe("fractional shares and decimal prices", () => {
    it("should handle fractional shares correctly", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10.5,
          buyPrice: 100.25,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150.75,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBeCloseTo(1052.625, 3);
      expect(result.currentValue).toBeCloseTo(1582.875, 3);
      expect(result.unrealizedPL).toBeCloseTo(530.25, 2);
      expect(result.successRate).toBeCloseTo(50.3741, 3);
    });

    it("should handle multiple positions with fractional shares", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 5.25,
          buyPrice: 100.5,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "MSFT",
          shares: 3.75,
          buyPrice: 200.25,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 120.75,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "MSFT",
          price: 180.5,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBeCloseTo(1278.5625, 4);
      expect(result.currentValue).toBeCloseTo(1310.8125, 4);
      expect(result.unrealizedPL).toBeCloseTo(32.25, 2);
      expect(result.successRate).toBeCloseTo(2.5224, 3);
    });
  });

  describe("zero positions edge case", () => {
    it("should return zero metrics with success rate of 0 when no positions", () => {
      const positions: Position[] = [];
      const stocks: Stock[] = [];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(0);
      expect(result.currentValue).toBe(0);
      expect(result.unrealizedPL).toBe(0);
      expect(result.successRate).toBe(0); // Avoids divide-by-zero
    });
  });

  describe("missing stock data (position without matching stock)", () => {
    it("should count cost basis but not current value when stock data is missing", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10,
          buyPrice: 100,
          dca: undefined,
        },
        {
          id: "2",
          symbol: "MISSING",
          shares: 5,
          buyPrice: 200,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        // MISSING stock data not provided
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(2000); // 1000 + 1000
      expect(result.currentValue).toBe(1500); // Only AAPL counted
      expect(result.unrealizedPL).toBe(-500);
      expect(result.successRate).toBe(-25);
    });
  });

  describe("zero cost basis edge case", () => {
    it("should handle position with zero buy price", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "FREE",
          shares: 100,
          buyPrice: 0,
          dca: undefined,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "FREE",
          price: 50,
          change: 0,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBe(0);
      expect(result.currentValue).toBe(5000);
      expect(result.unrealizedPL).toBe(5000);
      expect(result.successRate).toBe(0); // Avoids divide-by-zero
    });
  });

  describe("real-world scenario", () => {
    it("should match expected calculations for a typical portfolio", () => {
      const positions: Position[] = [
        {
          id: "1",
          symbol: "AMD",
          shares: 25.5,
          buyPrice: 95.75,
          dca: 85,
        },
        {
          id: "2",
          symbol: "NVDA",
          shares: 10,
          buyPrice: 450.5,
          dca: undefined,
        },
        {
          id: "3",
          symbol: "MSFT",
          shares: 15.25,
          buyPrice: 380.25,
          dca: 360,
        },
      ];

      const stocks: Stock[] = [
        {
          symbol: "AMD",
          price: 120.5,
          change: 2.5,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "NVDA",
          price: 475.75,
          change: -1.2,
          changePercent: 0,
          currency: "USD",
          source: "cache",
        },
        {
          symbol: "MSFT",
          price: 395.0,
          change: 0.8,
          changePercent: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const result = calculatePortfolioMetrics(positions, stocks);

      expect(result.totalInvested).toBeCloseTo(12745.4375, 4);
      expect(result.currentValue).toBeCloseTo(13854, 2);
      expect(result.unrealizedPL).toBeCloseTo(1108.5625, 2);
      expect(result.successRate).toBeCloseTo(8.6977, 3);
    });
  });
});

describe("getMetricColor", () => {
  describe("positive values", () => {
    it("should return primary color for positive value", () => {
      expect(getMetricColor(100)).toBe("text-primary");
    });

    it("should return primary color for very small positive value", () => {
      expect(getMetricColor(0.01)).toBe("text-primary");
    });

    it("should return primary color for large positive value", () => {
      expect(getMetricColor(999999)).toBe("text-primary");
    });
  });

  describe("negative values", () => {
    it("should return destructive color for negative value", () => {
      expect(getMetricColor(-100)).toBe("text-destructive");
    });

    it("should return destructive color for very small negative value", () => {
      expect(getMetricColor(-0.01)).toBe("text-destructive");
    });

    it("should return destructive color for large negative value", () => {
      expect(getMetricColor(-999999)).toBe("text-destructive");
    });
  });

  describe("zero value", () => {
    it("should return muted-foreground color for exactly zero", () => {
      expect(getMetricColor(0)).toBe("text-muted-foreground");
    });

    it("should return muted-foreground color for negative zero", () => {
      expect(getMetricColor(-0)).toBe("text-muted-foreground");
    });
  });
});
