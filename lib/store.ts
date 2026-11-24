import { 
  Donor, 
  NGO, 
  Volunteer, 
  Donation, 
  HeatmapZone, 
  PlatformStats,
  PriorityTier,
  DonationStatus,
  VerificationStatus
} from '@/types';
import { calculateHaversineDistance } from './haversine';
import { rankNGOsForDonation, calculateOptimalSplit } from './matching';

// Pre-seeded Donors in Bengaluru City Cluster
export const INITIAL_DONORS: Donor[] = [
  {
    id: 'DONOR-01',
    name: 'IIT Campus Hostel Mess #3',
    type: 'HOSTEL_MESS',
    fssaiLicense: 'FSSAI-11223344556677',
    address: 'Koramangala 3rd Block, Near Wipro Park, Bengaluru',
    lat: 12.9352,
    lng: 77.6144,
    contactPhone: '+91 98450 12345',
    contactEmail: 'mess3@campus.edu',
    verificationStatus: 'VERIFIED',
    hygieneCertified: true,
    totalMealsDonated: 1420,
    completedRescues: 38,
    onTimePickupRate: 98.8,
    zeroSpoilageRate: 99.4,
    rating: 4.9,
    joinedDate: '2026-03-15',
  },
  {
    id: 'DONOR-02',
    name: 'Grand Meridian Banquet Hall',
    type: 'CATERER',
    fssaiLicense: 'FSSAI-22334455667788',
    address: '100ft Road, Indiranagar, Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    contactPhone: '+91 99001 54321',
    contactEmail: 'events@grandmeridian.com',
    verificationStatus: 'VERIFIED',
    hygieneCertified: true,
    totalMealsDonated: 3850,
    completedRescues: 29,
    onTimePickupRate: 99.1,
    zeroSpoilageRate: 99.6,
    rating: 4.95,
    joinedDate: '2026-02-10',
  },
  {
    id: 'DONOR-03',
    name: 'Spice Route Kitchen',
    type: 'RESTAURANT',
    fssaiLicense: 'FSSAI-33445566778899',
    address: 'Brigade Road, Ashok Nagar, Bengaluru',
    lat: 12.9719,
    lng: 77.6080,
    contactPhone: '+91 98860 99887',
    contactEmail: 'manager@spiceroutekitchen.in',
    verificationStatus: 'VERIFIED',
    hygieneCertified: true,
    totalMealsDonated: 980,
    completedRescues: 24,
    onTimePickupRate: 97.5,
    zeroSpoilageRate: 98.8,
    rating: 4.8,
    joinedDate: '2026-05-02',
  },
  {
    id: 'DONOR-04',
    name: 'Infotech Central Cafeteria',
    type: 'CORPORATE_CAFETERIA',
    fssaiLicense: 'FSSAI-44556677889900',
    address: 'Ecospace Tech Park, Bellandur, Bengaluru',
    lat: 12.9260,
    lng: 77.6762,
    contactPhone: '+91 97410 44556',
    contactEmail: 'cafeteria@infotechcampus.com',
    verificationStatus: 'VERIFIED',
    hygieneCertified: true,
    totalMealsDonated: 2150,
    completedRescues: 45,
    onTimePickupRate: 99.0,
    zeroSpoilageRate: 99.5,
    rating: 4.9,
    joinedDate: '2026-01-20',
  },
  {
    id: 'DONOR-05',
    name: "The Baker's Oven & Patisserie",
    type: 'RESTAURANT',
    fssaiLicense: 'FSSAI-55667788990011',
    address: 'Lavelle Road, Shanthala Nagar, Bengaluru',
    lat: 12.9698,
    lng: 77.5992,
    contactPhone: '+91 98452 77889',
    contactEmail: 'orders@bakersoven.in',
    verificationStatus: 'VERIFIED',
    hygieneCertified: true,
    totalMealsDonated: 640,
    completedRescues: 18,
    onTimePickupRate: 96.8,
    zeroSpoilageRate: 98.2,
    rating: 4.75,
    joinedDate: '2026-07-11',
  },
  {
    id: 'DONOR-06',
    name: 'Royal Heritage Caterers & Banquets',
    type: 'CATERER',
    fssaiLicense: 'FSSAI-66778899001122',
    address: 'Frazer Town, Pulikeshi Nagar, Bengaluru',
    lat: 12.9968,
    lng: 77.6133,
    contactPhone: '+91 98800 66778',
    contactEmail: 'info@royalheritagecaterers.org',
    verificationStatus: 'PENDING_VERIFICATION', // For Admin Demo!
    hygieneCertified: true,
    totalMealsDonated: 0,
    completedRescues: 0,
    onTimePickupRate: 100,
    zeroSpoilageRate: 100,
    rating: 5.0,
    joinedDate: '2026-11-20',
  },
];

