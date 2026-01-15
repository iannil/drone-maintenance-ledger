/**
 * Configuration validation schemas
 *
 * Uses Zod for runtime validation with TypeScript type inference
 */

import { z } from "zod";

/**
 * Database configuration schema
 */
export const databaseSchema = z.object({
  DATABASE_URL: z.string().url(),
});

/**
 * JWT configuration schema
 */
export const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
});

/**
 * API configuration schema
 */
export const apiSchema = z.object({
  API_PORT: z.string().transform(Number).default("3001"),
  API_URL: z.string().url().default("http://localhost:3001"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Complete configuration schema
 */
export const configSchema = z
  .object({})
  .merge(databaseSchema)
  .merge(jwtSchema)
  .merge(apiSchema);

export type Config = z.infer<typeof configSchema>;
