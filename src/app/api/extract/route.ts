import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30; // Max serverless function duration

export async function POST(request: NextRequest) {
  try {
    const { base64Image, mimeType, apiKey, fileName } = await request.json();

    if (!base64Image || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: base64Image or apiKey' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    const prompt = `
      You are an expert medical data extraction AI.
      Read the attached medical document (prescription, lab report, or doctor note).
      Extract the following information and format it STRICTLY as a JSON object matching this TypeScript interface:

      interface ExtractedData {
        patient: {
          name: string; // Patient name
          age: number; // Age in years (integer), default to 0 if unknown
          gender: string; // 'M', 'F', or 'Unknown'
          knownAllergies: string[]; // List of allergies explicitly mentioned
          chronicConditions: string[]; // List of chronic conditions/diagnoses mentioned
        };
        medications: {
          id: string; // Generate a random short UUID or string (e.g. "med-1")
          name: string; // Name of the drug
          dosage: string; // e.g. "500mg"
          frequency: string; // e.g. "Twice daily" or "BD"
          duration?: string; // e.g. "5 days"
          startDate: string; // YYYY-MM-DD
          prescribedBy: string; // Doctor name
          docId: string; // Use "doc-api"
          visitId: string; // Use "visit-api"
          status: "active" | "changed" | "discontinued";
        }[];
        doctorNotes: string; // Any general clinical notes, findings, or advice
        recommendations?: string[];
      }

      Ensure the JSON is perfectly valid and contains no markdown formatting outside of the JSON structure itself.
      Only return the JSON.
    `;

    const savedProvider = 'gemini';
    const file = { type: mimeType || 'image/jpeg' };
    
    let isGeminiProcessed = false;
    let extracted: Record<string, any> = {};

    if (savedProvider === 'gemini') {
      try {
        console.log(`Using Gemini API (Vision) with fetch fallback for AQ keys...`);
        
        let prompt = `You are a medical data extraction AI. Extract the structured medical data from this medical document (image). 
Return ONLY a valid JSON object matching this schema, no markdown, no other text:
{
  "patientName": "string or Unknown",
  "visitDate": "YYYY-MM-DD or Unknown",
  "doctorName": "string or Unknown",
  "medications": ["string"],
  "labResults": ["string"],
  "allergies": ["string"]
}`;

        // Ensure proper mime type
        const mimeType = file.type || 'image/jpeg';
        
        const modelsToTry = [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-1.5-flash-8b',
          'gemini-1.0-pro-vision-latest',
          'gemini-pro-vision'
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
                        mimeType: mimeType,
                        data: base64Image
                      }
                    }
                  ]
                }]
              })
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(`[${response.status}] ${response.statusText} - ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
              resultText = data.candidates[0].content.parts[0].text;
              console.log(`Success with model ${modelName}`);
              break;
            } else {
              throw new Error("Invalid response structure from Gemini API");
            }
            
          } catch (err: any) {
            console.warn(`Model ${modelName} failed:`, err.message);
            lastError = err;
          }
        }

        if (!resultText) {
          // Diagnostic fallback
          try {
            const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            if (listRes.ok) {
              const data = await listRes.json();
              const availableModels = data.models
                .map((m: any) => m.name.replace('models/', ''))
                .filter((name: string) => name.includes('gemini'))
                .join(', ');
              
              throw new Error(`Your API Key is restricted. It only has access to these models: ${availableModels || 'None'}. Please generate a new key at aistudio.google.com!`);
            }
          } catch (listErr) {}
          
          throw lastError || new Error("All Gemini models failed.");
        }

        // Clean up markdown formatting if the model wraps it in ```json ... ```
        let jsonString = resultText.trim();
        if (jsonString.startsWith('```json')) {
          jsonString = jsonString.slice(7, -3).trim();
        } else if (jsonString.startsWith('```')) {
          jsonString = jsonString.slice(3, -3).trim();
        }

        extracted = JSON.parse(jsonString);
        isGeminiProcessed = true;
      }

      return NextResponse.json({ data: extracted });
    
  } catch (error: any) {
    console.error('Gemini Extraction Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract data using Gemini API.' },
      { status: 500 }
    );
  }
}