// Pre-seeded NGOs in Bengaluru City Cluster
export const INITIAL_NGOS: NGO[] = [
  {
    id: 'NGO-01',
    name: 'Robin Hood Army - Central Hub',
    ngoRegNumber: 'NGO-KA-2018-09142',
    address: 'Richmond Town, Langford Road, Bengaluru',
    lat: 12.9620,
    lng: 77.6010,
    contactPerson: 'Arunav Sengupta',
    contactPhone: '+91 98111 22334',
    contactEmail: 'bangalore@robinhoodarmy.com',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    maxCapacity: 200,
    currentCapacity: 60,
    coldStorageAvailable: true,
    hygieneCompliant: true,
    totalMealsReceived: 4200,
    completedDeliveries: 95,
    onTimeRate: 98.6,
    operatingHours: '24/7 Rapid Rescue Unit',
  },
  {
    id: 'NGO-02',
    name: 'Hope Food Bank & Night Shelter',
    ngoRegNumber: 'NGO-KA-2019-14258',
    address: 'Shivajinagar Bus Depot Road, Bengaluru',
    lat: 12.9863,
    lng: 77.6045,
    contactPerson: 'Sister Margaret',
    contactPhone: '+91 98222 33445',
    contactEmail: 'contact@hopeshelterblr.org',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    maxCapacity: 120,
    currentCapacity: 30,
    coldStorageAvailable: true,
    hygieneCompliant: true,
    totalMealsReceived: 2900,
    completedDeliveries: 68,
    onTimeRate: 97.4,
    operatingHours: '06:00 AM – 11:30 PM',
  },
  {
    id: 'NGO-03',
    name: 'Sneha Deep Orphanage Trust',
    ngoRegNumber: 'NGO-KA-2020-00841',
    address: 'Koramangala 4th Block, Bengaluru',
    lat: 12.9340,
    lng: 77.6280,
    contactPerson: 'Sunil Kumar',
    contactPhone: '+91 98333 44556',
    contactEmail: 'trust@snehadeep.org',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    maxCapacity: 80,
    currentCapacity: 20,
    coldStorageAvailable: false,
    hygieneCompliant: true,
    totalMealsReceived: 1850,
    completedDeliveries: 45,
    onTimeRate: 99.2,
    operatingHours: '08:00 AM – 10:30 PM',
  },
  {
    id: 'NGO-04',
    name: 'City Care Community Kitchen',
    ngoRegNumber: 'NGO-KA-2021-33120',
    address: 'Ulsoor Lake Road, Bengaluru',
    lat: 12.9772,
    lng: 77.6247,
    contactPerson: 'Pooja Hegde',
    contactPhone: '+91 98444 55667',
    contactEmail: 'care@citykitchens.org',
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    maxCapacity: 150,
    currentCapacity: 70,
    coldStorageAvailable: true,
    hygieneCompliant: true,
    totalMealsReceived: 3100,
    completedDeliveries: 74,
    onTimeRate: 98.1,
    operatingHours: '07:00 AM – 11:00 PM',
  },
  {
    id: 'NGO-05',
    name: 'Asha Jyoti Shelter & Old Age Home',
    ngoRegNumber: 'NGO-KA-2024-99812',
    address: 'Wilson Garden 10th Cross, Bengaluru',
    lat: 12.9490,
    lng: 77.5950,
    contactPerson: 'Devendra Gowda',
    contactPhone: '+91 98555 66778',
    contactEmail: 'support@ashajyoti.org',
    verificationStatus: 'PENDING_VERIFICATION', // For Admin Demo!
    isAvailable: true,
    maxCapacity: 90,
    currentCapacity: 15,
    coldStorageAvailable: false,
    hygieneCompliant: true,
    totalMealsReceived: 0,
    completedDeliveries: 0,
    onTimeRate: 100,
    operatingHours: '08:00 AM – 09:30 PM',
  },
];

// Pre-seeded Active Volunteers
const INITIAL_VOLUNTEERS: Volunteer[] = [
  { id: 'VOL-01', name: 'Kavita Rao', phone: '+91 98765 11001', vehicleType: 'E_BIKE', deliveriesCompleted: 54, averagePickupMins: 11.2, rating: 4.96, isActive: true },
  { id: 'VOL-02', name: 'Vikram Joshi', phone: '+91 98765 11002', vehicleType: 'VAN', deliveriesCompleted: 88, averagePickupMins: 14.5, rating: 4.98, isActive: true },
  { id: 'VOL-03', name: 'Ananya Sharma', phone: '+91 98765 11003', vehicleType: 'MOTORBIKE', deliveriesCompleted: 42, averagePickupMins: 9.8, rating: 4.92, isActive: true },
  { id: 'VOL-04', name: 'Rohan Deshmukh', phone: '+91 98765 11004', vehicleType: 'MOTORBIKE', deliveriesCompleted: 61, averagePickupMins: 12.0, rating: 4.89, isActive: true },
];

