import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
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
  } catch (error) {
    console.error("GET Documents Error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    
    // We expect an array of documents or a single document
    const newDocs = Array.isArray(body) ? body : [body];
    
    const createdDocs = await Promise.all(newDocs.map(async (doc) => {
      const created = await prisma.medicalDocument.create({
        data: {
          id: doc.id,
          userId: session.userId,
          fileName: doc.fileName || "unnamed_document",
          docType: doc.docType || "unclassified",
          visitDate: doc.visitDate || new Date().toISOString().split('T')[0],
          doctorName: doc.doctorName || "Unknown",
          healthcareProvider: doc.healthcareProvider || "Unknown",
          rawText: doc.rawText || "",
          cleanedText: doc.cleanedText || null,
          language: doc.language || "en",
          status: doc.status || "processed",
          extractedDataJson: JSON.stringify(doc.extractedData || {}),
          confidenceJson: doc.extractionConfidence ? JSON.stringify(doc.extractionConfidence) : null,
          uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date()
        }
      });
      return {
        ...created,
        extractedData: JSON.parse(created.extractedDataJson),
        extractionConfidence: created.confidenceJson ? JSON.parse(created.confidenceJson) : undefined
      };
    }));

    return NextResponse.json(createdDocs);
  } catch (error) {
    console.error("POST Documents Error:", error);
    return NextResponse.json({ error: "Failed to save documents" }, { status: 500 });
  }
}
