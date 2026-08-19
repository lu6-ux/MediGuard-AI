'use client';

import React, { useState, useEffect } from 'react';
import { Settings, HelpCircle, User, Check, ShieldCheck, Key, Cpu, BookOpen, AlertCircle, FileText, Pill, MapPin } from 'lucide-react';
import { useMedical } from '@/context/MedicalContext';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { Language } from '@/types/medical';

export default function SettingsPage() {
  const { currentLang, setCurrentLang } = useMedical();
  const t = TRANSLATIONS[currentLang];
  const [provider, setProvider] = useState<string>('hybrid');
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedProvider = localStorage.getItem('aiProvider');
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedProvider) setProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  const handleSaveAI = () => {
    localStorage.setItem('aiProvider', provider);
    localStorage.setItem('geminiApiKey', apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.navSettings || 'Settings'}</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your preferences, AI engines, and view documentation.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <a href="#language" className="block px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-500/20">
            Language
          </a>
          <a href="#ai-engine" className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition">
            AI Engine
          </a>
          <a href="#help" className="block px-4 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition">
            Help & Documentation
          </a>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Language Section */}
          <section id="language" className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-6">
              <Settings className="h-5 w-5 text-emerald-500" />
              <span>Language</span>
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['en', 'si', 'ta'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setCurrentLang(lang)}
                    className={`p-4 rounded-xl border text-center font-bold uppercase transition ${
                      currentLang === lang
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {lang === 'en' ? 'English' : lang === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* AI Engine Section */}
          <section id="ai-engine" className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-6">
              <Cpu className="h-5 w-5 text-teal-500" />
              <span>AI Engine & Model Settings</span>
            </h2>
            <div className="space-y-5">
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Select AI Provider:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setProvider('hybrid')}
                  className={`p-4 rounded-xl border text-left font-semibold transition ${
                    provider === 'hybrid'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Smart Hybrid Engine</span>
                    <ShieldCheck className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Offline NLP & Deterministic (Default)</span>
                </button>

                <button
                  onClick={() => setProvider('gemini')}
                  className={`p-4 rounded-xl border text-left font-semibold transition ${
                    provider === 'gemini'
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span>Google Gemini</span>
                    <Key className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Gemini Multimodal API</span>
                </button>
              </div>

              {provider !== 'hybrid' && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                    Enter API Key:
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Note: MediGuard AI runs full deterministic NLP & safety calculations out-of-the-box in Hybrid mode without needing external API keys.
              </div>

              <button
                onClick={handleSaveAI}
                className="w-full py-3 min-h-[48px] rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center space-x-2 transition-all"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Settings Saved!</span>
                  </>
                ) : (
                  <span>Save AI Settings</span>
                )}
              </button>
            </div>
          </section>

          {/* Help & Documentation Section */}
          <section id="help" className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2 mb-6">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span>Help & Documentation</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span>How to Upload Documents</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Go to the <strong>Upload</strong> tab. You can drag and drop your medical records (PDFs, Images) or browse files. The AI will automatically classify the document, extract vital information like medications and lab results, and build your profile.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  <span>Checking Prescription Safety</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The dashboard continuously runs background checks on your extracted data. It compares your newly prescribed medications against your known allergies and existing medications. Any risks or drug interactions will appear in the <strong>Prescription Safety Checker</strong> panel.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
                  <Pill className="h-4 w-4 text-purple-500" />
                  <span>Viewing Your Timeline</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The <strong>Medical Timeline</strong> on the dashboard provides a chronological view of all your visits, prescriptions, and lab tests across different healthcare providers. Click on any visit to expand and see the full details.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>Getting Local Doctor Recommendations</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  If the AI detects a critical safety risk (e.g., severe allergy conflict), a <strong>Doctor Recommendation</strong> panel will appear. You can enter your location or use GPS to find the nearest relevant specialists, view their ratings, and get directions instantly.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
