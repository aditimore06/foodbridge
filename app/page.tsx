'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import DonorPortal from '@/components/DonorPortal';
import NgoPortal from '@/components/NgoPortal';
import ImpactMapHub from '@/components/ImpactMapHub';
import AdminConsole from '@/components/AdminConsole';

export default function Home() {
  const { role, loading } = useApp();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-8 h-8 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin mb-3" />
        <h3 className="text-sm font-semibold text-[#1C1917]">Loading FoodBridge Logistics Engine...</h3>
        <p className="text-xs text-[#57534E] mt-1">Initializing real-time routing & verification nodes</p>
      </div>
    );
  }

  return (
    <div>
      {role === 'donor' && <DonorPortal />}
      {role === 'ngo' && <NgoPortal />}
      {role === 'public' && <ImpactMapHub />}
      {role === 'admin' && <AdminConsole />}
    </div>
  );
}
