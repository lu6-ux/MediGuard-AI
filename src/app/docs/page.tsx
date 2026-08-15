import React from 'react';
import { ShieldAlert, MapPin, Database, Activity, Printer, Info, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-10">
          <Link href="/" className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm hover:bg-slate-800 transition-colors">
            ← Back to App
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-emerald-400 mr-2" />
            MediGuard AI Documentation
          </h1>
        </div>

        {/* Hero Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/50 shadow-xl space-y-4">
          <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-semibold mb-2">
            YGC AI Competition 2026 – Final Round Submission
          </div>
          <p className="text-slate-300 leading-relaxed text-lg">
            MediGuard AI is a production-quality, deep AI medical document analysis and prescription safety cross-checker. Built to tackle real-world multi-visit, multi-provider medical records, it extracts structured data, builds interactive timelines, flags complex drug interactions, visualizes lab trends, and provides RAG Q&A with evidence citations.
          </p>
        </div>

        {/* Final Round Feature Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center">
            <MapPin className="h-6 w-6 text-blue-400 mr-3" />
            Local Doctor Recommendation (Final Round Feature)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
              icon={<ShieldAlert className="h-5 w-5 text-rose-400" />}
              title="Automatic High-Risk Detection"
              desc="When a high-severity alert is detected (e.g. severe drug interaction or allergy), the system automatically prompts the user to consult a specifically mapped specialist (e.g. Pharmacist, Cardiologist)."
            />
            <FeatureCard 
              icon={<MapPin className="h-5 w-5 text-blue-400" />}
              title="Auto-Detect Location & Distance"
              desc="Integrates with HTML5 Geolocation to detect user coordinates. Calculates exact distance in km using the real-time Haversine mathematical formula."
            />
            <FeatureCard 
              icon={<Database className="h-5 w-5 text-emerald-400" />}
              title="Google Maps Places API Proxy"
              desc="Uses places:searchText endpoint with X-Goog-FieldMask optimized for speed. Securely routed through a Next.js serverless backend to protect API keys."
            />
            <FeatureCard 
              icon={<CheckCircle2 className="h-5 w-5 text-teal-400" />}
              title="UX Innovations"
              desc="Automatically sorts closest doctors to the top, flags the ✨ Closest Match, provides direct Get Directions deep-linking, and 1-click tel: mobile dialing."
            />
          </div>
        </div>

        {/* Round 1 Core Features */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center">
            <Activity className="h-6 w-6 text-purple-400 mr-3" />
            Core AI Safety Engine (Round 1)
          </h2>
          <ul className="space-y-4 text-slate-300">
            <li className="flex items-start">
              <ChevronRight className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <div><strong className="text-white">Multi-Document Entity Extraction:</strong> Extracts demographics, allergies, medications, lab results, and clinical notes directly in-browser.</div>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <div><strong className="text-white">Deep Prescription Safety Analysis:</strong> Flags Drug-Drug Interactions, Allergy Contradictions, Duplicate Prescriptions, and Dosage Conflicts.</div>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <div><strong className="text-white">Longitudinal Lab Trend Visualizer:</strong> Visualizes lab metrics (Fasting Blood Sugar, Serum Creatinine) over time with Recharts.</div>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <div><strong className="text-white">RAG Q&A Assistant:</strong> Answers multi-visit questions with exact source document citations and confidence scores.</div>
            </li>
            <li className="flex items-start">
              <ChevronRight className="h-5 w-5 text-emerald-500 mr-2 shrink-0 mt-0.5" />
              <div><strong className="text-white">Multi-language Support:</strong> Seamless UI switching between English, Sinhala (සිංහල), and Tamil (தமிழ்).</div>
            </li>
          </ul>
        </div>

        {/* Architecture */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-white border-b border-slate-800 pb-3 flex items-center">
            <Database className="h-6 w-6 text-amber-400 mr-3" />
            Technical Stack
          </h2>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-slate-300">
            <p><strong>Frontend Framework:</strong> Next.js 14 (App Router) + TypeScript</p>
            <p><strong>Styling:</strong> Tailwind CSS + Glassmorphism Design System</p>
            <p><strong>Data Visualizations:</strong> Recharts</p>
            <p><strong>Location API:</strong> Google Maps Places API (New) via Serverless REST</p>
            <p><strong>NLP Engine:</strong> Custom Medical Rule & Deterministic RAG Vector Engine</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start space-x-3 text-slate-400 text-sm">
          <Info className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <p>
            <strong>Medical Disclaimer:</strong> MediGuard AI is designed as an AI decision-support and safety screening tool. It does NOT provide medical diagnoses or replace licensed physicians or pharmacists. All local clinic routing is based on public directories.
          </p>
        </div>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
          {icon}
        </div>
        <h3 className="font-bold text-slate-100">{title}</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
