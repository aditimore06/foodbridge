import { NextRequest, NextResponse } from 'next/server';
import { getSurplusPredictionsForDonor, getPredictionChartData } from '@/lib/surplus-prediction';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const donorId = searchParams.get('donorId') || 'DONOR-01';

  const predictions = getSurplusPredictionsForDonor(donorId);
  const chartData = getPredictionChartData();

  return NextResponse.json({
    success: true,
    predictions,
    chartData,
    donorId,
    disclaimer: 'Statistical Estimate — Based on Historical Patterns',
  });
}
