'use client';

import React, { useState } from 'react';
import { Calendar, User, Stethoscope, Pill, Activity, FileText, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { MedicalDocument, DocumentType } from '@/types/medical';

interface MedicalTimelineProps {
  documents: MedicalDocument[];
  t?: Record<string, string>;
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ documents, t }) => {
  const [filterType, setFilterType] = useState<string>('all');
  
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No documents available to generate timeline.
      </div>
    );
  }

  const [expandedDocId, setExpandedDocId] = useState<string | null>(documents[0]?.visitDate || null);

  // Group documents by visitDate
  const visitGroups: Record<string, {
    visitDate: string;
    providers: Set<string>;
    doctors: Set<string>;
    docTypes: Set<string>;
    meds: any[];
    labs: any[];
    symptoms: Set<string>;
    diagnosis: Set<string>;
    instructions: Set<string>;
    followUpDates: Set<string>;
    vitals: { bloodPressure?: string; temperature?: string };
    confidence: Record<string, number>;
  }> = {};

  documents.forEach(doc => {
    if (!visitGroups[doc.visitDate]) {
      visitGroups[doc.visitDate] = {
        visitDate: doc.visitDate,
        providers: new Set(),
        doctors: new Set(),
        docTypes: new Set(),
        meds: [],
        labs: [],
        symptoms: new Set(),
        diagnosis: new Set(),
        instructions: new Set(),
        followUpDates: new Set(),
        vitals: {},
        confidence: {}
      };
    }
    const g = visitGroups[doc.visitDate];
    if (doc.healthcareProvider && doc.healthcareProvider !== "Unknown") g.providers.add(doc.healthcareProvider);
    if (doc.doctorName && doc.doctorName !== "Unknown") g.doctors.add(doc.doctorName);
    if (doc.docType) g.docTypes.add(doc.docType);
    
    if (doc.extractedData?.medications) g.meds.push(...doc.extractedData.medications);
    if (doc.extractedData?.labResults) g.labs.push(...doc.extractedData.labResults);
    
    if (doc.extractedData?.symptoms) doc.extractedData.symptoms.forEach(s => g.symptoms.add(s));
    if (doc.extractedData?.diagnosis) doc.extractedData.diagnosis.forEach(d => g.diagnosis.add(d));
    if (doc.extractedData?.instructions) doc.extractedData.instructions.forEach(i => g.instructions.add(i));
    if (doc.extractedData?.followUpDate) g.followUpDates.add(doc.extractedData.followUpDate);
    
    if (doc.extractedData?.vitals?.bloodPressure) g.vitals.bloodPressure = doc.extractedData.vitals.bloodPressure;
    if (doc.extractedData?.vitals?.temperature) g.vitals.temperature = doc.extractedData.vitals.temperature;
    
    if (doc.extractionConfidence) {
      Object.entries(doc.extractionConfidence).forEach(([key, val]) => {
        g.confidence[key] = Math.min(g.confidence[key] || 1, val);
      });
    }
  });

  const sortedVisits = Object.values(visitGroups).sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  const filteredVisits = sortedVisits.filter(v => filterType === 'all' || v.docTypes.has(filterType));

  const toggleExpand = (date: string) => {
    setExpandedDocId(expandedDocId === date ? null : date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t?.timelineHeader || "Chronological Patient Medical Timeline"}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t?.timelineDesc || "Aggregated multi-visit history across healthcare providers"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'all' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            {t?.timelineAllVisits ? `${t.timelineAllVisits} (${sortedVisits.length})` : `All Visits (${sortedVisits.length})`}
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'prescription' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            {t?.timelinePrescriptions || "Prescriptions"}
          </button>
          <button
            onClick={() => setFilterType('lab_report')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'lab_report' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            {t?.timelineLabReports || "Lab Reports"}
          </button>
        </div>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500/50 before:to-slate-200 dark:before:to-slate-800">
        {filteredVisits.map((visit, idx) => {
          const isExpanded = expandedDocId === visit.visitDate;
          const meds = visit.meds;
          const labs = visit.labs;
          const symptoms = Array.from(visit.symptoms);
          const diagnosis = Array.from(visit.diagnosis);
          const instructions = Array.from(visit.instructions);
          const followUps = Array.from(visit.followUpDates).filter(Boolean);
          
          const hasVitals = visit.vitals.bloodPressure || visit.vitals.temperature;
          const hasFindings = symptoms.length > 0 || hasVitals;
          const hasNoData = !hasFindings && diagnosis.length === 0 && meds.length === 0 && instructions.length === 0 && followUps.length === 0 && labs.length === 0;

          return (
            <div key={visit.visitDate} className="relative group">
              <div className="absolute -left-[27px] sm:-left-[31px] top-4 h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 dark:shadow-emerald-950">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
              </div>

              <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-950/60">
                <div 
                  onClick={() => toggleExpand(visit.visitDate)}
                  className="p-5 bg-slate-50/90 dark:bg-slate-900/90 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold">
                      {visit.visitDate} — Clinical Visit
                    </span>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{Array.from(visit.providers).join(', ') || 'Unknown Hospital/Clinic'}</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{Array.from(visit.doctors).join(', ') || 'Unknown Doctor'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 space-y-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40">
                    
                    {hasNoData && (
                       <div className="text-sm text-slate-500 italic">No structured data found for this visit.</div>
                    )}

                    {hasFindings && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-2">
                          Clinical Findings
                          {visit.confidence.symptoms < 0.70 && <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Needs verification</span>}
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {symptoms.length > 0 && <li>Symptoms: {symptoms.join(', ')}</li>}
                          {visit.vitals.bloodPressure && <li>Blood pressure: {visit.vitals.bloodPressure} {visit.confidence.vitals < 0.70 && <span className="text-amber-500 text-xs ml-1">(Needs verification)</span>}</li>}
                          {visit.vitals.temperature && <li>Temperature: {visit.vitals.temperature} {visit.confidence.vitals < 0.70 && <span className="text-amber-500 text-xs ml-1">(Needs verification)</span>}</li>}
                        </ul>
                      </div>
                    )}
                    
                    {diagnosis.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-2">
                          Diagnosis
                          {visit.confidence.diagnosis < 0.70 && <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Needs verification</span>}
                        </h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {diagnosis.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    )}

                    {meds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-3">
                          Prescription
                          {visit.confidence.medications < 0.70 && <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Needs verification</span>}
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                                <th className="py-3 px-4">Medicine</th>
                                <th className="py-3 px-4">Dosage</th>
                                <th className="py-3 px-4">Frequency</th>
                                <th className="py-3 px-4">Duration</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {meds.map((med, i) => (
                                <tr key={med.id || i} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{med.name}</td>
                                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{med.dosage || '-'}</td>
                                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{med.frequency || '-'}</td>
                                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{med.duration || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {labs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-3">
                          Lab Results
                          {visit.confidence.labResults < 0.70 && <span className="ml-2 text-xs font-normal text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">Needs verification</span>}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {labs.map(lab => (
                            <div 
                              key={lab.id} 
                              className={`p-3 rounded-xl border text-sm ${
                                lab.isAbnormal 
                                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200' 
                                  : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <div className="flex justify-between font-semibold mb-1">
                                <span>{lab.testName}</span>
                                <span className="font-bold">{lab.value} {lab.unit}</span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex justify-between">
                                <span>Ref: {lab.referenceRange}</span>
                                {lab.isAbnormal && <span className="text-amber-600 dark:text-amber-400 font-bold">Elevated</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {instructions.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-2">Instructions</h4>
                        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
                          {instructions.map((ins, i) => <li key={i}>{ins}</li>)}
                        </ul>
                      </div>
                    )}

                    {followUps.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-1">Follow-up</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {followUps.join(', ')}
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
