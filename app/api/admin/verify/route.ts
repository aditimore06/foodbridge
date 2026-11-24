import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, id, status } = body;

    if (!entityType || !id || !status) {
      return NextResponse.json(
        { success: false, error: 'entityType, id, and status are required' },
        { status: 400 }
      );
    }

    const success = foodBridgeStore.setVerificationStatus(entityType, id, status);
    if (!success) {
      return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${entityType.toUpperCase()} ${id} updated to ${status}`,
      donors: foodBridgeStore.getDonors(),
      ngos: foodBridgeStore.getNgos(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update verification' }, { status: 500 });
  }
}
