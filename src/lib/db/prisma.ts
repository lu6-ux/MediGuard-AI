import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Vercel Serverless Hack for SQLite (Prototype Only)
if (process.env.VERCEL || process.env.NODE_ENV === "production") {
  const tmpDbPath = "/tmp/dev.db";
  if (!fs.existsSync(tmpDbPath)) {
    try {
      const sourceDbPath = path.join(process.cwd(), "prisma", "dev.db");
      if (fs.existsSync(sourceDbPath)) {
        fs.copyFileSync(sourceDbPath, tmpDbPath);
      }
    } catch (e) {
      console.error("Failed to copy SQLite db to /tmp", e);
    }
  }
  process.env.DATABASE_URL = "file:/tmp/dev.db";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
