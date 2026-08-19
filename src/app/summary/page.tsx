'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { SmartSummaryReport } from '@/components/SmartSummaryReport';

export default function SummaryPage() {
  const { documents, currentLang, safetyData, labTrends } = useMedical();

  return (
    <div className="max-w-7xl mx-auto">
      <SmartSummaryReport
        documents={documents}
        alerts={safetyData?.alerts || []}
        riskScore={safetyData?.riskScore || { score: 100, riskLevel: 'No Data', totalAlerts: 0, highRiskCount: 0, warningCount: 0, infoCount: 0, summary: '' }}
        labTrends={labTrends}
        currentLang={currentLang}
      />
    </div>
  );
}
