import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth";

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  try {
    // Ensure document belongs to user
    const doc = await prisma.medicalDocument.findUnique({
      where: { id }
    });

    if (!doc || doc.userId !== session.userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.medicalDocument.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE Document Error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = params.id;
  try {
    const doc = await prisma.medicalDocument.findUnique({
      where: { id }
    });

    if (!doc || doc.userId !== session.userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const parsedDoc = {
      ...doc,
      extractedData: JSON.parse(doc.extractedDataJson),
      extractionConfidence: doc.confidenceJson ? JSON.parse(doc.confidenceJson) : undefined
    };

    return NextResponse.json(parsedDoc);
  } catch (error) {
    return NextResponse.json({ error: "Failed to get document" }, { status: 500 });
  }
}
