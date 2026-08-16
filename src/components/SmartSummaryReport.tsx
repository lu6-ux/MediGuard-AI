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
      <div className="flex items-center justify-between glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <span>{t.summaryReportTitle}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
      <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 space-y-6 print:bg-white print:text-black">
        
        {/* Printable Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
              {t.summaryBrandHeader}
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{t.summaryMainHeading}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.summaryGeneratedOn} {new Date().toLocaleDateString()}</p>
          </div>

          <div className="text-right">
            <div className="inline-block p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
              <span className="block text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">{t.summarySafetyScoreLabel}</span>
              <span className={`text-3xl font-black ${riskScore.score < 60 ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {riskScore.score}/100
              </span>
            </div>
          </div>
        </div>

        {/* Patient Demographics & Allergies Grid */}
        {patient && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400 font-semibold block">{t.summaryPatientDetails}</span>
              <strong className="text-slate-900 dark:text-white text-base">{patient.name}</strong> ({patient.age} {currentLang === 'en' ? 'Yrs' : ''}, {patient.gender})
              <p className="text-slate-600 dark:text-slate-400 mt-1">{t.summaryConditions} {patient.chronicConditions.join(', ')}</p>
            </div>
            <div>
              <span className="text-rose-500 dark:text-rose-400 font-bold block flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                <span>{t.summaryDocumentedAllergies}</span>
              </span>
              <strong className="text-rose-700 dark:text-rose-200 text-base">{patient.knownAllergies.join(', ')}</strong>
            </div>
          </div>
        )}

        {/* Section 1: Flagged Medication Safety Risks */}
        <div>
          <h3 className="text-sm font-extrabold text-rose-500 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <ShieldAlert className="h-5 w-5" />
            <span>{t.summaryFlaggedRisks} ({alerts.length})</span>
          </h3>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1.5">
                  <span>{alert.title}</span>
                  <span className="text-rose-500 dark:text-rose-400 uppercase text-xs">{alert.severity}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">{alert.description}</p>
                <p className="text-emerald-700 dark:text-emerald-400 text-sm"><strong>{t.summaryRecommendation}</strong> {alert.recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Laboratory Metric Trends */}
        <div>
          <h3 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
            <Activity className="h-5 w-5" />
            <span>{t.summaryLabDriftTitle}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {labTrends.map((trend) => (
              <div key={trend.metricName} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between font-bold text-slate-900 dark:text-white mb-1.5">
                  <span>{trend.metricName}</span>
                  <span className="text-amber-600 dark:text-amber-400 capitalize">{trend.trendDirection}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {trend.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Physician Disclaimer */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm text-amber-800 dark:text-amber-300 flex items-start space-x-3">
          <Stethoscope className="h-6 w-6 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-900 dark:text-amber-300 block mb-1">{t.summaryClinicalNoteTitle}</strong>
            <p className="text-amber-800/90 dark:text-amber-200/90 text-xs leading-relaxed">
              {t.summaryClinicalNoteDesc}
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
