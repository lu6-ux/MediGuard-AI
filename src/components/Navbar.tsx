'use client';

import React from 'react';
import { ShieldAlert, Stethoscope, Globe, Settings, FileText, Activity } from 'lucide-react';
import { Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';

interface NavbarProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenSettings: () => void;
  documentCount: number;
  safetyScore: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  onOpenSettings,
  documentCount,
  safetyScore
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 backdrop-blur-md bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Stethoscope className="h-6 w-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {t.ygcBadge}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center space-x-4">
            
            {/* Documents Counter Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <FileText className="h-4 w-4 text-teal-400" />
              <span>{documentCount} {t.documentsProcessed}</span>
            </div>

            {/* Quick Safety Score Gauge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-400">Score:</span>
              <span className={`font-bold ${safetyScore < 60 ? 'text-rose-400' : safetyScore < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {safetyScore}/100
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <Globe className="h-4 w-4 text-slate-400 ml-1.5" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-medium rounded ${currentLang === 'en' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('si')}
                className={`px-2 py-1 text-xs font-medium rounded ${currentLang === 'si' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                සිං
              </button>
              <button
                onClick={() => onLanguageChange('ta')}
                className={`px-2 py-1 text-xs font-medium rounded ${currentLang === 'ta' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                த
              </button>
            </div>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
              title="AI Settings & Models"
            >
              <Settings className="h-5 w-5" />
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
