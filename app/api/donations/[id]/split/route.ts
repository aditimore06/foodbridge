import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updated = foodBridgeStore.executeSplitDispatch(params.id);
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Could not execute split dispatch' }, { status: 400 });
  }

  return NextResponse.json({ success: true, donation: updated });
}
