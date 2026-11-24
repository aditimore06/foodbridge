import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';
import { rankNGOsForDonation, calculateOptimalSplit } from '@/lib/matching';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const donation = foodBridgeStore.getDonationById(params.id);
  if (!donation) {
    return NextResponse.json({ success: false, error: 'Donation not found' }, { status: 404 });
  }

  const ngos = foodBridgeStore.getNgos();
  const matchingScores = rankNGOsForDonation(donation, ngos);
  const splitRecommendation = calculateOptimalSplit(donation, ngos);

  return NextResponse.json({
    success: true,
    donation,
    matchingScores,
    splitRecommendation,
  });
}
