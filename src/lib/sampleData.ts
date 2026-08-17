import { MedicalDocument } from '@/types/medical';

export const YGC_SAMPLE_PATIENT = {
  name: "K. Rajendran",
  age: 58,
  gender: "Male",
  knownAllergies: ["Penicillin", "Beta-lactam antibiotics"],
  chronicConditions: ["Hypertension", "Prediabetes / Type 2 Diabetes", "Atrial Fibrillation"],
  confidence: "HIGH" as const
};

export const YGC_SAMPLE_DOCUMENTS: MedicalDocument[] = [
  {
    id: "doc-v1",
    fileName: "Visit_1_Initial_Assessment_Jan2025.pdf",
    docType: "discharge_summary",
    visitDate: "2025-01-15",
    doctorName: "Dr. A. Arisudan (MD)",
    healthcareProvider: "City General Hospital - Internal Medicine",
    uploadDate: "2025-01-15T09:30:00Z",
    status: "processed",
    rawText: `
CITY GENERAL HOSPITAL - DISCHARGE & ASSESSMENT REPORT
Patient Name: K. Rajendran | Age: 58 | Sex: Male
Date of Visit: 15-Jan-2025 | Ref: CGH-88492
Attending Physician: Dr. A. Arisudan, MD

CLINICAL SUMMARY:
Patient presented for annual executive health checkup. Patient reports mild fatigue.
Past Medical History: Mild hypertension.

DOCUMENTED ALLERGIES:
- SEVERE PENICILLIN ALLERGY (Developed severe anaphylactic skin rash, hives & bronchospasm in 2018).

LABORATORY INVESTIGATIONS:
- Fasting Blood Sugar (FBS): 105 mg/dL (Reference: 70 - 99 mg/dL) [Slightly Elevated]
- Serum Creatinine: 0.90 mg/dL (Reference: 0.60 - 1.20 mg/dL) [Normal]
- HbA1c: 5.9 % (Reference: < 5.7 %) [Prediabetic Range]
- Total Cholesterol: 195 mg/dL (Reference: < 200 mg/dL) [Normal]

RECOMMENDATION:
Lifestyle modification, low glycemic diet, daily 30 min exercise. Re-check glucose in 6 months.
    `,
    extractedData: {
      patient: YGC_SAMPLE_PATIENT,
      medications: [],
      labResults: [
        {
          id: "lab-v1-1",
          testName: "Fasting Blood Sugar",
          category: "Glucose & Diabetes",
          value: 105,
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          minNormal: 70,
          maxNormal: 99,
          isAbnormal: true,
          testDate: "2025-01-15",
          docId: "doc-v1",
          visitId: "v1"
        },
        {
          id: "lab-v1-2",
          testName: "Serum Creatinine",
          category: "Renal Function",
          value: 0.90,
          unit: "mg/dL",
          referenceRange: "0.60 - 1.20 mg/dL",
          minNormal: 0.60,
          maxNormal: 1.20,
          isAbnormal: false,
          testDate: "2025-01-15",
          docId: "doc-v1",
          visitId: "v1"
        },
        {
          id: "lab-v1-3",
          testName: "HbA1c",
          category: "Glucose & Diabetes",
          value: 5.9,
          unit: "%",
          referenceRange: "< 5.7 %",
          minNormal: 4.0,
          maxNormal: 5.7,
          isAbnormal: true,
          testDate: "2025-01-15",
          docId: "doc-v1",
          visitId: "v1"
        }
      ],
      doctorNotes: "Initial health check. Noted severe Penicillin allergy. Fasting glucose 105 mg/dL, HbA1c 5.9%. Recommended diet & exercise."
    }
  },
  {
    id: "doc-v2",
    fileName: "Visit_2_Endocrinology_Prescription_Aug2025.pdf",
    docType: "prescription",
    visitDate: "2025-08-10",
    doctorName: "Dr. S. Perera (Endocrinologist)",
    healthcareProvider: "Apex Health Specialist Clinic",
    uploadDate: "2025-08-10T14:15:00Z",
    status: "processed",
    rawText: `
APEX HEALTH SPECIALIST CLINIC
Doctor: Dr. S. Perera, MBBS, MD (Endocrinology)
Date: 10-Aug-2025 | Patient: K. Rajendran (58/M)

DIAGNOSIS:
Prediabetes progressing to early Type 2 Diabetes Mellitus.

LABORATORY RESULTS:
- Fasting Blood Sugar: 124 mg/dL (Reference: 70 - 99 mg/dL) [Elevated]
- Serum Creatinine: 1.10 mg/dL (Reference: 0.60 - 1.20 mg/dL) [Normal]
- HbA1c: 6.3 %

PRESCRIPTION:
1. Metformin 500 mg - Take 1 tablet twice daily (after breakfast & dinner) for 90 days.

SPECIAL INSTRUCTIONS:
Monitor blood sugar levels weekly. Avoid high carbohydrate foods.
    `,
    extractedData: {
      patient: YGC_SAMPLE_PATIENT,
      medications: [
        {
          id: "med-v2-1",
          name: "Metformin",
          dosage: "500 mg",
          frequency: "Twice daily (BD)",
          duration: "90 days",
          startDate: "2025-08-10",
          prescribedBy: "Dr. S. Perera",
          docId: "doc-v2",
          visitId: "v2",
          status: "active",
          notes: "Take 1 tablet twice daily after meals"
        }
      ],
      labResults: [
        {
          id: "lab-v2-1",
          testName: "Fasting Blood Sugar",
          category: "Glucose & Diabetes",
          value: 124,
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          minNormal: 70,
          maxNormal: 99,
          isAbnormal: true,
          testDate: "2025-08-10",
          docId: "doc-v2",
          visitId: "v2"
        },
        {
          id: "lab-v2-2",
          testName: "Serum Creatinine",
          category: "Renal Function",
          value: 1.10,
          unit: "mg/dL",
          referenceRange: "0.60 - 1.20 mg/dL",
          minNormal: 0.60,
          maxNormal: 1.20,
          isAbnormal: false,
          testDate: "2025-08-10",
          docId: "doc-v2",
          visitId: "v2"
        }
      ],
      doctorNotes: "Fast glucose rose to 124 mg/dL. Initiated Metformin 500mg twice daily."
    }
  },
  {
    id: "doc-v3",
    fileName: "Visit_3_Cardiology_Consultation_Jan2026.pdf",
    docType: "prescription",
    visitDate: "2026-01-22",
    doctorName: "Dr. N. Fernando (Cardiologist)",
    healthcareProvider: "National Heart & Cardiology Centre",
    uploadDate: "2026-01-22T11:00:00Z",
    status: "processed",
    rawText: `
NATIONAL HEART & CARDIOLOGY CENTRE
Physician: Dr. N. Fernando, MD, FRCP
Date: 22-Jan-2026 | Patient: K. Rajendran (58/M)

CHIEF COMPLAINT:
Palpitations and irregular pulse. ECG shows non-valvular Atrial Fibrillation.

LABORATORY WORK:
- Fasting Blood Sugar: 138 mg/dL (Reference: 70 - 99 mg/dL) [High]
- Serum Creatinine: 1.20 mg/dL (Reference: 0.60 - 1.20 mg/dL) [Borderline High]
- INR: 2.3 (Therapeutic Target: 2.0 - 3.0)

PRESCRIPTION:
1. Warfarin 5 mg - Take 1 tablet once daily at night.
(Anticoagulant therapy to prevent stroke in Atrial Fibrillation).

WARNING:
Do NOT start any new NSAIDs or blood thinners without consulting cardiology.
    `,
    extractedData: {
      patient: YGC_SAMPLE_PATIENT,
      medications: [
        {
          id: "med-v3-1",
          name: "Warfarin",
          dosage: "5 mg",
          frequency: "Once daily (OD) at night",
          duration: "Ongoing",
          startDate: "2026-01-22",
          prescribedBy: "Dr. N. Fernando",
          docId: "doc-v3",
          visitId: "v3",
          status: "active",
          notes: "Anticoagulant blood thinner for Atrial Fibrillation"
        }
      ],
      labResults: [
        {
          id: "lab-v3-1",
          testName: "Fasting Blood Sugar",
          category: "Glucose & Diabetes",
          value: 138,
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          minNormal: 70,
          maxNormal: 99,
          isAbnormal: true,
          testDate: "2026-01-22",
          docId: "doc-v3",
          visitId: "v3"
        },
        {
          id: "lab-v3-2",
          testName: "Serum Creatinine",
          category: "Renal Function",
          value: 1.20,
          unit: "mg/dL",
          referenceRange: "0.60 - 1.20 mg/dL",
          minNormal: 0.60,
          maxNormal: 1.20,
          isAbnormal: false,
          testDate: "2026-01-22",
          docId: "doc-v3",
          visitId: "v3"
        }
      ],
      doctorNotes: "Diagnosed Atrial Fibrillation. Prescribed Warfarin 5mg daily. Glucose elevated to 138 mg/dL."
    }
  },
  {
    id: "doc-v4",
    fileName: "Visit_4_UrgentCare_Prescription_Jun2026.pdf",
    docType: "prescription",
    visitDate: "2026-06-30",
    doctorName: "Dr. M. Vimal (Emergency & Urgent Care)",
    healthcareProvider: "Metro Emergency Clinic",
    uploadDate: "2026-06-30T16:45:00Z",
    status: "processed",
    rawText: `
METRO EMERGENCY & URGENT CARE CLINIC
Doctor: Dr. M. Vimal, MBBS
Date: 30-Jun-2026 | Patient: K. Rajendran (58/M)

PRESENTING SYMPTOMS:
Upper respiratory tract symptoms, fever, chest congestion, and chest soreness.

LABORATORY PANELS:
- Fasting Blood Sugar: 156 mg/dL (Reference: 70 - 99 mg/dL) [CRITICAL HIGH TREND - Diabetic range]
- Serum Creatinine: 1.45 mg/dL (Reference: 0.60 - 1.20 mg/dL) [ABNORMAL HIGH TREND - Impaired Renal Clearance]
- HbA1c: 7.1 % (Reference: < 5.7 %) [Uncontrolled Diabetes]

PRESCRIPTIONS ISSUED:
1. Aspirin 100 mg - Take 1 tablet once daily morning for chest/joint inflammation.
2. Amoxicillin 500 mg - Take 1 capsule three times daily for 7 days for chest infection.
3. Amoxicillin 250 mg - Take 1 capsule daily.
4. Metformin 1000 mg - Take 1 tablet once daily.
    `,
    extractedData: {
      patient: YGC_SAMPLE_PATIENT,
      medications: [
        {
          id: "med-v4-1",
          name: "Aspirin",
          dosage: "100 mg",
          frequency: "Once daily (OD) morning",
          duration: "14 days",
          startDate: "2026-06-30",
          prescribedBy: "Dr. M. Vimal",
          docId: "doc-v4",
          visitId: "v4",
          status: "active"
        },
        {
          id: "med-v4-2",
          name: "Amoxicillin",
          dosage: "500 mg",
          frequency: "Three times daily (TDS)",
          duration: "7 days",
          startDate: "2026-06-30",
          prescribedBy: "Dr. M. Vimal",
          docId: "doc-v4",
          visitId: "v4",
          status: "active"
        },
        {
          id: "med-v4-3",
          name: "Amoxicillin",
          dosage: "250 mg",
          frequency: "Once daily (OD)",
          duration: "7 days",
          startDate: "2026-06-30",
          prescribedBy: "Dr. M. Vimal",
          docId: "doc-v4",
          visitId: "v4",
          status: "active"
        },
        {
          id: "med-v4-4",
          name: "Metformin",
          dosage: "1000 mg",
          frequency: "Once daily (OD)",
          duration: "Ongoing",
          startDate: "2026-06-30",
          prescribedBy: "Dr. M. Vimal",
          docId: "doc-v4",
          visitId: "v4",
          status: "changed"
        }
      ],
      labResults: [
        {
          id: "lab-v4-1",
          testName: "Fasting Blood Sugar",
          category: "Glucose & Diabetes",
          value: 156,
          unit: "mg/dL",
          referenceRange: "70 - 99 mg/dL",
          minNormal: 70,
          maxNormal: 99,
          isAbnormal: true,
          testDate: "2026-06-30",
          docId: "doc-v4",
          visitId: "v4"
        },
        {
          id: "lab-v4-2",
          testName: "Serum Creatinine",
          category: "Renal Function",
          value: 1.45,
          unit: "mg/dL",
          referenceRange: "0.60 - 1.20 mg/dL",
          minNormal: 0.60,
          maxNormal: 1.20,
          isAbnormal: true,
          testDate: "2026-06-30",
          docId: "doc-v4",
          visitId: "v4"
        },
        {
          id: "lab-v4-3",
          testName: "HbA1c",
          category: "Glucose & Diabetes",
          value: 7.1,
          unit: "%",
          referenceRange: "< 5.7 %",
          minNormal: 4.0,
          maxNormal: 5.7,
          isAbnormal: true,
          testDate: "2026-06-30",
          docId: "doc-v4",
          visitId: "v4"
        }
      ],
      doctorNotes: "Urgent care visit for chest infection. Prescribed Aspirin 100mg, Amoxicillin 500mg, Amoxicillin 250mg, and modified Metformin to 1000mg once daily. FBS elevated to 156 mg/dL, Creatinine 1.45 mg/dL."
    }
  }
];
