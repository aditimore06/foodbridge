'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Donation } from '@/types';
import CountdownTimer from './CountdownTimer';
import ChainOfCustodyTimeline from './ChainOfCustodyTimeline';
import QrScannerModal from './QrScannerModal';
import { calculateHaversineDistance, estimateTransitMinutes } from '@/lib/haversine';
import { 
  ShieldCheck, 
  Truck, 
  MapPin, 
  Clock, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Package,
  CheckCircle2,
  AlertCircle,
  HeartHandshake
} from 'lucide-react';

export default function NgoPortal() {
  const { donations, ngos, selectedNgoId, refreshData, setToastMessage } = useApp();
  const currentNgo = ngos.find((n) => n.id === selectedNgoId) || ngos[0];

  const [activeTab, setActiveTab] = useState<'available' | 'active_missions' | 'delivered'>('available');
  const [selectedDonationForScan, setSelectedDonationForScan] = useState<Donation | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  // Available open donations
  const availableDonations = donations
    .filter((d) => d.status === 'OPEN')
    .map((d) => {
      const distance = calculateHaversineDistance(
        currentNgo.lat,
        currentNgo.lng,
        d.donorLat,
        d.donorLng
      );
      const transitMinutes = estimateTransitMinutes(distance);
      return { ...d, distance, transitMinutes };
    })
    .sort((a, b) => {
      if (a.priorityTier === 'CRITICAL' && b.priorityTier !== 'CRITICAL') return -1;
      if (a.priorityTier !== 'CRITICAL' && b.priorityTier === 'CRITICAL') return 1;
      return a.distance - b.distance;
    });

  // Active missions (CLAIMED or IN_TRANSIT)
  const activeMissions = donations.filter(
    (d) =>
      (d.status === 'CLAIMED' || d.status === 'IN_TRANSIT') &&
      (!d.claimedByNgoId || d.claimedByNgoId === currentNgo.id || true)
  );

  // Delivered donations
  const deliveredDonations = donations.filter((d) => d.status === 'DELIVERED');

  const handleClaim = async (donationId: string) => {
    setIsClaiming(donationId);
    try {
      const res = await fetch(`/api/donations/${donationId}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId: currentNgo.id,
          volunteerId: 'VOL-01',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage({
          text: `Rescue mission claimed. 15-minute pickup deadline initialized for ${data.donation.donorName}.`,
          type: 'success',
        });
        await refreshData();
        setActiveTab('active_missions');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(null);
    }
  };

  const capacityPercent = Math.min(
    100,
    Math.round((currentNgo.currentCapacity / currentNgo.maxCapacity) * 100)
  );

  return (
    <div className="space-y-8">
      
      {/* Shelter Header & Real-Time Capacity Telemetry with depth */}
      <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 sm:p-7 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D8F3DC]/70 text-[#1B4332] flex items-center justify-center shrink-0 shadow-sm">
              <HeartHandshake className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
                  {currentNgo?.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1B4332] border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />
                  <span>Verified Shelter Node</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#57534E] mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
                  <span>{currentNgo?.address}</span>
                </span>
                <span className="text-[#E6E2D8]">•</span>
                <span className="font-mono text-[11px] font-medium">Govt Reg: {currentNgo?.ngoRegNumber}</span>
                <span className="text-[#E6E2D8]">•</span>
                <span className="font-mono tabular-nums text-[11px] font-bold text-[#1B4332]">
                  {currentNgo?.totalMealsReceived?.toLocaleString() || '3,480'} meals distributed
                </span>
              </div>
            </div>
          </div>

          {/* Shelter Intake Capacity Gauge */}
          <div className="flex items-center gap-4 bg-[#F8F7F4] border border-[#E6E2D8] p-4 rounded-xl min-w-[260px] shadow-sm">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-[#57534E] font-semibold">Intake Capacity</span>
                <span className="font-mono tabular-nums font-bold text-[#1C1917]">
                  {currentNgo.currentCapacity}/{currentNgo.maxCapacity} meals
                </span>
              </div>
              <div className="w-full bg-[#E6E2D8] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    capacityPercent > 80 ? 'bg-[#C2410C]' : 'bg-[#1B4332]'
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>
            <span className="text-xs font-mono tabular-nums font-bold text-[#57534E]">
              {capacityPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E6E2D8] pb-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'available'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
          }`}
        >
          <span>Available Surplus Feeds</span>
          <span className={`font-mono tabular-nums px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'available' ? 'bg-white/20 text-white' : 'bg-[#E6E2D8] text-[#1C1917]'
          }`}>
            {availableDonations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('active_missions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'active_missions'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
          }`}
        >
          <span>Active Pickup Missions</span>
          {activeMissions.length > 0 && (
            <span className={`font-mono tabular-nums px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === 'active_missions' ? 'bg-white/20 text-white' : 'bg-[#E6E2D8] text-[#1C1917]'
            }`}>
              {activeMissions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'delivered'
              ? 'bg-[#1B4332] text-white shadow-sm'
              : 'text-[#57534E] hover:text-[#1C1917] hover:bg-white'
          }`}
        >
          <span>Completed Archive</span>
          <span className={`font-mono tabular-nums px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === 'delivered' ? 'bg-white/20 text-white' : 'bg-[#E6E2D8] text-[#1C1917]'
          }`}>
            {deliveredDonations.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Available Surplus Feeds */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableDonations.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E6E2D8] p-10 text-center text-xs text-[#57534E] shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
              No active surplus batches available within current range. Checking incoming broadcasts...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableDonations.map((d) => {
                const isUnder30 = d.priorityTier === 'CRITICAL';

                return (
                  <div
                    key={d.id}
                    className={`bg-white rounded-xl border p-6 flex flex-col justify-between shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] hover:-translate-y-0.5 transition-all duration-200 ${
                      isUnder30 ? 'border-orange-200 bg-[#FFFDFB]' : 'border-[#E6E2D8]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <span className="font-bold text-base text-[#1C1917]">
                            {d.foodTitle}
                          </span>
                          <p className="text-xs text-[#57534E] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
                            <span>{d.donorName}</span>
                            <span className="text-[#E6E2D8]">•</span>
                            <span className="font-mono tabular-nums font-bold text-[#1B4332]">
                              {d.distance.toFixed(1)} km ({d.transitMinutes} mins transit)
                            </span>
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-lg font-bold font-mono tabular-nums text-[#1B4332] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-emerald-200">
                            {d.quantityMeals} meals
                          </div>
                          <div className="text-[10px] text-[#57534E] mt-1 font-medium">
                            {d.foodCategory.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#E6E2D8] mt-4">
                      <div>
                        <CountdownTimer safeUntil={d.safeUntil} />
                      </div>

                      <button
                        onClick={() => handleClaim(d.id)}
                        disabled={isClaiming === d.id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(27,67,50,0.25)] hover:shadow-[0_4px_10px_rgba(27,67,50,0.3)] active:scale-[0.98] transition disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                        <span>{isClaiming === d.id ? 'Claiming...' : 'Claim & Dispatch Courier'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Active Pickup Missions */}
      {activeTab === 'active_missions' && (
        <div className="space-y-4">
          {activeMissions.length === 0 ? (
            <div className="bg-white rounded-xl border border-[#E6E2D8] p-10 text-center text-xs text-[#57534E] shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
              No active rescue missions in transit. Claim an open batch from the feeds tab.
            </div>
          ) : (
            <div className="space-y-4">
              {activeMissions.map((d) => {
                const isClaimed = d.status === 'CLAIMED';
                const isTimelineOpen = expandedTimelineId === d.id;

                return (
                  <div
                    key={d.id}
                    className="bg-white rounded-xl border border-[#E6E2D8] p-6 space-y-4 shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] transition-all duration-200"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isClaimed 
                              ? 'bg-amber-50 text-[#B45309] border-amber-200' 
                              : 'bg-emerald-50 text-[#1B4332] border-emerald-200'
                          }`}>
                            {isClaimed ? 'Awaiting Kitchen Pickup' : 'In Transit to Shelter'}
                          </span>
                          <span className="font-bold text-base text-[#1C1917]">
                            {d.foodTitle}
                          </span>
                          <span className="font-mono tabular-nums text-xs text-[#1B4332] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded border border-emerald-200">
                            {d.quantityMeals} meals
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 text-xs text-[#57534E]">
                          <span>Donor: <strong className="text-[#1C1917]">{d.donorName}</strong></span>
                          <span className="text-[#E6E2D8]">•</span>
                          <span>Courier Assigned: <strong className="text-[#1C1917]">{d.claimedByVolunteerId || 'VOL-01'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <CountdownTimer safeUntil={d.safeUntil} />

                        {/* QR Verification Scanner Button */}
                        <button
                          onClick={() => setSelectedDonationForScan(d)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(27,67,50,0.25)] hover:shadow-[0_4px_10px_rgba(27,67,50,0.3)] active:scale-[0.98] transition"
                        >
                          <QrCode className="w-4 h-4" strokeWidth={1.75} />
                          <span>{isClaimed ? 'Scan Pickup Handover' : 'Scan Shelter Delivery'}</span>
                        </button>

                        <button
                          onClick={() => setExpandedTimelineId(isTimelineOpen ? null : d.id)}
                          className="p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4] border border-transparent hover:border-[#E6E2D8] transition"
                        >
                          {isTimelineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {isTimelineOpen && (
                      <div className="pt-4 border-t border-[#E6E2D8]">
                        <div className="mb-2 text-xs font-bold text-[#57534E]">
                          Chain-of-Custody Verification Audit Log
                        </div>
                        <ChainOfCustodyTimeline events={d.chainOfCustody || []} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Completed Archive */}
      {activeTab === 'delivered' && (
        <div className="bg-white rounded-xl border border-[#E6E2D8] divide-y divide-[#E6E2D8] shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
          {deliveredDonations.length === 0 ? (
            <div className="p-10 text-center text-xs text-[#57534E]">
              No verified deliveries archived yet.
            </div>
          ) : (
            deliveredDonations.map((d) => (
              <div key={d.id} className="p-5 flex items-center justify-between text-xs hover:bg-[#F8F7F4] transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-[#1C1917]">{d.foodTitle}</span>
                    <span className="font-mono tabular-nums text-xs text-[#1B4332] font-bold bg-[#ECFDF5] px-2 py-0.5 rounded border border-emerald-200">
                      {d.quantityMeals} meals
                    </span>
                  </div>
                  <div className="text-[#57534E]">
                    Rescued from {d.donorName} • Delivered to {d.claimedByNgoName}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[#1B4332] border border-emerald-200 font-semibold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />
                  <span>Verified Safe Custody</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* QR Scanner / Desktop Simulator Modal */}
      {selectedDonationForScan && (
        <QrScannerModal
          donation={selectedDonationForScan}
          onClose={() => setSelectedDonationForScan(null)}
        />
      )}

    </div>
  );
}
