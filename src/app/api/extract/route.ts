import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from "@/lib/auth";
import crypto from "crypto";

// Vercel serverless limits
export const maxDuration = 60; 

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ success: false, error: 'INVALID_REQUEST', message: 'Invalid JSON request body' }, { status: 400 });
    }

    const { base64Image, rawText, mimeType, apiKey: clientApiKey, fileName } = body;

    if (!base64Image && !rawText) {
      return NextResponse.json(
        { success: false, error: 'MISSING_PAYLOAD', message: 'Missing required parameter: base64Image or rawText' },
        { status: 400 }
      );
    }

    const serverApiKey = process.env.GEMINI_API_KEY;
    const finalApiKey = serverApiKey || clientApiKey;

    if (!finalApiKey) {
      return NextResponse.json(
        { success: false, error: 'SERVER_CONFIGURATION_ERROR', message: 'Server Error: GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const prompt = `
You are an expert medical data extraction AI.
Your task is to process the provided medical document (which may be an image or noisy OCR text).
Follow this pipeline exactly:

1. OCR / Text Extraction: Read the text carefully. Preserve document layout, tables, row/column relationships, and sections (especially for prescriptions).
2. OCR Text Cleaning: Remove meaningless OCR artifacts, corrupted characters, unnecessary spaces, and obvious capitalization errors. Preserve medically meaningful numbers and units.
3. Medical Entity Extraction: Extract patient info, doctor, hospital, dates, symptoms, vitals, diagnosis, prescriptions, instructions, and follow-up.
   IMPORTANT FOR MEDICATIONS:
   - Look for signals: "Prescription", "Rx", "Medicine", "Medication", "Tablet", "Capsule", "mg", "ml", "morning/night", etc.
   - If medicines are in a table, preserve the row/column mapping.
   - A medicine is valid if it has a name AND at least one other field (dosage, frequency, duration).
   - DO NOT reject a medicine just because route or instructions are missing.
4. Patient Info Extraction: Contextually identify the patient name by looking for labels like "Patient", "Name", "Age". Do not mistake doctor/hospital names for the patient. Do not guess gender unless clear ("M", "Male", "F", "Female", "13Y").
5. Confidence Scoring: Score confidence for each field from 0.0 to 1.0 (e.g., 0.95). 
   - High (>0.85): Clearly readable.
   - Medium (0.70-0.85): Readable but has some noise/typos.
   - Low (<0.70): Corrupted or barely readable. Mark as uncertain.

DO NOT hallucinate or invent information. If a field cannot be confidently extracted, leave it as an empty string/array, or null.
DO NOT guess missing information.

Return STRICTLY a JSON object matching this schema. NO markdown wrapping.
{
  "rawOcrText": "The raw extracted text with all noise",
  "cleanedText": "The cleaned, normalized text",
  "language": "en | si | ta | mixed",
  "docType": "prescription" | "lab_report" | "doctor_note" | "discharge_summary" | "other",
  "visitDate": "YYYY-MM-DD" | "Unknown",
  "doctorName": "string or Unknown",
  "healthcareProvider": "string or Unknown",
  "extractionConfidence": {
    "patientName": 0.0,
    "age": 0.0,
    "gender": 0.0,
    "weight": 0.0,
    "diagnosis": 0.0,
    "medications": 0.0,
    "vitals": 0.0,
    "labResults": 0.0,
    "visitDate": 0.0
  },
  "extractedData": {
    "patient": {
      "name": "string or null", "age": "string or number or null", "gender": "M" | "F" | "Unknown" | null, "weight": "string or null",
      "knownAllergies": ["string"], "chronicConditions": ["string"]
    },
    "vitals": { "bloodPressure": "string or null", "temperature": "string or null" },
    "symptoms": ["string"],
    "diagnosis": ["string"],
    "instructions": ["string"],
    "followUpDate": "string or null",
    "medications": [
      {
        "id": "generate random string",
        "name": "string", "dosage": "string", "frequency": "string", "duration": "string", "route": "string", "instructions": "string"
      }
    ],
    "labResults": [
      {
        "id": "generate random string",
        "testName": "string", "value": "string or number", "unit": "string", "referenceRange": "string",
        "isAbnormal": true
      }
    ],
    "clinicalFindings": [
      {
        "id": "generate random string",
        "type": "symptom" | "diagnosis" | "vital_sign" | "other",
        "description": "string", "value": "string"
      }
    ],
    "doctorNotes": ["string"],
    "recommendations": ["string"]
  }
}
`;

    const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash"; // updated default model

    let resultText = null;
    let lastError: any = null;
    const maxRetries = 3;
    
    // Bounded exponential backoff only for 429
    for (let i = 0; i < maxRetries; i++) {
      try {
        const genAI = new GoogleGenerativeAI(finalApiKey);
        const model = genAI.getGenerativeModel({ model: geminiModel });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); 

        const contentParts: any[] = [prompt];
        
        if (base64Image) {
          const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
          contentParts.push({
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/jpeg'
            }
          });
        } else if (rawText) {
          contentParts.push(rawText);
        }

        const result = await model.generateContent(contentParts, { signal: controller.signal } as any);
        
        clearTimeout(timeoutId);
        
        const response = await result.response;
        resultText = response.text();
        break; // Success!
        
      } catch (err: any) {
        lastError = err;
        
        // Timeout Error handling
        if (err.name === 'AbortError' || err.message.includes('fetch failed') || err.message.includes('timeout')) {
          console.error("[EXTRACT] Gemini request timed out");
          return NextResponse.json({ success: false, error: 'DOCUMENT_PROCESSING_TIMEOUT', message: 'The document took too long to process. Please try again or upload a clearer/smaller document.' }, { status: 504 });
        }

        // Only retry on 429 (Rate Limit) or 503 (Service Unavailable)
        if (err.message.includes('429') || err.message.includes('503')) {
          if (i < maxRetries - 1) {
            const delay = Math.pow(2, i) * 1000; // 1s, 2s, 4s
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        
        // If it's a 400, 403, 500, fail immediately without retrying
        return NextResponse.json({ success: false, error: 'API_ERROR', message: err.message }, { status: 500 });
      }
    }

    if (!resultText) {
      return NextResponse.json({ success: false, error: 'API_ERROR', message: `SDK_ERROR: ${lastError?.message || 'Failed after retries'}` }, { status: 500 });
    }

    // Robust JSON Extraction
    let jsonString = resultText.trim();
    const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
        jsonString = jsonMatch[1].trim();
    } else {
        const firstBrace = resultText.indexOf('{');
        const lastBrace = resultText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonString = resultText.slice(firstBrace, lastBrace + 1);
        }
    }

    let extracted;
    try {
      extracted = JSON.parse(jsonString);
    } catch (parseError) {
      return NextResponse.json({ success: false, error: 'SCHEMA_VALIDATION_ERROR', message: "Failed to parse AI output." }, { status: 500 });
    }

    const docId = crypto.randomUUID();
    if (!extracted.extractedData) extracted.extractedData = {};
    
    extracted.extractedData.medications = (extracted.extractedData.medications || []).map((m: any) => ({
      ...m, id: m.id || crypto.randomUUID(), docId: docId
    }));
    extracted.extractedData.labResults = (extracted.extractedData.labResults || []).map((l: any) => ({
      ...l, id: l.id || crypto.randomUUID(), docId: docId
    }));

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        fileName: fileName || "uploaded_doc.pdf",
        docType: extracted.docType || "other",
        visitDate: extracted.visitDate || new Date().toISOString().split('T')[0],
        doctorName: extracted.doctorName || "Unknown",
        healthcareProvider: extracted.healthcareProvider || "Unknown",
        rawText: extracted.rawOcrText || "",
        cleanedText: extracted.cleanedText || "",
        language: extracted.language || "en",
        extractionConfidence: extracted.extractionConfidence || {},
        extractedData: extracted.extractedData
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'UNKNOWN_ERROR', message: "An unexpected error occurred." }, { status: 500 });
  }
}
