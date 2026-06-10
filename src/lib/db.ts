import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function resolveConnectionString(): string {
  if (process.env.DIRECT_DATABASE_URL) {
    return process.env.DIRECT_DATABASE_URL;
  }

  const url = process.env.DATABASE_URL ?? "";
  if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
    return url;
  }

  // Prisma local dev proxy — direct Postgres URL from `npx prisma dev`
  return "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
}

const pool = new Pool({ connectionString: resolveConnectionString() });

export const dbAdapter = new PrismaPg(pool);
