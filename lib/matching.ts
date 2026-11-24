import { NGO, Donation, MatchingScoreResult, SplitAllocation } from '@/types';
import { calculateHaversineDistance, estimateTransitMinutes } from './haversine';

/**
 * Score and rank candidate NGOs for a given donation using a multi-factor weighted algorithm.
 */
export function rankNGOsForDonation(
  donation: Donation,
  ngos: NGO[]
): MatchingScoreResult[] {
  const verifiedNgos = ngos.filter(
    (ngo) => ngo.verificationStatus === 'VERIFIED' && ngo.isAvailable
  );

  const now = new Date().getTime();
  const safeUntilMs = new Date(donation.safeUntil).getTime();
  const minutesRemaining = Math.max(0, Math.round((safeUntilMs - now) / 60000));

  const results: MatchingScoreResult[] = verifiedNgos.map((ngo) => {
    const distanceKm = calculateHaversineDistance(
      donation.donorLat,
      donation.donorLng,
      ngo.lat,
      ngo.lng
    );

    const remainingCap = Math.max(0, ngo.maxCapacity - ngo.currentCapacity);
    const canAccommodateFull = remainingCap >= donation.quantityMeals;
    const estimatedTransit = estimateTransitMinutes(distanceKm);

    // Factor 1: Proximity Score (0 to 40 pts)
    // Within 2km = 40pts, scales down to 0 at 15km
    let proximityScore = 0;
    if (distanceKm <= 2) {
      proximityScore = 40;
    } else if (distanceKm <= 15) {
      proximityScore = Math.max(0, 40 * (1 - (distanceKm - 2) / 13));
    }

    // Factor 2: Capacity Match Score (0 to 30 pts)
    let capacityScore = 0;
    if (canAccommodateFull) {
      // Optimal fit without huge excess waste of capacity
      const ratio = donation.quantityMeals / remainingCap;
      capacityScore = 20 + Math.min(10, Math.round(ratio * 10)); // 20 - 30 pts
    } else {
      // Partial capacity score
      capacityScore = Math.min(18, Math.round((remainingCap / donation.quantityMeals) * 18));
    }

    // Factor 3: Urgency Alignment & Transit Viability (0 to 20 pts)
    let urgencyScore = 15;
    if (minutesRemaining < 45) {
      // Critical: NGO must be reachable quickly
      if (estimatedTransit <= 15) {
        urgencyScore = 20;
      } else if (estimatedTransit <= 30) {
        urgencyScore = 10;
      } else {
        urgencyScore = 0; // risky delivery
      }
    } else {
      urgencyScore = 15;
    }

    // Factor 4: Cold Storage & Operational Bonus (0 to 10 pts)
    let opsScore = 5;
    if (ngo.coldStorageAvailable && donation.temperatureState !== 'ROOM_TEMP') {
      opsScore += 5;
    }

    const totalScore = Math.min(100, Math.round(proximityScore + capacityScore + urgencyScore + opsScore));

    // Transparent Reason Tags
    const reasons: string[] = [];
    reasons.push(`${distanceKm} km away (~${estimatedTransit}m transit)`);
    if (canAccommodateFull) {
      reasons.push(`Capacity verified (Can absorb ${donation.quantityMeals}/${remainingCap} open slots)`);
    } else {
      reasons.push(`Partial fit: Absorbs ${remainingCap} of ${donation.quantityMeals} meals`);
    }

    if (minutesRemaining <= 45) {
      reasons.push(`⚡ Fast transit viable for critical ${minutesRemaining}m safe window`);
    }
    if (ngo.coldStorageAvailable) {
      reasons.push(`❄️ Cold storage equipped for food safety`);
    }
    if (ngo.onTimeRate >= 95) {
      reasons.push(`🛡️ High reliability (${ngo.onTimeRate}% on-time rescue record)`);
    }

    return {
      ngo,
      distanceKm,
      score: totalScore,
      canAccommodateFull,
      remainingCapacity: remainingCap,
      reasons,
    };
  });

  // Sort descending by score, then ascending by distance
  return results.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm);
}

/**
 * Smart Split-Donation Engine:
 * When a donation exceeds any single NGO's remaining capacity,
 * automatically compute an optimal distribution plan across 2-3 nearby NGOs.
 */
export function calculateOptimalSplit(
  donation: Donation,
  ngos: NGO[]
): {
  isSplitNeeded: boolean;
  allocations: SplitAllocation[];
  unallocatedMeals: number;
  totalDistanceKm: number;
} {
  const verifiedNgos = ngos
    .filter((n) => n.verificationStatus === 'VERIFIED' && n.isAvailable)
    .map((ngo) => {
      const distanceKm = calculateHaversineDistance(
        donation.donorLat,
        donation.donorLng,
        ngo.lat,
        ngo.lng
      );
      const remainingCap = Math.max(0, ngo.maxCapacity - ngo.currentCapacity);
      return { ngo, distanceKm, remainingCap };
    })
    .filter((item) => item.remainingCap > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm); // Closest first

  const maxSingleCapacity = Math.max(0, ...verifiedNgos.map((n) => n.remainingCap));
  const isSplitNeeded = donation.quantityMeals > maxSingleCapacity;

  if (!isSplitNeeded || verifiedNgos.length === 0) {
    return {
      isSplitNeeded: false,
      allocations: [],
      unallocatedMeals: 0,
      totalDistanceKm: 0,
    };
  }

  let mealsLeft = donation.quantityMeals;
  const allocations: SplitAllocation[] = [];
  let totalDistance = 0;

  for (const item of verifiedNgos) {
    if (mealsLeft <= 0) break;
    const allocated = Math.min(mealsLeft, item.remainingCap);
    if (allocated > 0) {
      allocations.push({
        ngoId: item.ngo.id,
        ngoName: item.ngo.name,
        meals: allocated,
        distanceKm: item.distanceKm,
        status: 'PENDING',
      });
      mealsLeft -= allocated;
      totalDistance += item.distanceKm;
    }
  }

  return {
    isSplitNeeded: true,
    allocations,
    unallocatedMeals: mealsLeft,
    totalDistanceKm: Math.round(totalDistance * 10) / 10,
  };
}
