import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediGuard AI – Intelligent Medical Document Analysis & Prescription Safety',
  description: 'AI-powered Medical Report & Prescription Cross-Checker built for YGC AI Competition 2026.',
};

import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
