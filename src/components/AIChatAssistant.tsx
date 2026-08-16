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

  // Dynamically retranslate the entire chat history when the language changes
  React.useEffect(() => {
    setMessages(prev => prev.map(msg => {
      if (msg.sender === 'user' && msg.suggestedIndex !== undefined) {
        // Retranslate suggested user questions
        return { ...msg, text: sampleQuestions[msg.suggestedIndex] };
      }
      if (msg.sender === 'ai' && msg.originalQuery) {
        // Re-run the RAG engine for the AI's previous answer using the new language
        const ragResult = answerMedicalQuestion(msg.originalQuery, documents, currentLang);
        return { 
          ...msg, 
          text: ragResult.answer,
          disclaimer: ragResult.disclaimer 
        };
      }
      return msg; // Leave custom-typed user questions as-is
    }));
  }, [currentLang, documents]);

  const handleSend = (textToSend?: string, suggestedIndex?: number) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedIndex: suggestedIndex
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
        disclaimer: ragResult.disclaimer,
        originalQuery: query
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-950/50">
            <Bot className="h-6 w-6 text-white dark:text-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>{t.chatTitle}</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {t.chatSubtitle} ({documents.length} {t.chatDocsIndexed})
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          {t.chatSuggested}
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q, idx)}
              className="px-4 py-3 min-h-[48px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 hover:border-emerald-400 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left"
            >
              💬 {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-4 min-h-[400px] max-h-[600px] overflow-y-auto space-y-4 bg-white/60 dark:bg-slate-950/60">
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 border text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white border-emerald-500 rounded-br-none'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 rounded-bl-none shadow-md'
              }`}
            >
              {msg.sender === 'ai' ? (
                <>
                  <div className="flex items-center justify-between mb-2 border-b border-slate-200 dark:border-slate-800/60 pb-2 text-xs">
                    <span className="font-bold flex items-center space-x-1">
                      <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">MediGuard AI</span>
                    </span>
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 font-semibold text-xs">
                      {msg.confidenceScore}% {t.confidence}
                    </span>
                  </div>
                  <div className="whitespace-pre-line text-sm font-normal">
                    {msg.text}
                  </div>
                  {msg.disclaimer && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                      <span>{msg.disclaimer}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm font-medium">{msg.text}</div>
              )}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center space-x-2 text-sm text-slate-500 p-2">
            <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
            <span>{t.chatAnalyzing}</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-2 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900/80 dark:border-slate-800 flex items-end space-x-2 relative focus-within:border-emerald-400 dark:focus-within:border-emerald-500/50 transition-colors">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={t.chatPlaceholder}
          className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none py-3 px-3 min-h-[48px] max-h-[120px]"
          rows={1}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim()}
          className="p-3 min-h-[48px] min-w-[48px] mb-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-950 hover:shadow-lg hover:shadow-emerald-500/30 disabled:opacity-50 transition flex items-center justify-center shrink-0"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
};
