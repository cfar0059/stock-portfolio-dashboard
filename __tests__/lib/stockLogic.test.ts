import { describe, expect, it } from "vitest";
import {
  getRowStyles,
  isAtOrBelowDca,
  mergePositionsWithStocks,
  sortStocks,
} from "@/lib/stockLogic";
import type { Position, Stock } from "@/lib/types";

describe("isAtOrBelowDca", () => {
  describe("price at or below DCA target (definitive buy signal)", () => {
    it("should return true when price equals DCA target", () => {
      expect(isAtOrBelowDca(100, 100)).toBe(true);
    });

    it("should return true when price is below DCA target", () => {
      expect(isAtOrBelowDca(95, 100)).toBe(true);
    });

    it("should return true when price is significantly below DCA target", () => {
      expect(isAtOrBelowDca(50, 100)).toBe(true);
    });

    it("should return true when price is 1 cent below DCA target", () => {
      expect(isAtOrBelowDca(99.99, 100)).toBe(true);
    });
  });

  describe("price above DCA target with proximity threshold", () => {
    it("should return true when price is within +5% of DCA target", () => {
      expect(isAtOrBelowDca(104, 100)).toBe(true);
    });

    it("should return true when price is at upper bound (+5%)", () => {
      expect(isAtOrBelowDca(105, 100)).toBe(true);
    });

    it("should return false when price is above +5% threshold", () => {
      expect(isAtOrBelowDca(106, 100)).toBe(false);
    });

    it("should return false when price is significantly above DCA target", () => {
      expect(isAtOrBelowDca(150, 100)).toBe(false);
    });
  });

  describe("no DCA target set", () => {
    it("should return false when dcaTarget is undefined", () => {
      expect(isAtOrBelowDca(100, undefined)).toBe(false);
    });

    it("should return false when dcaTarget is zero", () => {
      expect(isAtOrBelowDca(100, 0)).toBe(false);
    });

    it("should return false when dcaTarget is negative", () => {
      expect(isAtOrBelowDca(100, -50)).toBe(false);
    });
  });

  describe("edge cases with decimal precision", () => {
    it("should handle decimal DCA target at lower bound", () => {
      const dcaTarget = 100.5;
      const lowerBound = dcaTarget * 0.95; // 95.475
      expect(isAtOrBelowDca(lowerBound, dcaTarget)).toBe(true);
    });

    it("should handle decimal DCA target at upper bound", () => {
      const dcaTarget = 100.5;
      const upperBound = dcaTarget * 1.05; // 105.525
      expect(isAtOrBelowDca(upperBound, dcaTarget)).toBe(true);
    });

    it("should handle decimal DCA target just outside upper bound", () => {
      const dcaTarget = 100.5;
      const aboveUpperBound = dcaTarget * 1.05 + 0.01; // 105.535
      expect(isAtOrBelowDca(aboveUpperBound, dcaTarget)).toBe(false);
    });
  });

  describe("real-world DCA scenarios", () => {
    it("should highlight AMD at $120.5 when DCA target is $85 (price above target)", () => {
      // Price is way above DCA, should NOT highlight
      expect(isAtOrBelowDca(120.5, 85)).toBe(false);
    });

    it("should highlight AMD at $82 when DCA target is $85 (price below target)", () => {
      expect(isAtOrBelowDca(82, 85)).toBe(true);
    });

    it("should highlight AMD at $89 when DCA target is $85 (within +5% proximity)", () => {
      expect(isAtOrBelowDca(89, 85)).toBe(true);
    });

    it("should NOT highlight AMD at $90 when DCA target is $85 (above +5%)", () => {
      // 85 * 1.05 = 89.25, so 90 is outside range
      expect(isAtOrBelowDca(90, 85)).toBe(false);
    });
  });
});

