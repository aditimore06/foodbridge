'use client';

import React, { useState, useEffect } from 'react';
import { Donation, MatchingScoreResult, SplitAllocation } from '@/types';
import { rankNGOsForDonation, calculateOptimalSplit } from '@/lib/matching';
import { useApp } from '@/context/AppContext';
import { 
  X, 
  GitFork, 
  MapPin, 
  Clock, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SplitMatchModalProps {
  donation: Donation;
  onClose: () => void;
}

export default function SplitMatchModal({ donation, onClose }: SplitMatchModalProps) {
  const { ngos, refreshData, setToastMessage } = useApp();
  const [matchingScores, setMatchingScores] = useState<MatchingScoreResult[]>([]);
  const [splitResult, setSplitResult] = useState<{
    isSplitNeeded: boolean;
    allocations: SplitAllocation[];
    unallocatedMeals: number;
    totalDistanceKm: number;
  }>({
    isSplitNeeded: false,
    allocations: [],
    unallocatedMeals: 0,
    totalDistanceKm: 0,
  });
  const [dispatching, setDispatching] = useState(false);

  useEffect(() => {
    if (donation && ngos.length > 0) {
      const scores = rankNGOsForDonation(donation, ngos);
      setMatchingScores(scores);

      const split = calculateOptimalSplit(donation, ngos);
      setSplitResult(split);
    }
  }, [donation, ngos]);

  // Execute Direct Match (Single NGO)
  const handleDirectClaim = async (ngoId: string) => {
    setDispatching(true);
    try {
      const res = await fetch(`/api/donations/${donation.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngoId, volunteerId: 'VOL-01' }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          text: `Rescue mission assigned to ${data.donation.claimedByNgoName}. Courier dispatched.`,
          type: 'success',
        });
        await refreshData();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  // Execute Multi-NGO Split Dispatch
  const handleApproveSplit = async () => {
    setDispatching(true);
    try {
      const res = await fetch(`/api/donations/${donation.id}/split`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          text: `Multi-shelter split approved across ${splitResult.allocations.length} partner shelters.`,
          type: 'success',
        });
        await refreshData();
        onClose();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDispatching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg shadow-xl text-[#1C1917] p-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4] transition"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[11px] font-medium mb-1.5">
            <GitFork className="w-3.5 h-3.5 text-[#065F46]" strokeWidth={1.75} />
            <span>Optimal Logistics Matching Engine</span>
          </div>
          <h3 className="text-base font-bold text-[#1C1917]">
            Redistribution Match Analysis for {donation.id}
          </h3>
          <p className="text-xs text-[#57534E] mt-0.5">
            Batch volume: <span className="font-mono tabular-nums font-semibold text-[#1C1917]">{donation.quantityMeals} meals</span> • Donor location: {donation.donorAddress}
          </p>
        </div>

        {/* Multi-Shelter Split Strategy Recommendation */}
        {splitResult.isSplitNeeded && splitResult.allocations.length > 0 && (
          <div className="mb-5 p-4 rounded-md bg-[#F8F7F4] border border-[#E6E2D8] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1C1917]">
                  Multi-Shelter Split Recommendation
                </h4>
                <p className="text-[11px] text-[#57534E]">
                  Batch exceeds single nearby shelter capacity. Routing across {splitResult.allocations.length} partners.
                </p>
              </div>
              <button
                onClick={handleApproveSplit}
                disabled={dispatching}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#1B4332] hover:bg-[#163829] text-white text-xs font-semibold transition disabled:opacity-50"
              >
                <span>{dispatching ? 'Splitting...' : 'Approve Split'}</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-1.5">
              {splitResult.allocations.map((alloc) => (
                <div key={alloc.ngoId} className="flex items-center justify-between p-2 rounded bg-[#FFFFFF] border border-[#E6E2D8] text-xs">
                  <div>
                    <span className="font-semibold text-[#1C1917]">{alloc.ngoName}</span>
                    <span className="text-[10px] text-[#57534E] ml-2 font-mono tabular-nums">
                      {alloc.distanceKm.toFixed(1)} km
                    </span>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-[#1B4332] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
                    {alloc.meals} meals
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Ranked Shelters */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#57534E] uppercase tracking-wider">
            Ranked Nearby Shelter Candidates
          </h4>

          <div className="divide-y divide-[#E6E2D8] border border-[#E6E2D8] rounded-md">
            {matchingScores.map((score) => (
              <div key={score.ngo.id} className="p-3 flex items-center justify-between gap-3 text-xs hover:bg-[#F8F7F4] transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C1917]">{score.ngo.name}</span>
                    <span className="font-mono tabular-nums text-[11px] text-[#1B4332] font-semibold bg-[#ECFDF5] px-1.5 py-0.2 rounded border border-[#A7F3D0]">
                      {score.score}% Match
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#57534E] font-mono tabular-nums">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#78716C]" strokeWidth={1.75} />
                      {score.distanceKm.toFixed(1)} km
                    </span>
                    <span>Remaining Cap: {score.remainingCapacity} meals</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDirectClaim(score.ngo.id)}
                  disabled={dispatching}
                  className="px-2.5 py-1.5 rounded-md border border-[#E6E2D8] hover:bg-[#FFFFFF] hover:border-[#CFC9BC] text-xs font-medium text-[#1C1917] transition disabled:opacity-50"
                >
                  Direct Assign
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
