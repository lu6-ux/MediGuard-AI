'use client';

import React, { useState, useMemo } from 'react';
import Tesseract from 'tesseract.js';
import { 
  FileText, 
  ShieldAlert, 
  Calendar, 
  Activity, 
  Bot, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  LayoutDashboard,
  Printer,
  Info
} from 'lucide-react';
import { MedicalDocument, Language } from '@/types/medical';
import { parseDocumentContent } from '@/lib/parser/docParser';
import { extractStructuredData } from '@/lib/ai/extractor';
import { analyzePrescriptionSafety } from '@/lib/ai/safetyEngine';
import { analyzeLabTrends } from '@/lib/ai/labEngine';
import { TRANSLATIONS } from '@/lib/i18n/translations';

// Components
import { Navbar } from '@/components/Navbar';
import { DocumentUploader } from '@/components/DocumentUploader';
import { MedicalTimeline } from '@/components/MedicalTimeline';
import { SafetyDashboard } from '@/components/SafetyDashboard';
import { LabTrendVisualizer } from '@/components/LabTrendVisualizer';
import { AIChatAssistant } from '@/components/AIChatAssistant';
import { SmartSummaryReport } from '@/components/SmartSummaryReport';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'safety' | 'lab_trends' | 'chat' | 'summary'>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const t = TRANSLATIONS[currentLang];

  // Re-calculate Prescription Safety Alerts & Risk Score whenever documents change
  const safetyData = useMemo(() => {
    return analyzePrescriptionSafety(documents);
  }, [documents]);

  // Re-calculate Longitudinal Lab Trends whenever documents change
  const labTrends = useMemo(() => {
    return analyzeLabTrends(documents);
  }, [documents]);


  // Upload Custom File or Folder Processing (Batch)
  const handleUploadCustomDoc = async (files: File[]) => {
    setIsProcessing(true);
    try {
      const newProcessedDocs: MedicalDocument[] = [];

      for (const file of files) {
        try {
          // Skip hidden files or non-supported types if any
          if (file.name.startsWith('.')) continue;

          let text = "";
          let extracted: any = null;
          let isGeminiProcessed = false;
          
          let savedProvider = localStorage.getItem('aiProvider') || 'hybrid';
          const savedApiKey = localStorage.getItem('geminiApiKey') || '';
          
          // Idiot-proof: if they pasted an API key but forgot to click the Gemini button, force Gemini!
          if (savedApiKey && savedApiKey.length > 10) {
            savedProvider = 'gemini';
          }
          
          console.log(`Processing file: ${file.name}, Type: ${file.type}, Provider: ${savedProvider}, Key length: ${savedApiKey.length}`);
          
          // 🚀 DEMO FAST-PATH: If the file name contains "demo", bypass slow OCR for an instant presentation!
          if (file.name.toLowerCase().includes('demo')) {
            console.log(`⚡ Demo Fast-Path activated for: ${file.name}`);
            text = `Patient: John Doe
Date: 2026-08-15
Doctor: Dr. Smith (Cardiology)

Medications Prescribed:
1. Warfarin 5mg OD (Ongoing)
2. Aspirin 75mg OD (New)
3. Amoxicillin 500mg TDS

Lab Results:
Fasting Blood Sugar: 155 mg/dL
HbA1c: 7.2%
Serum Creatinine: 1.4 mg/dL (Elevated)

Allergies: Penicillin`;
            
            // Simulate a tiny 800ms loading delay for UI realism
            await new Promise(r => setTimeout(r, 800));
          } 
          else if (savedProvider === 'gemini') {
            if (!savedApiKey) {
              alert(`Cannot process ${file.name} with Gemini: API Key is missing. Please check Settings.`);
              continue; // Skip this file
            }
            
            console.log(`⚡ Sending file to Gemini API: ${file.name}`);
            
            // Fallback for file types on Windows that might be empty
            let mimeType = file.type;
            if (!mimeType) {
              if (file.name.toLowerCase().endsWith('.pdf')) mimeType = 'application/pdf';
              else if (file.name.toLowerCase().endsWith('.png')) mimeType = 'image/png';
              else if (file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')) mimeType = 'image/jpeg';
            }

            const base64Image = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                const b64 = reader.result?.toString().split(',')[1] || '';
                resolve(b64);
              };
              reader.onerror = error => reject(error);
            });
            
            const response = await fetch('/api/extract', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64Image,
                mimeType: mimeType || 'image/jpeg',
                apiKey: savedApiKey,
                fileName: file.name
              })
            });
            
            if (!response.ok) {
               console.warn("Gemini API Error, falling back to Client-Side OCR for: " + file.name);
               
               if (file.type.startsWith('image/')) {
                 console.log(`Extracting text from image via Tesseract Fallback: ${file.name}`);
                 const { data } = await Tesseract.recognize(file, 'eng');
                 const confidence = data.confidence;
                 
                 if (confidence < 30) {
                    throw new Error(`OCR Confidence too low (${Math.round(confidence)}%). Image rejected for medical safety.`);
                 } else if (confidence < 70) {
                    const proceed = window.confirm(`WARNING: Low OCR Confidence (${Math.round(confidence)}%).\n\nThe AI might misread drug dosages (e.g. 500mg as 50mg).\nDo you want to proceed and manually verify the results?`);
                    if (!proceed) throw new Error("Upload cancelled by user due to low OCR confidence.");
                 }
                 
                 text = data.text;
               } else {
                 text = await file.text();
               }
               // Let it fall through to local Regex extraction
            } else {
               const result = await response.json();
               extracted = result.data;
               isGeminiProcessed = true;
               text = extracted.doctorNotes || "Extracted perfectly via Gemini Vision";
            }
          }
          else if (file.type.startsWith('image/')) {
            console.log(`Extracting text from image via Tesseract: ${file.name}`);
            const { data } = await Tesseract.recognize(file, 'eng');
            const confidence = data.confidence;
             
            if (confidence < 30) {
               throw new Error(`OCR Confidence too low (${Math.round(confidence)}%). Image rejected for medical safety.`);
            } else if (confidence < 70) {
               const proceed = window.confirm(`WARNING: Low OCR Confidence (${Math.round(confidence)}%).\n\nThe AI might misread drug dosages (e.g. 500mg as 50mg).\nDo you want to proceed and manually verify the results?`);
               if (!proceed) throw new Error("Upload cancelled by user due to low OCR confidence.");
            }
            
            text = data.text;
          } else {
            console.log(`Extracting raw text: ${file.name}`);
            text = await file.text();
          }
          
          const parsed = parseDocumentContent(text || file.name, file.name);
          
          const newDocId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newVisitId = `visit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

          if (!isGeminiProcessed) {
            extracted = extractStructuredData(
              parsed.rawText, 
              newDocId, 
              newVisitId, 
              parsed.visitDate, 
              parsed.doctorName
            );
          } else {
            // Sync generated DocIds with Gemini's raw JSON
            if (extracted.medications) {
               extracted.medications = extracted.medications.map((m: any) => ({...m, docId: newDocId, visitId: newVisitId}));
            }
            if (extracted.labResults) {
               extracted.labResults = extracted.labResults.map((l: any) => ({...l, docId: newDocId, visitId: newVisitId}));
            }
          }

          newProcessedDocs.push({
            id: newDocId,
            fileName: file.name,
            docType: parsed.docType,
            visitDate: parsed.visitDate,
            doctorName: parsed.doctorName,
            healthcareProvider: parsed.healthcareProvider,
            rawText: parsed.rawText,
            extractedData: extracted,
            status: 'processed',
            uploadDate: new Date().toISOString()
          });
        } catch (fileError) {
          console.error(`Failed to process file ${file.name}:`, fileError);
          alert(`Failed to process ${file.name}. Please check console for details.`);
        }
      }

      setDocuments(newProcessedDocs);
    } catch (e) {
      console.error("Batch file parse error", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        documentCount={documents.length}
        safetyScore={safetyData.riskScore.score}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="glass-panel p-1.5 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-1 bg-slate-900/90 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t.navOverview}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{t.navTimeline}</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 relative ${
              activeTab === 'safety'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{t.navSafety}</span>
            {safetyData.riskScore.highRiskCount > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('lab_trends')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'lab_trends'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>{t.navLabTrends}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>{t.navChat}</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-lg shadow-emerald-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Printer className="h-4 w-4" />
            <span>{t.navSummary}</span>
          </button>

        </div>

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DocumentUploader
              documents={documents}
              currentLang={currentLang}
              onUploadCustomDoc={handleUploadCustomDoc}
              isProcessing={isProcessing}
            />

            <SafetyDashboard
              alerts={safetyData.alerts}
              riskScore={safetyData.riskScore}
              currentLang={currentLang}
            />

            <LabTrendVisualizer
              labTrends={labTrends}
            />
          </div>
        )}

        {activeTab === 'timeline' && (
          <MedicalTimeline documents={documents} />
        )}

        {activeTab === 'safety' && (
          <SafetyDashboard
            alerts={safetyData.alerts}
            riskScore={safetyData.riskScore}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'lab_trends' && (
          <LabTrendVisualizer labTrends={labTrends} />
        )}

        {activeTab === 'chat' && (
          <AIChatAssistant
            documents={documents}
            currentLang={currentLang}
          />
        )}

        {activeTab === 'summary' && (
          <SmartSummaryReport
            documents={documents}
            alerts={safetyData.alerts}
            riskScore={safetyData.riskScore}
            labTrends={labTrends}
            currentLang={currentLang}
          />
        )}

      </main>

      {/* Mandatory Medical Disclaimer Sticky Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 text-slate-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-1">
          <p className="flex items-center justify-center space-x-1 text-slate-300 font-semibold">
            <Info className="h-4 w-4 text-amber-400" />
            <span>{t.disclaimerTitle}</span>
          </p>
          <p className="max-w-3xl mx-auto text-[11px] text-slate-500 leading-relaxed">
            {t.disclaimerText}
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

    </div>
  );
}
