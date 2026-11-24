'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('FoodBridge Uncaught Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white rounded-xl border border-[#E6E2D8] p-8 max-w-lg w-full shadow-[0_4px_16px_rgba(28,25,23,0.08)]">
        <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#C2410C] border border-orange-200 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h2 className="text-lg font-bold text-[#1C1917] mb-1">
          Something went wrong
        </h2>
        <p className="text-xs text-[#57534E] mb-4 leading-relaxed">
          {error?.message || 'An unexpected rendering error occurred in FoodBridge OS.'}
        </p>

        <div className="bg-[#F8F7F4] p-3 rounded-lg border border-[#E6E2D8] text-[11px] font-mono text-[#57534E] text-left overflow-x-auto max-h-32 mb-6">
          {error?.stack ? error.stack.split('\n').slice(0, 4).join('\n') : 'No stack trace available.'}
        </div>

        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-sm active:scale-[0.98] transition"
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Reload FoodBridge Engine</span>
        </button>
      </div>
    </div>
  );
}
