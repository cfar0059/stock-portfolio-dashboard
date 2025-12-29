import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatDecimal,
  formatPercentage,
} from "@/lib/formatting";

describe("formatCurrency", () => {
  describe("positive values", () => {
    it("should format whole number with 2 decimals and comma separator", () => {
      expect(formatCurrency(1000)).toBe("1,000.00");
    });

    it("should format decimal value with 2 decimals", () => {
      expect(formatCurrency(1234.56)).toBe("1,234.56");
    });

    it("should format large value with comma separators", () => {
      expect(formatCurrency(1234567.89)).toBe("1,234,567.89");
    });

    it("should format small value with 2 decimals", () => {
      expect(formatCurrency(0.99)).toBe("0.99");
    });

    it("should round to 2 decimals when more precision provided", () => {
      expect(formatCurrency(123.456)).toBe("123.46");
    });
  });

  describe("negative values", () => {
    it("should format negative value with minus sign", () => {
      expect(formatCurrency(-1000)).toBe("-1,000.00");
    });

    it("should format negative decimal with 2 decimals", () => {
      expect(formatCurrency(-1234.56)).toBe("-1,234.56");
    });
  });

  describe("zero value", () => {
    it("should format zero with 2 decimals", () => {
      expect(formatCurrency(0)).toBe("0.00");
    });
  });

  describe("edge cases", () => {
    it("should format very large number", () => {
      expect(formatCurrency(999999999.99)).toBe("999,999,999.99");
    });

    it("should format very small positive number", () => {
      expect(formatCurrency(0.01)).toBe("0.01");
    });

    it("should always show 2 decimals even for whole numbers", () => {
      expect(formatCurrency(100)).toBe("100.00");
    });
  });
});

describe("formatDecimal", () => {
  describe("various decimal values", () => {
    it("should format with exactly 2 decimal places", () => {
      expect(formatDecimal(123.456)).toBe("123.46");
    });

    it("should format whole number with 2 decimals", () => {
      expect(formatDecimal(100)).toBe("100.00");
    });

    it("should format negative value with 2 decimals", () => {
      expect(formatDecimal(-50.5)).toBe("-50.50");
    });

    it("should format zero with 2 decimals", () => {
      expect(formatDecimal(0)).toBe("0.00");
    });

    it("should round to 2 decimals", () => {
      expect(formatDecimal(123.456789)).toBe("123.46");
    });
  });

  describe("no comma separators", () => {
    it("should not include comma separators (unlike formatCurrency)", () => {
      expect(formatDecimal(1234.56)).toBe("1234.56");
    });

    it("should not include comma for large numbers", () => {
      expect(formatDecimal(1234567.89)).toBe("1234567.89");
    });
  });
});

describe("formatPercentage", () => {
  describe("positive percentages", () => {
    it("should format positive percentage with % sign", () => {
      expect(formatPercentage(50)).toBe("50.00%");
    });

    it("should format decimal percentage with 2 decimals", () => {
      expect(formatPercentage(12.34)).toBe("12.34%");
    });

    it("should format small percentage", () => {
      expect(formatPercentage(0.01)).toBe("0.01%");
    });

    it("should round to 2 decimals", () => {
      expect(formatPercentage(12.3456)).toBe("12.35%");
    });
  });

  describe("negative percentages", () => {
    it("should format negative percentage with minus sign and % sign", () => {
      expect(formatPercentage(-25)).toBe("-25.00%");
    });

    it("should format negative decimal percentage", () => {
      expect(formatPercentage(-12.34)).toBe("-12.34%");
    });
  });

  describe("zero percentage", () => {
    it("should format zero with % sign", () => {
      expect(formatPercentage(0)).toBe("0.00%");
    });
  });

  describe("edge cases", () => {
    it("should format very large percentage", () => {
      expect(formatPercentage(999.99)).toBe("999.99%");
    });

    it("should format very small percentage", () => {
      expect(formatPercentage(0.01)).toBe("0.01%");
    });

    it("should always show 2 decimals", () => {
      expect(formatPercentage(100)).toBe("100.00%");
    });
  });
});
