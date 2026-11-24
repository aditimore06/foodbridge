'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/types';
import { 
  UtensilsCrossed, 
  HeartHandshake, 
  Map, 
  ShieldCheck, 
  Layers,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { 
    role, 
    setRole, 
    donations, 
    donors, 
    ngos, 
    selectedDonorId, 
    setSelectedDonorId, 
    selectedNgoId, 
    setSelectedNgoId
  } = useApp();

  const criticalCount = donations.filter((d) => d.status === 'OPEN' && d.priorityTier === 'CRITICAL').length;
  const activeCount = donations.filter((d) => d.status === 'OPEN' || d.status === 'CLAIMED' || d.status === 'IN_TRANSIT').length;

  const roles: { id: UserRole; label: string; icon: React.ReactNode }[] = [
    { 
      id: 'donor', 
      label: 'Donor Kitchens', 
      icon: <UtensilsCrossed className="w-3.5 h-3.5" strokeWidth={1.75} /> 
    },
    { 
      id: 'ngo', 
      label: 'NGO & Shelters', 
      icon: <HeartHandshake className="w-3.5 h-3.5" strokeWidth={1.75} /> 
    },
    { 
      id: 'public', 
      label: 'Impact Telemetry', 
      icon: <Map className="w-3.5 h-3.5" strokeWidth={1.75} /> 
    },
    { 
      id: 'admin', 
      label: 'Verification & Trust', 
      icon: <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} /> 
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E6E2D8] text-[#1C1917] shadow-[0_2px_10px_rgba(28,25,23,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Platform Tagline */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-[0_2px_6px_rgba(27,67,50,0.3)]">
              <Layers className="w-4 h-4 text-white" strokeWidth={1.75} />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg tracking-tight text-[#1C1917]">
                FoodBridge
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-semibold bg-[#D8F3DC] text-[#1B4332]">
                Rescue OS
              </span>
            </div>
          </div>

          {/* Role Switching Tabs */}
          <nav className="flex items-center bg-[#F4F1EA] p-1 rounded-lg border border-[#E6E2D8] overflow-x-auto scrollbar-none">
            {roles.map((tab) => {
              const isActive = role === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setRole(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'bg-[#1B4332] text-white shadow-[0_2px_6px_rgba(27,67,50,0.25)]'
                      : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white/60'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#57534E]'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  {tab.id === 'donor' && criticalCount > 0 && (
                    <span className="ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums bg-[#C2410C] text-white font-bold shadow-sm">
                      {criticalCount}
                    </span>
                  )}
                  {tab.id === 'ngo' && activeCount > 0 && (
                    <span className={`ml-1 inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-mono tabular-nums font-bold ${
                      isActive ? 'bg-white text-[#1B4332]' : 'bg-[#E6E2D8] text-[#1C1917]'
                    }`}>
                      {activeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Identity & Context Selector */}
          <div className="flex items-center gap-2 shrink-0">
            {role === 'donor' && (
              <div className="hidden lg:flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8] shadow-sm">
                <span className="text-[#57534E] font-medium">Kitchen:</span>
                <select
                  value={selectedDonorId}
                  onChange={(e) => setSelectedDonorId(e.target.value)}
                  className="bg-transparent text-[#1B4332] font-semibold focus:outline-none cursor-pointer"
                >
                  {donors.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white text-[#1C1917]">
                      {d.name.length > 25 ? d.name.substring(0, 24) + '...' : d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {role === 'ngo' && (
              <div className="hidden lg:flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-[#E6E2D8] shadow-sm">
                <span className="text-[#57534E] font-medium">Shelter:</span>
                <select
                  value={selectedNgoId}
                  onChange={(e) => setSelectedNgoId(e.target.value)}
                  className="bg-transparent text-[#1B4332] font-semibold focus:outline-none cursor-pointer"
                >
                  {ngos.map((n) => (
                    <option key={n.id} value={n.id} className="bg-white text-[#1C1917]">
                      {n.name.length > 25 ? n.name.substring(0, 24) + '...' : n.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
