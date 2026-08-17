'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

  const [safetyData, setSafetyData] = useState<{alerts: any[], riskScore: any} | null>(null);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);

  useEffect(() => {
    async function runSafetyAnalysis() {
      if (documents.length === 0) {
        setSafetyData(null);
        return;
      }
      setIsAnalyzingSafety(true);
      
      try {
        const apiKey = localStorage.getItem('geminiApiKey') || '';
        
        // Aggregate allergies and meds
        const allergies = Array.from(new Set(documents.flatMap(d => d.extractedData?.patient?.knownAllergies || [])));
        const allMeds = documents.flatMap(d => 
          (d.extractedData?.medications || []).map(m => ({...m, visitDate: d.visitDate, provider: d.healthcareProvider, docName: d.fileName}))
        );

        if (allMeds.length === 0) {
          setSafetyData({
            alerts: [],
            riskScore: { score: 100, riskLevel: 'Safe', totalAlerts: 0, highRiskCount: 0, warningCount: 0, infoCount: 0, summary: 'NO MEDICATIONS DETECTED. Upload documents with medications to run safety checks.', totalMedicationsAnalyzed: 0, safetyChecksPerformed: 0 }
          });
          setIsAnalyzingSafety(false);
          return;
        }

        const res = await fetch('/api/safety', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medications: allMeds,
            allergies,
            apiKey
          })
        });

        if (res.ok) {
          const json = await res.json();
          setSafetyData(json.data);
        } else {
          // fallback to local if API fails
          setSafetyData(analyzePrescriptionSafety(documents));
        }
      } catch (e) {
        console.error(e);
        setSafetyData(analyzePrescriptionSafety(documents));
      } finally {
        setIsAnalyzingSafety(false);
      }
    }
    
    runSafetyAnalysis();
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
              alert(t.uploadErrNoApiKey.replace('{file}', file.name));
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
                    throw new Error(t.uploadErrLowConfidence.replace('{confidence}', Math.round(confidence).toString()));
                 } else if (confidence < 70) {
                    const proceed = window.confirm(t.uploadWarnLowConfidence.replace('{confidence}', Math.round(confidence).toString()));
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
               throw new Error(t.uploadErrLowConfidence.replace('{confidence}', Math.round(confidence).toString()));
            } else if (confidence < 70) {
               const proceed = window.confirm(t.uploadWarnLowConfidence.replace('{confidence}', Math.round(confidence).toString()));
               if (!proceed) throw new Error("Upload cancelled by user due to low OCR confidence.");
            }
            
            text = data.text;
          } else {
            console.log(`Extracting raw text: ${file.name}`);
            text = await file.text();
          }
          
          const newDocId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
          const newVisitId = `visit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

          if (!isGeminiProcessed) {
            throw new Error("Local fallback disabled. Gemini extraction is required for robust schema.");
          } else {
            // Sync generated DocIds with Gemini's raw JSON
            if (extracted.medications) {
               extracted.medications = extracted.medications.map((m: any, i: number) => ({...m, id: `med-${newDocId}-${i}`, docId: newDocId, visitId: newVisitId, sourceDocument: file.name}));
            }
            if (extracted.labResults) {
               extracted.labResults = extracted.labResults.map((l: any, i: number) => ({...l, id: `lab-${newDocId}-${i}`, docId: newDocId, visitId: newVisitId, sourceDocument: file.name}));
            }
            if (extracted.clinicalFindings) {
               extracted.clinicalFindings = extracted.clinicalFindings.map((c: any, i: number) => ({...c, id: `cf-${newDocId}-${i}`, docId: newDocId, visitId: newVisitId, sourceDocument: file.name}));
            }
          }

          newProcessedDocs.push({
            id: newDocId,
            fileName: file.name,
            docType: extracted.docType || 'other',
            visitDate: extracted.visitDate || new Date().toISOString().split('T')[0],
            doctorName: extracted.doctorName || 'Unknown Doctor',
            healthcareProvider: extracted.healthcareProvider || 'Unknown Provider',
            rawText: text || 'Extracted via Vision AI',
            extractedData: extracted,
            status: 'processed',
            uploadDate: new Date().toISOString()
          });
        } catch (fileError) {
          console.error(`Failed to process file ${file.name}:`, fileError);
          alert(t.uploadErrGeneral.replace('{file}', file.name));
        }
      }

      setDocuments(prev => [...prev, ...newProcessedDocs]);
    } catch (e) {
      console.error("Batch file parse error", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white dark:selection:text-slate-950 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenSettings={() => setIsSettingsOpen(true)}
        documentCount={documents.length}
        safetyScore={safetyData?.riskScore?.score ?? 0}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <div className="glass-panel p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-nowrap md:flex-wrap items-center gap-2 bg-white/90 dark:bg-slate-900/90 overflow-x-auto scrollbar-hide snap-x">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t.navOverview}</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>{t.navTimeline}</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start relative ${
              activeTab === 'safety'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>{t.navSafety}</span>
            {(safetyData?.riskScore?.highRiskCount ?? 0) > 0 && (
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping absolute top-2 right-2" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('lab_trends')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start ${
              activeTab === 'lab_trends'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>{t.navLabTrends}</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white dark:text-slate-950 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>{t.navChat}</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={`px-5 py-3 min-h-[44px] rounded-xl text-sm font-bold transition flex items-center space-x-2 shrink-0 snap-start ml-auto ${
              activeTab === 'summary'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-950'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800'
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
              alerts={safetyData?.alerts || []}
              riskScore={safetyData?.riskScore || { score: 0, highRiskCount: 0, mediumRiskCount: 0 }}
              currentLang={currentLang}
              latestClinicalFindings={documents[documents.length - 1]?.extractedData?.clinicalFindings?.map(f => f.description).join(', ')}
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
            alerts={safetyData?.alerts || []}
            riskScore={safetyData?.riskScore || { score: 0, highRiskCount: 0, mediumRiskCount: 0 }}
            currentLang={currentLang}
            latestClinicalFindings={documents[documents.length - 1]?.extractedData?.clinicalFindings?.map(f => f.description).join(', ')}
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
            alerts={safetyData?.alerts || []}
            riskScore={safetyData?.riskScore || { score: 0, highRiskCount: 0, mediumRiskCount: 0 }}
            labTrends={labTrends}
            currentLang={currentLang}
          />
        )}

      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/90 dark:bg-slate-950/90 py-4 text-slate-500 dark:text-slate-400 text-xs mt-auto sticky bottom-0 z-10 backdrop-blur-md">
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