// Pre-seeded Regional Heatmap Hotspots & High Demand Hunger Zones
export const INITIAL_HEATMAP_ZONES: HeatmapZone[] = [
  {
    id: 'ZONE-SURPLUS-1',
    name: 'Koramangala Student Hostel & Cloud Kitchen Corridor',
    type: 'HOTSPOT_SURPLUS',
    lat: 12.9350,
    lng: 77.6180,
    radiusMeters: 1400,
    intensity: 0.85,
    description: 'High concentration of 40+ hostel messes & cloud kitchens with regular post-dinner surplus (21:30 - 23:00)',
    isSimulatedBaseline: true,
  },
  {
    id: 'ZONE-SURPLUS-2',
    name: 'Indiranagar & MG Road Restaurant Hub',
    type: 'HOTSPOT_SURPLUS',
    lat: 12.9750,
    lng: 77.6250,
    radiusMeters: 1600,
    intensity: 0.92,
    description: 'High weekend banquet & gourmet food rescue density with 85+ partner dining outlets',
    isSimulatedBaseline: true,
  },
  {
    id: 'ZONE-SURPLUS-3',
    name: 'Bellandur & Outer Ring Road Tech Parks',
    type: 'HOTSPOT_SURPLUS',
    lat: 12.9280,
    lng: 77.6720,
    radiusMeters: 1800,
    intensity: 0.78,
    description: 'Corporate catering overflow during mid-day lunch & evening corporate events',
    isSimulatedBaseline: true,
  },
  {
    id: 'ZONE-HUNGER-1',
    name: 'Kalpalli Community Shelter & Labor Settlement',
    type: 'HIGH_DEMAND_HUNGER',
    lat: 12.9920,
    lng: 77.6200,
    radiusMeters: 1500,
    intensity: 0.95,
    description: 'Under-resourced migratory worker settlement requiring ~350 warm meals daily',
    isSimulatedBaseline: true,
  },
  {
    id: 'ZONE-HUNGER-2',
    name: 'Wilson Garden & City Market Night Workers Zone',
    type: 'HIGH_DEMAND_HUNGER',
    lat: 12.9520,
    lng: 77.5880,
    radiusMeters: 1600,
    intensity: 0.90,
    description: 'Informal daily wage labor and night shelter cluster with acute nutrition gap',
    isSimulatedBaseline: true,
  },
  {
    id: 'ZONE-HUNGER-3',
    name: 'Ejipura Transit Camp Relief Point',
    type: 'HIGH_DEMAND_HUNGER',
    lat: 12.9400,
    lng: 77.6320,
    radiusMeters: 1200,
    intensity: 0.82,
    description: 'Rehabilitation transit camp with 180 children and senior citizens',
    isSimulatedBaseline: true,
  },
];

