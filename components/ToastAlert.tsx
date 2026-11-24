'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function ToastAlert() {
  const { toastMessage, setToastMessage } = useApp();

  if (!toastMessage) return null;

  const styleConfig = {
    success: {
      bg: 'bg-[#FFFFFF] border-[#1B4332] text-[#1C1917]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#1B4332] shrink-0" strokeWidth={1.75} />,
    },
    alert: {
      bg: 'bg-[#FFFFFF] border-[#C2410C] text-[#1C1917]',
      icon: <AlertTriangle className="w-4 h-4 text-[#C2410C] shrink-0" strokeWidth={1.75} />,
    },
    info: {
      bg: 'bg-[#FFFFFF] border-[#57534E] text-[#1C1917]',
      icon: <Info className="w-4 h-4 text-[#57534E] shrink-0" strokeWidth={1.75} />,
    },
  }[toastMessage.type];

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm w-full animate-in fade-in duration-200 pointer-events-auto">
      <div className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-md ${styleConfig.bg}`}>
        {styleConfig.icon}
        <div className="flex-1 text-xs font-medium leading-relaxed text-[#1C1917]">
          {toastMessage.text}
        </div>
        <button
          onClick={() => setToastMessage(null)}
          className="text-[#57534E] hover:text-[#1C1917] p-0.5 rounded transition"
          aria-label="Close message"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}
