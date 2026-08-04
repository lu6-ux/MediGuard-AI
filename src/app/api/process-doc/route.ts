import { NextRequest, NextResponse } from 'next/server';
import { parseDocumentContent } from '@/lib/parser/docParser';
import { extractStructuredData } from '@/lib/ai/extractor';
import { analyzePrescriptionSafety } from '@/lib/ai/safetyEngine';
import { analyzeLabTrends } from '@/lib/ai/labEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, fileName } = body;

    if (!rawText) {
      return NextResponse.json({ error: "rawText parameter is required" }, { status: 400 });
    }

    const parsed = parseDocumentContent(rawText, fileName || "uploaded_doc.pdf");
    const docId = `doc-${Date.now()}`;
    const visitId = `visit-${Date.now()}`;

    const extracted = extractStructuredData(
      parsed.rawText,
      docId,
      visitId,
      parsed.visitDate,
      parsed.doctorName
    );

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        fileName: fileName || "uploaded_doc.pdf",
        docType: parsed.docType,
        visitDate: parsed.visitDate,
        doctorName: parsed.doctorName,
        healthcareProvider: parsed.healthcareProvider,
        extractedData: extracted
      }
    });
  } catch (error) {
    console.error("API error in process-doc", error);
    return NextResponse.json({ error: "Failed to process medical document" }, { status: 500 });
  }
}
