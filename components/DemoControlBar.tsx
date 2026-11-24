'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FastForward, 
  AlertTriangle, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Sliders,
  Clock,
  Radio
} from 'lucide-react';

export default function DemoControlBar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    fastForwardMinutes, 
    simulateAbandonedClaim, 
    triggerSurplusAlert, 
    resetSeedData,
  } = useApp();

  return (
    <aside aria-label="Demo Simulator Controls" className="fixed bottom-3 right-4 z-50 pointer-events-auto">
      <div className="bg-[#1C1917] border border-[#292524] rounded-lg shadow-xl text-[#F8F7F4] overflow-hidden w-72 sm:w-80">
        
        {/* Header Bar */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between px-3 py-2 cursor-pointer select-none border-b border-[#292524] hover:bg-[#292524]/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-medium tracking-wide uppercase text-[#F8F7F4]">
              <Sliders className="w-3 h-3 text-[#A8A29E]" strokeWidth={1.75} />
              <span>Logistics Simulation</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[#A8A29E]">
            <span className="text-[10px] font-mono uppercase text-[#78716C]">
              {isExpanded ? 'Hide' : 'Controls'}
            </span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </div>

        {/* Action Controls */}
        {isExpanded && (
          <div className="p-2.5 bg-[#1C1917] space-y-1.5 text-xs font-mono">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => fastForwardMinutes(30)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#292524] hover:bg-[#44403C] text-[#F8F7F4] border border-[#44403C] transition text-left"
              >
                <FastForward className="w-3 h-3 text-[#10B981]" strokeWidth={1.75} />
                <span className="tabular-nums">+30 Mins</span>
              </button>

              <button
                onClick={() => fastForwardMinutes(60)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#292524] hover:bg-[#44403C] text-[#F8F7F4] border border-[#44403C] transition text-left"
              >
                <Clock className="w-3 h-3 text-[#B45309]" strokeWidth={1.75} />
                <span className="tabular-nums">+60 Mins</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <button
                onClick={simulateAbandonedClaim}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#292524] hover:bg-[#44403C] text-[#F8F7F4] border border-[#44403C] transition text-left"
              >
                <AlertTriangle className="w-3 h-3 text-[#C2410C]" strokeWidth={1.75} />
                <span>Claim Timeout</span>
              </button>

              <button
                onClick={triggerSurplusAlert}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#292524] hover:bg-[#44403C] text-[#F8F7F4] border border-[#44403C] transition text-left"
              >
                <Radio className="w-3 h-3 text-[#10B981]" strokeWidth={1.75} />
                <span>Surplus Event</span>
              </button>
            </div>

            <div className="pt-1 border-t border-[#292524]">
              <button
                onClick={resetSeedData}
                className="w-full flex items-center justify-center gap-1.5 px-2 py-1 rounded-md text-[#A8A29E] hover:text-white hover:bg-[#292524] transition text-[11px]"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.75} />
                <span>Reset Simulation Seed</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </aside>
  );
}
