'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { DocumentUploader } from '@/components/DocumentUploader';
import { FileText, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function DocumentsPage() {
  const { documents, addDocuments, removeDocument, currentLang, isDocumentsLoaded } = useMedical();
  const t = TRANSLATIONS[currentLang];

  const handleDelete = (docId: string) => {
    const isConfirmed = window.confirm(t.deleteConfirmationDesc || 'Are you sure you want to remove this document? This action cannot be undone.');
    if (isConfirmed) {
      removeDocument(docId);
      alert(t.documentDeletedSuccess || 'Document deleted successfully');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <DocumentUploader
        documents={documents}
        currentLang={currentLang}
        onUploadCustomDoc={addDocuments}
      />
      {documents.length > 0 && (
        <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.recentDocuments || 'Uploaded Documents'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start space-x-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">{doc.fileName}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-slate-500 truncate">{doc.visitDate}</span>
                    {doc.doctorName && <span className="text-xs text-slate-300">•</span>}
                    {doc.doctorName && <span className="text-xs text-slate-500 truncate">{doc.doctorName}</span>}
                    <span className="text-xs text-slate-300">•</span>
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded capitalize shrink-0">
                      {doc.docType.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2 shrink-0">
                  <Link href={`/documents/${doc.id}`} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors">
                    {t.viewDocument || 'View'}
                  </Link>
                  <button 
                    onClick={() => handleDelete(doc.id)} 
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg transition-colors"
                    title={t.deleteDocument || 'Remove / Delete Document'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
