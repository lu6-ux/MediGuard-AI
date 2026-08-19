'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ArrowLeft, FileText, Calendar, User, Activity, AlertCircle, Pill, FileCode, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DoctorRecommender } from '@/components/DoctorRecommender';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { documents, currentLang } = useMedical();
  const t = TRANSLATIONS[currentLang];
  const [showRawText, setShowRawText] = useState(false);
  
  const docId = params.id as string;
  const document = documents.find(d => d.id === docId);

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Document not found</h2>
        <button onClick={() => router.push('/documents')} className="mt-4 text-emerald-600 hover:underline">
          &larr; Back to documents
        </button>
      </div>
    );
  }

  const ex = document.extractedData || {};
  const conf = document.extractionConfidence || {};
  
  // Field-level confidence helpers
  const isConfident = (field: string) => conf[field] === undefined || conf[field] >= 0.70;
  
  const hasPatientData = ex.patient?.name || ex.patient?.age || ex.patient?.gender || ex.patient?.weight;
  
  // Determine overall status
  const lowConfidenceFields: string[] = Object.entries(conf)
    .filter(([_, score]) => (score as number) < 0.70)
    .map(([key]) => key);
    
  const uncertainCount = lowConfidenceFields.length;
  const totalScoredFields = Object.keys(conf).length;
  
  let statusColor = "emerald";
  let statusTitle = "🟢 Processed Successfully";
  let statusDesc = "All vital information was extracted clearly.";
  
  if (totalScoredFields > 0 && uncertainCount > 0) {
    statusColor = "amber";
    statusTitle = "🟡 Partially Processed";
    statusDesc = "Most important information was extracted successfully.\nSome details need verification.";
  } else if (totalScoredFields === 0 || (totalScoredFields > 0 && uncertainCount === totalScoredFields)) {
    statusColor = "rose";
    statusTitle = "🔴 Needs Manual Review";
    statusDesc = "We could not confidently extract the structured data. Please verify against the raw document.";
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <button 
        onClick={() => router.push('/documents')}
        className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Documents</span>
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 capitalize">
                {document.docType.replace('_', ' ')}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{document.fileName}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{document.visitDate}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Extraction Status */}
        <div className="mb-8">
          <h3 className={`font-bold text-lg mb-1 ${
            statusColor === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
            statusColor === 'amber' ? 'text-amber-600 dark:text-amber-400' :
            'text-rose-600 dark:text-rose-400'
          }`}>{statusTitle}</h3>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line mb-4">
            {statusDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-300">
            {hasPatientData && (
              <div className="flex items-center space-x-2">
                {isConfident('patientName') ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span>Patient information</span>
              </div>
            )}
            {ex.diagnosis && ex.diagnosis.length > 0 && (
              <div className="flex items-center space-x-2">
                {isConfident('diagnosis') ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span>Diagnosis</span>
              </div>
            )}
            {ex.patient?.weight && (
              <div className="flex items-center space-x-2">
                {isConfident('weight') ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span>Weight</span>
              </div>
            )}
            {ex.medications && ex.medications.length > 0 && (
              <div className="flex items-center space-x-2">
                {isConfident('medications') ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span>{isConfident('medications') ? 'Prescription details' : 'Some prescription details need verification'}</span>
              </div>
            )}
            {!isConfident('visitDate') && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Visit date needs verification</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
          
          {/* Patient Information */}
          {hasPatientData && (
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-4">
                {ex.patient?.name && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-xs font-semibold">👤 Patient Name</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {ex.patient.name}
                    </div>
                  </div>
                )}
                {ex.patient?.age && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-xs font-semibold">🎂 Age</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {ex.patient.age.toString().includes('year') ? ex.patient.age : `${ex.patient.age} years`}
                    </div>
                  </div>
                )}
                {ex.patient?.gender && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-xs font-semibold">⚥ Gender</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {ex.patient.gender}
                    </div>
                  </div>
                )}
                {ex.patient?.weight && (
                  <div>
                    <div className="flex items-center space-x-1.5 text-slate-500 dark:text-slate-400 mb-1">
                      <span className="text-xs font-semibold">⚖️ Weight</span>
                    </div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {ex.patient.weight}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Clinical Information */}
          {ex.diagnosis && ex.diagnosis.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                Clinical Information
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 block">Diagnosis</span>
                  <div className="font-medium text-slate-900 dark:text-white">
                    {ex.diagnosis.join(', ')}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Prescription */}
          {ex.medications && ex.medications.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                Prescription
              </h3>
              
              <div className="space-y-4">
                {ex.medications.map((med: any, i: number) => (
                  <div key={i} className="flex flex-col py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                    <div className="mb-2">
                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Medicine {i + 1}</div>
                      <div className="font-semibold text-slate-900 dark:text-white text-base">
                        {med.name || <span className="text-amber-600 italic text-sm">Needs verification</span>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Strength</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{med.dosage || <span className="text-amber-600 italic text-xs">Needs verification</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Frequency</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{med.frequency || <span className="text-amber-600 italic text-xs">Needs verification</span>}</span>
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Duration</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{med.duration || <span className="text-amber-600 italic text-xs">Needs verification</span>}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isConfident('medications') && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                  <span>⚠ Some medicine information needs verification.</span>
                </div>
              )}
            </section>
          )}
          
          {/* AI Safety Analysis */}
          <section className="pt-8">
             <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                AI Safety Analysis
              </h3>
             <DoctorRecommender 
                flagContext="general" 
                currentLang={currentLang} 
                showRecommender={true} 
                issueDescription=""
              />
          </section>

          {/* Raw OCR Text Section */}
          <section className="pt-8 mt-8">
              <button 
                onClick={() => setShowRawText(!showRawText)}
                className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                <span>{showRawText ? 'Show Raw OCR Text ▼' : 'Show Raw OCR Text ▼'}</span>
              </button>
              
              {showRawText && (
                <div className="mt-4 bg-slate-900 rounded-xl p-4 overflow-x-auto">
                  <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {document.rawText || "No raw text available."}
                  </pre>
                </div>
              )}
          </section>

        </div>
      </div>
    </div>
  );
}
