/**
 * Form validation utilities for position data
 */

import type { ValidationError } from "@/lib/types";

// Re-export for convenience
export type { ValidationError };

/**
 * Validate stock symbol
 * @param symbol - The symbol string to validate
 * @returns Error message if invalid, null if valid
 */
export const validateSymbol = (symbol: string): string | null => {
  const trimmed = symbol.trim().toUpperCase();
  if (!trimmed) {
    return "Symbol is required.";
  }
  return null;
};

/**
 * Validate shares quantity
 * @param shares - The shares value (will be converted to number)
 * @returns Error message if invalid, null if valid
 */
export const validateShares = (shares: string): string | null => {
  const sharesNumber = Number(shares);
  if (!Number.isFinite(sharesNumber) || sharesNumber < 0) {
    return "Shares must be a non-negative number.";
  }
  return null;
};

/**
 * Validate buy price
 * @param buyPrice - The buy price value (will be converted to number)
 * @returns Error message if invalid, null if valid
 */
export const validateBuyPrice = (buyPrice: string): string | null => {
  const buyPriceNumber = Number(buyPrice);
  if (!Number.isFinite(buyPriceNumber) || buyPriceNumber < 0) {
    return "Buy price must be a non-negative number.";
  }
  return null;
};

/**
 * Validate target DCA (optional field)
 * @param dca - The DCA value (will be converted to number if not empty)
 * @returns Error message if invalid, null if valid
 */
export const validateDca = (dca: string): string | null => {
  if (!dca) {
    // DCA is optional
    return null;
  }
  const dcaNumber = Number(dca);
  if (!Number.isFinite(dcaNumber) || dcaNumber < 0) {
    return "Target DCA must be a non-negative number.";
  }
  return null;
};

/**
 * Validate all form fields at once
 * @param symbol - The symbol string
 * @param shares - The shares string
 * @param buyPrice - The buy price string
 * @param dca - The DCA string (optional)
 * @returns Error message if any field is invalid, null if all valid
 */
export const validatePosition = (
  symbol: string,
  shares: string,
  buyPrice: string,
  dca: string,
): string | null => {
  // Validate in order, return first error
  const symbolError = validateSymbol(symbol);
  if (symbolError) return symbolError;

  const sharesError = validateShares(shares);
  if (sharesError) return sharesError;

  const buyPriceError = validateBuyPrice(buyPrice);
  if (buyPriceError) return buyPriceError;

  const dcaError = validateDca(dca);
  if (dcaError) return dcaError;

  return null;
};
