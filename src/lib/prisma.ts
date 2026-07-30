import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function isTransientConnectionError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as { code?: string }).code === "P1001"
  );
}

/**
 * Retries a batch of Prisma queries once (with a short backoff) if it fails
 * with P1001 ("Can't reach database server"). The pooled Supabase connection
 * occasionally drops a burst of simultaneous queries — most often right after
 * a fresh login when several dashboard queries fire in parallel — and a
 * single retry reliably succeeds. Non-connection errors are rethrown as-is.
 */
export async function withDbRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 250): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isTransientConnectionError(error) || attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}
