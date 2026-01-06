import { z } from "zod";

/**
 * Schema for creating a new position
 * - symbol: trimmed, uppercased, non-empty
 * - shares: positive number
 * - buyPrice: positive number
 * - dcaPrice: optional positive number
 */
export const createPositionSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol is required")
      .transform((s) => s.toUpperCase()),
    shares: z
      .number()
      .positive("Shares must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "Shares must be greater than 0"),
    buyPrice: z
      .number()
      .positive("Buy price must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "Buy price must be greater than 0"),
    dcaPrice: z
      .number()
      .positive("DCA price must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "DCA price must be greater than 0")
      .optional()
      .nullable(),
  })
  .strict();

export type CreatePositionDto = z.infer<typeof createPositionSchema>;
