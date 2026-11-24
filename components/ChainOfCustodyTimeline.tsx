'use client';

import React from 'react';
import { ChainOfCustodyEvent } from '@/types';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  AlertTriangle,
  QrCode,
  UserCheck
} from 'lucide-react';

interface ChainOfCustodyTimelineProps {
  events: ChainOfCustodyEvent[];
}

export default function ChainOfCustodyTimeline({ events }: ChainOfCustodyTimelineProps) {
  const getStageIcon = (stage: string, qrVerified?: boolean) => {
    switch (stage) {
      case 'CREATION':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />;
      case 'CLAIM':
        return <UserCheck className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />;
      case 'PICKUP':
        return qrVerified ? <QrCode className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} /> : <Truck className="w-3.5 h-3.5 text-[#B45309]" strokeWidth={1.75} />;
      case 'IN_TRANSIT':
        return <Truck className="w-3.5 h-3.5 text-[#B45309]" strokeWidth={1.75} />;
      case 'DELIVERY':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />;
      case 'REOPENED':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#C2410C]" strokeWidth={1.75} />;
      case 'EXPIRED':
        return <Clock className="w-3.5 h-3.5 text-[#991B1B]" strokeWidth={1.75} />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />;
    }
  };

  const getStageBadgeClass = (stage: string) => {
    switch (stage) {
      case 'CREATION':
      case 'CLAIM':
      case 'DELIVERY':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]';
      case 'PICKUP':
      case 'IN_TRANSIT':
        return 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      case 'REOPENED':
      case 'EXPIRED':
        return 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
      default:
        return 'bg-[#F8F7F4] text-[#57534E] border-[#E6E2D8]';
    }
  };

  return (
    <div className="relative pl-5 space-y-2.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E6E2D8]">
      {events.map((evt, index) => {
        const timeFormatted = new Date(evt.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <div key={evt.id || index} className="relative group text-xs font-mono">
            {/* Timeline Node dot */}
            <div className="absolute -left-5 top-1.5 w-4 h-4 rounded-full bg-[#FFFFFF] border border-[#E6E2D8] flex items-center justify-center">
              {getStageIcon(evt.stage, evt.qrVerified)}
            </div>

            {/* Event Content Box */}
            <div className="bg-[#FFFFFF] rounded-md p-2.5 border border-[#E6E2D8]">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider border ${getStageBadgeClass(evt.stage)}`}>
                    {evt.stage}
                  </span>
                  <span className="font-semibold text-[#1C1917] font-sans">
                    {evt.actor}
                  </span>
                  <span className="text-[10px] text-[#57534E]">
                    ({evt.actorRole})
                  </span>
                </div>
                <span className="text-[10px] tabular-nums text-[#57534E]">
                  {timeFormatted}
                </span>
              </div>

              {evt.location && (
                <div className="flex items-center gap-1 text-[11px] text-[#57534E] mb-1 font-sans">
                  <MapPin className="w-3 h-3 text-[#78716C]" strokeWidth={1.75} />
                  <span>{evt.location}</span>
                </div>
              )}

              {evt.notes && (
                <div className="text-[11px] text-[#57534E] font-sans bg-[#F8F7F4] p-1.5 rounded border border-[#E6E2D8] mt-1">
                  {evt.notes}
                </div>
              )}

              {/* Verification Tag */}
              {evt.qrVerified && (
                <div className="mt-1 flex items-center gap-1.5 text-[9px] text-[#065F46] font-semibold border-t border-[#E6E2D8] pt-1">
                  ✓ Verified Handover via Digital Cryptographic Token
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
