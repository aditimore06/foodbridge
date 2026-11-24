import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const donorId = searchParams.get('donorId');

  let donations = foodBridgeStore.getDonations();

  if (status) {
    donations = donations.filter((d) => d.status === status);
  }
  if (donorId) {
    donations = donations.filter((d) => d.donorId === donorId);
  }

  return NextResponse.json({ success: true, donations });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDonation = foodBridgeStore.createDonation(body);
    return NextResponse.json({ success: true, donation: newDonation }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create donation' },
      { status: 400 }
    );
  }
}
