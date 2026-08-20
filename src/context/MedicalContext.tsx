'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { MedicalDocument, Language } from '@/types/medical';
import { analyzePrescriptionSafety } from '@/lib/ai/safetyEngine';
import { analyzeLabTrends } from '@/lib/ai/labEngine';

interface MedicalContextType {
  clearState: () => void;
  isDocumentsLoaded: boolean;
  documents: MedicalDocument[];
  addDocuments: (newDocs: MedicalDocument[]) => void;
  removeDocument: (docId: string) => void;
  currentLang: Language;
  setCurrentLang: (lang: Language) => void;
  safetyData: { alerts: any[]; riskScore: any } | null;
  isAnalyzingSafety: boolean;
  labTrends: any;
}

const MedicalContext = createContext<MedicalContextType | undefined>(undefined);

export function MedicalProvider({ children }: { children: React.ReactNode }) {

  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [currentLang, setCurrentLangState] = useState<Language>('en');
  const [isDocumentsLoaded, setIsDocumentsLoaded] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('mediguard_lang') as Language;
    if (savedLang && ['en', 'si', 'ta'].includes(savedLang)) {
      setCurrentLangState(savedLang);
    }
  }, []);

  const setCurrentLang = (lang: Language) => {
    setCurrentLangState(lang);
    localStorage.setItem('mediguard_lang', lang);
  };

  const [safetyData, setSafetyData] = useState<{alerts: any[], riskScore: any} | null>(null);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);

  // Fetch documents on mount
  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch('/api/documents');
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        } else {
          setDocuments([]); // probably unauthenticated
        }
      } catch (e) {
        console.error('Failed to fetch docs:', e);
      } finally {
        setIsDocumentsLoaded(true);
      }
    }
    fetchDocs();
  }, []);

  const addDocuments = async (newDocs: MedicalDocument[]) => {
    // Optimistic UI update
    setDocuments(prev => [...prev, ...newDocs]);
    
    // Persist to backend
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocs)
      });
      if (!res.ok) {
        throw new Error("Failed to save documents");
      }
      const savedDocs = await res.json();
      // Update with backend generated IDs if necessary, or just rely on UUIDs generated locally
    } catch (e) {
      console.error(e);
      // Rollback on failure (simplified)
      setDocuments(prev => prev.filter(d => !newDocs.find(nd => nd.id === d.id)));
      alert("Failed to save documents to database");
    }
  };

  const removeDocument = async (docId: string) => {
    // Optimistic UI
    setDocuments(prev => prev.filter(d => d.id !== docId));
    
    try {
      await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
  };

  const clearState = () => {
    setDocuments([]);
    setSafetyData(null);
  };

  useEffect(() => {

    async function runSafetyAnalysis() {
      if (documents.length === 0) {
        setSafetyData(null);
        return;
      }
      setIsAnalyzingSafety(true);
      
      try {
        const apiKey = localStorage.getItem('geminiApiKey') || '';
        
        const allergies = Array.from(new Set(documents.flatMap(d => d.extractedData?.patient?.knownAllergies || [])));
        const allMeds = documents.flatMap(d => 
          (d.extractedData?.medications || []).map(m => ({...m, visitDate: d.visitDate, provider: d.healthcareProvider, docName: d.fileName}))
        );

        if (allMeds.length === 0) {
          setSafetyData({
            alerts: [],
            riskScore: { score: 100, riskLevel: 'Safe', totalAlerts: 0, highRiskCount: 0, warningCount: 0, infoCount: 0, summary: 'NO MEDICATIONS DETECTED. Upload documents with medications to run safety checks.', totalMedicationsAnalyzed: 0, safetyChecksPerformed: 0 }
          });
          setIsAnalyzingSafety(false);
          return;
        }

        const res = await fetch('/api/safety', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            medications: allMeds,
            allergies,
            apiKey
          })
        });

        if (res.ok) {
          const json = await res.json();
          setSafetyData(json.data);
        } else {
          setSafetyData(analyzePrescriptionSafety(documents));
        }
      } catch (e) {
        console.error(e);
        setSafetyData(analyzePrescriptionSafety(documents));
      } finally {
        setIsAnalyzingSafety(false);
      }
    }
    
    runSafetyAnalysis();
  }, [documents]);

  const labTrends = useMemo(() => {
    return analyzeLabTrends(documents);
  }, [documents]);

  return (
    <MedicalContext.Provider value={{
      documents,
      addDocuments,
      removeDocument,
      currentLang,
      setCurrentLang,
      safetyData,
      isAnalyzingSafety,
      labTrends
    }}>
      {children}
    </MedicalContext.Provider>
  );
}

export function useMedical() {
  const context = useContext(MedicalContext);
  if (context === undefined) {
    throw new Error('useMedical must be used within a MedicalProvider');
  }
  return context;
}
