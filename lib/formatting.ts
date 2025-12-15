/**
 * Formatting utilities for consistent number/currency display across the app
 */

/**
 * Format a number as a currency string (USD)
 * @param value - The numeric value to format
 * @returns Formatted string with 2 decimal places (e.g., "1,234.56")
 */
export const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/**
 * Format a number to 2 decimal places
 * @param value - The numeric value to format
 * @returns Formatted string with 2 decimal places (e.g., "123.45")
 */
export const formatDecimal = (value: number): string => value.toFixed(2);

/**
 * Format a percentage value
 * @param value - The numeric percentage value
 * @returns Formatted string with 2 decimal places and % sign (e.g., "5.67%")
 */
export const formatPercentage = (value: number): string =>
  `${value.toFixed(2)}%`;
