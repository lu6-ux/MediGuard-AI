import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 60; // Increased duration limit

export async function POST(request: NextRequest) {
  try {
    console.log("[EXTRACT] Request received");
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("[EXTRACT] JSON parse error on request body", e);
      return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { base64Image, mimeType, apiKey: clientApiKey, fileName } = body;

    console.log(`[EXTRACT] Filename: ${fileName || 'Unknown'}`);
    console.log(`[EXTRACT] MIME type: ${mimeType || 'Unknown'}`);
    
    if (!base64Image) {
      console.error("[EXTRACT] Error: base64Image is missing");
      return NextResponse.json(
        { error: 'Missing required parameter: base64Image' },
        { status: 400 }
      );
    }

    const estimatedSize = Math.round((base64Image.length * 3) / 4);
    console.log(`[EXTRACT] File size (estimated bytes): ${estimatedSize}`);

    const serverApiKey = process.env.GEMINI_API_KEY;
    console.log(`[EXTRACT] Gemini configured via server env: ${!!serverApiKey}`);
    
    // We prioritize the server environment variable to keep secrets secure.
    // Fallback to clientApiKey only for legacy compatibility or local debugging if allowed.
    const finalApiKey = serverApiKey || clientApiKey;

    if (!finalApiKey) {
      console.error("[EXTRACT] Error: No Gemini API Key available");
      return NextResponse.json(
        { error: 'Server Error: GEMINI_API_KEY is not configured on the server.' },
        { status: 500 }
      );
    }

    const prompt = `
You are an expert medical data extraction AI.
Read the attached medical document.
DO NOT fabricate information. If a field is uncertain, extract what you can and set confidence to "LOW" or "MEDIUM".

Extract the information and format it STRICTLY as a JSON object matching this TypeScript interface.
DO NOT wrap the output in markdown \`\`\`json blocks. Just return the raw JSON object.

{
  "docType": "prescription" | "lab_report" | "doctor_note" | "discharge_summary" | "other",
  "visitDate": "YYYY-MM-DD" | "Unknown",
  "doctorName": "string or Unknown",
  "healthcareProvider": "string or Unknown",
  "extractedData": {
    "patient": {
      "name": "string",
      "age": 0,
      "gender": "M" | "F" | "Unknown",
      "knownAllergies": ["string"],
      "chronicConditions": ["string"]
    },
    "medications": [
      {
        "id": "generate random string",
        "name": "string",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "confidence": "HIGH" | "MEDIUM" | "LOW"
      }
    ],
    "labResults": [
      {
        "id": "generate random string",
        "testName": "string",
        "value": "string or number",
        "unit": "string",
        "referenceRange": "string",
        "isAbnormal": boolean,
        "confidence": "HIGH" | "MEDIUM" | "LOW"
      }
    ],
    "clinicalFindings": [
      {
        "id": "generate random string",
        "type": "symptom" | "diagnosis" | "vital_sign" | "other",
        "description": "string",
        "value": "string",
        "confidence": "HIGH" | "MEDIUM" | "LOW"
      }
    ],
    "doctorNotes": ["string (Any general clinical notes, findings, or advice)"],
    "recommendations": ["string"]
  }
}

Important Rules:
1. "medications": Do not return "NO MEDICATIONS DETECTED". If none exist, return an empty array []. If text is unreadable but looks like a medication, extract your best guess and mark confidence "LOW".
2. "labResults": Find lab values even if they are buried inside paragraphs.
3. "clinicalFindings": Extract symptoms, diagnoses, and vital signs separately from medications.
`;

    // Remove data:image/... prefix if present
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;

    let geminiModel = (process.env.GEMINI_MODEL || "gemini-3.6-flash").trim().replace(/['"]/g, '');
    if (geminiModel.includes('1.0-pro-vision')) {
        geminiModel = "gemini-3.6-flash";
    }
    console.log(`[EXTRACT] Selected Gemini Model: ${geminiModel}`);

    let resultText = null;
    
    try {
      const genAI = new GoogleGenerativeAI(finalApiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });

      console.log(`[EXTRACT] Sending request via GoogleGenerativeAI SDK`);
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ]);
      
      const response = await result.response;
      resultText = response.text();
      console.log(`[EXTRACT] Model ${geminiModel} succeeded`);
      
    } catch (err: any) {
      console.error(`[EXTRACT] Gemini SDK error for ${geminiModel}`);
      console.error(`[EXTRACT] Message: ${err?.message || 'Unknown'}`);
      
      // Return the actual raw error message so we can debug it!
      return NextResponse.json({ error: `SDK_ERROR: ${err?.message || 'Unknown error'}` }, { status: 500 });
    }

    if (!resultText) {
      console.error("[EXTRACT] Gemini model returned empty text");
      return NextResponse.json({ error: "Gemini model returned empty text" }, { status: 500 });
    }

    console.log(`[EXTRACT] Parsing JSON output...`);
    
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
      console.log(`[EXTRACT] Response parsed: true`);
    } catch (parseError) {
      console.error(`[EXTRACT] Response parsed: false`);
      console.error(`[EXTRACT] Parse Error:`, parseError);
      console.error(`[EXTRACT] Output to parse was:`, resultText.substring(0, 500) + '...');
      return NextResponse.json({ error: "SCHEMA_VALIDATION_ERROR: Failed to parse Gemini output as JSON" }, { status: 500 });
    }

    const docId = `doc-${Date.now()}`;
    
    // Ensure nested objects exist to avoid undefined errors
    if (!extracted.extractedData) {
       extracted.extractedData = {};
    }
    
    extracted.extractedData.medications = (extracted.extractedData.medications || []).map((m: any) => ({
      ...m,
      id: m.id || `med-${Math.random()}`,
      startDate: extracted.visitDate || new Date().toISOString().split('T')[0],
      prescribedBy: extracted.doctorName || "Unknown",
      docId: docId,
      visitId: `visit-${extracted.visitDate || 'unknown'}`,
      status: "active"
    }));

    extracted.extractedData.labResults = (extracted.extractedData.labResults || []).map((l: any) => ({
      ...l,
      id: l.id || `lab-${Math.random()}`,
      testDate: extracted.visitDate || new Date().toISOString().split('T')[0],
      docId: docId,
      visitId: `visit-${extracted.visitDate || 'unknown'}`,
      isAbnormal: typeof l.isAbnormal === 'boolean' ? l.isAbnormal : false
    }));

    extracted.extractedData.clinicalFindings = (extracted.extractedData.clinicalFindings || []).map((f: any) => ({
      ...f,
      id: f.id || `find-${Math.random()}`,
      date: extracted.visitDate || new Date().toISOString().split('T')[0],
      docId: docId,
      visitId: `visit-${extracted.visitDate || 'unknown'}`
    }));

    extracted.extractedData.doctorNotes = extracted.extractedData.doctorNotes || [];
    extracted.extractedData.recommendations = extracted.extractedData.recommendations || [];

    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        fileName: fileName || "uploaded_doc.pdf",
        docType: extracted.docType || "other",
        visitDate: extracted.visitDate || new Date().toISOString().split('T')[0],
        doctorName: extracted.doctorName || "Unknown",
        healthcareProvider: extracted.healthcareProvider || "Unknown",
        extractedData: extracted.extractedData
      }
    });

  } catch (error: any) {
    console.error("[EXTRACT] Unhandled API error:", error);
    return NextResponse.json({ error: `UNKNOWN_EXTRACTION_ERROR: ${error.message || "Failed to process medical document"}` }, { status: 500 });
  }
}
