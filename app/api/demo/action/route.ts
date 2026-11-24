import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, minutes } = body;

    let result: any = {};

    switch (action) {
      case 'fastForward':
        result = foodBridgeStore.fastForwardMinutes(minutes || 30);
        break;

      case 'simulateAbandonedClaim':
        const abandoned = foodBridgeStore.simulateAbandonedClaim();
        result = { success: true, abandonedDonation: abandoned };
        break;

      case 'triggerSurplus':
        const newDonation = foodBridgeStore.triggerLiveSurplusAlert();
        result = { success: true, newDonation };
        break;

      case 'reset':
        foodBridgeStore.resetAll();
        result = { success: true, message: 'All store data reset to clean demo seed baseline.' };
        break;

      default:
        return NextResponse.json({ success: false, error: `Unknown action ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      donations: foodBridgeStore.getDonations(),
      stats: foodBridgeStore.getPlatformStats(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to execute demo action' }, { status: 500 });
  }
}
