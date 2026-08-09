import { PrismaClient } from "@prisma/client";
import dns from "node:dns";

try {
  // Force ipv4first to prevent Windows & Serverless TCP socket drops on Supabase connections
  dns.setDefaultResultOrder("ipv4first");
} catch {
  /* ignore */
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

/**
 * Production-safe Prisma singleton.
 * Reuses one client across HMR and serverless warm invocations to avoid exhausting connections.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

export async function checkDatabaseConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