describe("getRowStyles", () => {
  describe("DCA highlighting when price <= DCA target", () => {
    it("should apply highlight when price is below DCA", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 80,
        change: 0,
        currency: "USD",
        source: "live",
        dca: 100,
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(true);
      expect(result.rowClass).toContain("border-sky-500/40");
      expect(result.rowClass).toContain("bg-slate-800/60");
      expect(result.priceTextClass).toBe("text-sky-400");
      expect(result.dcaTextClass).toBe("text-slate-200");
    });

    it("should apply highlight when price equals DCA", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 100,
        change: 0,
        currency: "USD",
        source: "live",
        dca: 100,
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(true);
      expect(result.priceTextClass).toBe("text-sky-400");
    });
  });

  describe("DCA highlighting when price > DCA with proximity threshold", () => {
    it("should apply highlight when price is within +5% of DCA", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 104,
        change: 0,
        currency: "USD",
        source: "live",
        dca: 100,
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(true);
      expect(result.priceTextClass).toBe("text-sky-400");
    });

    it("should NOT apply highlight when price is above +5% of DCA", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 106,
        change: 0,
        currency: "USD",
        source: "live",
        dca: 100,
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(false);
      expect(result.rowClass).toContain("border-slate-800");
      expect(result.rowClass).not.toContain("border-sky-500");
      expect(result.priceTextClass).toBe("text-slate-200");
    });
  });

  describe("no DCA target set", () => {
    it("should NOT apply highlight when DCA is undefined", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 100,
        change: 0,
        currency: "USD",
        source: "live",
        dca: undefined,
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(false);
      expect(result.rowClass).toContain("border-slate-800");
      expect(result.priceTextClass).toBe("text-slate-200");
      expect(result.dcaTextClass).toBe("text-slate-200");
    });

    it("should NOT apply highlight when DCA is not provided in stock object", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 100,
        change: 0,
        currency: "USD",
        source: "live",
      };

      const result = getRowStyles(stock);

      expect(result.highlightRow).toBe(false);
    });
  });

  describe("CSS class structure validation", () => {
    it("should always include base row classes", () => {
      const stock: Stock = {
        symbol: "TEST",
        price: 100,
        change: 0,
        currency: "USD",
        source: "live",
      };

      const result = getRowStyles(stock);

      expect(result.rowClass).toContain("border-b");
      expect(result.rowClass).toContain("last:border-b-0");
      expect(result.rowClass).toContain("hover:bg-slate-900/60");
      expect(result.rowClass).toContain("transition-colors");
    });
  });
});

describe("mergePositionsWithStocks", () => {
  describe("basic merging", () => {
    it("should merge stock data with matching position", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "live",
        },
      ];

      const positions: Position[] = [
        { id: "1", symbol: "AAPL", shares: 10, buyPrice: 100, dca: undefined },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result).toHaveLength(1);
      expect(result[0].symbol).toBe("AAPL");
      expect(result[0].price).toBe(150);
      expect(result[0].shares).toBe(10);
      expect(result[0].buyPrice).toBe(100);
      expect(result[0].id).toBe("1");
      expect(result[0].profit).toBe(500); // (150-100)*10
    });

    it("should merge multiple stocks with positions", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "live",
        },
        {
          symbol: "MSFT",
          price: 300,
          change: -1.0,
          currency: "USD",
          source: "cache",
        },
      ];

      const positions: Position[] = [
        { id: "1", symbol: "AAPL", shares: 10, buyPrice: 100, dca: 90 },
        { id: "2", symbol: "MSFT", shares: 5, buyPrice: 250, dca: undefined },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result).toHaveLength(2);
      expect(result[0].profit).toBe(500);
      expect(result[0].dca).toBe(90);
      expect(result[1].profit).toBe(250);
      expect(result[1].dca).toBeUndefined();
    });
  });

  describe("stocks without matching positions", () => {
    it("should set shares and buyPrice to 0 when no position matches", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "live",
        },
      ];

      const positions: Position[] = [];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result).toHaveLength(1);
      expect(result[0].shares).toBe(0);
      expect(result[0].buyPrice).toBe(0);
      expect(result[0].profit).toBe(0);
      expect(result[0].id).toBeUndefined();
      expect(result[0].dca).toBeUndefined();
    });

    it("should set profit to 0 when buyPrice is 0", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "live",
        },
      ];

      const positions: Position[] = [
        { id: "1", symbol: "AAPL", shares: 10, buyPrice: 0, dca: undefined },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result[0].profit).toBe(0);
    });

    it("should set profit to 0 when shares is 0", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "live",
        },
      ];

      const positions: Position[] = [
        { id: "1", symbol: "AAPL", shares: 0, buyPrice: 100, dca: undefined },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result[0].profit).toBe(0);
    });
  });

  describe("fractional shares and decimal prices", () => {
    it("should calculate profit correctly with fractional shares", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150.75,
          change: 0,
          currency: "USD",
          source: "live",
        },
      ];

      const positions: Position[] = [
        {
          id: "1",
          symbol: "AAPL",
          shares: 10.5,
          buyPrice: 100.25,
          dca: undefined,
        },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result[0].profit).toBeCloseTo(530.25, 2);
    });
  });

  describe("preserves all stock properties", () => {
    it("should preserve all original stock properties", () => {
      const stocks: Stock[] = [
        {
          symbol: "AAPL",
          price: 150,
          change: 2.5,
          currency: "USD",
          source: "cache",
        },
      ];

      const positions: Position[] = [
        { id: "1", symbol: "AAPL", shares: 10, buyPrice: 100, dca: 95 },
      ];

      const result = mergePositionsWithStocks(stocks, positions);

      expect(result[0].symbol).toBe("AAPL");
      expect(result[0].price).toBe(150);
      expect(result[0].change).toBe(2.5);
      expect(result[0].currency).toBe("USD");
      expect(result[0].source).toBe("cache");
    });
  });
});

