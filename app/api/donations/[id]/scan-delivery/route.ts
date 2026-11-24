import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const { receiverNotes } = body;

    const updated = foodBridgeStore.scanDeliveryQr(params.id, receiverNotes);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Cannot complete delivery scan. Check status.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, donation: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record delivery scan' }, { status: 500 });
  }
}
