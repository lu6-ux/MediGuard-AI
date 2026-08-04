import { DocumentType } from '@/types/medical';

export interface DocumentParseResult {
  docType: DocumentType;
  visitDate: string;
  doctorName: string;
  healthcareProvider: string;
  rawText: string;
}

export function parseDocumentContent(text: string, fileName: string): DocumentParseResult {
  const cleanText = text.trim();
  const lowerText = cleanText.toLowerCase();

  // Determine Document Type
  let docType: DocumentType = 'doctor_note';
  if (lowerText.includes('prescription') || lowerText.includes('rx') || lowerText.includes('prescribed') || lowerText.includes('take 1 tablet')) {
    docType = 'prescription';
  } else if (lowerText.includes('laboratory') || lowerText.includes('lab result') || lowerText.includes('fasting blood sugar') || lowerText.includes('creatinine') || lowerText.includes('reference range')) {
    docType = 'lab_report';
  } else if (lowerText.includes('discharge') || lowerText.includes('clinical summary') || lowerText.includes('admission')) {
    docType = 'discharge_summary';
  }

  // Extract Date
  const dateMatch = cleanText.match(/\b(\d{1,2}[-/\s](?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[-/\s]\d{2,4})\b/i);
  let visitDate = dateMatch ? normalizeDate(dateMatch[1]) : new Date().toISOString().split('T')[0];

  // Extract Doctor Name
  const doctorMatch = cleanText.match(/(?:Dr\.|Doctor|Physician)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/);
  const doctorName = doctorMatch ? `Dr. ${doctorMatch[1]}` : "Attending Physician";

  // Extract Provider
  const providerMatch = cleanText.match(/([A-Za-z0-9\s]+(?:Hospital|Clinic|Centre|Center|Healthcare|Medical|Urgent Care))/i);
  const healthcareProvider = providerMatch ? providerMatch[1].trim() : "Healthcare Clinic";

  return {
    docType,
    visitDate,
    doctorName,
    healthcareProvider,
    rawText: cleanText
  };
}

function normalizeDate(rawDateStr: string): string {
  try {
    const d = new Date(rawDateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
}
