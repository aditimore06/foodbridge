'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers } from 'lucide-react';

const DynamicMap = dynamic(() => import('./LeafletMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[520px] rounded-md bg-[#F4F1EA] border border-[#E6E2D8] flex items-center justify-center text-[#57534E] text-xs">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
        <span>Loading Geographic Telemetry Map...</span>
      </div>
    </div>
  ),
});

export type ProvenanceFilter = 'ALL' | 'LIVE_PLATFORM' | 'SIMULATED_BASELINE';

export default function LeafletMap() {
  const [provenanceFilter, setProvenanceFilter] = useState<ProvenanceFilter>('ALL');

  return (
    <div className="relative w-full rounded-md overflow-hidden border border-[#E6E2D8] bg-[#FFFFFF]">
      
      {/* Top Map Control Bar & Provenance Filter */}
      <div className="p-3 bg-[#FFFFFF] border-b border-[#E6E2D8] flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Left: Map Layer Info */}
        <div className="flex items-center gap-2">
          <span className="p-1 rounded bg-[#F8F7F4] text-[#1B4332] border border-[#E6E2D8]">
            <Layers className="w-4 h-4" strokeWidth={1.75} />
          </span>
          <div>
            <div className="font-bold text-[#1C1917]">
              Urban Redistribution & Corridor Telemetry
            </div>
            <div className="text-[11px] text-[#57534E]">
              Live donor kitchen surplus, shelter capacity levels, and active courier transit routes
            </div>
          </div>
        </div>

        {/* Center / Right: Provenance Toggle */}
        <div className="flex items-center gap-1 bg-[#F8F7F4] p-1 rounded-md border border-[#E6E2D8]">
          <span className="text-[10px] text-[#57534E] font-medium uppercase px-1.5">
            Filter:
          </span>
          <button
            onClick={() => setProvenanceFilter('ALL')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              provenanceFilter === 'ALL'
                ? 'bg-[#1B4332] text-white'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            All Corridors
          </button>
          <button
            onClick={() => setProvenanceFilter('LIVE_PLATFORM')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              provenanceFilter === 'LIVE_PLATFORM'
                ? 'bg-[#1B4332] text-white'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Live Batches
          </button>
          <button
            onClick={() => setProvenanceFilter('SIMULATED_BASELINE')}
            className={`px-2 py-1 rounded text-xs font-medium transition ${
              provenanceFilter === 'SIMULATED_BASELINE'
                ? 'bg-[#1B4332] text-white'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            Regional Hotspots
          </button>
        </div>

      </div>

      {/* Render the dynamically imported Leaflet Map */}
      <div className="w-full h-[520px]">
        <DynamicMap filter={provenanceFilter} />
      </div>

      {/* Map Legend Footer */}
      <div className="p-2.5 bg-[#FFFFFF] border-t border-[#E6E2D8] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#57534E]">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B4332] border border-[#1B4332]" />
            <span>Donor Kitchen (Surplus Ready)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#B45309] border border-[#B45309]" />
            <span>Verified Intake Shelter</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-[#C2410C]" />
            <span>Active Courier Corridor</span>
          </div>
        </div>
        <div className="font-mono text-[10px] text-[#78716C]">
          Coordinates: Bengaluru Center (12.9600° N, 77.6200° E)
        </div>
      </div>

    </div>
  );
}
