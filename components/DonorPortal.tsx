'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Donation, FoodCategory, DietaryType } from '@/types';
import CountdownTimer from './CountdownTimer';
import ChainOfCustodyTimeline from './ChainOfCustodyTimeline';
import QrModal from './QrModal';
import SplitMatchModal from './SplitMatchModal';
import SurplusPredictionWidget from './SurplusPredictionWidget';
import { 
  Plus, 
  QrCode, 
  GitFork, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Package,
  Thermometer,
  AlertCircle,
  UtensilsCrossed,
  Sparkles
} from 'lucide-react';

export default function DonorPortal() {
  const { donations, donors, selectedDonorId, refreshData, setToastMessage } = useApp();
  const currentDonor = donors.find((d) => d.id === selectedDonorId) || donors[0];

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDonationForQr, setSelectedDonationForQr] = useState<Donation | null>(null);
  const [selectedDonationForMatch, setSelectedDonationForMatch] = useState<Donation | null>(null);
  const [expandedTimelineId, setExpandedTimelineId] = useState<string | null>(null);

  // Form State
  const [foodTitle, setFoodTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quantityMeals, setQuantityMeals] = useState<number>(45);
  const [foodCategory, setFoodCategory] = useState<FoodCategory>('COOKED_MEALS');
  const [dietaryType, setDietaryType] = useState<DietaryType>('VEGETARIAN');
  const [temperatureState, setTemperatureState] = useState<'HOT' | 'CHILLED' | 'ROOM_TEMP'>('HOT');
  const [packagingType, setPackagingType] = useState<'SEALED_CONTAINERS' | 'ALUMINUM_TRAYS' | 'INSULATED_BOXES'>('INSULATED_BOXES');
  const [safeUntilMinutes, setSafeUntilMinutes] = useState<number>(120);
  const [specialHandling, setSpecialHandling] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter donations for this donor or all donations relevant to donor perspective
  const donorDonations = donations.filter(
    (d) => d.donorId === currentDonor?.id || d.donorName === currentDonor?.name
  );

  // Sort: CRITICAL first, then URGENT, then STANDARD, then others
  const sortedDonations = [...donorDonations].sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;
    if (a.priorityTier === 'CRITICAL' && b.priorityTier !== 'CRITICAL') return -1;
    if (a.priorityTier !== 'CRITICAL' && b.priorityTier === 'CRITICAL') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const safeUntil = new Date(now.getTime() + safeUntilMinutes * 60 * 1000).toISOString();

      const res = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorId: currentDonor.id,
          donorName: currentDonor.name,
          donorAddress: currentDonor.address,
          donorLat: currentDonor.lat,
          donorLng: currentDonor.lng,
          foodTitle,
          description,
          quantityMeals,
          foodCategory,
          dietaryType,
          temperatureState,
          packagingType,
          safeUntil,
          specialHandling,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToastMessage({
          text: `Surplus manifest "${foodTitle}" published to network. Routing to verified shelters.`,
          type: 'success',
        });
        await refreshData();
        setFoodTitle('');
        setDescription('');
        setSpecialHandling('');
        setShowCreateForm(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1B4332] border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>Broadcasting</span>
          </span>
        );
      case 'CLAIMED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-[#B45309] border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span>
            <span>Courier Dispatched</span>
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-[#065F46] border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
            <span>In Transit</span>
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F7F4] text-[#57534E] border border-[#E6E2D8]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#78716C]"></span>
            <span>Delivered & Verified</span>
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-[#C2410C] border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
            <span>Safety Expired</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F8F7F4] text-[#57534E] border border-[#E6E2D8]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Donor Kitchen Header Card with soft elevation */}
      <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 sm:p-7 shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#D8F3DC]/70 text-[#1B4332] flex items-center justify-center shrink-0 shadow-sm">
              <UtensilsCrossed className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-[#1C1917] tracking-tight">
                  {currentDonor?.name}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-[#1B4332] border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />
                  <span>Verified Kitchen Node</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#57534E] mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
                  <span>{currentDonor?.address}</span>
                </span>
                <span className="text-[#E6E2D8]">•</span>
                <span className="font-mono text-[11px] font-medium">FSSAI: {currentDonor?.fssaiLicense}</span>
                <span className="text-[#E6E2D8]">•</span>
                <span className="font-mono tabular-nums text-[11px] font-bold text-[#1B4332]">
                  {currentDonor?.totalMealsDonated?.toLocaleString() || '1,240'} meals rescued
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(27,67,50,0.3)] hover:shadow-[0_4px_12px_rgba(27,67,50,0.35)] active:scale-[0.98] transition-all duration-200"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span>{showCreateForm ? 'Close Manifest' : 'Log Surplus Manifest'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Smart Predictive Widget */}
      <SurplusPredictionWidget donorId={currentDonor.id} />

      {/* Manifest Creation Form Modal/Card */}
      {showCreateForm && (
        <div className="bg-white rounded-xl border border-[#E6E2D8] p-6 sm:p-7 shadow-[0_4px_16px_rgba(28,25,23,0.08)] animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E6E2D8]">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-[#1C1917]">
                Surplus Batch Manifest & Redistribution Window
              </h3>
              <p className="text-xs text-[#57534E]">
                Broadcast active kitchen surplus to shelters within calculated transit reach.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateDonation} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Surplus Batch Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50 Trays Steamed Basmati Rice & Mixed Dal Tadka"
                  value={foodTitle}
                  onChange={(e) => setFoodTitle(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3.5 py-2.5 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Estimated Portions (Meals) *
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={1000}
                  value={quantityMeals}
                  onChange={(e) => setQuantityMeals(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3.5 py-2.5 text-xs font-mono tabular-nums text-[#1C1917] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Category
                </label>
                <select
                  value={foodCategory}
                  onChange={(e) => setFoodCategory(e.target.value as FoodCategory)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="COOKED_MEALS">Cooked Meals</option>
                  <option value="RAW_INGREDIENTS">Raw Ingredients</option>
                  <option value="BAKERY_BREAD">Bakery & Bread</option>
                  <option value="PACKAGED_GOODS">Packaged Goods</option>
                  <option value="PRODUCE_FRUITS">Fresh Produce</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Dietary
                </label>
                <select
                  value={dietaryType}
                  onChange={(e) => setDietaryType(e.target.value as DietaryType)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                  <option value="EGGITARIAN">Eggitarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Thermal State
                </label>
                <select
                  value={temperatureState}
                  onChange={(e) => setTemperatureState(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="HOT">Hot Insulated (&gt;60°C)</option>
                  <option value="CHILLED">Chilled Cold-Chain (&lt;5°C)</option>
                  <option value="ROOM_TEMP">Ambient Room Temp</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Safe Window (Hours)
                </label>
                <select
                  value={safeUntilMinutes}
                  onChange={(e) => setSafeUntilMinutes(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3 py-2 text-xs font-mono tabular-nums text-[#1C1917] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value={45}>45 mins (Urgent)</option>
                  <option value={90}>1.5 Hours</option>
                  <option value={120}>2.0 Hours (Standard)</option>
                  <option value={180}>3.0 Hours</option>
                  <option value={240}>4.0 Hours</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Packaging Protocol
                </label>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value as any)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3 py-2 text-xs text-[#1C1917] focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="INSULATED_BOXES">Insulated Stainless Transport Boxes</option>
                  <option value="SEALED_CONTAINERS">Food-Grade Sealed Containers</option>
                  <option value="ALUMINUM_TRAYS">Heavy Aluminum Trays (Foil Sealed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Special Handling / Allergens
                </label>
                <input
                  type="text"
                  placeholder="e.g. Contains dairy. Keep upright. Prepared at 20:30."
                  value={specialHandling}
                  onChange={(e) => setSpecialHandling(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E6E2D8] rounded-lg px-3.5 py-2 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6E2D8]">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 rounded-lg border border-[#E6E2D8] text-xs font-semibold text-[#57534E] hover:bg-[#F8F7F4] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-bold shadow-[0_2px_6px_rgba(27,67,50,0.3)] active:scale-[0.98] transition disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Broadcast Manifest to Shelters'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manifest Inventory Section with Card Grid Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-bold text-[#1C1917]">
              Active Batches & Manifest Ledger
            </h3>
            <span className="text-xs font-mono tabular-nums text-[#57534E] px-2 py-0.5 rounded-full bg-white border border-[#E6E2D8] shadow-sm">
              {sortedDonations.length} records
            </span>
          </div>
          <span className="text-xs font-mono text-[#57534E] hidden sm:block">
            Priority window & freshness order
          </span>
        </div>

        {sortedDonations.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E6E2D8] p-10 text-center text-xs text-[#57534E] shadow-[0_2px_8px_rgba(28,25,23,0.06)]">
            No surplus food logged currently. Click &quot;Log Surplus Manifest&quot; to initiate redistribution.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedDonations.map((d) => {
              const isTimelineOpen = expandedTimelineId === d.id;

              return (
                <div 
                  key={d.id} 
                  className="bg-white rounded-xl border border-[#E6E2D8] p-5 shadow-[0_2px_8px_rgba(28,25,23,0.06)] hover:shadow-[0_6px_16px_rgba(28,25,23,0.10)] transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Item Details */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {getStatusBadge(d.status)}
                        <span className="font-bold text-base text-[#1C1917]">
                          {d.foodTitle}
                        </span>
                        <span className="text-xs font-mono tabular-nums font-bold text-[#1B4332] bg-[#ECFDF5] border border-emerald-200 px-2.5 py-0.5 rounded-md">
                          {d.quantityMeals} meals
                        </span>
                        <span className="text-[11px] font-mono text-[#57534E] px-2 py-0.5 rounded bg-[#F8F7F4] border border-[#E6E2D8]">
                          {d.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#57534E]">
                        <span className="flex items-center gap-1.5">
                          <Package className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
                          <span>{d.foodCategory.replace('_', ' ')} • {d.dietaryType}</span>
                        </span>
                        <span className="text-[#E6E2D8]">•</span>
                        <span className="flex items-center gap-1.5">
                          <Thermometer className="w-3.5 h-3.5 text-[#57534E]" strokeWidth={1.75} />
                          <span>{d.temperatureState}</span>
                        </span>
                        {d.claimedByNgoName && (
                          <>
                            <span className="text-[#E6E2D8]">•</span>
                            <span className="text-[#1B4332] font-semibold">
                              Shelter: {d.claimedByNgoName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expiry & Logistics Controls */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      <div>
                        <CountdownTimer safeUntil={d.safeUntil} />
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Split Recommendation Action if high portions */}
                        {d.status === 'OPEN' && d.quantityMeals >= 60 && (
                          <button
                            onClick={() => setSelectedDonationForMatch(d)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-[#F8F7F4] border border-[#E6E2D8] text-xs font-semibold text-[#1C1917] shadow-sm hover:shadow transition active:scale-[0.98]"
                            title="Split across multiple shelters"
                          >
                            <GitFork className="w-3.5 h-3.5 text-[#1B4332]" strokeWidth={1.75} />
                            <span>Split Match</span>
                          </button>
                        )}

                        {/* Handover QR Code Presentation */}
                        <button
                          onClick={() => setSelectedDonationForQr(d)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-xs font-semibold shadow-[0_2px_6px_rgba(27,67,50,0.25)] hover:shadow-[0_4px_10px_rgba(27,67,50,0.3)] transition active:scale-[0.98]"
                          title="Show Handover QR Code"
                        >
                          <QrCode className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
                          <span>Handover QR</span>
                        </button>

                        {/* Timeline Audit Accordion Toggle */}
                        <button
                          onClick={() => setExpandedTimelineId(isTimelineOpen ? null : d.id)}
                          className="p-2 rounded-lg text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F7F4] border border-transparent hover:border-[#E6E2D8] transition"
                          aria-label="Toggle chain of custody"
                        >
                          {isTimelineOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Chain of Custody Dropdown */}
                  {isTimelineOpen && (
                    <div className="mt-4 pt-4 border-t border-[#E6E2D8]">
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

      {/* QR Code Presentation Modal */}
      {selectedDonationForQr && (
        <QrModal
          donation={selectedDonationForQr}
          onClose={() => setSelectedDonationForQr(null)}
        />
      )}

      {/* Multi-Shelter Split Dispatch Modal */}
      {selectedDonationForMatch && (
        <SplitMatchModal
          donation={selectedDonationForMatch}
          onClose={() => setSelectedDonationForMatch(null)}
        />
      )}

    </div>
  );
}
