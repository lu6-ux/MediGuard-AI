'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Pill, FileText, Stethoscope, AlertOctagon, HelpCircle } from 'lucide-react';
import { SafetyAlert, MedicalRiskScore, Language } from '@/types/medical';
import { DoctorRecommender } from './DoctorRecommender';
import { TRANSLATIONS } from '@/lib/i18n/translations';

interface SafetyDashboardProps {
  alerts: SafetyAlert[];
  riskScore: MedicalRiskScore;
  currentLang?: Language;
  latestClinicalFindings?: string;
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ alerts, riskScore, currentLang = 'en', latestClinicalFindings = '' }) => {
  const t = TRANSLATIONS[currentLang];
  const getSeverityBadge = (severity: 'high' | 'warning' | 'info') => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold flex items-center space-x-1">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>{t.safetyCriticalHighRisk}</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{t.safetyWarningFlag}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center space-x-1">
            <Info className="h-3.5 w-3.5" />
            <span>{t.safetyInformational}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Risk Score & Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Circular Score Metric */}
          <div className="flex items-center space-x-5 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 pb-5 lg:pb-0 lg:pr-5">
            <div className="relative h-24 w-24 flex items-center justify-center rounded-full bg-slate-50 border-4 border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={riskScore.score < 60 ? 'text-rose-500' : riskScore.score < 85 ? 'text-amber-400' : 'text-emerald-400'}
                  strokeDasharray={`${riskScore.score}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className={`text-2xl font-black ${riskScore.score < 60 ? 'text-rose-500 dark:text-rose-400' : riskScore.score < 85 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                  {riskScore.score}
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span className="text-sm uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                {t.safetyOverallScore}
              </span>
              <h3 className={`text-xl font-black mt-0.5 ${riskScore.riskLevel === 'No Data' ? 'text-slate-500 dark:text-slate-400' : riskScore.score < 60 ? 'text-rose-500 dark:text-rose-400' : riskScore.score < 85 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
                {riskScore.riskLevel === 'No Data' ? '--' : riskScore.riskLevel}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t.safetyEvaluatedFrom} {riskScore.totalMedicationsAnalyzed || 0} {t.safetyTotalChecks}
              </p>
            </div>
          </div>

          {/* Quick Stats Breakdown */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-200 text-sm leading-relaxed">
              <strong className="font-bold text-rose-800 dark:text-rose-300">{t.safetySummaryTitle} </strong>
              {riskScore.summary}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="block text-xl font-black text-rose-500 dark:text-rose-400">{riskScore.highRiskCount}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{t.highRiskAlerts}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="block text-xl font-black text-amber-500 dark:text-amber-400">{riskScore.warningCount}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{t.warningAlerts}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="block text-xl font-black text-emerald-500 dark:text-emerald-400">{riskScore.totalMedicationsAnalyzed || 0}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase">{t.safetyTotalAnalyzed}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Local Doctor Recommendation */}
      <DoctorRecommender 
        flagContext={latestClinicalFindings || (alerts.length > 0 ? alerts[0].type : 'general')} 
        currentLang={currentLang} 
        showRecommender={riskScore.highRiskCount > 0} 
        issueDescription={alerts.length > 0 ? alerts[0].title : 'A high-risk medical issue was detected in your records.'}
      />

      {/* Safety Alerts List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <ShieldAlert className="h-6 w-6 text-rose-500 dark:text-rose-400" />
          <span>{t.safetyCrossCheckFlags} ({alerts.length})</span>
        </h3>

        {alerts.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            {riskScore.totalMedicationsAnalyzed === 0 ? (
              <>
                <Info className="h-10 w-10 text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.notAvailable}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.noSafetyChecks}</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-10 w-10 text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{t.noUrgentConcerns}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t.emptyAlerts}</p>
              </>
            )}
          </div>
        ) : (
          alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`glass-panel rounded-2xl p-5 border transition-all ${
              alert.severity === 'high' 
                ? 'border-rose-200 dark:border-rose-500/40 bg-gradient-to-r from-white via-white to-rose-50 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/20 glow-rose' 
                : 'border-amber-200 dark:border-amber-500/30 bg-white/90 dark:bg-slate-900/90'
            }`}
          >
            {/* Alert Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-sm text-slate-500 dark:text-slate-400 capitalize px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800">
                    {alert.type.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-2">{alert.title}</h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              {alert.description}
            </p>

            {/* Evidence Quotes */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-4 space-y-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                {t.safetyEvidenceCitations}
              </span>
              {alert.evidence.map((item, idx) => (
                <div key={idx} className="text-sm text-slate-600 dark:text-slate-300 flex items-start space-x-2">
                  <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Recommendation Box */}
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-sm flex items-start space-x-3">
              <Stethoscope className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-700 dark:text-emerald-400">{t.safetyClinicalRecommendation} </strong>
                <span>{alert.recommendation}</span>
              </div>
            </div>

          </div>
        )))}
      </div>

    </div>
  );
};
