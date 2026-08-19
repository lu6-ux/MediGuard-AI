import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const docs = await prisma.medicalDocument.findMany({
    where: { userId: session.userId as string },
    orderBy: { uploadDate: "desc" }
  });

  const parsedDocs = docs.map(d => ({
    ...d,
    extractedData: JSON.parse(d.extractedDataJson),
    extractionConfidence: d.confidenceJson ? JSON.parse(d.confidenceJson) : undefined
  }));

  return NextResponse.json(parsedDocs);
}

