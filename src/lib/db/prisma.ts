import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";



const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL;
let finalUrl = dbUrl;

if (finalUrl) {
  // If the user appended ?pgbouncer=true but used a ? instead of & when there were already parameters, fix it.
  if (finalUrl.includes('?') && finalUrl.split('?').length > 2) {
    // Basic repair for double question marks
    const parts = finalUrl.split('?');
    finalUrl = parts[0] + '?' + parts.slice(1).join('&');
  }
  
  // Ensure pgbouncer is present if using port 6543
  if (finalUrl.includes('6543') && !finalUrl.includes('pgbouncer=true')) {
    const separator = finalUrl.includes('?') ? '&' : '?';
    finalUrl = `${finalUrl}${separator}pgbouncer=true&connection_limit=1`;
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(finalUrl ? {
  datasources: {
    db: {
      url: finalUrl as string
    }
  }
} : undefined)

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