describe("sortStocks", () => {
  const mockStocks: Stock[] = [
    {
      symbol: "MSFT",
      price: 300,
      change: -1.0,
      currency: "USD",
      source: "live",
      shares: 5,
      buyPrice: 250,
      profit: 250,
    },
    {
      symbol: "AAPL",
      price: 150,
      change: 2.5,
      currency: "USD",
      source: "cache",
      shares: 10,
      buyPrice: 100,
      profit: 500,
    },
    {
      symbol: "NVDA",
      price: 475,
      change: 0,
      currency: "USD",
      source: "live",
      shares: 2,
      buyPrice: 450,
      profit: 50,
    },
  ];

  describe("numeric column sorting", () => {
    it("should sort by price ascending", () => {
      const result = sortStocks(mockStocks, "price", "asc");

      expect(result[0].symbol).toBe("AAPL");
      expect(result[1].symbol).toBe("MSFT");
      expect(result[2].symbol).toBe("NVDA");
    });

    it("should sort by price descending", () => {
      const result = sortStocks(mockStocks, "price", "desc");

      expect(result[0].symbol).toBe("NVDA");
      expect(result[1].symbol).toBe("MSFT");
      expect(result[2].symbol).toBe("AAPL");
    });

    it("should sort by change ascending", () => {
      const result = sortStocks(mockStocks, "change", "asc");

      expect(result[0].change).toBe(-1.0);
      expect(result[1].change).toBe(0);
      expect(result[2].change).toBe(2.5);
    });

    it("should sort by shares descending", () => {
      const result = sortStocks(mockStocks, "shares", "desc");

      expect(result[0].shares).toBe(10);
      expect(result[1].shares).toBe(5);
      expect(result[2].shares).toBe(2);
    });

    it("should sort by profit ascending", () => {
      const result = sortStocks(mockStocks, "profit", "asc");

      expect(result[0].profit).toBe(50);
      expect(result[1].profit).toBe(250);
      expect(result[2].profit).toBe(500);
    });
  });

  describe("string column sorting", () => {
    it("should sort by symbol ascending (case-insensitive)", () => {
      const result = sortStocks(mockStocks, "symbol", "asc");

      expect(result[0].symbol).toBe("AAPL");
      expect(result[1].symbol).toBe("MSFT");
      expect(result[2].symbol).toBe("NVDA");
    });

    it("should sort by symbol descending", () => {
      const result = sortStocks(mockStocks, "symbol", "desc");

      expect(result[0].symbol).toBe("NVDA");
      expect(result[1].symbol).toBe("MSFT");
      expect(result[2].symbol).toBe("AAPL");
    });

    it("should sort by source ascending", () => {
      const result = sortStocks(mockStocks, "source", "asc");

      expect(result[0].source).toBe("cache");
      expect(result[1].source).toBe("live");
      expect(result[2].source).toBe("live");
    });
  });

  describe("null column (no sort)", () => {
    it("should return original array when column is null", () => {
      const result = sortStocks(mockStocks, null, "asc");

      expect(result).toEqual(mockStocks);
    });
  });

  describe("immutability", () => {
    it("should not modify the original array", () => {
      const original = [...mockStocks];
      sortStocks(mockStocks, "price", "asc");

      expect(mockStocks).toEqual(original);
    });
  });
});
