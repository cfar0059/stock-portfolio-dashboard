/**
 * Centralized style constants and helper functions
 * Single source of truth for UI styling across the application
 */

/**
 * Table header styling classes
 * Used for all table header cells
 */
export const TABLE_HEAD_CLASS =
  "px-2 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-medium text-slate-400 font-semibold";

/**
 * Sortable table header styling classes
 * Extends TABLE_HEAD_CLASS with interactive states
 */
export const SORTABLE_HEAD_CLASS = `${TABLE_HEAD_CLASS} cursor-pointer hover:text-slate-300 transition-colors`;

/**
 * Input field base styling
 * Used for symbol, shares, buyPrice, DCA inputs
 */
export const INPUT_CLASS =
  "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-slate-400";

/**
 * Disabled input styling
 * Applied to inputs in disabled state (e.g., symbol field when editing)
 */
export const INPUT_DISABLED_CLASS = "disabled:opacity-60";

/**
 * Form label styling
 * Consistent styling for all form labels
 */
export const LABEL_CLASS = "mb-1 block text-xs font-medium text-slate-400";

/**
 * Get profit/loss text color based on profit amount
 * @param profit - The profit amount (positive or negative) * @returns Tailwind color class for text
 */
export const getProfitColor = (profit: number): string =>
  profit >= 0 ? "text-emerald-400" : "text-red-400";

/**
 * Get profit/loss background color (subtle) based on profit amount
 * Useful for highlighting rows or backgrounds
 * @param profit - The profit amount
 * @returns Tailwind color class for background
 */
export const getProfitBgColor = (profit: number): string =>
  profit >= 0 ? "bg-emerald-950/30" : "bg-red-950/30";
