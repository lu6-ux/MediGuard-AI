'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { SafetyDashboard } from '@/components/SafetyDashboard';

export default function SafetyPage() {
  const { documents, safetyData, currentLang } = useMedical();

  return (
    <div className="max-w-7xl mx-auto">
      <SafetyDashboard
        alerts={safetyData?.alerts || []}
        riskScore={safetyData?.riskScore || { score: 100, riskLevel: 'No Data', totalAlerts: 0, highRiskCount: 0, warningCount: 0, infoCount: 0, summary: '' }}
        currentLang={currentLang}
        latestClinicalFindings={documents[documents.length - 1]?.extractedData?.clinicalFindings?.map(f => f.description).join(', ')}
      />
    </div>
  );
}
