/**
 * Database package entry point
 *
 * This package provides:
 * - Database client instance
 * - Schema exports
 * - Migration utilities
 */

export * from "./schema/index.js";

import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL ?? path.join(__dirname, "../../database/local.db");

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

/**
 * Database client instance
 * Use this for querying the database
 */
export const db = drizzle(sqlite);
