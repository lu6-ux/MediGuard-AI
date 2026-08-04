# MediGuard AI – Intelligent Medical Document Analysis & Safety Assistant

**YGC AI Competition 2026 – Round 1 Submission**

MediGuard AI is a production-quality, deep AI medical document analysis and prescription safety cross-checker. Built to tackle real-world multi-visit, multi-provider medical records, MediGuard AI extracts structured data, builds interactive chronological patient timelines, flags complex drug interactions & allergy conflicts, visualizes longitudinal lab result drift, and provides RAG Q&A with confidence scoring and evidence citations.

---

## 🌟 Key Features & Hackathon Capabilities

### 1. Multi-Document Entity Extraction
- Extracts patient demographics, allergies, medications (dosage, frequency, duration, status), lab results (test name, value, unit, reference range), and doctor clinical notes.

### 2. Interactive Chronological Patient Timeline
- Visual vertical timeline mapping patient visits across dates, clinics, and physicians.

### 3. Deep Prescription Safety Analysis AI Engine
- **Drug-Drug Interactions**: Flags severe combinations (e.g. Warfarin + Aspirin hemorrhage risk).
- **Allergy Contradictions**: Detects prescribed penicillin derivatives (Amoxicillin) when a Penicillin allergy is documented.
- **Duplicate Prescriptions**: Identifies repeated medications across visits or duplicate dosages.
- **Dosage Conflicts**: Highlights dosage adjustments (e.g. Metformin 500mg BD vs 1000mg OD).
- **Medication Safety Score (0-100)**: Calculates an overall risk gauge.

### 4. Longitudinal Laboratory Trend Visualizer
- Visualizes lab metrics (Fasting Blood Sugar, Serum Creatinine, HbA1c) over time using interactive Recharts.
- Detects value drift above normal limits and provides plain-language AI clinical interpretations with confidence scores.

### 5. RAG Multi-Document Q&A Assistant
- Cross-references all uploaded documents to answer multi-visit questions.
- Displays exact source document citations, text evidence quotes, confidence scores (e.g. 96%), and required medical disclaimers.

### 6. Multi-language Support
- Seamless UI and AI explanation switching between English, Sinhala (සිංහල), and Tamil (தமிழ்).

### 7. Exportable Patient Safety Summary Report
- Single-page printable/downloadable health summary for physician or pharmacist review.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed.

### Installation & Running Locally
```bash
# 1. Navigate to directory
cd C:\Users\PC\.gemini\antigravity\scratch\mediguard-ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 🏗️ Technical Stack & Architecture

- **Frontend Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism Design System
- **Data Visualizations**: Recharts
- **Icons & UI**: Lucide React
- **NLP & Safety Engine**: Custom Medical Rule & Deterministic RAG Vector Engine + Multi-LLM API Bridge (Gemini / OpenAI / Groq / Hybrid Local)

---

## ⚠️ Medical Disclaimer
MediGuard AI is designed as an AI decision-support and safety screening tool. It does NOT provide medical diagnoses or replace licensed physicians or pharmacists.
