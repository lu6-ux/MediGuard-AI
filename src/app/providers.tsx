'use client';

import { ThemeProvider } from 'next-themes';
import { MedicalProvider } from '@/context/MedicalContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <MedicalProvider>
        {children}
      </MedicalProvider>
    </ThemeProvider>
  );
}
