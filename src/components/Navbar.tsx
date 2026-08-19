'use client';

import React from 'react';
import { ShieldAlert, Stethoscope, Globe, Settings, FileText, Activity, BookOpen, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/50">
              <Stethoscope className="h-6 w-6 text-white dark:text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-emerald-600 dark:from-white dark:via-slate-200 dark:to-emerald-400 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Right Status Badges & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Documents Counter Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-sm text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
              <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>{documentCount} {t.documentsProcessed}</span>
            </div>

            {/* Quick Safety Score Gauge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-sm dark:bg-slate-900 dark:border-slate-800">
              <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-slate-500 dark:text-slate-400">Score:</span>
              <span className={`font-bold ${safetyScore < 60 ? 'text-rose-600 dark:text-rose-400' : safetyScore < 85 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {safetyScore}/100
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition"
              title="Toggle Theme"
            >
              <Sun className="h-5 w-5 hidden dark:block" />
              <Moon className="h-5 w-5 block dark:hidden" />
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400 ml-1.5 hidden sm:block" />
              <button
                onClick={() => onLanguageChange('en')}
                className={`min-h-[36px] px-2 py-1 text-sm font-medium rounded ${currentLang === 'en' ? 'bg-emerald-500 text-white dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('si')}
                className={`min-h-[36px] px-2 py-1 text-sm font-medium rounded ${currentLang === 'si' ? 'bg-emerald-500 text-white dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                සිං
              </button>
              <button
                onClick={() => onLanguageChange('ta')}
                className={`min-h-[36px] px-2 py-1 text-sm font-medium rounded ${currentLang === 'ta' ? 'bg-emerald-500 text-white dark:text-slate-950 font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                த
              </button>
            </div>

            {/* Documentation Link */}
            <Link
              href="/docs"
              className="hidden sm:flex p-2 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition"
              title="Documentation"
            >
              <BookOpen className="h-5 w-5" />
            </Link>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white transition"
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
