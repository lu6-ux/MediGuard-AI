'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  Activity, 
  Bot, 
  Printer, 
  Settings,
  Stethoscope
} from 'lucide-react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';

export const Sidebar = () => {
  const pathname = usePathname();
  const { currentLang, safetyData } = useMedical();
  const t = TRANSLATIONS[currentLang];

  const navigation = [
    { name: t.navOverview || 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: t.navDocuments || 'Documents', href: '/documents', icon: FileText },
    { name: t.navTimeline || 'Medical Timeline', href: '/timeline', icon: Calendar },
    { name: t.navSafety || 'Prescription Safety', href: '/safety', icon: ShieldAlert, hasAlert: (safetyData?.riskScore?.highRiskCount ?? 0) > 0 },
    { name: t.navLabTrends || 'Lab Trends', href: '/labs', icon: Activity },
    { name: t.navChat || 'Medical Assistant', href: '/assistant', icon: Bot },
    { name: t.navSummary || 'Health Summary', href: '/summary', icon: Printer },
  ];

  return (
    <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Stethoscope className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            MediGuard AI
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                isActive 
                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <span>{item.name}</span>
              {item.hasAlert && (
                <span className="absolute right-3 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/settings"
          className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            pathname === '/settings'
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          <span>{t.navSettings || 'Settings'}</span>
        </Link>
      </div>
    </div>
  );
};
