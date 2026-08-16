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
      <body className="antialiased text-slate-900 dark:text-slate-100 transition-colors duration-300 relative min-h-screen">
        
        {/* Premium Animated Mesh Gradient Background */}
        <div className="fixed inset-0 z-[-1] min-h-screen w-full bg-slate-50 dark:bg-[#040914] transition-colors duration-500 overflow-hidden">
          {/* Light Mode Glowing Orbs */}
          <div className="absolute top-0 left-1/4 w-3/4 h-[500px] bg-emerald-100/40 dark:hidden blur-[100px] rounded-full mix-blend-multiply opacity-70"></div>
          <div className="absolute -top-20 -right-20 w-[600px] h-[600px] bg-teal-50/60 dark:hidden blur-[120px] rounded-full opacity-80"></div>
          <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-cyan-50/50 dark:hidden blur-[120px] rounded-full opacity-60"></div>
          
          {/* Dark Mode Glowing Orbs */}
          <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-900/15 blur-[120px] hidden dark:block pointer-events-none"></div>
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-teal-900/10 blur-[120px] hidden dark:block pointer-events-none"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] rounded-full bg-slate-800/30 blur-[120px] hidden dark:block pointer-events-none"></div>
          
          {/* Subtle Grid Overlay (Optional texturing) */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        </div>

        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
