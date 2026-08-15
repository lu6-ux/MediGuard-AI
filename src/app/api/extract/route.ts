import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30; // Max serverless function duration

export async function POST(request: NextRequest) {
  try {
    const { base64Image, mimeType, apiKey } = await request.json();

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
          notes?: string;
        }[];
        labResults: {
          id: string; // Generate a random string (e.g. "lab-1")
          testName: string;
          category: string;
          value: number;
          unit: string;
          referenceRange: string; // e.g. "4.0 - 5.6"
          minNormal?: number; // lower bound
          maxNormal?: number; // upper bound
          isAbnormal: boolean; // boolean
          testDate: string; // YYYY-MM-DD
          docId: string; // Use "doc-api"
          visitId: string; // Use "visit-api"
        }[];
        doctorNotes: string; // Any general clinical notes, findings, or advice
        recommendations?: string[];
      }

      Ensure the JSON is perfectly valid and contains no markdown formatting outside of the JSON structure itself.
      Only return the JSON.
    `;

    const modelsToTry = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-1.5-flash-8b',
      'gemini-1.0-pro-vision-latest',
      'gemini-pro-vision'
    ];

    let result = null;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Trying model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType || 'image/jpeg'
            }
          }
        ]);
        
        // If we get here, the model worked! Break the loop.
        break;
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message);
        lastError = err;
        // Continue to the next model in the array
      }
    }

    if (!result) {
      throw lastError || new Error("All Gemini models failed.");
    }

    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown formatting if the model wraps it in ```json ... ```
    let jsonString = text.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    const parsedData = JSON.parse(jsonString);

    return NextResponse.json({ data: parsedData });
    
  } catch (error: any) {
    console.error('Gemini Extraction Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract data using Gemini API.' },
      { status: 500 }
    );
  }
}
