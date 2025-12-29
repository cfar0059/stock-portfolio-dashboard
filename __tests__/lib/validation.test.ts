import { describe, expect, it } from "vitest";
import {
  validateBuyPrice,
  validateDca,
  validatePosition,
  validateShares,
  validateSymbol,
} from "@/lib/validation";

describe("validateSymbol", () => {
  describe("valid symbols", () => {
    it("should return null for valid uppercase symbol", () => {
      expect(validateSymbol("AAPL")).toBe(null);
    });

    it("should return null for valid lowercase symbol (converts to uppercase)", () => {
      expect(validateSymbol("aapl")).toBe(null);
    });

    it("should return null for symbol with numbers", () => {
      expect(validateSymbol("BRK.B")).toBe(null);
    });

    it("should return null for symbol with whitespace (trims)", () => {
      expect(validateSymbol("  MSFT  ")).toBe(null);
    });
  });

  describe("invalid symbols", () => {
    it("should return error for empty string", () => {
      expect(validateSymbol("")).toBe("Symbol is required.");
    });

    it("should return error for whitespace only", () => {
      expect(validateSymbol("   ")).toBe("Symbol is required.");
    });
  });
});

describe("validateShares", () => {
  describe("valid whole number shares", () => {
    it("should return null for valid whole number", () => {
      expect(validateShares("10")).toBe(null);
    });

    it("should return null for single share", () => {
      expect(validateShares("1")).toBe(null);
    });

    it("should return null for large quantity", () => {
      expect(validateShares("1000")).toBe(null);
    });
  });

  describe("valid fractional shares", () => {
    it("should return null for 1 decimal place", () => {
      expect(validateShares("10.5")).toBe(null);
    });

    it("should return null for 2 decimal places", () => {
      expect(validateShares("10.25")).toBe(null);
    });

    it("should return null for 0.01 shares", () => {
      expect(validateShares("0.01")).toBe(null);
    });

    it("should return null for 0.5 shares", () => {
      expect(validateShares("0.5")).toBe(null);
    });
  });

  describe("invalid shares - too many decimals", () => {
    it("should return error for 3 decimal places", () => {
      expect(validateShares("10.123")).toBe(
        "Shares can have at most 2 decimal places.",
      );
    });

    it("should return error for 4 decimal places", () => {
      expect(validateShares("10.1234")).toBe(
        "Shares can have at most 2 decimal places.",
      );
    });
  });

  describe("invalid shares - non-positive", () => {
    it("should return error for zero shares", () => {
      expect(validateShares("0")).toBe("Shares must be greater than 0.");
    });

    it("should return error for negative shares", () => {
      expect(validateShares("-10")).toBe("Shares must be greater than 0.");
    });

    it("should return error for negative fractional shares", () => {
      expect(validateShares("-0.5")).toBe("Shares must be greater than 0.");
    });
  });

  describe("invalid shares - non-numeric", () => {
    it("should return error for non-numeric string", () => {
      expect(validateShares("abc")).toBe("Shares must be a number.");
    });

    it("should return error for empty string (converts to 0)", () => {
      expect(validateShares("")).toBe("Shares must be greater than 0.");
    });

    it("should return error for special characters", () => {
      expect(validateShares("10@#")).toBe("Shares must be a number.");
    });
  });
});

describe("validateBuyPrice", () => {
  describe("valid buy prices", () => {
    it("should return null for valid integer price", () => {
      expect(validateBuyPrice("100")).toBe(null);
    });

    it("should return null for valid decimal price", () => {
      expect(validateBuyPrice("100.50")).toBe(null);
    });

    it("should return null for zero buy price", () => {
      expect(validateBuyPrice("0")).toBe(null);
    });

    it("should return null for very small price", () => {
      expect(validateBuyPrice("0.01")).toBe(null);
    });
  });

  describe("invalid buy prices", () => {
    it("should return error for negative price", () => {
      expect(validateBuyPrice("-100")).toBe(
        "Buy price must be a non-negative number.",
      );
    });

    it("should return error for non-numeric string", () => {
      expect(validateBuyPrice("abc")).toBe(
        "Buy price must be a non-negative number.",
      );
    });

    it("should return null for empty string (converts to 0, which is valid)", () => {
      expect(validateBuyPrice("")).toBe(null);
    });
  });
});

describe("validateDca", () => {
  describe("valid DCA values", () => {
    it("should return null for valid DCA price", () => {
      expect(validateDca("100")).toBe(null);
    });

    it("should return null for valid decimal DCA", () => {
      expect(validateDca("85.50")).toBe(null);
    });

    it("should return null for zero DCA", () => {
      expect(validateDca("0")).toBe(null);
    });

    it("should return null for empty string (DCA is optional)", () => {
      expect(validateDca("")).toBe(null);
    });
  });

  describe("invalid DCA values", () => {
    it("should return error for negative DCA", () => {
      expect(validateDca("-100")).toBe(
        "Target DCA must be a non-negative number.",
      );
    });

    it("should return error for non-numeric string", () => {
      expect(validateDca("abc")).toBe(
        "Target DCA must be a non-negative number.",
      );
    });
  });
});

describe("validatePosition", () => {
  describe("all fields valid", () => {
    it("should return null when all fields are valid", () => {
      expect(validatePosition("AAPL", "10", "100", "")).toBe(null);
    });

    it("should return null with fractional shares and DCA", () => {
      expect(validatePosition("MSFT", "10.5", "250.75", "240")).toBe(null);
    });
  });

  describe("validates symbol first", () => {
    it("should return symbol error when symbol is invalid", () => {
      expect(validatePosition("", "10", "100", "")).toBe("Symbol is required.");
    });
  });

  describe("validates shares second", () => {
    it("should return shares error when shares is invalid", () => {
      expect(validatePosition("AAPL", "0", "100", "")).toBe(
        "Shares must be greater than 0.",
      );
    });

    it("should return shares error for too many decimals", () => {
      expect(validatePosition("AAPL", "10.123", "100", "")).toBe(
        "Shares can have at most 2 decimal places.",
      );
    });
  });

  describe("validates buy price third", () => {
    it("should return buy price error when buy price is invalid", () => {
      expect(validatePosition("AAPL", "10", "-100", "")).toBe(
        "Buy price must be a non-negative number.",
      );
    });
  });

  describe("validates DCA last", () => {
    it("should return DCA error when DCA is invalid", () => {
      expect(validatePosition("AAPL", "10", "100", "-50")).toBe(
        "Target DCA must be a non-negative number.",
      );
    });
  });

  describe("returns first error encountered", () => {
    it("should return symbol error when multiple fields are invalid", () => {
      expect(validatePosition("", "0", "-100", "-50")).toBe(
        "Symbol is required.",
      );
    });

    it("should return shares error when shares and later fields are invalid", () => {
      expect(validatePosition("AAPL", "abc", "-100", "-50")).toBe(
        "Shares must be a number.",
      );
    });
  });
});
