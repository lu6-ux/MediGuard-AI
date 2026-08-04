'use client';

import React, { useState } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { LabTrend } from '@/types/medical';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, CartesianGrid } from 'recharts';

interface LabTrendVisualizerProps {
  labTrends: LabTrend[];
}

export const LabTrendVisualizer: React.FC<LabTrendVisualizerProps> = ({ labTrends }) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(labTrends[0]?.metricName || 'Fasting Blood Sugar');

  const currentTrend = labTrends.find(t => t.metricName === selectedMetric) || labTrends[0];

  if (!currentTrend) {
    return <div className="p-6 text-center text-slate-400">No laboratory trend data available.</div>;
  }

  const chartData = currentTrend.dataPoints.map(dp => ({
    date: dp.date,
    value: dp.value,
    isAbnormal: dp.isAbnormal
  }));

  return (
    <div className="space-y-6">
      
      {/* Header & Metric Selector Tabs */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            <span>Longitudinal Laboratory Result Trends</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Track test values drifting over time across multiple medical visits
          </p>
        </div>

        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          {labTrends.map((trend) => (
            <button
              key={trend.metricName}
              onClick={() => setSelectedMetric(trend.metricName)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedMetric === trend.metricName
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {trend.metricName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart & AI Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Chart Container */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>{currentTrend.metricName}</span>
                <span className="text-xs font-normal text-slate-400">({currentTrend.unit})</span>
              </h3>
              <span className="text-xs text-slate-400">Normal Range: {currentTrend.referenceRange}</span>
            </div>

            <span className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize flex items-center space-x-1 ${
              currentTrend.trendDirection === 'increasing' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{currentTrend.trendDirection} Trend</span>
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <ReferenceLine y={currentTrend.maxNormal} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Max Normal (${currentTrend.maxNormal})`, fill: '#f43f5e', fontSize: 10 }} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#10b981', stroke: '#090d16', strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Trend Explanation Callout Box */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-emerald-400 mb-3">
              <div className="flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                <span>AI Clinical Interpretation</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                {currentTrend.confidenceScore}% Confidence
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
              {currentTrend.explanation}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start space-x-2">
            <Info className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
            <span>Values drifting continuously out of range should be evaluated by a healthcare professional for treatment adjustment.</span>
          </div>
        </div>

      </div>

    </div>
  );
};
