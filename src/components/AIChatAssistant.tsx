'use client';

import React, { useState } from 'react';
import { Bot, User, Send, Sparkles, FileText, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { ChatMessage, MedicalDocument, Language } from '@/types/medical';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { answerMedicalQuestion } from '@/lib/ai/ragEngine';

interface AIChatAssistantProps {
  documents: MedicalDocument[];
  currentLang: Language;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ documents, currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sampleQuestions = [
    t.chatQ1,
    t.chatQ2,
    t.chatQ3,
    t.chatQ4
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsThinking(true);

    setTimeout(() => {
      const ragResult = answerMedicalQuestion(query, documents, currentLang);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: ragResult.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: ragResult.confidenceScore,
        citations: ragResult.citations,
        disclaimer: ragResult.disclaimer
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-950/50">
            <Bot className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>{t.chatTitle}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                {documents.length} {t.chatDocsIndexed}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t.chatSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          {t.chatSuggested}
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-slate-850 transition text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-2xl border border-slate-800 p-4 min-h-[400px] max-h-[550px] overflow-y-auto space-y-4 bg-slate-950/60">
        
        {/* Dynamic Static Welcome Message */}
        <div className="flex flex-col items-start">
          <div className="max-w-[85%] rounded-2xl p-4 border text-xs leading-relaxed bg-slate-900 text-slate-200 border-slate-800 rounded-bl-none shadow-md">
            <div className="flex items-center justify-between mb-1.5 border-b border-slate-800/60 pb-1 text-[11px]">
              <span className="font-bold flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">MediGuard AI</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                99% {t.confidence}
              </span>
            </div>
            <div className="whitespace-pre-line text-xs font-normal">
              {t.chatWelcome}
            </div>
            <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start space-x-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{t.disclaimerText}</span>
            </div>
          </div>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 border text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white border-emerald-500 rounded-br-none'
                  : 'bg-slate-900 text-slate-200 border-slate-800 rounded-bl-none shadow-md'
              }`}
            >
              {/* Sender Tag & Confidence Score */}
              <div className="flex items-center justify-between mb-1.5 border-b border-slate-800/60 pb-1 text-[11px]">
                <span className="font-bold flex items-center space-x-1">
                  {msg.sender === 'ai' ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">MediGuard AI</span>
                    </>
                  ) : (
                    <span>You</span>
                  )}
                </span>

                {msg.confidenceScore && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px]">
                    {msg.confidenceScore}% {t.confidence}
                  </span>
                )}
              </div>

              {/* Message Content */}
              <div className="whitespace-pre-line text-xs font-normal">
                {msg.text}
              </div>

              {/* Citations & Evidence Quotes */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Source Document Citations ({msg.citations.length}):
                  </span>
                  {msg.citations.map((c, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      <div className="flex justify-between font-semibold text-emerald-400 mb-0.5">
                        <span>📄 {c.docName}</span>
                        <span>{c.date}</span>
                      </div>
                      <p className="text-slate-400 italic">"{c.quote}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Required Medical Disclaimer Callout */}
              {msg.disclaimer && (
                <div className="mt-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start space-x-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{msg.disclaimer}</span>
                </div>
              )}

              <span className="block text-[10px] text-slate-500 text-right mt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
            <span>{t.chatAnalyzing}</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={t.chatPlaceholder}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-950/50 transition disabled:opacity-50"
        >
          <span>{t.sendBtn}</span>
          <Send className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};
