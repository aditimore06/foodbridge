import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function GET() {
  const stats = foodBridgeStore.getPlatformStats();
  const donors = foodBridgeStore.getDonors();
  const volunteers = foodBridgeStore.getVolunteers();
  const ngos = foodBridgeStore.getNgos();

  // Gamified Leaderboard rankings
  const topDonors = [...donors]
    .sort((a, b) => b.totalMealsDonated - a.totalMealsDonated)
    .slice(0, 5);

  const topVolunteers = [...volunteers]
    .sort((a, b) => b.deliveriesCompleted - a.deliveriesCompleted || a.averagePickupMins - b.averagePickupMins)
    .slice(0, 5);

  // Monthly Impact Trends
  const monthlyTrends = [
    { month: 'Jun', meals: 1200, co2Kg: 1200, activeRescues: 32 },
    { month: 'Jul', meals: 1850, co2Kg: 1850, activeRescues: 48 },
    { month: 'Aug', meals: 2400, co2Kg: 2400, activeRescues: 64 },
    { month: 'Sep', meals: 3100, co2Kg: 3100, activeRescues: 85 },
    { month: 'Oct', meals: 4200, co2Kg: 4200, activeRescues: 112 },
    { month: 'Nov (Current)', meals: stats.totalMealsRescued, co2Kg: stats.co2PreventedKg, activeRescues: stats.completedDonations },
  ];

  return NextResponse.json({
    success: true,
    stats,
    topDonors,
    topVolunteers,
    monthlyTrends,
  });
}
