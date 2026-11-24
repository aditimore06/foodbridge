import { SurplusPrediction } from '@/types';

export interface HistoricalDonationLog {
  id: string;
  donorId: string;
  donorName: string;
  donorType: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeSlot: string;
  mealCount: number;
  category: string;
  rescuedCount: number;
  date: string;
}

export const SEED_HISTORICAL_LOGS: HistoricalDonationLog[] = [
  // IIT Campus Hostel Mess #3 - High recurring Friday night dinner surplus
  { id: 'HIST-101', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 48, category: 'COOKED_MEALS', rescuedCount: 48, date: '2026-10-17' },
  { id: 'HIST-102', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 42, category: 'COOKED_MEALS', rescuedCount: 42, date: '2026-10-24' },
  { id: 'HIST-103', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 50, category: 'COOKED_MEALS', rescuedCount: 48, date: '2026-10-31' },
  { id: 'HIST-104', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 44, category: 'COOKED_MEALS', rescuedCount: 44, date: '2026-11-07' },
  { id: 'HIST-105', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 46, category: 'COOKED_MEALS', rescuedCount: 46, date: '2026-11-14' },
  { id: 'HIST-106', donorId: 'DONOR-01', donorName: 'IIT Campus Hostel Mess #3', donorType: 'HOSTEL_MESS', dayOfWeek: 'Friday', timeSlot: '21:30 - 22:30', mealCount: 45, category: 'COOKED_MEALS', rescuedCount: 45, date: '2026-11-21' },
  
  // Grand Meridian Banquet - Sunday Wedding / Event spikes
  { id: 'HIST-107', donorId: 'DONOR-02', donorName: 'Grand Meridian Banquet Hall', donorType: 'CATERER', dayOfWeek: 'Sunday', timeSlot: '22:00 - 23:30', mealCount: 160, category: 'BANQUET_FEAST', rescuedCount: 155, date: '2026-10-26' },
  { id: 'HIST-108', donorId: 'DONOR-02', donorName: 'Grand Meridian Banquet Hall', donorType: 'CATERER', dayOfWeek: 'Sunday', timeSlot: '22:00 - 23:30', mealCount: 145, category: 'BANQUET_FEAST', rescuedCount: 145, date: '2026-11-02' },
  { id: 'HIST-109', donorId: 'DONOR-02', donorName: 'Grand Meridian Banquet Hall', donorType: 'CATERER', dayOfWeek: 'Sunday', timeSlot: '22:00 - 23:30', mealCount: 170, category: 'BANQUET_FEAST', rescuedCount: 165, date: '2026-11-09' },
  { id: 'HIST-110', donorId: 'DONOR-02', donorName: 'Grand Meridian Banquet Hall', donorType: 'CATERER', dayOfWeek: 'Sunday', timeSlot: '22:00 - 23:30', mealCount: 150, category: 'BANQUET_FEAST', rescuedCount: 150, date: '2026-11-16' },

  // Spice Route Kitchen (Restaurant) - Daily post-dinner lunch and dinner
  { id: 'HIST-111', donorId: 'DONOR-03', donorName: 'Spice Route Kitchen', donorType: 'RESTAURANT', dayOfWeek: 'Saturday', timeSlot: '23:00 - 00:00', mealCount: 28, category: 'COOKED_MEALS', rescuedCount: 28, date: '2026-11-15' },
  { id: 'HIST-112', donorId: 'DONOR-03', donorName: 'Spice Route Kitchen', donorType: 'RESTAURANT', dayOfWeek: 'Saturday', timeSlot: '23:00 - 00:00', mealCount: 32, category: 'COOKED_MEALS', rescuedCount: 30, date: '2026-11-22' },
];

export function getSurplusPredictionsForDonor(donorId: string): SurplusPrediction[] {
  if (donorId === 'DONOR-01' || donorId === 'all') {
    return [
      {
        donorId: 'DONOR-01',
        donorName: 'IIT Campus Hostel Mess #3',
        dayOfWeek: 'Friday',
        timeWindow: '9:30 PM – 10:30 PM',
        averageSurplusMeals: 45,
        forecastVariance: 3.2,
        confidenceScore: 94,
        sampleSizeWeeks: 6,
        recommendedAction: 'Based on 6 weeks of consistent Friday data, you average ~45 surplus meals between 9:30 PM – 10:30 PM. Pre-schedule a standby pickup with Robin Hood Army?',
        topItemSurplus: ['Rice & Dal Makhani', 'Mixed Veg Curry', 'Wheat Rotis (80 pcs)', 'Paneer Bhurji'],
      },
      {
        donorId: 'DONOR-01',
        donorName: 'IIT Campus Hostel Mess #3',
        dayOfWeek: 'Wednesday',
        timeWindow: '2:30 PM – 3:30 PM',
        averageSurplusMeals: 22,
        forecastVariance: 4.5,
        confidenceScore: 82,
        sampleSizeWeeks: 4,
        recommendedAction: 'Mid-week post-lunch surplus detected (~22 meals). Ideal for Sneha Deep Orphanage micro-transit.',
        topItemSurplus: ['Pulao', 'Kadhi Pakora', 'Seasonal Salad'],
      }
    ];
  }

  if (donorId === 'DONOR-02') {
    return [
      {
        donorId: 'DONOR-02',
        donorName: 'Grand Meridian Banquet Hall',
        dayOfWeek: 'Sunday',
        timeWindow: '10:00 PM – 11:30 PM',
        averageSurplusMeals: 155,
        forecastVariance: 9.8,
        confidenceScore: 91,
        sampleSizeWeeks: 4,
        recommendedAction: 'Sunday banquet events produce high surplus (~155 meals). Automated multi-NGO split dispatch recommended 2 hours in advance.',
        topItemSurplus: ['Biryani Deghs', 'Paneer Butter Masala', 'Naan / Paratha Trays', 'Gulab Jamun (120 pcs)'],
      }
    ];
  }

  // Default fallback prediction
  return [
    {
      donorId,
      donorName: 'Kitchen Partner',
      dayOfWeek: 'Daily',
      timeWindow: '10:00 PM – 11:00 PM',
      averageSurplusMeals: 35,
      forecastVariance: 5.0,
      confidenceScore: 88,
      sampleSizeWeeks: 3,
      recommendedAction: 'Consistent closing surplus detected. Pre-matching alerts active.',
      topItemSurplus: ['Prepared Curries', 'Cooked Grain Staples'],
    }
  ];
}

export function getPredictionChartData() {
  return [
    { period: 'Week 1', actual: 48, predicted: 45, upperCI: 50, lowerCI: 40 },
    { period: 'Week 2', actual: 42, predicted: 44, upperCI: 49, lowerCI: 39 },
    { period: 'Week 3', actual: 50, predicted: 46, upperCI: 52, lowerCI: 40 },
    { period: 'Week 4', actual: 44, predicted: 45, upperCI: 48, lowerCI: 42 },
    { period: 'Week 5', actual: 46, predicted: 45, upperCI: 49, lowerCI: 41 },
    { period: 'Week 6 (Current)', actual: 45, predicted: 45, upperCI: 48, lowerCI: 42 },
    { period: 'Week 7 (Forecast)', actual: null, predicted: 46, upperCI: 50, lowerCI: 42 },
    { period: 'Week 8 (Forecast)', actual: null, predicted: 47, upperCI: 51, lowerCI: 43 },
  ];
}
