/**
 * Environment Configuration Schema
 *
 * Validates environment variables at application startup using Zod.
 * Provides clear error messages for missing or invalid configuration.
 */

import { z } from "zod";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env files
// Priority: .env.local > .env (relative to project root)
config({ path: resolve(process.cwd(), "../../.env.local") });
config({ path: resolve(process.cwd(), "../../.env") });
// Also try loading from current directory for standalone runs
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/**
 * Environment configuration schema
 */
export const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development")
    .describe("Application environment"),

  // API Configuration
  API_PORT: z.coerce
    .number()
    .int()
    .positive()
    .default(3001)
    .describe("API server port"),

  // Database
  DATABASE_URL: z
    .string()
    .optional()
    .describe("Database connection URL (default: local SQLite)"),

  // JWT Authentication
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security")
    .describe("Secret key for JWT signing"),

  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]?$|^\d+$/, "JWT_EXPIRES_IN must be a valid duration (e.g., '7d', '24h', '3600')")
    .default("7d")
    .describe("JWT token expiration time"),

  // CORS
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:3000")
    .describe("Allowed CORS origins (comma-separated)"),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "debug", "verbose"])
    .default("info")
    .describe("Logging level"),

  // Rate Limiting
  RATE_LIMIT_SHORT_TTL: z.coerce
    .number()
    .int()
    .positive()
    .default(1000)
    .describe("Short rate limit TTL in milliseconds"),

  RATE_LIMIT_SHORT_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(10)
    .describe("Short rate limit max requests"),

  RATE_LIMIT_MEDIUM_TTL: z.coerce
    .number()
    .int()
    .positive()
    .default(60000)
    .describe("Medium rate limit TTL in milliseconds"),

  RATE_LIMIT_MEDIUM_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(100)
    .describe("Medium rate limit max requests"),

  RATE_LIMIT_LONG_TTL: z.coerce
    .number()
    .int()
    .positive()
    .default(3600000)
    .describe("Long rate limit TTL in milliseconds"),

  RATE_LIMIT_LONG_LIMIT: z.coerce
    .number()
    .int()
    .positive()
    .default(1000)
    .describe("Long rate limit max requests"),
});

/**
 * Inferred type from the schema
 */
export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validated environment configuration
 * Throws an error at startup if validation fails
 */
let cachedConfig: EnvConfig | null = null;

/**
 * Validate and return environment configuration
 *
 * @returns Validated configuration object
 * @throws Error if validation fails
 */
export function validateEnv(): EnvConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors.map((err) => {
      const path = err.path.join(".");
      return `  - ${path}: ${err.message}`;
    });

    console.error("\n╔════════════════════════════════════════════════════════════╗");
    console.error("║               Environment Configuration Error                ║");
    console.error("╠════════════════════════════════════════════════════════════╣");
    console.error("║                                                              ║");
    console.error("║  The following environment variables are missing or invalid: ║");
    console.error("║                                                              ║");
    errors.forEach((err) => {
      console.error(`║ ${err.padEnd(60)}║`);
    });
    console.error("║                                                              ║");
    console.error("║  Please check your .env file or environment variables.      ║");
    console.error("║                                                              ║");
    console.error("╚════════════════════════════════════════════════════════════╝\n");

    throw new Error(`Environment validation failed: ${errors.join(", ")}`);
  }

  cachedConfig = result.data;
  return cachedConfig;
}

/**
 * Get validated config (alias for validateEnv)
 */
export function getConfig(): EnvConfig {
  return validateEnv();
}

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return getConfig().NODE_ENV === "production";
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return getConfig().NODE_ENV === "development";
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return getConfig().NODE_ENV === "test";
}