export function generateInitialDonations(): Donation[] {
  const now = new Date();
  
  // 1. Critical Donation (expiring in ~28 mins!)
  const criticalSafeUntil = new Date(now.getTime() + 28 * 60 * 1000).toISOString();
  const criticalCooked = new Date(now.getTime() - 2.5 * 60 * 60 * 1000).toISOString();

  // 2. Large Wedding Banquet Surplus (160 meals, for split demo)
  const weddingSafeUntil = new Date(now.getTime() + 150 * 60 * 1000).toISOString();
  const weddingCooked = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();

  // 3. In-Transit Donation (currently moving to Robin Hood Army)
  const inTransitSafeUntil = new Date(now.getTime() + 90 * 60 * 1000).toISOString();
  const inTransitCooked = new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toISOString();
  const inTransitClaimed = new Date(now.getTime() - 25 * 60 * 1000).toISOString();
  const inTransitPickedUp = new Date(now.getTime() - 10 * 60 * 1000).toISOString();

  // 4. Claimed Watchdog Donation (claimed 12 mins ago, deadline in 3 mins or testable with Demo Bar)
  const claimedSafeUntil = new Date(now.getTime() + 65 * 60 * 1000).toISOString();
  const claimedCooked = new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString();
  const claimedAt = new Date(now.getTime() - 12 * 60 * 1000).toISOString();
  const pickupDeadline = new Date(now.getTime() + 3 * 60 * 1000).toISOString();

  return [
    {
      id: 'DON-2026-001',
      donorId: 'DONOR-01',
      donorName: 'IIT Campus Hostel Mess #3',
      donorAddress: 'Koramangala 3rd Block, Bengaluru',
      donorLat: 12.9352,
      donorLng: 77.6144,
      foodTitle: 'Fresh Dal Tadka, Jeera Rice & 70 Chapatis',
      description: 'Hot cooked nutritious dinner prepared in hygienic steam-jacketed cauldrons. Packed in food-grade insulated thermal containers.',
      foodCategory: 'COOKED_MEALS',
      dietaryType: 'VEGETARIAN',
      quantityMeals: 55,
      cookedAt: criticalCooked,
      safeUntil: criticalSafeUntil,
      status: 'OPEN',
      priorityTier: 'CRITICAL',
      temperatureState: 'HOT',
      packagingType: 'INSULATED_BOXES',
      specialHandling: 'Keep upright; steam vented containers',
      qrCodeSecret: 'FB-QR-001-IIT-55M',
      chainOfCustody: [
        {
          id: 'COC-101',
          timestamp: criticalCooked,
          stage: 'CREATION',
          actor: 'Chef Ramesh (Hostel Mess Supervisor)',
          actorRole: 'Donor Staff',
          location: 'Hostel Mess Kitchen #3',
          notes: 'Batch temperature measured at 74°C. Hygiene protocol #FSSAI-H9 checked.',
        }
      ],
      createdAt: criticalCooked,
    },
    {
      id: 'DON-2026-002',
      donorId: 'DONOR-02',
      donorName: 'Grand Meridian Banquet Hall',
      donorAddress: '100ft Road, Indiranagar, Bengaluru',
      donorLat: 12.9784,
      donorLng: 77.6408,
      foodTitle: 'Grand Wedding Feast (Shahi Paneer, Dal Makhani, Pulao & Naan)',
      description: 'Unconsumed premium banquet food from high-profile wedding reception. Sealed immediately post-buffet in aluminum gastronorm containers.',
      foodCategory: 'BANQUET_FEAST',
      dietaryType: 'VEGETARIAN',
      quantityMeals: 160,
      cookedAt: weddingCooked,
      safeUntil: weddingSafeUntil,
      status: 'OPEN',
      priorityTier: 'STANDARD',
      temperatureState: 'HOT',
      packagingType: 'ALUMINUM_TRAYS',
      specialHandling: 'Total 8 large GN trays. Requires 2 dispatch vehicles or multi-NGO split.',
      qrCodeSecret: 'FB-QR-002-MERIDIAN-160M',
      chainOfCustody: [
        {
          id: 'COC-201',
          timestamp: weddingCooked,
          stage: 'CREATION',
          actor: 'Banquet Manager Vikramaditya',
          actorRole: 'Donor Staff',
          location: 'Grand Ballroom Service Area',
          notes: 'Excess prepared for 600-person banquet. Chilled holding holding until pickup.',
        }
      ],
      createdAt: weddingCooked,
    },
    {
      id: 'DON-2026-003',
      donorId: 'DONOR-04',
      donorName: 'Infotech Central Cafeteria',
      donorAddress: 'Ecospace Tech Park, Bellandur, Bengaluru',
      donorLat: 12.9260,
      donorLng: 77.6762,
      foodTitle: 'Healthy Macro Bowls (Paneer Curry, Brown Rice & Steamed Veggies)',
      description: 'High-protein corporate lunch bowls pre-packed in biodegradable compostable meal boxes.',
      foodCategory: 'COOKED_MEALS',
      dietaryType: 'VEGETARIAN',
      quantityMeals: 40,
      cookedAt: inTransitCooked,
      safeUntil: inTransitSafeUntil,
      status: 'IN_TRANSIT',
      priorityTier: 'URGENT',
      temperatureState: 'ROOM_TEMP',
      packagingType: 'SEALED_CONTAINERS',
      claimedByNgoId: 'NGO-01',
      claimedByNgoName: 'Robin Hood Army - Central Hub',
      targetNgoLat: 12.9620,
      targetNgoLng: 77.6010,
      claimedByVolunteerId: 'VOL-01',
      claimedByVolunteerName: 'Kavita Rao (E-Bike Carrier)',
      claimedAt: inTransitClaimed,
      pickedUpAt: inTransitPickedUp,
      qrCodeSecret: 'FB-QR-003-INFOTECH-40M',
      chainOfCustody: [
        {
          id: 'COC-301',
          timestamp: inTransitCooked,
          stage: 'CREATION',
          actor: 'Cafeteria Ops Lead Sumeet',
          actorRole: 'Donor Staff',
          location: 'Bellandur Campus Kitchen',
          notes: 'Pre-portioned lunch boxes sealed.',
        },
        {
          id: 'COC-302',
          timestamp: inTransitClaimed,
          stage: 'CLAIM',
          actor: 'Kavita Rao (Volunteer)',
          actorRole: 'Volunteer Courier',
          location: 'Mobile App Portal',
          notes: 'Claim registered. ETA to donor kitchen: 14 mins.',
        },
        {
          id: 'COC-303',
          timestamp: inTransitPickedUp,
          stage: 'PICKUP',
          actor: 'Kavita Rao (Volunteer)',
          actorRole: 'Volunteer Courier',
          location: 'Infotech Loading Dock B',
          notes: 'Checkpoint 1 QR verified. Food inspected for seal integrity & heat.',
          qrVerified: true,
        }
      ],
      createdAt: inTransitCooked,
    },
    {
      id: 'DON-2026-004',
      donorId: 'DONOR-03',
      donorName: 'Spice Route Kitchen',
      donorAddress: 'Brigade Road, Ashok Nagar, Bengaluru',
      donorLat: 12.9719,
      donorLng: 77.6080,
      foodTitle: 'Hyderabadi Dum Biryani & Mirchi Ka Salan (35 Servings)',
      description: 'Slow-cooked aromatic dum biryani with sides, sealed in insulated carrier barrels.',
      foodCategory: 'COOKED_MEALS',
      dietaryType: 'ALL_VARIANTS',
      quantityMeals: 35,
      cookedAt: claimedCooked,
      safeUntil: claimedSafeUntil,
      status: 'CLAIMED',
      priorityTier: 'URGENT',
      temperatureState: 'HOT',
      packagingType: 'INSULATED_BOXES',
      claimedByNgoId: 'NGO-02',
      claimedByNgoName: 'Hope Food Bank & Night Shelter',
      targetNgoLat: 12.9863,
      targetNgoLng: 77.6045,
      claimedByVolunteerId: 'VOL-04',
      claimedByVolunteerName: 'Rohan Deshmukh',
      claimedAt: claimedAt,
      pickupDeadline: pickupDeadline,
      qrCodeSecret: 'FB-QR-004-SPICE-35M',
      chainOfCustody: [
        {
          id: 'COC-401',
          timestamp: claimedCooked,
          stage: 'CREATION',
          actor: 'Head Chef Farooq',
          actorRole: 'Donor Staff',
          location: 'Spice Route Main Kitchen',
          notes: 'Cooked fresh for banquet catering, untouched overflow.',
        },
        {
          id: 'COC-402',
          timestamp: claimedAt,
          stage: 'CLAIM',
          actor: 'Rohan Deshmukh (Volunteer)',
          actorRole: 'Volunteer Courier',
          location: 'Assigned via Auto-Dispatch',
          notes: 'Pickup window active (15 min timer initialized).',
        }
      ],
      createdAt: claimedCooked,
    }
  ];
}

