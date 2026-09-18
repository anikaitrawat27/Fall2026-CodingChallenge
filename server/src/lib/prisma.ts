import { PrismaClient } from "@prisma/client";

/**
 * A single shared Prisma client for the whole server.
 * Creating one per request would exhaust the database connection pool.
 */
export const prisma = new PrismaClient();
