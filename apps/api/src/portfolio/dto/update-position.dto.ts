import { z } from "zod";

/**
 * Schema for updating an existing position (partial updates allowed)
 * All fields are optional but must be valid if provided
 */
export const updatePositionSchema = z
  .object({
    symbol: z
      .string()
      .trim()
      .min(1, "Symbol cannot be empty")
      .transform((s) => s.toUpperCase())
      .optional(),
    shares: z
      .number()
      .positive("Shares must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "Shares must be greater than 0")
      .optional(),
    buyPrice: z
      .number()
      .positive("Buy price must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "Buy price must be greater than 0")
      .optional(),
    dcaPrice: z
      .number()
      .positive("DCA price must be greater than 0")
      .or(z.string().transform(Number))
      .refine((val) => val > 0, "DCA price must be greater than 0")
      .optional()
      .nullable(),
  })
  .strict();

export type UpdatePositionDto = z.infer<typeof updatePositionSchema>;
