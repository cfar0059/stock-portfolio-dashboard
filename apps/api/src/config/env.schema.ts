import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  API_PORT: z.coerce.number().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const formatted = result.error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${formatted}`);
  }
  return result.data;
}
