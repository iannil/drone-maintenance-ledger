import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema",
  out: "../../database/migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "../database/local.db",
  },
} satisfies Config;
