import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const ngos = foodBridgeStore.getNgos();
  return NextResponse.json({ success: true, ngos });
}
