'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Globe, FilePlus, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';

export const TopBar = () => {
  const { theme, setTheme } = useTheme();
  const { currentLang, setCurrentLang, documents } = useMedical();
  const t = TRANSLATIONS[currentLang];
  const pathname = usePathname();
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case '/': return t.navOverview || 'Dashboard';
      case '/documents': return t.navDocuments || 'Documents';
      case '/timeline': return t.navTimeline || 'Medical Timeline';
      case '/safety': return t.navSafety || 'Prescription Safety';
      case '/labs': return t.navLabTrends || 'Lab Trends';
      case '/assistant': return t.navChat || 'Medical Assistant';
      case '/summary': return t.navSummary || 'Health Summary';
      case '/settings': return t.navSettings || 'Settings';
      default: return t.appTitle || 'MediGuard AI';
    }
  };

  const patient = documents[0]?.extractedData?.patient;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between h-16 px-6">
        
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          
          <button
            onClick={() => router.push('/documents')}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <FilePlus className="h-4 w-4" />
            <span>{t.uploadDocument || 'Upload Document'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
            title="Toggle Theme"
          >
            <Sun className="h-5 w-5 hidden dark:block" />
            <Moon className="h-5 w-5 block dark:hidden" />
          </button>

          {/* User Profile Area */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center overflow-hidden shrink-0 hover:ring-2 ring-emerald-500/50 transition-all focus:outline-none"
            >
              {patient ? (
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {patient.name.charAt(0).toUpperCase()}
                </span>
              ) : (
                <User className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{patient?.name || t.profileMenu || 'Profile'}</p>
                </div>
                
                <div className="py-1">
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      {t.languageSettings || 'Language'}
                    </p>
                    <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg dark:bg-slate-950">
                      <button
                        onClick={() => setCurrentLang('en')}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded ${currentLang === 'en' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setCurrentLang('si')}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded ${currentLang === 'si' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        සිං
                      </button>
                      <button
                        onClick={() => setCurrentLang('ta')}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded ${currentLang === 'ta' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-800 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                      >
                        த
                      </button>
                    </div>
                  </div>
                </div>

                <div className="py-1 border-t border-slate-200 dark:border-slate-800">
                  <button 
                    onClick={() => {
                      router.push('/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>{t.userPreferences || 'Preferences'}</span>
                  </button>
                  <button 
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t.signOut || 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </header>
  );
};
