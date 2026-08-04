import { NextRequest, NextResponse } from 'next/server';
import { answerMedicalQuestion } from '@/lib/ai/ragEngine';
import { YGC_SAMPLE_DOCUMENTS } from '@/lib/sampleData';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, documents } = body;

    if (!question) {
      return NextResponse.json({ error: "question parameter is required" }, { status: 400 });
    }

    const docsToUse = documents && documents.length > 0 ? documents : YGC_SAMPLE_DOCUMENTS;
    const result = answerMedicalQuestion(question, docsToUse);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      confidenceScore: result.confidenceScore,
      citations: result.citations,
      disclaimer: result.disclaimer
    });
  } catch (error) {
    console.error("API error in chat", error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
