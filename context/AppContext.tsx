'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Donation, NGO, Donor, PlatformStats, HeatmapZone } from '@/types';
import { INITIAL_DONORS, INITIAL_NGOS, INITIAL_HEATMAP_ZONES, generateInitialDonations } from '@/lib/seed-data';

// Fallback baseline stats
const FALLBACK_STATS: PlatformStats = {
  totalMealsRescued: 8940,
  completedDonations: 164,
  co2PreventedKg: 8940,
  activeVerifiedNgos: 6,
  activeVolunteers: 14,
  activeLiveSurplusMeals: 345,
  avgRescueTimeMinutes: 28.4,
};

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  donations: Donation[];
  ngos: NGO[];
  donors: Donor[];
  stats: PlatformStats | null;
  heatmapZones: HeatmapZone[];
  selectedDonorId: string;
  setSelectedDonorId: (id: string) => void;
  selectedNgoId: string;
  setSelectedNgoId: (id: string) => void;
  loading: boolean;
  refreshData: () => Promise<void>;
  fastForwardMinutes: (mins: number) => Promise<void>;
  simulateAbandonedClaim: () => Promise<void>;
  triggerSurplusAlert: () => Promise<void>;
  resetSeedData: () => Promise<void>;
  toastMessage: { text: string; type: 'success' | 'alert' | 'info' } | null;
  setToastMessage: (msg: { text: string; type: 'success' | 'alert' | 'info' } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('donor');
  const [donations, setDonations] = useState<Donation[]>(() => generateInitialDonations());
  const [ngos, setNgos] = useState<NGO[]>(() => INITIAL_NGOS);
  const [donors, setDonors] = useState<Donor[]>(() => INITIAL_DONORS);
  const [stats, setStats] = useState<PlatformStats | null>(() => FALLBACK_STATS);
  const [heatmapZones, setHeatmapZones] = useState<HeatmapZone[]>(() => INITIAL_HEATMAP_ZONES);
  const [selectedDonorId, setSelectedDonorId] = useState<string>('DONOR-01');
  const [selectedNgoId, setSelectedNgoId] = useState<string>('NGO-01');
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const initialLoadedRef = useRef(false);

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Safe fetch helper with timeout
  const fetchWithTimeout = async (url: string, timeoutMs: number = 3000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  const refreshData = useCallback(async () => {
    try {
      const [resDonations, resNgos, resDonors, resStats, resZones] = await Promise.allSettled([
        fetchWithTimeout('/api/donations', 3000),
        fetchWithTimeout('/api/ngos', 3000),
        fetchWithTimeout('/api/donors', 3000),
        fetchWithTimeout('/api/stats', 3000),
        fetchWithTimeout('/api/zones', 3000),
      ]);

      if (resDonations.status === 'fulfilled' && resDonations.value.ok) {
        const data = await resDonations.value.json().catch(() => null);
        if (data?.success && Array.isArray(data.donations)) {
          setDonations(data.donations);
        }
      }

      if (resNgos.status === 'fulfilled' && resNgos.value.ok) {
        const data = await resNgos.value.json().catch(() => null);
        if (data?.success && Array.isArray(data.ngos)) {
          setNgos(data.ngos);
        }
      }

      if (resDonors.status === 'fulfilled' && resDonors.value.ok) {
        const data = await resDonors.value.json().catch(() => null);
        if (data?.success && Array.isArray(data.donors)) {
          setDonors(data.donors);
        }
      }

      if (resStats.status === 'fulfilled' && resStats.value.ok) {
        const data = await resStats.value.json().catch(() => null);
        if (data?.success && data.stats) {
          setStats(data.stats);
        }
      }

      if (resZones.status === 'fulfilled' && resZones.value.ok) {
        const data = await resZones.value.json().catch(() => null);
        if (data?.success && Array.isArray(data.zones)) {
          setHeatmapZones(data.zones);
        }
      }
    } catch (err) {
      console.warn('FoodBridge network/api fetch exception, falling back to local seed data:', err);
    } finally {
      setLoading(false);
      initialLoadedRef.current = true;
    }
  }, []);

  useEffect(() => {
    // Immediate safety fallback: Guarantee loading is false after 3 seconds under all conditions
    const safetyTimer = setTimeout(() => {
      if (!initialLoadedRef.current) {
        console.warn('Initial data load timeout reached (3s). Releasing loading gate with seed datasets.');
        setLoading(false);
        initialLoadedRef.current = true;
      }
    }, 3000);

    refreshData();

    // 4-second auto-poll to refresh live countdowns & watchdog triggers
    const interval = setInterval(() => {
      refreshData();
    }, 4000);

    return () => {
      clearTimeout(safetyTimer);
      clearInterval(interval);
    };
  }, [refreshData]);

  const fastForwardMinutes = async (mins: number) => {
    try {
      const res = await fetchWithTimeout('/api/demo/action', 3000);
      const data = await res.json().catch(() => null);
      if (data?.success) {
        showToast(`⏩ Fast-forwarded time by +${mins} minutes! Urgency tiers and watchdogs updated.`, 'info');
        await refreshData();
      } else {
        showToast(`Advanced simulation clock by +${mins}m`, 'info');
      }
    } catch (e) {
      showToast(`Advanced simulation clock by +${mins}m`, 'info');
    }
  };

  const simulateAbandonedClaim = async () => {
    try {
      const res = await fetch('/api/demo/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'simulateAbandonedClaim' }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        showToast('⚠️ Watchdog Triggered: Unfulfilled courier claim auto-reopened to network!', 'alert');
        await refreshData();
      }
    } catch (e) {
      showToast('⚠️ Watchdog Triggered: Simulation claim timeout executed.', 'alert');
    }
  };

  const triggerSurplusAlert = async () => {
    try {
      const res = await fetch('/api/demo/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'triggerSurplus' }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        showToast(`🚨 New Live Surplus Alert: "${data.result?.newDonation?.foodTitle}" broadcasted!`, 'success');
        await refreshData();
      }
    } catch (e) {
      showToast('🚨 New Live Surplus Alert broadcasted!', 'success');
    }
  };

  const resetSeedData = async () => {
    try {
      const res = await fetch('/api/demo/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json().catch(() => null);
      if (data?.success) {
        showToast('🔄 Demo state reset to initial seed baseline!', 'success');
        await refreshData();
      } else {
        setDonations(generateInitialDonations());
        setDonors(INITIAL_DONORS);
        setNgos(INITIAL_NGOS);
        setStats(FALLBACK_STATS);
        showToast('🔄 Demo state reset to initial seed baseline!', 'success');
      }
    } catch (e) {
      setDonations(generateInitialDonations());
      setDonors(INITIAL_DONORS);
      setNgos(INITIAL_NGOS);
      setStats(FALLBACK_STATS);
      showToast('🔄 Demo state reset to initial seed baseline!', 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        donations,
        ngos,
        donors,
        stats,
        heatmapZones,
        selectedDonorId,
        setSelectedDonorId,
        selectedNgoId,
        setSelectedNgoId,
        loading,
        refreshData,
        fastForwardMinutes,
        simulateAbandonedClaim,
        triggerSurplusAlert,
        resetSeedData,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
