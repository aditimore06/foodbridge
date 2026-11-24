import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const zones = foodBridgeStore.getHeatmapZones();
  return NextResponse.json({ success: true, zones });
}
