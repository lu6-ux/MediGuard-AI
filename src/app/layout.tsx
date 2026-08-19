import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MediGuard AI',
  description: 'Intelligent Medical Document Analysis & Prescription Safety',
};

import { Providers } from './providers';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased text-slate-900 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen w-full overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
