'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { LabTrendVisualizer } from '@/components/LabTrendVisualizer';

export default function LabsPage() {
  const { labTrends } = useMedical();

  return (
    <div className="max-w-7xl mx-auto">
      <LabTrendVisualizer labTrends={labTrends} />
    </div>
  );
}
