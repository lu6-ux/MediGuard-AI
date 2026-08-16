'use client';

import React, { useState } from 'react';
import { Calendar, User, Stethoscope, Pill, Activity, FileText, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { MedicalDocument, DocumentType } from '@/types/medical';

interface MedicalTimelineProps {
  documents: MedicalDocument[];
}

export const MedicalTimeline: React.FC<MedicalTimelineProps> = ({ documents }) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [expandedDocId, setExpandedDocId] = useState<string | null>(documents[0]?.id || null);

  // Sort documents chronologically
  const sortedDocs = [...documents].sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());

  const filteredDocs = sortedDocs.filter(d => filterType === 'all' || d.docType === filterType);

  const toggleExpand = (id: string) => {
    setExpandedDocId(expandedDocId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>Chronological Patient Medical Timeline</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated multi-visit history across healthcare providers
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'all' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            All Visits ({documents.length})
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'prescription' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setFilterType('lab_report')}
            className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-semibold transition flex-1 sm:flex-none ${filterType === 'lab_report' ? 'bg-emerald-500 text-white dark:text-slate-950' : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'}`}
          >
            Lab Reports
          </button>
        </div>
      </div>

      {/* Vertical Timeline View */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500/50 before:to-slate-200 dark:before:to-slate-800">
        {filteredDocs.map((doc, idx) => {
          const isExpanded = expandedDocId === doc.id;
          const meds = doc.extractedData?.medications || [];
          const labs = doc.extractedData?.labResults || [];

          return (
            <div key={doc.id} className="relative group">
              
              {/* Timeline Node Dot */}
              <div className="absolute -left-[27px] sm:-left-[31px] top-4 h-6 w-6 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 dark:shadow-emerald-950">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{idx + 1}</span>
              </div>

              {/* Event Card */}
              <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700 bg-white/80 dark:bg-slate-950/60">
                
                {/* Event Card Header */}
                <div 
                  onClick={() => toggleExpand(doc.id)}
                  className="p-5 bg-slate-50/90 dark:bg-slate-900/90 cursor-pointer flex items-center justify-between gap-4 select-none hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-sm font-bold">
                      {doc.visitDate}
                    </span>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                        <span>{doc.healthcareProvider}</span>
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                        <Stethoscope className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>{doc.doctorName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="capitalize px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium border border-slate-300 dark:border-slate-700">
                      {doc.docType.replace('_', ' ')}
                    </span>
                    {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="p-5 space-y-5 border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/40">
                    
                    {/* Doctor Clinical Notes */}
                    {doc.extractedData?.doctorNotes && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-1.5 flex items-center space-x-1.5">
                          <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Clinical Findings & Notes</span>
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {doc.extractedData.doctorNotes}
                        </p>
                      </div>
                    )}

                    {/* Prescribed Medications Section */}
                    {meds.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-3 flex items-center space-x-1.5">
                          <Pill className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          <span>Medications Issued ({meds.length})</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {meds.map(med => (
                            <div key={med.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-sm flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">{med.name}</span>
                                <span className="text-slate-500 dark:text-slate-400 ml-2">{med.dosage}</span>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{med.frequency}</p>
                              </div>
                              <span className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                Prescribed
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Results Highlights */}
                    {labs.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-3 flex items-center space-x-1.5">
                          <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Lab Results Record ({labs.length})</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