class FoodBridgeDataStore {
  private donors: Donor[] = [];
  private ngos: NGO[] = [];
  private volunteers: Volunteer[] = [];
  private donations: Donation[] = [];
  private heatmapZones: HeatmapZone[] = [];
  private demoModeActive: boolean = true;
  private demoFastForwardMins: number = 0;

  constructor() {
    this.resetAll();
  }

  public resetAll() {
    this.donors = JSON.parse(JSON.stringify(INITIAL_DONORS));
    this.ngos = JSON.parse(JSON.stringify(INITIAL_NGOS));
    this.volunteers = JSON.parse(JSON.stringify(INITIAL_VOLUNTEERS));
    this.donations = generateInitialDonations();
    this.heatmapZones = JSON.parse(JSON.stringify(INITIAL_HEATMAP_ZONES));
    this.demoFastForwardMins = 0;
  }

  // Auto-Reopen Watchdog & Expiry Checker
  public runWatchdogChecks() {
    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    const nowMs = now.getTime();

    this.donations.forEach((donation) => {
      // 1. Hard Expiry Lock check
      const safeUntilMs = new Date(donation.safeUntil).getTime();
      if (nowMs >= safeUntilMs && donation.status !== 'DELIVERED' && donation.status !== 'EXPIRED') {
        donation.status = 'EXPIRED';
        donation.chainOfCustody.push({
          id: `COC-EXP-${Date.now()}`,
          timestamp: now.toISOString(),
          stage: 'EXPIRED',
          actor: 'System Watchdog Engine',
          actorRole: 'Automated Safety Protocol',
          notes: 'Hard safe-until window reached. Locked to protect public health and safety protocols.',
        });
      }

      // 2. Abandoned Claim Watchdog
      // If CLAIMED but pickup deadline passed without pickup scan -> REVERT to OPEN
      if (donation.status === 'CLAIMED' && donation.pickupDeadline) {
        const deadlineMs = new Date(donation.pickupDeadline).getTime();
        if (nowMs >= deadlineMs) {
          const abandonedVolunteer = donation.claimedByVolunteerName || 'Assigned Courier';
          donation.status = 'OPEN';
          donation.claimedByNgoId = undefined;
          donation.claimedByNgoName = undefined;
          donation.claimedByVolunteerId = undefined;
          donation.claimedByVolunteerName = undefined;
          donation.claimedAt = undefined;
          donation.pickupDeadline = undefined;

          donation.chainOfCustody.push({
            id: `COC-REOPEN-${Date.now()}`,
            timestamp: now.toISOString(),
            stage: 'REOPENED',
            actor: 'Abandoned Claim Watchdog',
            actorRole: 'Automated Safety Protocol',
            notes: `Pickup window expired without QR scan verification from ${abandonedVolunteer}. Donation auto-reopened to network.`,
          });
        }
      }

      // Dynamic Priority Tier Update
      if (donation.status === 'OPEN' || donation.status === 'CLAIMED') {
        const diffMins = Math.max(0, Math.round((safeUntilMs - nowMs) / 60000));
        if (diffMins <= 45) {
          donation.priorityTier = 'CRITICAL';
        } else if (diffMins <= 90) {
          donation.priorityTier = 'URGENT';
        } else {
          donation.priorityTier = 'STANDARD';
        }
      }
    });
  }

