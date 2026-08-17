import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { base64Image, mimeType, apiKey, fileName } = await request.json();

    if (!base64Image || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: base64Image or apiKey' },
        { status: 400 }
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

    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.0-pro-vision-latest'
    ];

    let resultText = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model via fetch: ${modelName}`);
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Image.split(',')[1] || base64Image
                  }
                }
              ]
            }]
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (resultText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!resultText) {
      throw lastError || new Error("All Gemini models failed");
    }

    let jsonString = resultText.trim();
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    const extracted = JSON.parse(jsonString);

    const docId = `doc-${Date.now()}`;
    
    // Default mapped values
    extracted.extractedData.medications = (extracted.extractedData.medications || []).map((m: any) => ({
      ...m,
      id: m.id || `med-${Math.random()}`,
      startDate: extracted.visitDate,
      prescribedBy: extracted.doctorName,
      docId: docId,
      visitId: `visit-${extracted.visitDate}`,
      status: "active"
    }));

    extracted.extractedData.labResults = (extracted.extractedData.labResults || []).map((l: any) => ({
      ...l,
      id: l.id || `lab-${Math.random()}`,
      date: extracted.visitDate,
      docId: docId,
      visitId: `visit-${extracted.visitDate}`
    }));

    extracted.extractedData.clinicalFindings = (extracted.extractedData.clinicalFindings || []).map((f: any) => ({
      ...f,
      id: f.id || `find-${Math.random()}`
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
        extractedData: extracted.extractedData
      }
    });

  } catch (error: any) {
    console.error("API error in extract", error);
    return NextResponse.json({ error: error.message || "Failed to process medical document" }, { status: 500 });
  }
}
