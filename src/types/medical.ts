export type Language = 'en' | 'si' | 'ta';

export type DocumentType = 
  | 'prescription'
  | 'lab_report'
  | 'doctor_note'
  | 'discharge_summary';

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  startDate: string;
  prescribedBy: string;
  docId: string;
  visitId: string;
  status: 'active' | 'changed' | 'discontinued';
  notes?: string;
}

export interface LabResult {
  id: string;
  testName: string;
  category: string;
  value: number;
  unit: string;
  referenceRange: string;
  minNormal?: number;
  maxNormal?: number;
  isAbnormal: boolean;
  testDate: string;
  docId: string;
  visitId: string;
}

export interface PatientInfo {
  name: string;
  age: number;
  gender: string;
  knownAllergies: string[];
  chronicConditions: string[];
}

export interface ExtractedData {
  patient: PatientInfo;
  medications: Medication[];
  labResults: LabResult[];
  doctorNotes: string;
  recommendations?: string[];
}

export interface MedicalDocument {
  id: string;
  fileName: string;
  docType: DocumentType;
  visitDate: string;
  doctorName: string;
  healthcareProvider: string;
  rawText: string;
  extractedData: ExtractedData;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  uploadDate: string;
}

export type AlertType = 
  | 'drug_interaction'
  | 'duplicate_prescription'
  | 'dosage_conflict'
  | 'allergy_contradiction';

export type AlertSeverity = 'high' | 'warning' | 'info';

export interface SafetyAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
  affectedMedications: string[];
  docIds: string[];
  visitDates: string[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  visitTitle: string;
  doctorName: string;
  provider: string;
  documentType: DocumentType;
  docId: string;
  medications: Medication[];
  labHighlights: LabResult[];
  notesSnippet: string;
  alertIds: string[];
}

export interface LabTrendDataPoint {
  date: string;
  value: number;
  isAbnormal: boolean;
  visitId: string;
  docId: string;
}

export interface LabTrend {
  metricName: string;
  category: string;
  unit: string;
  referenceRange: string;
  minNormal: number;
  maxNormal: number;
  dataPoints: LabTrendDataPoint[];
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  explanation: string;
  confidenceScore: number;
}

export interface MedicalRiskScore {
  score: number; // 0 (critical risk) to 100 (perfect safety)
  riskLevel: 'Safe' | 'Moderate' | 'High Risk' | 'No Data';
  totalAlerts: number;
  highRiskCount: number;
  warningCount: number;
  infoCount: number;
  summary: string;
  totalMedicationsAnalyzed?: number;
  totalDocumentsAnalyzed?: number;
}

export interface EvidenceCitation {
  docId: string;
  docName: string;
  date: string;
  quote: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  confidenceScore?: number;
  citations?: EvidenceCitation[];
  disclaimer?: string;
}
