'use client';

import React from 'react';
import { useMedical } from '@/context/MedicalContext';
import { AIChatAssistant } from '@/components/AIChatAssistant';

export default function AssistantPage() {
  const { documents, currentLang } = useMedical();

  return (
    <div className="max-w-7xl mx-auto">
      <AIChatAssistant
        documents={documents}
        currentLang={currentLang}
      />
    </div>
  );
}
