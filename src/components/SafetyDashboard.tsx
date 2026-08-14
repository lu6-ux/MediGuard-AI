'use client';

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Pill, FileText, Stethoscope, AlertOctagon, HelpCircle } from 'lucide-react';
import { SafetyAlert, MedicalRiskScore } from '@/types/medical';
import { DoctorRecommender } from './DoctorRecommender';

interface SafetyDashboardProps {
  alerts: SafetyAlert[];
  riskScore: MedicalRiskScore;
}

export const SafetyDashboard: React.FC<SafetyDashboardProps> = ({ alerts, riskScore }) => {
  const getSeverityBadge = (severity: 'high' | 'warning' | 'info') => {
    switch (severity) {
      case 'high':
        return (
          <span className="px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-extrabold flex items-center space-x-1">
            <AlertOctagon className="h-3.5 w-3.5" />
            <span>CRITICAL HIGH RISK</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center space-x-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>WARNING FLAG</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium flex items-center space-x-1">
            <Info className="h-3.5 w-3.5" />
            <span>INFORMATIONAL</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Risk Score & Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/90 relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* Circular Score Metric */}
          <div className="flex items-center space-x-5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-5 lg:pb-0 lg:pr-5">
            <div className="relative h-24 w-24 flex items-center justify-center rounded-full bg-slate-950 border-4 border-slate-800 shadow-inner">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
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
                <span className={`text-2xl font-black ${riskScore.score < 60 ? 'text-rose-400' : riskScore.score < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {riskScore.score}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                Overall Medication Safety Score
              </span>
              <h3 className={`text-xl font-black mt-0.5 ${riskScore.score < 60 ? 'text-rose-400' : riskScore.score < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {riskScore.riskLevel}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Evaluated from {alerts.length} total safety checks
              </p>
            </div>
          </div>

          {/* Quick Stats Breakdown */}
          <div className="lg:col-span-2 space-y-3">
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs leading-relaxed">
              <strong className="font-bold text-rose-300">Safety Analysis Summary: </strong>
              {riskScore.summary}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-lg font-black text-rose-400">{riskScore.highRiskCount}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">High Risk Flags</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-lg font-black text-amber-400">{riskScore.warningCount}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Warnings</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="block text-lg font-black text-emerald-400">{alerts.length}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Analyzed</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Local Doctor Recommendation (Shown for any risk to ensure visibility during demo) */}
      <DoctorRecommender flagContext={alerts.length > 0 ? alerts[0].type : 'general'} />

      {/* Safety Alerts List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <span>Cross-Check Prescription Flags ({alerts.length})</span>
        </h3>

        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={`glass-panel rounded-2xl p-5 border transition-all ${
              alert.severity === 'high' 
                ? 'border-rose-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20 glow-rose' 
                : 'border-amber-500/30 bg-slate-900/90'
            }`}
          >
            {/* Alert Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  {getSeverityBadge(alert.severity)}
                  <span className="text-xs text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800">
                    {alert.type.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-2">{alert.title}</h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {alert.description}
            </p>

            {/* Evidence Quotes */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Documented Evidence & Source Citations:
              </span>
              {alert.evidence.map((item, idx) => (
                <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                  <FileText className="h-3.5 w-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-start space-x-2.5">
              <Stethoscope className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-400">Clinical Recommendation: </strong>
                <span>{alert.recommendation}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
