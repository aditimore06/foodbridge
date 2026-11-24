'use client';

import React, { useState, useEffect } from 'react';
import { PriorityTier } from '@/types';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownTimerProps {
  safeUntil: string;
  onExpire?: () => void;
  showIcon?: boolean;
}

export default function CountdownTimer({ safeUntil, onExpire, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    tier: PriorityTier;
    isExpired: boolean;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    tier: 'STANDARD',
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(safeUntil).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          tier: 'CRITICAL',
          isExpired: true,
        });
        if (onExpire) onExpire();
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const totalMinutes = Math.floor(totalSeconds / 60);
      let tier: PriorityTier = 'STANDARD';
      if (totalMinutes <= 30) {
        tier = 'CRITICAL';
      } else if (totalMinutes <= 90) {
        tier = 'URGENT';
      }

      setTimeLeft({
        hours,
        minutes,
        seconds,
        totalSeconds,
        tier,
        isExpired: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [safeUntil, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
        <span className="font-mono tabular-nums">00:00:00</span>
        <span className="text-[10px] uppercase font-bold tracking-wider">Expired</span>
      </span>
    );
  }

  const formatPad = (n: number) => String(n).padStart(2, '0');
  const timeString = `${formatPad(timeLeft.hours)}:${formatPad(timeLeft.minutes)}:${formatPad(timeLeft.seconds)}`;

  if (timeLeft.tier === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-[#C2410C] border border-orange-200 shadow-sm animate-pulse">
        {showIcon && <Clock className="w-3.5 h-3.5 text-[#C2410C]" strokeWidth={2} />}
        <span className="text-[10px] uppercase font-bold tracking-wider">Expires</span>
        <span className="font-mono tabular-nums font-black tracking-tight">{timeString}</span>
      </span>
    );
  }

  if (timeLeft.tier === 'URGENT') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-[#B45309] border border-amber-200 shadow-sm">
        {showIcon && <Clock className="w-3.5 h-3.5 text-[#B45309]" strokeWidth={1.75} />}
        <span className="text-[10px] uppercase font-bold tracking-wider">Remaining</span>
        <span className="font-mono tabular-nums font-bold tracking-tight">{timeString}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1B4332] border border-emerald-200 shadow-sm">
      {showIcon && <Clock className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />}
      <span className="text-[10px] uppercase font-bold tracking-wider">Safe for</span>
      <span className="font-mono tabular-nums font-bold tracking-tight">{timeString}</span>
    </span>
  );
}
