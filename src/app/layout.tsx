import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediGuard AI – Intelligent Medical Document Analysis & Prescription Safety',
  description: 'AI-powered Medical Report & Prescription Cross-Checker built for YGC AI Competition 2026.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
