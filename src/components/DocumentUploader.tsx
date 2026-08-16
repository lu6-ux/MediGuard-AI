'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, AlertCircle, FilePlus, User, AlertTriangle } from 'lucide-react';
import { MedicalDocument, Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';

interface DocumentUploaderProps {
  documents: MedicalDocument[];
  currentLang: Language;
  onUploadCustomDoc: (files: File[]) => void;
  isProcessing: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  currentLang,
  onUploadCustomDoc,
  isProcessing
}) => {
  const t = TRANSLATIONS[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadCustomDoc(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUploadCustomDoc(Array.from(e.dataTransfer.files));
    }
  };

  // Get patient info from first document
  const patient = documents[0]?.extractedData?.patient;

  return (
    <div className="space-y-6">
      
      {/* Patient Banner Card */}
      {patient && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-white via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-slate-900/90 dark:to-emerald-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center">
                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{patient.name}</h2>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    {patient.age} Yrs • {patient.gender}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <span>Conditions: <strong className="text-slate-700 dark:text-slate-200">{patient.chronicConditions.join(', ')}</strong></span>
                </div>
              </div>
            </div>

            {/* Documented Allergies Highlight */}
            <div className="px-4 py-3 min-h-[44px] rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-rose-500 dark:text-rose-400 shrink-0" />
              <div className="text-sm">
                <span className="text-rose-700 dark:text-rose-300 font-semibold">{t.knownAllergies}: </span>
                <span className="text-rose-600 dark:text-rose-200 font-bold">{patient.knownAllergies.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <div className="w-full">
        
        {/* Drag & Drop Card */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[160px] ${
            isDragOver 
              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10' 
              : 'border-slate-300 bg-slate-50/60 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.png,.jpg,.jpeg,.txt" 
            multiple
            className="hidden" 
          />
          <input 
            type="file" 
            ref={folderInputRef} 
            onChange={handleFileChange} 
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            multiple
            className="hidden" 
          />

          <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
            <Upload className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{t.uploadTitle}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mb-3">{t.uploadSubtitle}</p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition"
            >
              📄 Upload Files
            </button>
            <button
              onClick={() => folderInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-xs font-semibold text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 transition flex items-center space-x-1"
            >
              📁 Select Entire Folder
            </button>
          </div>
        </div>

      </div>

      {/* Uploaded Document List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <span>Uploaded Medical Documents</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {documents.length}
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {documents.map((doc) => (
            <div 
              key={doc.id}
              className="glass-panel rounded-xl p-3.5 border border-slate-800 bg-slate-900/80 hover:border-slate-700 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <FileText className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[130px]">
                    {doc.fileName}
                  </span>
                </div>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>

              <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Visit Date:</span>
                  <strong className="text-slate-200">{doc.visitDate}</strong>
                </div>
                <div className="flex justify-between truncate">
                  <span>Doctor:</span>
                  <strong className="text-slate-200 truncate">{doc.doctorName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="capitalize px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-medium">
                    {doc.docType.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
