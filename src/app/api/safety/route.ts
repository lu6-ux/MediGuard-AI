import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const maxDuration = 30; // Max serverless function duration

export async function POST(request: NextRequest) {
  try {
    const { medications, allergies, apiKey } = await request.json();

    if (!medications || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: medications or apiKey' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let geminiModel = (process.env.GEMINI_MODEL || 'gemini-2.5-flash').trim().replace(/['"]/g, '');
    if (geminiModel.includes('1.0-pro-vision')) geminiModel = 'gemini-2.5-flash';
    const model = genAI.getGenerativeModel({ model: geminiModel });
    
    const prompt = `
You are a highly experienced clinical pharmacist AI. 
Analyze the following patient profile containing known allergies and a comprehensive list of medications extracted from one or more medical visits.
Perform a deep cross-check for the following safety concerns:
1. "allergy_contradiction": Check if any medication contradicts the patient's known allergies.
2. "drug_interaction": Check for severe drug-drug interactions between any of the medications.
3. "duplicate_prescription": Check if the same drug (or drug class) was prescribed multiple times.
4. "dosage_conflict": Check if there are conflicting dosage instructions for the same medication across different visits.

Here is the data:
Allergies: ${JSON.stringify(allergies)}
Medications (with their source visit dates and IDs):
${JSON.stringify(medications)}

Output a valid JSON object matching exactly this structure:
{
  "alerts": [
    {
      "id": "unique-id-string",
      "type": "allergy_contradiction" | "drug_interaction" | "duplicate_prescription" | "dosage_conflict" | "missing_info",
      "severity": "high" | "warning" | "info",
      "title": "Short title",
      "description": "Detailed explanation of the risk",
      "evidence": ["Quote from the medication list supporting this alert"],
      "recommendation": "Actionable advice for the patient/doctor",
      "affectedMedications": ["Name of drug 1", "Name of drug 2"],
      "docIds": ["docId-of-affected-med-1", "docId-of-affected-med-2"],
      "visitDates": ["visit-date-1", "visit-date-2"]
    }
  ],
  "riskScore": {
    "score": number, // 0 (critical risk) to 100 (perfect safety)
    "riskLevel": "Safe" | "Moderate" | "High Risk",
    "totalAlerts": number,
    "highRiskCount": number,
    "warningCount": number,
    "infoCount": number,
    "summary": "Overall summary of the safety profile",
    "totalMedicationsAnalyzed": ${medications.length},
    "safetyChecksPerformed": 4
  }
}

Do NOT output markdown \`\`\`json blocks. Just output the raw JSON object. If there are no alerts, return an empty alerts array [] and score 100.
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let jsonString = responseText.trim();
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    const analysis = JSON.parse(jsonString);
      
    return NextResponse.json({ data: analysis });
    
  } catch (error: any) {
    console.error('Gemini Safety Analysis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze safety using Gemini API.' },
      { status: 500 }
    );
  }
}
