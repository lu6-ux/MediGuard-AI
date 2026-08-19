'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { MedicalTimeline } from '@/components/MedicalTimeline';

export default function TimelinePage() {
  const { documents, currentLang } = useMedical();
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="max-w-7xl mx-auto">
      <MedicalTimeline documents={documents} t={t} />
    </div>
  );
}
