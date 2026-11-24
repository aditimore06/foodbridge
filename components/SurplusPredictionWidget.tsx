'use client';

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
} from 'recharts';
import { SurplusPrediction } from '@/types';
import { 
  TrendingUp, 
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';

interface SurplusPredictionWidgetProps {
  donorId: string;
  onPreSchedule?: (prediction: SurplusPrediction) => void;
}

export default function SurplusPredictionWidget({ donorId, onPreSchedule }: SurplusPredictionWidgetProps) {
  const [predictions, setPredictions] = useState<SurplusPrediction[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPredictions() {
      try {
        const res = await fetch(`/api/predictions?donorId=${donorId}`);
        const data = await res.json();
        if (data.success) {
          setPredictions(data.predictions);
          setChartData(data.chartData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchPredictions();
  }, [donorId]);

  if (loading) {
    return (
      <div className="p-6 rounded-xl bg-white border border-[#E6E2D8] text-center text-xs text-[#57534E] shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
        Loading historical telemetry and surplus forecast...
      </div>
    );
  }

  const primaryPrediction = predictions[0];

  return (
    <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 sm:p-7 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E6E2D8]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D8F3DC]/70 text-[#1B4332] flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">
              Surplus Volume Forecast & Pre-Dispatch Intelligence
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5">
              Statistical regression on recurring meal volumes across 6-week operational logs
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#F8F7F4] text-[#57534E] border border-[#E6E2D8] shadow-sm shrink-0">
          <Info className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
          <span>Historical Model</span>
        </span>
      </div>

      {/* Main Forecast Callout with Elevation */}
      {primaryPrediction && (
        <div className="mb-6 p-5 rounded-xl bg-[#F8F7F4] border border-[#E6E2D8] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1B4332]">
                <Sparkles className="w-4 h-4 text-[#1B4332]" strokeWidth={1.75} />
                <span>Predicted Window ({primaryPrediction.dayOfWeek})</span>
                <span className="text-[10px] font-mono tabular-nums px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-emerald-200 font-bold">
                  {primaryPrediction.confidenceScore}% Confidence
                </span>
              </div>
              <p className="text-xs text-[#1C1917] leading-relaxed">
                {primaryPrediction.recommendedAction}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {primaryPrediction.topItemSurplus.map((item, idx) => (
                  <span key={idx} className="text-[11px] px-2.5 py-1 rounded-md bg-white text-[#57534E] border border-[#E6E2D8] shadow-sm font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-xl font-black text-[#1B4332] font-mono tabular-nums">
                  ~{primaryPrediction.averageSurplusMeals} meals
                </div>
                <div className="text-[10px] text-[#57534E] font-mono tabular-nums mt-0.5">
                  Variance: ±{primaryPrediction.forecastVariance} meals
                </div>
              </div>

              {onPreSchedule && (
                <button
                  onClick={() => onPreSchedule(primaryPrediction)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-[0_2px_6px_rgba(27,67,50,0.3)] hover:shadow-[0_4px_10px_rgba(27,67,50,0.35)] active:scale-[0.98] transition"
                >
                  <span>Pre-Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Historical vs Predicted Chart */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
            6-Week Trend vs. 2-Week Forward Forecast
          </span>
          <span className="text-[11px] text-[#57534E] font-mono tabular-nums">
            IIT Mess Friday 21:30 Window (Meals)
          </span>
        </div>

        <div className="w-full h-52 bg-white rounded-xl p-3 border border-[#E6E2D8] shadow-inner">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHistorical" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1B4332" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#1B4332" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B45309" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#B45309" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D8" vertical={false} />
              <XAxis dataKey="week" stroke="#78716C" fontSize={10} tickLine={false} />
              <YAxis stroke="#78716C" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E6E2D8',
                  borderRadius: '8px',
                  fontSize: '11px',
                  color: '#1C1917',
                  boxShadow: '0 4px 12px rgba(28,25,23,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke="#1B4332" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorHistorical)" 
                name="Historical Actual"
              />
              <Area 
                type="monotone" 
                dataKey="predicted" 
                stroke="#B45309" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorPredicted)" 
                name="Forecasted Estimate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
