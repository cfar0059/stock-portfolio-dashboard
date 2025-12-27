/**
 * Server-only environment validation
 * Fail fast on missing required environment variables
 *
 * This file should ONLY be imported in server-side code (API routes, server components).
 * Do NOT import this in "use client" components.
 *
 * AWS Amplify Gen 1 SSR Compatibility:
 * - Amplify injects environment variables via process.env at runtime
 * - Variables must be configured in Amplify Console → App settings → Environment variables
 * - For SSR apps, ensure variables are available to the Lambda/SSR function
 */

// Security: Required environment variables for server-side operations
const REQUIRED_ENV_VARS = ["FINNHUB_API_KEY"] as const;

type EnvVarName = (typeof REQUIRED_ENV_VARS)[number];

/**
 * Get an environment variable with Amplify SSR fallback
 * Amplify Gen 1 SSR: process.env is populated at runtime by Amplify
 *
 * @param name - Environment variable name
 * @returns The value or undefined if not set
 */
function getEnvValue(name: string): string | undefined {
  // Primary: Standard process.env (works for local, Vercel, and Amplify SSR)
  const value = process.env[name];

  if (value) {
    console.log(`[env] Found ${name} via process.env`);
    return value;
  }

  // Debug: Log all available env keys (masked) to help diagnose Amplify issues
  // This runs only when the primary lookup fails
  console.log(`[env] ${name} not found in process.env`);
  console.log(
    `[env] Available env keys:`,
    Object.keys(process.env).filter(
      (k) =>
        k.includes("FINNHUB") ||
        k.includes("API") ||
        k.includes("SECRET") ||
        k.includes("AWS") ||
        k.includes("AMPLIFY"),
    ),
  );

  return undefined;
}

/**
 * Validate that all required environment variables are set
 * Call this at server startup or in API routes
 * @throws Error if any required env var is missing
 */
export function validateEnv(): void {
  const missing: EnvVarName[] = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    if (!getEnvValue(envVar)) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `Check your .env.local file or deployment environment (Amplify Console → Environment variables).`,
    );
  }
}

/**
 * Get a required environment variable with Amplify SSR support
 * @param name - Environment variable name
 * @returns The value (guaranteed non-empty if this function returns)
 * @throws Error if the variable is not set
 */
export function getRequiredEnv(name: EnvVarName): string {
  const value = getEnvValue(name);
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or deployment environment (Amplify Console → Environment variables).`,
    );
  }
  return value;
}

/**
 * Get the Finnhub API key (convenience function)
 * @returns The Finnhub API key
 * @throws Error if not set
 */
export function getFinnhubApiKey(): string {
  return getRequiredEnv("FINNHUB_API_KEY");
}
