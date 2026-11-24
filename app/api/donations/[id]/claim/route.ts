import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { ngoId, volunteerId } = body;

    if (!ngoId) {
      return NextResponse.json({ success: false, error: 'ngoId is required' }, { status: 400 });
    }

    const updated = foodBridgeStore.claimDonation(params.id, ngoId, volunteerId);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Could not claim donation' }, { status: 400 });
    }

    return NextResponse.json({ success: true, donation: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to process claim' }, { status: 500 });
  }
}
