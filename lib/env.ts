/**
 * Server-only environment validation
 * Fail fast on missing required environment variables
 *
 * This file should ONLY be imported in server-side code (API routes, server components).
 * Do NOT import this in "use client" components.
 */

// Security: Required environment variables for server-side operations
const REQUIRED_ENV_VARS = ["FINNHUB_API_KEY"] as const;

type EnvVarName = (typeof REQUIRED_ENV_VARS)[number];

/**
 * Validate that all required environment variables are set
 * Call this at server startup or in API routes
 * @throws Error if any required env var is missing
 */
export function validateEnv(): void {
  const missing: EnvVarName[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Check your .env.local file or deployment environment.`,
    );
  }
}

/**
 * Get a required environment variable
 * @param name - Environment variable name
 * @returns The value (guaranteed non-empty if this function returns)
 * @throws Error if the variable is not set
 */
export function getRequiredEnv(name: EnvVarName): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or deployment environment.`,
    );
  }
  return value;
}
