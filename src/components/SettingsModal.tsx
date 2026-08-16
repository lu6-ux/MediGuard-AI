'use client';

import React, { useState } from 'react';
import { X, Key, Cpu, Check, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<string>('hybrid');
  const [apiKey, setApiKey] = useState<string>('');
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    const savedProvider = localStorage.getItem('aiProvider');
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedProvider) setProvider(savedProvider);
    if (savedApiKey) setApiKey(savedApiKey);
  }, []);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('aiProvider', provider);
    localStorage.setItem('geminiApiKey', apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Engine & Model Settings</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Configure LLM providers and custom API keys</p>
          </div>
        </div>

        <div className="space-y-5 text-sm">
          
          {/* Provider Selector */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-2">Select AI Provider:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('hybrid')}
                className={`p-4 rounded-xl border text-left font-semibold transition ${
                  provider === 'hybrid'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span>Smart Hybrid Engine</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Offline NLP & Deterministic (Default)</span>
              </button>

              <button
                onClick={() => setProvider('gemini')}
                className={`p-4 rounded-xl border text-left font-semibold transition ${
                  provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span>Google Gemini 1.5</span>
                  <Key className="h-4 w-4 text-teal-500 dark:text-teal-400" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">Gemini Flash / Pro API</span>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {provider !== 'hybrid' && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                Enter {provider.toUpperCase()} API Key:
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

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white dark:text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950 transition-all"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <span>Save & Apply Settings</span>
            )}
          </button>

        </div>

      </div>
    </div>
  );
};
