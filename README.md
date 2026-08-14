# MediGuard AI – Intelligent Medical Document Analysis & Safety Assistant

**YGC AI Competition 2026 – Final Round Submission**

MediGuard AI is a production-quality, deep AI medical document analysis and prescription safety cross-checker. Built to tackle real-world multi-visit, multi-provider medical records, MediGuard AI extracts structured data, builds interactive chronological patient timelines, flags complex drug interactions & allergy conflicts, visualizes longitudinal lab result drift, and provides RAG Q&A with confidence scoring and evidence citations.

---

## 🌟 Key Features & Hackathon Capabilities

### 1. Local Doctor Recommendation (Final Round Feature)
- **Automatic High-Risk Detection**: When a high-severity alert is detected (e.g. severe drug interaction or allergy), the system automatically prompts the user to consult a relevant specialist (e.g. Pharmacist, Cardiologist).
- **Auto-Detect Location & Distance**: Integrates with HTML5 Geolocation to automatically detect user coordinates.
- **Google Maps Places API Integration**: Utilizes the Google Maps Places API (New) via a secure Next.js backend proxy route (`/api/doctors`).
- **How the API is Used**: 
  - Uses `places:searchText` endpoint with `X-Goog-FieldMask` optimized for cost and speed (`places.displayName,places.formattedAddress,places.rating,places.nationalPhoneNumber,places.location`).
  - Calculates the exact distance in kilometers from the user to the clinic using the Haversine formula based on the `lat`/`lng` coordinates returned by the API.
  - Automatically sorts doctors so the closest ones are at the top.
  - Generates clickable `tel:` links so users can call the clinic immediately on their mobile devices.

### 2. Multi-Document Entity Extraction
- Extracts patient demographics, allergies, medications (dosage, frequency, duration, status), lab results (test name, value, unit, reference range), and doctor clinical notes.

### 3. Interactive Chronological Patient Timeline
- Visual vertical timeline mapping patient visits across dates, clinics, and physicians.

### 4. Deep Prescription Safety Analysis AI Engine
- **Drug-Drug Interactions**: Flags severe combinations (e.g. Warfarin + Aspirin hemorrhage risk).
- **Allergy Contradictions**: Detects prescribed penicillin derivatives (Amoxicillin) when a Penicillin allergy is documented.
- **Duplicate Prescriptions**: Identifies repeated medications across visits or duplicate dosages.
- **Dosage Conflicts**: Highlights dosage adjustments (e.g. Metformin 500mg BD vs 1000mg OD).
- **Medication Safety Score (0-100)**: Calculates an overall risk gauge.

### 5. Longitudinal Laboratory Trend Visualizer
- Visualizes lab metrics (Fasting Blood Sugar, Serum Creatinine, HbA1c) over time using interactive Recharts.
- Detects value drift above normal limits and provides plain-language AI clinical interpretations with confidence scores.

### 6. RAG Multi-Document Q&A Assistant
- Cross-references all uploaded documents to answer multi-visit questions.
- Displays exact source document citations, text evidence quotes, confidence scores (e.g. 96%), and required medical disclaimers.

### 7. Multi-language Support
- Seamless UI and AI explanation switching between English, Sinhala (සිංහල), and Tamil (தமிழ்).

### 8. Exportable Patient Safety Summary Report
- Single-page printable/downloadable health summary for physician or pharmacist review.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed.
- Google Maps Places API Key

### Installation & Running Locally
```bash
# 1. Navigate to directory
cd mediguard-ai

# 2. Install dependencies
npm install

# 3. Add Environment Variable
# Create a .env.local file in the root directory and add:
# GOOGLE_MAPS_API_KEY=your_api_key_here

# 4. Start development server
npm run dev

# 5. Open in browser
http://localhost:3000
```

---

## 🏗️ Technical Stack & Architecture

- **Frontend Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Glassmorphism Design System
- **Data Visualizations**: Recharts
- **Icons & UI**: Lucide React
- **Location API**: Google Maps Places API (New) via REST
- **NLP & Safety Engine**: Custom Medical Rule & Deterministic RAG Vector Engine + Multi-LLM API Bridge (Gemini / OpenAI / Groq / Hybrid Local)

---

## ⚠️ Medical Disclaimer
MediGuard AI is designed as an AI decision-support and safety screening tool. It does NOT provide medical diagnoses or replace licensed physicians or pharmacists.
