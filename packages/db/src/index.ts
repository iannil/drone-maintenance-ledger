/**
 * Database package entry point
 *
 * This package provides:
 * - Database client instance
 * - Schema exports
 * - Migration utilities
 */

export * from "./schema/index.js";

export { drizzle } from "drizzle-orm/postgres-js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL ?? "postgresql://localhost:5432/drone_ledger";

/**
 * Database client instance
 * Use this for querying the database
 */
export const db = drizzle(postgres(connectionString));