  // Getters
  public getDonors() {
    return this.donors;
  }

  public getNgos() {
    return this.ngos;
  }

  public getVolunteers() {
    return this.volunteers;
  }

  public getDonations() {
    this.runWatchdogChecks();
    return this.donations;
  }

  public getHeatmapZones() {
    return this.heatmapZones;
  }

  public getDonationById(id: string) {
    this.runWatchdogChecks();
    return this.donations.find((d) => d.id === id);
  }

  public getPlatformStats(): PlatformStats {
    this.runWatchdogChecks();
    const delivered = this.donations.filter((d) => d.status === 'DELIVERED');
    const totalDeliveredMeals = delivered.reduce((acc, d) => acc + d.quantityMeals, 0);
    // Baseline seeded rescued meals + real-time additions
    const totalMealsRescued = 8940 + totalDeliveredMeals;
    // Food waste conversion: ~0.4 kg food/meal * 2.5 kg CO2 per kg food saved = 1.0 kg CO2 / meal
    const co2PreventedKg = Math.round(totalMealsRescued * 1.0 * 10) / 10;
    const activeVerifiedNgos = this.ngos.filter((n) => n.verificationStatus === 'VERIFIED').length;
    const activeVolunteers = this.volunteers.filter((v) => v.isActive).length;
    const activeLiveSurplusMeals = this.donations
      .filter((d) => d.status === 'OPEN' || d.status === 'CLAIMED' || d.status === 'IN_TRANSIT')
      .reduce((acc, d) => acc + d.quantityMeals, 0);

    return {
      totalMealsRescued,
      completedDonations: 164 + delivered.length,
      co2PreventedKg,
      activeVerifiedNgos,
      activeVolunteers,
      activeLiveSurplusMeals,
      avgRescueTimeMinutes: 28.4,
    };
  }

