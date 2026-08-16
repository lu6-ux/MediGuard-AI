'use client';

import React from 'react';
import { Download, Printer, ShieldAlert, FileText, Activity, Pill, User, AlertTriangle, Stethoscope } from 'lucide-react';
import { MedicalDocument, SafetyAlert, MedicalRiskScore, LabTrend, Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';

interface SmartSummaryReportProps {
  documents: MedicalDocument[];
  alerts: SafetyAlert[];
  riskScore: MedicalRiskScore;
  labTrends: LabTrend[];
  currentLang: Language;
}

export const SmartSummaryReport: React.FC<SmartSummaryReportProps> = ({
  documents,
  alerts,
  riskScore,
  labTrends,
  currentLang
}) => {
  const t = TRANSLATIONS[currentLang];
  const patient = documents[0]?.extractedData?.patient;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Print Button */}
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            <span>{t.summaryReportTitle}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.summaryReportSubtitle}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950 transition"
        >
          <Printer className="h-4 w-4 stroke-[2.5]" />
          <span>{t.summaryPrintBtn}</span>
        </button>
      </div>

      {/* Printable Report Document Card */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 bg-slate-900/95 space-y-6 print:bg-white print:text-black">
        
        {/* Printable Header */}
        <div className="border-b border-slate-800 pb-4 flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
              {t.summaryBrandHeader}
            </span>
            <h1 className="text-xl font-black text-white mt-1">{t.summaryMainHeading}</h1>
            <p className="text-xs text-slate-400">{t.summaryGeneratedOn} {new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-right">
            <div className="inline-block p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="block text-xs text-slate-400 font-semibold uppercase">{t.summarySafetyScoreLabel}</span>
              <span className={`text-2xl font-black ${riskScore.score < 60 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {riskScore.score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Patient Demographics & Allergies Grid */}
        {patient && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block">{t.summaryPatientDetails}</span>
              <strong className="text-white text-sm">{patient.name}</strong> ({patient.age} {currentLang === 'en' ? 'Yrs' : ''}, {patient.gender})
              <p className="text-slate-400 mt-1">{t.summaryConditions} {patient.chronicConditions.join(', ')}</p>
            </div>
            <div>
              <span className="text-rose-400 font-bold block flex items-center space-x-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                <span>{t.summaryDocumentedAllergies}</span>
              </span>
              <strong className="text-rose-200 text-sm">{patient.knownAllergies.join(', ')}</strong>
            </div>
          </div>
        )}

        {/* Section 1: Flagged Medication Safety Risks */}
        <div>
          <h3 className="text-xs font-extrabold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <ShieldAlert className="h-4 w-4" />
            <span>{t.summaryFlaggedRisks} ({alerts.length})</span>
          </h3>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>{alert.title}</span>
                  <span className="text-rose-400 uppercase text-[10px]">{alert.severity}</span>
                </div>
                <p className="text-slate-300 text-[11px] mb-1">{alert.description}</p>
                <p className="text-emerald-400 text-[11px]"><strong>{t.summaryRecommendation}</strong> {alert.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Laboratory Metric Trends */}
        <div>
          <h3 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Activity className="h-4 w-4" />
            <span>{t.summaryLabDriftTitle}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {labTrends.map((trend) => (
              <div key={trend.metricName} className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between font-bold text-white mb-1">
                  <span>{trend.metricName}</span>
                  <span className="text-amber-400 capitalize">{trend.trendDirection}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {trend.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Physician Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-3">
          <Stethoscope className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-300 block mb-0.5">{t.summaryClinicalNoteTitle}</strong>
            <p className="text-amber-200/90 text-[11px] leading-relaxed">
              {t.summaryClinicalNoteDesc}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
