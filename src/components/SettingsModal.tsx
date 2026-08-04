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

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 bg-slate-900 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Engine & Model Settings</h3>
            <p className="text-xs text-slate-400">Configure LLM providers and custom API keys</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* Provider Selector */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Select AI Provider:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setProvider('hybrid')}
                className={`p-3 rounded-xl border text-left font-semibold transition ${
                  provider === 'hybrid'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Smart Hybrid Engine</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Offline NLP & Deterministic (Default)</span>
              </button>

              <button
                onClick={() => setProvider('gemini')}
                className={`p-3 rounded-xl border text-left font-semibold transition ${
                  provider === 'gemini'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>Google Gemini 1.5</span>
                  <Key className="h-3.5 w-3.5 text-teal-400" />
                </div>
                <span className="text-[10px] text-slate-400 font-normal">Gemini Flash / Pro API</span>
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {provider !== 'hybrid' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Enter {provider.toUpperCase()} API Key:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Note: MediGuard AI runs full deterministic NLP & safety calculations out-of-the-box in Hybrid mode without needing external API keys.
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950"
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
