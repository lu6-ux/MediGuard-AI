'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { SafetyDashboard } from '@/components/SafetyDashboard';
import { FileText, Activity, ShieldAlert, Calendar, Pill, Plus, Clock, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { documents, removeDocument, currentLang, safetyData } = useMedical();
  const t = TRANSLATIONS[currentLang];

  const recentDocs = [...documents].reverse().slice(0, 5);

  const totalDocuments = documents.length;
  const uniqueVisits = new Set(documents.map(d => d.visitDate).filter(Boolean)).size;
  const totalMedicines = documents.reduce((acc, doc) => acc + (doc.extractedData?.medications?.length || 0), 0);
  const totalLabReports = documents.filter(d => d.docType === 'lab_report').length;

  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  const handleDelete = (docId: string) => {
    const isConfirmed = window.confirm(t.deleteConfirmationDesc || 'Are you sure you want to remove this document? This action cannot be undone.');
    if (isConfirmed) {
      removeDocument(docId);
      setToastMessage(t.documentDeletedSuccess || 'Document deleted successfully');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-md">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t.appTitle || 'MediGuard AI'}</h1>
          <p className="text-emerald-50 max-w-xl text-sm md:text-base">
            {t.dashboardDesc || 'Easily manage your medical documents and health information.'}
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0 shrink-0">
          <Link href="/documents" className="flex items-center space-x-2 bg-white text-emerald-700 hover:bg-emerald-50 px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm">
            <Plus className="h-5 w-5" />
            <span>{t.uploadDocument || 'Upload Document'}</span>
          </Link>
          <Link href="/timeline" className="flex items-center space-x-2 bg-emerald-800/40 hover:bg-emerald-800/60 text-white px-5 py-2.5 rounded-xl font-medium transition-colors border border-emerald-500/30">
            <Clock className="h-5 w-5" />
            <span className="hidden sm:inline">{t.navTimeline || 'Medical Timeline'}</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{totalDocuments}</h3>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{t.totalDocuments || 'Documents'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.totalDocumentsDesc || 'Total uploaded documents'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
              <Calendar className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{uniqueVisits}</h3>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{t.totalVisits || 'Medical Visits'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.totalVisitsDesc || 'Total medical visits'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
              <Pill className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{totalMedicines}</h3>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{t.totalMedicines || 'Medicines'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.totalMedicinesDesc || 'Number of medicines identified'}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{totalLabReports}</h3>
            <p className="font-semibold text-slate-700 dark:text-slate-300">{t.totalLabReports || 'Lab Reports'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.totalLabReportsDesc || 'Number of lab reports'}</p>
          </div>
        </div>

      </div>

      {documents.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4">
            <FileText className="h-10 w-10 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">{t.emptyDocsTitle || 'No documents uploaded yet.'}</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {t.emptyDocsDesc || 'Upload medical records, prescriptions, or lab results to start generating intelligent insights.'}
          </p>
          <Link 
            href="/documents" 
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-all shadow-sm shadow-emerald-500/20"
          >
            {t.uploadFirstDoc || 'Upload First Document'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Recent Documents Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                {t.recentDocuments || 'Recent Documents'}
              </h2>
              <Link href="/documents" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1">
                {t.viewAllDocuments || 'View all documents'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentDocs.map(doc => (
                <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.fileName}</p>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-xs text-slate-500 truncate">{doc.visitDate}</span>
                        <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 rounded capitalize shrink-0 font-medium">
                          {doc.docType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 shrink-0 ml-4">
                    <Link href={`/documents/${doc.id}`} className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
                      {t.viewDocument || 'View'}
                    </Link>
                    <button 
                      onClick={() => handleDelete(doc.id)} 
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-rose-900/50 dark:hover:bg-rose-500/10 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg transition-colors"
                      title={t.deleteDocument || 'Remove / Delete Document'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Health / Lab Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-emerald-500" />
                {t.healthOverview || 'Health Overview'}
              </h2>
              <Link href="/safety" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                {t.reviewSafetyAlerts || 'Review safety'} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <SafetyDashboard 
                alerts={safetyData?.alerts?.filter((a: any) => a.severity === 'high' || a.severity === 'critical') || []}
                riskScore={safetyData?.riskScore || { score: 100, riskLevel: 'No Data', totalAlerts: 0, highRiskCount: 0, warningCount: 0, infoCount: 0, summary: '' }}
                currentLang={currentLang}
                latestClinicalFindings=""
              />
            </div>
          </div>

        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg font-medium animate-in fade-in slide-in-from-bottom-5">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
