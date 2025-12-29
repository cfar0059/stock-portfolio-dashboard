import { describe, expect, it } from "vitest";
import { calculateProfit } from "@/lib/calculateProfit";

describe("calculateProfit", () => {
  describe("positive profit scenarios", () => {
    it("should calculate profit for price increase with whole shares", () => {
      const result = calculateProfit(150, 100, 10);
      expect(result.amount).toBe(500);
      expect(result.percentage).toBe(50);
    });

    it("should calculate profit for small price increase", () => {
      const result = calculateProfit(101, 100, 100);
      expect(result.amount).toBe(100);
      expect(result.percentage).toBeCloseTo(1, 10);
    });

    it("should calculate profit with fractional shares", () => {
      const result = calculateProfit(150.75, 100.25, 10);
      expect(result.amount).toBe(505);
      expect(result.percentage).toBeCloseTo(50.3741, 3);
    });

    it("should calculate profit with fractional shares and decimal prices", () => {
      const result = calculateProfit(82.45, 75.3, 12.75);
      expect(result.amount).toBeCloseTo(91.1625, 4);
      expect(result.percentage).toBeCloseTo(9.4954, 3);
    });
  });

  describe("negative profit (loss) scenarios", () => {
    it("should calculate loss for price decrease", () => {
      const result = calculateProfit(80, 100, 10);
      expect(result.amount).toBe(-200);
      expect(result.percentage).toBeCloseTo(-20, 10);
    });

    it("should calculate loss with fractional shares", () => {
      const result = calculateProfit(80, 100, 10.25);
      expect(result.amount).toBe(-205);
      expect(result.percentage).toBeCloseTo(-20, 10);
    });

    it("should calculate loss with decimal prices", () => {
      const result = calculateProfit(75.5, 100.25, 10);
      expect(result.amount).toBe(-247.5);
      expect(result.percentage).toBeCloseTo(-24.6883, 4);
    });

    it("should calculate large loss percentage", () => {
      const result = calculateProfit(10, 100, 5);
      expect(result.amount).toBe(-450);
      expect(result.percentage).toBe(-90);
    });
  });

  describe("zero profit scenarios", () => {
    it("should return zero profit when price equals buy price", () => {
      const result = calculateProfit(100, 100, 10);
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(0);
    });

    it("should return zero profit with fractional shares", () => {
      const result = calculateProfit(100.5, 100.5, 10.75);
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe("edge cases and floating-point behavior", () => {
    it("should handle very small price differences", () => {
      const result = calculateProfit(100.01, 100, 1000);
      expect(result.amount).toBeCloseTo(10, 2);
      expect(result.percentage).toBeCloseTo(0.01, 4);
    });

    it("should handle single share", () => {
      const result = calculateProfit(150, 100, 1);
      expect(result.amount).toBe(50);
      expect(result.percentage).toBe(50);
    });

    it("should handle zero shares (returns zero)", () => {
      const result = calculateProfit(150, 100, 0);
      expect(result.amount).toBe(0);
      expect(result.percentage).toBe(50);
    });

    it("should handle maximum precision shares (2 decimals)", () => {
      const result = calculateProfit(150.99, 100.01, 0.01);
      expect(result.amount).toBeCloseTo(0.5098, 4);
      expect(result.percentage).toBeCloseTo(50.9749, 4);
    });

    it("should preserve current floating-point behavior for typical portfolio values", () => {
      // Real-world example: AMD position
      const result = calculateProfit(120.5, 95.75, 25.5);
      expect(result.amount).toBeCloseTo(631.125, 3);
      expect(result.percentage).toBeCloseTo(25.8486, 3);
    });
  });

  describe("division by zero in percentage calculation", () => {
    it("should return Infinity when buyPrice is zero", () => {
      const result = calculateProfit(100, 0, 10);
      expect(result.amount).toBe(1000);
      expect(result.percentage).toBe(Infinity);
    });
  });
});
