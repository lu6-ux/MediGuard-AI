'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { ArrowLeft, FileText, Calendar, User, Activity, AlertCircle, Pill, FileCode, AlertTriangle } from 'lucide-react';
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
  
  // Identify low confidence fields
  const lowConfidenceFields: string[] = [];
  if (conf.patientName && conf.patientName < 0.70) lowConfidenceFields.push("Patient Name");
  if (conf.age && conf.age < 0.70) lowConfidenceFields.push("Age");
  if (conf.gender && conf.gender < 0.70) lowConfidenceFields.push("Gender");
  if (conf.diagnosis && conf.diagnosis < 0.70) lowConfidenceFields.push("Diagnosis");
  if (conf.medications && conf.medications < 0.70) lowConfidenceFields.push("Medications");
  if (conf.vitals && conf.vitals < 0.70) lowConfidenceFields.push("Vitals");
  if (conf.labResults && conf.labResults < 0.70) lowConfidenceFields.push("Lab Results");

  const totalScoredFields = Object.keys(conf).length;
  const uncertainCount = lowConfidenceFields.length;
  
  let statusColor = "emerald";
  let statusTitle = "🟢 Most information extracted successfully";
  
  if (totalScoredFields > 0 && uncertainCount > 0) {
    statusColor = "amber";
    statusTitle = "🟡 Some information needs verification";
  } else if (totalScoredFields === 0 || (totalScoredFields > 0 && uncertainCount === totalScoredFields)) {
    statusColor = "rose";
    statusTitle = "🔴 Document could not be completely processed";
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => router.push('/documents')}
        className="flex items-center space-x-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Documents</span>
      </button>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-start space-x-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{document.fileName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{document.visitDate}</span>
                </span>
                {document.doctorName && document.doctorName !== "Unknown" && (
                  <span className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{document.doctorName}</span>
                  </span>
                )}
                <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium capitalize">
                  {document.docType.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Extraction Status UI */}
        <div className={`mb-6 p-4 rounded-xl border ${
          statusColor === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
          statusColor === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
          'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
        }`}>
          <div className="flex flex-col space-y-2">
            <h3 className={`font-bold ${
              statusColor === 'emerald' ? 'text-emerald-800 dark:text-emerald-200' :
              statusColor === 'amber' ? 'text-amber-800 dark:text-amber-200' :
              'text-rose-800 dark:text-rose-200'
            }`}>{statusTitle}</h3>
            
            {uncertainCount > 0 ? (
              <div className={`text-sm ${
                statusColor === 'amber' ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'
              }`}>
                <p className="mb-1">The following fields could not be read with sufficient confidence:</p>
                <ul className="list-disc pl-5">
                  {lowConfidenceFields.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              </div>
            ) : totalScoredFields > 0 ? (
              <p className="text-sm text-emerald-700 dark:text-emerald-300">{totalScoredFields} fields extracted successfully.</p>
            ) : null}
          </div>
        </div>
        
        {/* Local Doctor Recommendation for Low Confidence / Testing */}
        <DoctorRecommender 
          flagContext="general" 
          currentLang={currentLang} 
          showRecommender={true} 
          issueDescription={uncertainCount > 0 ? (t.doctorLowConfidenceIssue || 'Some medical information could not be clearly read from the document. We recommend consulting a healthcare professional to verify these details.') : (t.doctorRecommendedConsultation || 'Consultation recommended to verify document details.')}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          
          <div className="space-y-8">
            {/* Patient Info */}
            {(ex.patient?.name || ex.patient?.age || ex.patient?.gender || ex.patient?.knownAllergies?.length > 0) && (
            <section>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-500" />
                <span>{t.docInformation || 'Patient Information'}</span>
              </h3>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  {ex.patient?.name && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t.patientName || 'Name'}</span>
                      <span className="text-sm text-slate-900 dark:text-white font-medium">{ex.patient.name}</span>
                    </div>
                  )}
                  {(ex.patient?.age || ex.patient?.gender) && (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Age & Gender</span>
                      <span className="text-sm text-slate-900 dark:text-white font-medium">
                        {ex.patient.age || '—'} • {ex.patient.gender || '—'}
                      </span>
                    </div>
                  )}
                </div>
                {ex.patient?.knownAllergies?.length > 0 && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t.knownAllergies || 'Allergies'}</span>
                    <div className="flex flex-wrap gap-2">
                      {ex.patient.knownAllergies.map((allergy: string, i: number) => (
                        <span key={i} className="text-xs bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
            )}
            
            {/* Clinical Findings & Vitals */}
            {((ex.symptoms && ex.symptoms.length > 0) || ex.vitals?.bloodPressure || ex.vitals?.temperature) && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-rose-500" />
                  <span>Clinical Findings & Vitals</span>
                </h3>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
                  {ex.vitals?.bloodPressure && (
                    <div className="text-sm flex justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Blood Pressure:</span>
                      <span className="text-slate-900 dark:text-white">{ex.vitals.bloodPressure}</span>
                    </div>
                  )}
                  {ex.vitals?.temperature && (
                    <div className="text-sm flex justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">Temperature:</span>
                      <span className="text-slate-900 dark:text-white">{ex.vitals.temperature}</span>
                    </div>
                  )}
                  {ex.symptoms && ex.symptoms.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Symptoms</span>
                      <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                        {ex.symptoms.map((s: string, i: number) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}
            
            {/* Diagnosis */}
            {ex.diagnosis && ex.diagnosis.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span>Diagnosis</span>
                </h3>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
                  <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                    {ex.diagnosis.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </section>
            )}

            {/* Medications */}
            {ex.medications && ex.medications.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-purple-500" />
                  <span>{t.timelinePrescriptions || 'Medications'}</span>
                </h3>
                <div className="space-y-3">
                  {ex.medications.map((med: any, i: number) => (
                    <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{med.name}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {med.dosage} • {med.frequency} {med.duration && `• ${med.duration}`}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-8">
            {/* Lab Results */}
            {ex.labResults && ex.labResults.length > 0 && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  <span>{t.timelineLabReports || 'Lab Results'}</span>
                </h3>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{t.testName || 'Test'}</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{t.result || 'Result'}</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">{t.status || 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {ex.labResults.map((lab: any, i: number) => (
                        <tr key={i}>
                          <td className="px-4 py-3 text-slate-900 dark:text-slate-300 font-medium">{lab.testName}</td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {lab.value} <span className="text-xs">{lab.unit}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              lab.isAbnormal 
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            }`}>
                              {lab.isAbnormal ? 'Abnormal' : 'Normal'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Instructions and Follow-up */}
            {((ex.instructions && ex.instructions.length > 0) || ex.followUpDate) && (
              <section>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span>Instructions & Follow-up</span>
                </h3>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
                  {ex.instructions && ex.instructions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Instructions</h4>
                      <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        {ex.instructions.map((inst: string, i: number) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {ex.followUpDate && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Follow-up Date</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{ex.followUpDate}</p>
                    </div>
                  )}
                </div>
              </section>
            )}
            
            {/* Unstructured / Fallback Notes */}
            {ex.doctorNotes && ex.doctorNotes.length > 0 && (
              <section>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Other Notes</h3>
                 <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{ex.doctorNotes}"</p>
                 </div>
              </section>
            )}
            
            {/* Raw OCR Text Section for Auditing */}
            <section className="pt-8 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={() => setShowRawText(!showRawText)}
                  className="flex items-center space-x-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <FileCode className="h-4 w-4" />
                  <span>{showRawText ? 'Hide Raw OCR Text' : 'View Raw OCR Text (Debugging & Auditing)'}</span>
                </button>
                
                {showRawText && (
                  <div className="mt-4 bg-slate-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                      {document.rawText || "No raw text available."}
                    </pre>
                  </div>
                )}
            </section>
            
          </div>
        </div>
      </div>
    </div>
  );
}
