import { PrismaClient } from "@/generated/prisma/client";
import { dbAdapter } from "@/lib/db";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: dbAdapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
