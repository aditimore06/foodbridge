'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LeafletMap from './LeafletMap';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
} from 'recharts';
import { 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  UtensilsCrossed, 
  Truck, 
  Clock,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Leaf,
  Layers
} from 'lucide-react';

export default function ImpactMapHub() {
  const { stats } = useApp();
  const [leaderboardData, setLeaderboardData] = useState<{
    topDonors: any[];
    topVolunteers: any[];
    monthlyTrends: any[];
  }>({
    topDonors: [],
    topVolunteers: [],
    monthlyTrends: [],
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setLeaderboardData({
            topDonors: data.topDonors,
            topVolunteers: data.topVolunteers,
            monthlyTrends: data.monthlyTrends,
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchStats();
  }, [stats?.totalMealsRescued]);

  return (
    <div className="space-y-8">
      
      {/* Premium Hero Impact Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#1B4332] text-[#F8F7F4] p-8 sm:p-10 shadow-[0_12px_36px_-8px_rgba(27,67,50,0.35)] border border-[#2D6A4F]">
        {/* Soft atmospheric gradient accent */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#52B788]/20 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-[#D8F3DC]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D8F3DC]/15 border border-[#D8F3DC]/20 text-[#D8F3DC] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Real-Time Civic Food Logistics Network</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Redirecting surplus food into verified local shelters before expiry.
            </h1>
            <p className="text-sm text-[#D8F3DC]/80 leading-relaxed">
              Every batch logged is cryptographically tracked from donor kitchen to shelter intake through algorithmic Haversine dispatch corridors.
            </p>
          </div>

          {/* Prominent High-Impact Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-inner">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D8F3DC]/75">
                Total Meals Saved
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
                {stats?.totalMealsRescued?.toLocaleString() || '8,940'}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#B7E4C7] mt-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Safe Window</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-inner">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D8F3DC]/75">
                CO₂ Prevented
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
                {stats?.co2PreventedKg?.toLocaleString() || '22,350'} <span className="text-xs font-normal text-white/70">kg</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#B7E4C7] mt-1 font-medium">
                <Leaf className="w-3 h-3" />
                <span>Landfill Diversion</span>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-inner">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D8F3DC]/75">
                Avg Transit Window
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums mt-1">
                {stats?.avgRescueTimeMinutes || 21.4} <span className="text-xs font-normal text-white/70">min</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#B7E4C7] mt-1 font-medium">
                <Clock className="w-3 h-3" />
                <span>Optimal Routing</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-5 shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#57534E]">Completed Handover Runs</div>
              <div className="text-xl font-bold text-[#1C1917] font-mono tabular-nums mt-0.5">
                {stats?.completedDonations || 164}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-5 shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#57534E]">Verified Intake Shelters</div>
              <div className="text-xl font-bold text-[#1C1917] font-mono tabular-nums mt-0.5">
                {stats?.activeVerifiedNgos || 6}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-5 shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] hover:-translate-y-0.5 transition-all duration-200 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#57534E]">Active Volunteer Couriers</div>
              <div className="text-xl font-bold text-[#1C1917] font-mono tabular-nums mt-0.5">
                {stats?.activeVolunteers || 14}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Logistics Map */}
      <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E6E2D8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" strokeWidth={1.75} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1C1917]">
                Real-Time Civic Rescue Heatmap & Dispatch Corridors
              </h3>
              <p className="text-xs text-[#57534E] mt-0.5">
                Live donor kitchen surplus, shelter capacity levels, and active courier transit routes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
            <span className="flex items-center gap-1.5 text-[#57534E]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332] shadow-sm"></span>
              Kitchen Surplus
            </span>
            <span className="flex items-center gap-1.5 text-[#57534E]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#B45309] shadow-sm"></span>
              Intake Shelters
            </span>
            <span className="flex items-center gap-1.5 text-[#57534E]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C2410C] shadow-sm"></span>
              Active Transit
            </span>
          </div>
        </div>

        {/* Leaflet Map Hub Frame */}
        <div className="w-full rounded-xl overflow-hidden border border-[#E6E2D8] shadow-sm">
          <LeafletMap />
        </div>
      </div>

      {/* Leaderboards and Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Leaderboard: Kitchens */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6E2D8]">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center">
                <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span>Top Donor Kitchens</span>
            </h4>
            <span className="text-[10px] font-mono text-[#57534E] font-medium">Meals Donated</span>
          </div>

          <div className="space-y-3">
            {leaderboardData.topDonors?.map((donor, idx) => (
              <div key={donor.id || idx} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#F8F7F4] transition">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold text-[#57534E] w-4">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-[#1C1917]">{donor.name}</div>
                    <div className="text-[10px] text-[#57534E]">{donor.category}</div>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-bold text-[#1B4332] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                  {donor.meals?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard: Volunteers */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6E2D8]">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center">
                <Truck className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span>Courier Fleet Telemetry</span>
            </h4>
            <span className="text-[10px] font-mono text-[#57534E] font-medium">Verified Runs</span>
          </div>

          <div className="space-y-3">
            {leaderboardData.topVolunteers?.map((vol, idx) => (
              <div key={vol.id || idx} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-[#F8F7F4] transition">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] font-semibold text-[#57534E] w-4">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-[#1C1917]">{vol.name}</div>
                    <div className="text-[10px] text-[#57534E] font-mono">
                      Rating: {vol.rating} ★ • {vol.badge}
                    </div>
                  </div>
                </div>
                <span className="font-mono tabular-nums font-bold text-[#1B4332] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                  {vol.runs} runs
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E6E2D8]">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[#D8F3DC]/60 text-[#1B4332] flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={1.75} />
              </div>
              <span>Redistribution Trajectory</span>
            </h4>
            <span className="text-[10px] font-mono text-[#57534E] font-medium">Portions</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leaderboardData.monthlyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E2D8" vertical={false} />
                <XAxis dataKey="month" stroke="#78716C" fontSize={10} tickLine={false} />
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
                <Bar dataKey="meals" fill="#1B4332" radius={[6, 6, 0, 0]} name="Meals Rescued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
