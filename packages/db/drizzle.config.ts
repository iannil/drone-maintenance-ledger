import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema",
  out: "../../database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL ?? "postgresql://localhost:5432/drone_ledger",
  },
} satisfies Config;