  // Actions
  public createDonation(data: Partial<Donation>): Donation {
    const id = `DON-2026-${String(this.donations.length + 1).padStart(3, '0')}`;
    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    
    // Determine priority
    const safeUntilMs = new Date(data.safeUntil || now.getTime() + 120 * 60 * 1000).getTime();
    const diffMins = Math.max(0, Math.round((safeUntilMs - now.getTime()) / 60000));
    let priorityTier: PriorityTier = 'STANDARD';
    if (diffMins <= 45) priorityTier = 'CRITICAL';
    else if (diffMins <= 90) priorityTier = 'URGENT';

    const newDonation: Donation = {
      id,
      donorId: data.donorId || 'DONOR-01',
      donorName: data.donorName || 'Campus Mess #3',
      donorAddress: data.donorAddress || 'Koramangala, Bengaluru',
      donorLat: data.donorLat || 12.9352,
      donorLng: data.donorLng || 77.6144,
      foodTitle: data.foodTitle || 'Surplus Nutritious Meal',
      description: data.description || 'Hygienically prepared cooked meals ready for rapid dispatch.',
      foodCategory: data.foodCategory || 'COOKED_MEALS',
      dietaryType: data.dietaryType || 'VEGETARIAN',
      quantityMeals: data.quantityMeals || 30,
      cookedAt: data.cookedAt || now.toISOString(),
      safeUntil: data.safeUntil || new Date(now.getTime() + 120 * 60 * 1000).toISOString(),
      status: 'OPEN',
      priorityTier,
      temperatureState: data.temperatureState || 'HOT',
      packagingType: data.packagingType || 'SEALED_CONTAINERS',
      specialHandling: data.specialHandling,
      qrCodeSecret: `FB-QR-${id}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      chainOfCustody: [
        {
          id: `COC-${Date.now()}`,
          timestamp: now.toISOString(),
          stage: 'CREATION',
          actor: data.donorName || 'Donor Kitchen Supervisor',
          actorRole: 'Donor Staff',
          location: data.donorAddress,
          notes: 'Donation created and broadcast to nearby verified food rescue partners.',
        }
      ],
      createdAt: now.toISOString(),
    };

    this.donations.unshift(newDonation);
    return newDonation;
  }

  // Claim Donation
  public claimDonation(donationId: string, ngoId: string, volunteerId?: string): Donation | null {
    const donation = this.getDonationById(donationId);
    if (!donation || donation.status !== 'OPEN') return null;

    const ngo = this.ngos.find((n) => n.id === ngoId);
    if (!ngo) return null;

    const volunteer = volunteerId 
      ? this.volunteers.find((v) => v.id === volunteerId)
      : this.volunteers[0]; // Assign active volunteer courier

    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    // Pickup deadline: 15 minutes in standard, or 5 mins in demo
    const deadline = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    donation.status = 'CLAIMED';
    donation.claimedByNgoId = ngo.id;
    donation.claimedByNgoName = ngo.name;
    donation.targetNgoLat = ngo.lat;
    donation.targetNgoLng = ngo.lng;
    donation.claimedByVolunteerId = volunteer?.id;
    donation.claimedByVolunteerName = volunteer?.name;
    donation.claimedAt = now.toISOString();
    donation.pickupDeadline = deadline;

    donation.chainOfCustody.push({
      id: `COC-${Date.now()}`,
      timestamp: now.toISOString(),
      stage: 'CLAIM',
      actor: `${volunteer?.name || 'Assigned Courier'} (for ${ngo.name})`,
      actorRole: 'Volunteer Courier',
      location: 'Dispatched from Hub',
      notes: `Rescue mission accepted. 15-minute pickup deadline ticking. Target drop-off: ${ngo.name}.`,
    });

    return donation;
  }

  // Checkpoint 1: Donor Handover QR Scan (CLAIMED -> IN_TRANSIT)
  public scanPickupQr(donationId: string, volunteerId?: string, notes?: string): Donation | null {
    const donation = this.getDonationById(donationId);
    if (!donation || donation.status !== 'CLAIMED') return null;

    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    donation.status = 'IN_TRANSIT';
    donation.pickedUpAt = now.toISOString();

    donation.chainOfCustody.push({
      id: `COC-${Date.now()}`,
      timestamp: now.toISOString(),
      stage: 'PICKUP',
      actor: donation.claimedByVolunteerName || 'Volunteer Courier',
      actorRole: 'Volunteer Courier',
      location: donation.donorAddress,
      notes: notes || 'Checkpoint 1 Verified: Cryptographic QR scanned at donor kitchen. Physical handover complete. Now in transit.',
      qrVerified: true,
    });

    return donation;
  }

  // Checkpoint 2: NGO Delivery QR Scan (IN_TRANSIT -> DELIVERED)
  public scanDeliveryQr(donationId: string, receiverNotes?: string): Donation | null {
    const donation = this.getDonationById(donationId);
    if (!donation || donation.status !== 'IN_TRANSIT') return null;

    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    donation.status = 'DELIVERED';
    donation.deliveredAt = now.toISOString();

    // Increment NGO capacity & received count
    if (donation.claimedByNgoId) {
      const ngo = this.ngos.find((n) => n.id === donation.claimedByNgoId);
      if (ngo) {
        ngo.currentCapacity = Math.min(ngo.maxCapacity, ngo.currentCapacity + donation.quantityMeals);
        ngo.totalMealsReceived += donation.quantityMeals;
        ngo.completedDeliveries += 1;
      }
    }

    // Increment Donor metrics
    const donor = this.donors.find((d) => d.id === donation.donorId);
    if (donor) {
      donor.totalMealsDonated += donation.quantityMeals;
      donor.completedRescues += 1;
    }

    donation.chainOfCustody.push({
      id: `COC-${Date.now()}`,
      timestamp: now.toISOString(),
      stage: 'DELIVERY',
      actor: `${donation.claimedByNgoName || 'Verified NGO'} Intake Team`,
      actorRole: 'NGO Coordinator',
      location: donation.claimedByNgoName,
      notes: receiverNotes || 'Checkpoint 2 Verified: Drop-off QR scanned at NGO distribution shelter. Food verified fresh & safely distributed.',
      qrVerified: true,
    });

    return donation;
  }

  // Split Dispatch Execution
  public executeSplitDispatch(donationId: string): Donation | null {
    const donation = this.getDonationById(donationId);
    if (!donation) return null;

    const splitResult = calculateOptimalSplit(donation, this.ngos);
    if (!splitResult.isSplitNeeded || splitResult.allocations.length === 0) return null;

    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    donation.isSplitDonation = true;
    donation.splitAllocations = splitResult.allocations;
    donation.status = 'CLAIMED';
    donation.claimedByNgoName = splitResult.allocations.map((a) => `${a.ngoName} (${a.meals}m)`).join(', ');

    donation.chainOfCustody.push({
      id: `COC-${Date.now()}`,
      timestamp: now.toISOString(),
      stage: 'CLAIM',
      actor: 'Smart Donation Splitting Engine',
      actorRole: 'Platform Logistics AI',
      notes: `Optimal multi-NGO split executed: Distributed across ${splitResult.allocations.length} shelters (${splitResult.allocations.map((a) => `${a.meals} meals -> ${a.ngoName}`).join('; ')}).`,
    });

    return donation;
  }

  // Admin Verification
  public setVerificationStatus(
    entityType: 'donor' | 'ngo', 
    id: string, 
    status: VerificationStatus
  ): boolean {
    if (entityType === 'donor') {
      const donor = this.donors.find((d) => d.id === id);
      if (!donor) return false;
      donor.verificationStatus = status;
      return true;
    } else {
      const ngo = this.ngos.find((n) => n.id === id);
      if (!ngo) return false;
      ngo.verificationStatus = status;
      return true;
    }
  }

  // Hackathon Demo Bar Actions
  public fastForwardMinutes(minutes: number) {
    this.demoFastForwardMins += minutes;
    this.runWatchdogChecks();
    return { fastForwardMins: this.demoFastForwardMins };
  }

  public simulateAbandonedClaim(): Donation | null {
    // Find the claimed donation or set one
    let target = this.donations.find((d) => d.status === 'CLAIMED');
    if (!target) {
      // Claim an open one first
      const open = this.donations.find((d) => d.status === 'OPEN');
      if (open) {
        this.claimDonation(open.id, this.ngos[0].id, this.volunteers[0].id);
        target = open;
      }
    }

    if (target) {
      // Force pickup deadline to be in the past
      const pastTime = new Date(Date.now() + (this.demoFastForwardMins - 1) * 60 * 1000).toISOString();
      target.pickupDeadline = pastTime;
      this.runWatchdogChecks();
      return target;
    }

    return null;
  }

  public triggerLiveSurplusAlert(): Donation {
    const randomMeals = [35, 45, 60, 85][Math.floor(Math.random() * 4)];
    const titles = [
      'Hot Buffet Surplus: Paneer Butter Masala, Veg Biryani & Rotis',
      'Hostel Dining Hall Fresh Surplus: Sambar, Rice & Potato Roast',
      'Corporate Seminar Excess: 65 Packed Executive Lunch Boxes',
      'Wedding Reception Overflow: Kashmiri Pulao & Kofta Curry'
    ];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const donors = this.donors.filter((d) => d.verificationStatus === 'VERIFIED');
    const donor = donors[Math.floor(Math.random() * donors.length)];

    const now = new Date(Date.now() + this.demoFastForwardMins * 60 * 1000);
    // Urgent safeUntil (40 mins away) to demonstrate pulsing critical alert
    const safeUntil = new Date(now.getTime() + 38 * 60 * 1000).toISOString();

    return this.createDonation({
      donorId: donor.id,
      donorName: donor.name,
      donorAddress: donor.address,
      donorLat: donor.lat,
      donorLng: donor.lng,
      foodTitle: title,
      description: 'Just freshly flagged for immediate rescue! Hot and packed in sanitary insulated crates.',
      quantityMeals: randomMeals,
      safeUntil,
      foodCategory: 'COOKED_MEALS',
      dietaryType: 'VEGETARIAN',
      temperatureState: 'HOT',
    });
  }
}

// Global singleton instance across Next.js API calls in dev mode
const globalStore = global as unknown as { __foodbridgeStore?: FoodBridgeDataStore };
if (!globalStore.__foodbridgeStore) {
  globalStore.__foodbridgeStore = new FoodBridgeDataStore();
}

export const foodBridgeStore = globalStore.__foodbridgeStore;
