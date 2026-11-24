export type UserRole = 'donor' | 'ngo' | 'public' | 'admin';

export type VerificationStatus = 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

export type DonationStatus = 
  | 'OPEN' 
  | 'CLAIMED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'EXPIRED' 
  | 'CANCELLED';

export type PriorityTier = 'CRITICAL' | 'URGENT' | 'STANDARD';

export type FoodCategory = 
  | 'COOKED_MEALS' 
  | 'PACKAGED' 
  | 'BAKERY' 
  | 'PRODUCE' 
  | 'DAIRY' 
  | 'BANQUET_FEAST';

export type DietaryType = 
  | 'VEGETARIAN' 
  | 'NON_VEGETARIAN' 
  | 'VEGAN' 
  | 'HALAL' 
  | 'ALL_VARIANTS';

export interface Donor {
  id: string;
  name: string;
  type: 'HOSTEL_MESS' | 'RESTAURANT' | 'CATERER' | 'CANTEEN' | 'CORPORATE_CAFETERIA';
  fssaiLicense: string;
  address: string;
  lat: number;
  lng: number;
  contactPhone: string;
  contactEmail: string;
  verificationStatus: VerificationStatus;
  hygieneCertified: boolean;
  totalMealsDonated: number;
  completedRescues: number;
  onTimePickupRate: number; // e.g. 98.5%
  zeroSpoilageRate: number; // e.g. 99.2%
  rating: number;
  joinedDate: string;
}

export interface NGO {
  id: string;
  name: string;
  ngoRegNumber: string;
  address: string;
  lat: number;
  lng: number;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  verificationStatus: VerificationStatus;
  isAvailable: boolean;
  maxCapacity: number; // total daily meal intake capacity
  currentCapacity: number; // capacity used today
  coldStorageAvailable: boolean;
  hygieneCompliant: boolean;
  totalMealsReceived: number;
  completedDeliveries: number;
  onTimeRate: number;
  operatingHours: string;
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'E_BIKE' | 'VAN' | 'MOTORBIKE' | 'ON_FOOT';
  deliveriesCompleted: number;
  averagePickupMins: number;
  rating: number;
  isActive: boolean;
}

export interface ChainOfCustodyEvent {
  id: string;
  timestamp: string;
  stage: 'CREATION' | 'CLAIM' | 'PICKUP' | 'IN_TRANSIT' | 'DELIVERY' | 'EXPIRED' | 'REOPENED';
  actor: string;
  actorRole: string;
  location?: string;
  notes?: string;
  qrVerified?: boolean;
}

export interface SplitAllocation {
  ngoId: string;
  ngoName: string;
  meals: number;
  distanceKm: number;
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorAddress: string;
  donorLat: number;
  donorLng: number;
  foodTitle: string;
  description: string;
  foodCategory: FoodCategory;
  dietaryType: DietaryType;
  quantityMeals: number;
  cookedAt: string; // ISO
  safeUntil: string; // ISO
  status: DonationStatus;
  priorityTier: PriorityTier;
  temperatureState: 'HOT' | 'CHILLED' | 'ROOM_TEMP';
  packagingType: 'SEALED_CONTAINERS' | 'ALUMINUM_TRAYS' | 'INSULATED_BOXES';
  specialHandling?: string;
  claimedByNgoId?: string;
  claimedByNgoName?: string;
  targetNgoLat?: number;
  targetNgoLng?: number;
  claimedByVolunteerId?: string;
  claimedByVolunteerName?: string;
  claimedAt?: string;
  pickupDeadline?: string; // Abandoned claim watchdog deadline
  pickedUpAt?: string;
  deliveredAt?: string;
  qrCodeSecret: string;
  chainOfCustody: ChainOfCustodyEvent[];
  isSplitDonation?: boolean;
  splitParentId?: string;
  splitAllocations?: SplitAllocation[];
  createdAt: string;
}

export interface SurplusPrediction {
  donorId: string;
  donorName: string;
  dayOfWeek: string;
  timeWindow: string;
  averageSurplusMeals: number;
  forecastVariance: number;
  confidenceScore: number; // 0 - 100%
  sampleSizeWeeks: number;
  recommendedAction: string;
  topItemSurplus: string[];
}

export interface HeatmapZone {
  id: string;
  name: string;
  type: 'HOTSPOT_SURPLUS' | 'HIGH_DEMAND_HUNGER';
  lat: number;
  lng: number;
  radiusMeters: number;
  intensity: number; // 0.1 to 1.0
  description: string;
  isSimulatedBaseline: boolean;
}

export interface MatchingScoreResult {
  ngo: NGO;
  distanceKm: number;
  score: number; // 0 - 100
  canAccommodateFull: boolean;
  remainingCapacity: number;
  reasons: string[];
}

export interface PlatformStats {
  totalMealsRescued: number;
  completedDonations: number;
  co2PreventedKg: number;
  activeVerifiedNgos: number;
  activeVolunteers: number;
  activeLiveSurplusMeals: number;
  avgRescueTimeMinutes: number;
}
