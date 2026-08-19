'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, AlertCircle, X, FilePlus } from 'lucide-react';
import { MedicalDocument, Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import Tesseract from 'tesseract.js';

interface DocumentUploaderProps {
  documents: MedicalDocument[];
  currentLang: Language;
  onUploadCustomDoc: (files: MedicalDocument[]) => void;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  documents,
  currentLang,
  onUploadCustomDoc
}) => {
  const t = TRANSLATIONS[currentLang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [errorState, setErrorState] = useState<{ title: string; message: string } | null>(null);

  const resizeImage = (file: File, maxWidth: number = 2048): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No canvas context');
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG compression to 80% quality drastically reduces base64 size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl.split(',')[1]); 
      };
      img.onerror = () => reject('Image load error');
      img.src = url;
    });
  };

  const handleProcessFiles = async (files: File[]) => {
    if (isProcessing) return;
    setIsProcessing(true);
    setErrorState(null);
    
    try {
      const newProcessedDocs: MedicalDocument[] = [];
      const savedApiKey = localStorage.getItem('geminiApiKey') || '';

      for (const file of files) {
        if (file.name.startsWith('.')) continue;

        // Validation
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/plain'];
        if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
          setErrorState({
            title: "Unsupported file type",
            message: `The file ${file.name} is not supported. Please upload a PDF, JPG, PNG, or TXT file.`
          });
          continue;
        }

        if (file.size > 15 * 1024 * 1024) { // 15MB hard limit
          setErrorState({
            title: "File is too large",
            message: `The file ${file.name} exceeds the 15MB limit. Please compress it and try again.`
          });
          continue;
        }

        setProgressStatus(`Preparing ${file.name}...`);
        
        let text = "";
        let extracted: any = null;
        let isGeminiProcessed = false;
        
        let rawOcrText = "";
        let cleanedText = "";
        let language = "";
        let confidenceScores = {};

        let base64Payload = "";
        let finalMimeType = file.type || 'application/octet-stream';

        if (file.type.startsWith('image/')) {
          setProgressStatus(`Compressing image ${file.name}...`);
          base64Payload = await resizeImage(file, 2048);
          finalMimeType = 'image/jpeg';
        } else {
          // PDF or Text
          base64Payload = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result?.toString().split(',')[1] || '');
            reader.onerror = error => reject(error);
          });
          if (file.name.toLowerCase().endsWith('.pdf')) finalMimeType = 'application/pdf';
        }

        setProgressStatus(`Analyzing document using AI...`);
        
        try {
          const response = await fetch('/api/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Image: base64Payload,
              mimeType: finalMimeType,
              apiKey: savedApiKey,
              fileName: file.name
            })
          });

          if (!response.ok) {
            const errRes = await response.json().catch(() => null);
            throw new Error(errRes?.error || 'DOCUMENT_PROCESSING_ERROR');
          }

          const result = await response.json();
          extracted = result.document.extractedData;
          rawOcrText = result.document.rawText || "";
          cleanedText = result.document.cleanedText || "";
          language = result.document.language || "";
          confidenceScores = result.document.confidenceScores || {};
          
          isGeminiProcessed = true;
          text = cleanedText || rawOcrText || "Extracted successfully via Document AI";

        } catch (apiError: any) {
          console.error("API Extraction Failed:", apiError);
          
          if (apiError.message === 'DOCUMENT_PROCESSING_TIMEOUT') {
             setErrorState({
               title: "Document processing took too long",
               message: "We couldn't finish analyzing this document. Please try again or upload a smaller, clearer file."
             });
             continue;
          }
          
          if (apiError.message.includes('GEMINI_API_KEY is not configured')) {
             setErrorState({
               title: "Server Configuration Error",
               message: "The AI API key is missing. Please configure it in settings or the server environment."
             });
             continue;
          }

          setProgressStatus(`Falling back to local OCR for ${file.name}...`);
          
          if (file.type.startsWith('image/')) {
            const { data } = await Tesseract.recognize(file, 'eng');
            const confidence = data.confidence;
            
            if (confidence < 30) {
              setErrorState({
                title: "Image quality is too low",
                message: "We could not reliably read the text in this document. Try uploading a clearer image."
              });
              continue;
            } else if (confidence < 70) {
               // Proceed with warning, do NOT block or ask for window.confirm
               console.warn("Low OCR confidence, but proceeding: ", confidence);
            }
            
            text = data.text;
            rawOcrText = text;
            extracted = {
              docType: "unclassified",
              visitDate: new Date().toISOString().split('T')[0],
              doctorName: "",
              healthcareProvider: "",
              patient: { name: "", age: 0, gender: "", knownAllergies: [], chronicConditions: [] },
              medications: [],
              labResults: [],
              clinicalFindings: [],
              symptoms: [],
              vitals: {},
              diagnosis: [],
              instructions: [],
              followUpDate: "",
              doctorNotes: ""
            };
          } else {
            text = await file.text();
            rawOcrText = text;
            extracted = {
              docType: "unclassified",
              visitDate: new Date().toISOString().split('T')[0],
              doctorName: "",
              healthcareProvider: "",
              patient: { name: "", age: 0, gender: "", knownAllergies: [], chronicConditions: [] },
              medications: [],
              labResults: [],
              clinicalFindings: [],
              symptoms: [],
              vitals: {},
              diagnosis: [],
              instructions: [],
              followUpDate: "",
              doctorNotes: ""
            };
          }
        }

        setProgressStatus(`Saving results...`);
        const newDocId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        
        newProcessedDocs.push({
          id: newDocId,
          fileName: file.name,
          docType: extracted?.docType || 'unclassified',
          visitDate: extracted?.visitDate || new Date().toISOString().split('T')[0],
          doctorName: extracted?.doctorName || '',
          healthcareProvider: extracted?.healthcareProvider || '',
          rawText: rawOcrText || text,
          cleanedText,
          language,
          confidenceScores,
          extractedData: extracted,
          status: 'processed',
          uploadDate: new Date().toISOString()
        });
      }

      if (newProcessedDocs.length > 0) {
        onUploadCustomDoc(newProcessedDocs);
      }
      
    } catch (e) {
      console.error("Batch processing error", e);
      setErrorState({
        title: "Unexpected Error",
        message: "An unexpected error occurred while processing your files."
      });
    } finally {
      setIsProcessing(false);
      setProgressStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Zone */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.uploadDocument || 'Upload Document'}</h2>
        
        {errorState && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl p-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 mr-3 shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">{errorState.title}</h3>
              <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">{errorState.message}</p>
              <div className="mt-3 flex space-x-3">
                <button 
                  onClick={() => setErrorState(null)} 
                  className="text-xs font-semibold px-3 py-1.5 bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 rounded hover:bg-rose-200 transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[200px] ${
            isProcessing ? 'opacity-50 pointer-events-none' : ''
          } ${
            isDragOver 
              ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-500/10' 
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".pdf,.png,.jpg,.jpeg,.txt" 
            multiple
            className="hidden" 
            disabled={isProcessing}
          />

          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"></div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{progressStatus}</p>
            </div>
          ) : (
            <>
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{t.dragDropFiles || 'Drag & Drop files here'}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">{t.supportedFormats || 'Supported formats'}: PDF, JPG, PNG, TXT (Max 15MB)</p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white shadow-sm transition"
              >
                {t.browseFiles || 'Browse Files'}
              </button>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
