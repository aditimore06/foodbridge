import { NextRequest, NextResponse } from 'next/server';
import { foodBridgeStore } from '@/lib/store';

export async function GET(req: NextRequest) {
  const donors = foodBridgeStore.getDonors();
  return NextResponse.json({ success: true, donors });
}
