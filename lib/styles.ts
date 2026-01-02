/**
 * Centralized style constants and helper functions
 * Single source of truth for UI styling across the application
 */

/**
 * Table header styling classes
 * Used for all table header cells
 */
export const TABLE_HEAD_CLASS =
  "h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 transition-colors text-muted-foreground";

/**
 * Sortable table header styling classes
 * Extends TABLE_HEAD_CLASS with interactive states
 */
export const SORTABLE_HEAD_CLASS = `${TABLE_HEAD_CLASS} cursor-pointer hover:text-foreground transition-colors`;

/**
 * Input field base styling
 * Used for symbol, shares, buyPrice, DCA inputs
 */
export const INPUT_CLASS =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-ring";

/**
 * Disabled input styling
 * Applied to inputs in disabled state (e.g., symbol field when editing)
 */
export const INPUT_DISABLED_CLASS = "disabled:opacity-60";

/**
 * Form label styling
 * Consistent styling for all form labels
 */
export const LABEL_CLASS =
  "mb-1 block text-xs font-medium text-muted-foreground";

/**
 * Get profit/loss text color based on profit amount
 * @param profit - The profit amount (positive or negative) * @returns Tailwind color class for text
 */
export const getProfitColor = (profit: number): string =>
  profit >= 0 ? "text-primary" : "text-destructive";

/**
 * Get profit/loss background color (subtle) based on profit amount
 * Useful for highlighting rows or backgrounds
 * @param profit - The profit amount
 * @returns Tailwind color class for background
 */
export const getProfitBgColor = (profit: number): string =>
  profit >= 0 ? "bg-primary/10" : "bg-destructive/10";
