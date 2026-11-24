import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { volunteerId, notes } = body;

    const updated = foodBridgeStore.scanPickupQr(params.id, volunteerId, notes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Cannot complete pickup scan. Check status.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, donation: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record pickup scan' }, { status: 500 });
  }
}
