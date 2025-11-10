import type { Passenger, Driver, Admin, Vehicle, Ride, Transaction, PromoCode, IncidentReport, TrafficReport, Notification } from '../types';
import { generateId, getRandomElement, getRandomNumber, getRandomFloat } from '../utils/helpers';

// Indian first names
const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan',
  'Shaurya', 'Atharv', 'Advait', 'Pranav', 'Dhruv', 'Aryan', 'Reyansh', 'Aadhya', 'Ananya', 'Pari',
  'Diya', 'Aanya', 'Sara', 'Aarohi', 'Anaya', 'Navya', 'Angel', 'Avni', 'Mira', 'Myra',
  'Priya', 'Riya', 'Kavya', 'Saanvi', 'Kiara', 'Rajesh', 'Suresh', 'Ramesh', 'Vikram', 'Amit',
  'Rohan', 'Karan', 'Varun', 'Rahul', 'Neha', 'Pooja', 'Sneha', 'Deepika', 'Anjali', 'Preeti'
];

const lastNames = [
  'Sharma', 'Verma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Iyer', 'Menon', 'Nair',
  'Rao', 'Desai', 'Shah', 'Joshi', 'Kulkarni', 'Agarwal', 'Banerjee', 'Mehta', 'Chopra', 'Malhotra',
  'Kapoor', 'Saxena', 'Pandey', 'Mishra', 'Thakur', 'Chauhan', 'Bose', 'Das', 'Ghosh', 'Khan'
];

// Indian cities and landmarks
const indianLocations = [
  { area: 'Connaught Place', city: 'New Delhi', lat: 28.6304, lng: 77.2177 },
  { area: 'Chandni Chowk', city: 'New Delhi', lat: 28.6506, lng: 77.2303 },
  { area: 'Hauz Khas', city: 'New Delhi', lat: 28.5494, lng: 77.1960 },
  { area: 'Saket', city: 'New Delhi', lat: 28.5244, lng: 77.2066 },
  { area: 'Dwarka', city: 'New Delhi', lat: 28.5921, lng: 77.0460 },
  { area: 'Nehru Place', city: 'New Delhi', lat: 28.5494, lng: 77.2500 },
  { area: 'Rajouri Garden', city: 'New Delhi', lat: 28.6410, lng: 77.1214 },
  { area: 'Lajpat Nagar', city: 'New Delhi', lat: 28.5677, lng: 77.2433 },
  { area: 'Karol Bagh', city: 'New Delhi', lat: 28.6512, lng: 77.1900 },
  { area: 'Janakpuri', city: 'New Delhi', lat: 28.6219, lng: 77.0815 },
  { area: 'Bandra West', city: 'Mumbai', lat: 19.0596, lng: 72.8295 },
  { area: 'Andheri East', city: 'Mumbai', lat: 19.1136, lng: 72.8697 },
  { area: 'Powai', city: 'Mumbai', lat: 19.1197, lng: 72.9059 },
  { area: 'Colaba', city: 'Mumbai', lat: 18.9067, lng: 72.8147 },
  { area: 'Worli', city: 'Mumbai', lat: 19.0176, lng: 72.8170 },
  { area: 'Koramangala', city: 'Bangalore', lat: 12.9352, lng: 77.6245 },
  { area: 'Whitefield', city: 'Bangalore', lat: 12.9698, lng: 77.7499 },
  { area: 'Indiranagar', city: 'Bangalore', lat: 12.9716, lng: 77.6412 },
  { area: 'Electronic City', city: 'Bangalore', lat: 12.8456, lng: 77.6603 },
  { area: 'MG Road', city: 'Bangalore', lat: 12.9716, lng: 77.6147 },
];

// Vehicle makes and models
const vehicles = [
  { make: 'Maruti Suzuki', models: ['Swift', 'Dzire', 'Baleno', 'Ertiga', 'Brezza'] },
  { make: 'Hyundai', models: ['i20', 'Verna', 'Creta', 'Venue', 'Alcazar'] },
  { make: 'Honda', models: ['City', 'Amaze', 'Jazz', 'WR-V', 'Civic'] },
  { make: 'Toyota', models: ['Innova', 'Fortuner', 'Glanza', 'Urban Cruiser'] },
  { make: 'Mahindra', models: ['XUV700', 'Scorpio', 'Thar', 'Bolero', 'XUV300'] },
  { make: 'Tata', models: ['Nexon', 'Harrier', 'Safari', 'Altroz', 'Punch'] },
];

const bikeModels = ['Honda Activa', 'TVS Jupiter', 'Hero Splendor', 'Bajaj Pulsar', 'Royal Enfield'];
const autoModels = ['Bajaj RE', 'Piaggio Ape', 'Mahindra Alfa'];

const colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Grey', 'Brown'];

// Helper to generate random name
function generateName(): string {
  return `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`;
}

// Helper to generate phone number
function generatePhone(): string {
  return `+91 ${getRandomNumber(70000, 99999)} ${getRandomNumber(10000, 99999)}`;
}

// Helper to generate email
function generateEmail(name: string): string {
  const sanitized = name.toLowerCase().replace(/\s+/g, '.');
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  return `${sanitized}${getRandomNumber(1, 999)}@${getRandomElement(domains)}`;
}

// Helper to generate location
function generateLocation() {
  const loc = getRandomElement(indianLocations);
  return {
    lat: loc.lat + getRandomFloat(-0.05, 0.05, 4),
    lng: loc.lng + getRandomFloat(-0.05, 0.05, 4),
    address: `${getRandomNumber(1, 999)}, ${loc.area}, ${loc.city}`,
  };
}

// Generate Passengers (50+)
export const passengers: Passenger[] = [
  // Demo passenger account
  {
    id: generateId('pass_demo_'),
    email: 'passenger@demo.com',
    password: 'password123',
    role: 'passenger',
    name: 'Demo Passenger',
    phone: '+91 98765 43211',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=passenger',
    rating: 4.8,
    totalRides: 45,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    walletBalance: 2500,
    savedAddresses: [
      {
        id: generateId('addr_'),
        label: 'Home',
        address: '123, Connaught Place, New Delhi',
        location: { lat: 28.6304, lng: 77.2177, address: '123, Connaught Place, New Delhi' },
      },
      {
        id: generateId('addr_'),
        label: 'Work',
        address: '456, Nehru Place, New Delhi',
        location: { lat: 28.5494, lng: 77.2500, address: '456, Nehru Place, New Delhi' },
      },
    ],
    paymentMethods: [
      {
        id: generateId('pm_'),
        type: 'card',
        isDefault: true,
        cardNumber: '**** 1234',
        cardholderName: 'Demo Passenger',
        expiryDate: '12/25',
      },
    ],
  },
  // Generate remaining passengers
  ...Array.from({ length: 54 }, (_, i) => {
    const name = generateName();
    return {
      id: generateId('pass_'),
      email: generateEmail(name),
      password: 'password123',
    role: 'passenger',
    name,
    phone: generatePhone(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    rating: getRandomFloat(3.5, 5.0, 1),
    totalRides: getRandomNumber(5, 150),
    createdAt: new Date(Date.now() - getRandomNumber(1, 365) * 24 * 60 * 60 * 1000).toISOString(),
    walletBalance: getRandomNumber(0, 5000),
    savedAddresses: Array.from({ length: getRandomNumber(2, 5) }, (_, j) => ({
      id: generateId('addr_'),
      label: ['Home', 'Work', 'Gym', 'College', 'Office'][j] || 'Other',
      address: generateLocation().address,
      location: generateLocation(),
    })),
    paymentMethods: [
      {
        id: generateId('pm_'),
        type: 'card',
        isDefault: true,
        cardNumber: `**** ${getRandomNumber(1000, 9999)}`,
        cardholderName: name,
        expiryDate: `${getRandomNumber(1, 12).toString().padStart(2, '0')}/${getRandomNumber(25, 30)}`,
      },
    ],
  };
  }),
];

// Generate Drivers (30+)
export const drivers: Driver[] = [
  // Demo driver account
  {
    id: generateId('drv_demo_'),
    email: 'driver@demo.com',
    password: 'password123',
    role: 'driver',
    name: 'Demo Driver',
    phone: '+91 98765 43212',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver',
    rating: 4.9,
    totalRides: 320,
    createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString(),
    licenseNumber: 'DL-01-12345678',
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleIds: ['veh_demo_12345'],
    isOnline: true,
    totalEarnings: 125000,
    currentLocation: { lat: 28.6304, lng: 77.2177, address: 'Connaught Place, New Delhi' },
    documentsVerified: true,
  },
  // Generate remaining drivers
  ...Array.from({ length: 34 }, (_, i) => {
    const name = generateName();
    return {
      id: generateId('drv_'),
      email: generateEmail(name),
      password: 'password123',
    role: 'driver',
    name,
    phone: generatePhone(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=driver${name}`,
    rating: getRandomFloat(3.8, 5.0, 1),
    totalRides: getRandomNumber(50, 1000),
    createdAt: new Date(Date.now() - getRandomNumber(30, 1095) * 24 * 60 * 60 * 1000).toISOString(),
    licenseNumber: `DL-${getRandomNumber(10, 99)}-${getRandomNumber(10000000, 99999999)}`,
    licenseExpiry: new Date(Date.now() + getRandomNumber(365, 1825) * 24 * 60 * 60 * 1000).toISOString(),
    vehicleIds: [generateId('veh_')],
    isOnline: Math.random() > 0.3,
    totalEarnings: getRandomNumber(50000, 500000),
    currentLocation: generateLocation(),
    documentsVerified: Math.random() > 0.1,
  };
  }),
];

// Generate Vehicles
// First, add vehicle for demo driver
const demoDriverVehicle: Vehicle = {
  id: 'veh_demo_12345',
  driverId: drivers[0].id,
  type: 'car',
  make: 'Maruti Suzuki',
  model: 'Swift',
  year: 2022,
  color: 'White',
  plateNumber: 'DL-01-AB-1234',
  capacity: 4,
  features: ['AC', 'Music System'],
  insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  insuranceNumber: 'INS-1234567890',
  isActive: true,
};

export const vehiclesData: Vehicle[] = [
  demoDriverVehicle,
  ...drivers.slice(1).flatMap((driver, i) => {
  const vehicleTypes: Array<'bike' | 'auto' | 'car' | 'suv' | 'luxury'> = ['bike', 'auto', 'car', 'suv', 'luxury'];
  const type = i < 10 ? vehicleTypes[0] : i < 15 ? vehicleTypes[1] : i < 25 ? vehicleTypes[2] : i < 30 ? vehicleTypes[3] : vehicleTypes[4];
  
  let make, model;
  if (type === 'bike') {
    make = 'Bike';
    model = getRandomElement(bikeModels);
  } else if (type === 'auto') {
    make = 'Auto';
    model = getRandomElement(autoModels);
  } else {
    const veh = getRandomElement(vehicles);
    make = veh.make;
    model = getRandomElement(veh.models);
  }

  return [{
    id: driver.vehicleIds[0],
    driverId: driver.id,
    type,
    make,
    model,
    year: getRandomNumber(2015, 2024),
    color: getRandomElement(colors),
    plateNumber: `DL-${getRandomNumber(1, 99)}-${String.fromCharCode(65 + getRandomNumber(0, 25))}${String.fromCharCode(65 + getRandomNumber(0, 25))}-${getRandomNumber(1000, 9999)}`,
    capacity: type === 'bike' ? 1 : type === 'auto' ? 3 : type === 'suv' || type === 'luxury' ? 6 : 4,
    features: type === 'luxury' ? ['AC', 'Leather Seats', 'WiFi', 'Water Bottles'] : type === 'car' || type === 'suv' ? ['AC', 'Music System'] : ['Basic'],
    insuranceExpiry: new Date(Date.now() + getRandomNumber(30, 365) * 24 * 60 * 60 * 1000).toISOString(),
    insuranceNumber: `INS-${getRandomNumber(1000000000, 9999999999)}`,
    isActive: driver.isOnline,
  }];
  }),
];

// Generate Rides (100+)
export const rides: Ride[] = Array.from({ length: 120 }, (_, i) => {
  const passenger = getRandomElement(passengers);
  const driver = getRandomElement(drivers);
  const vehicle = vehiclesData.find(v => v.driverId === driver.id)!;
  const pickup = generateLocation();
  const destination = generateLocation();
  const distance = getRandomFloat(2, 50, 1);
  const duration = Math.round(distance * getRandomNumber(2, 4));
  const fare = Math.round((distance * getRandomNumber(10, 20)) + getRandomNumber(20, 50));
  
  const statuses: Array<'pending' | 'accepted' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled'> = 
    ['completed', 'completed', 'completed', 'completed', 'completed', 'cancelled', 'in_progress'];
  const status = i < 5 ? 'in_progress' : i < 8 ? 'pending' : getRandomElement(statuses);
  
  const createdAt = new Date(Date.now() - getRandomNumber(0, 90) * 24 * 60 * 60 * 1000).toISOString();
  const startTime = status !== 'pending' ? new Date(new Date(createdAt).getTime() + getRandomNumber(5, 20) * 60 * 1000).toISOString() : undefined;
  const endTime = status === 'completed' ? new Date(new Date(startTime!).getTime() + duration * 60 * 1000).toISOString() : undefined;

  return {
    id: generateId('ride_'),
    passengerId: passenger.id,
    driverId: status !== 'pending' ? driver.id : undefined,
    vehicleId: status !== 'pending' ? vehicle.id : undefined,
    pickup,
    destination,
    status,
    fare,
    distance,
    duration,
    vehicleType: vehicle.type,
    paymentMethod: getRandomElement(['cash', 'card', 'upi', 'wallet'] as const),
    promoCode: Math.random() > 0.7 ? 'SAVE20' : undefined,
    discount: Math.random() > 0.7 ? getRandomNumber(20, 100) : undefined,
    createdAt,
    requestTime: createdAt,
    startTime,
    endTime,
    rating: status === 'completed' && Math.random() > 0.2 ? {
      stars: getRandomNumber(3, 5),
      comment: getRandomElement([
        'Great ride!',
        'Very professional driver',
        'Clean vehicle',
        'Smooth journey',
        'Excellent service',
        undefined,
      ]),
      createdAt: endTime!,
    } : undefined,
  };
});

// Generate Admins
export const admins: Admin[] = [
  {
    id: generateId('adm_'),
    email: 'admin@rideflow.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    phone: '+91 98765 43210',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    rating: 5.0,
    totalRides: 0,
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['all'],
  },
];

// Generate Transactions
export const transactions: Transaction[] = rides
  .filter(r => r.status === 'completed')
  .map(ride => ({
    id: generateId('txn_'),
    userId: ride.passengerId,
    type: 'ride' as const,
    amount: ride.fare - (ride.discount || 0),
    status: 'completed' as const,
    paymentMethod: ride.paymentMethod,
    rideId: ride.id,
    description: `Ride from ${ride.pickup.address.split(',')[0]} to ${ride.destination.address.split(',')[0]}`,
    createdAt: ride.endTime!,
  }));

// Add wallet recharges
passengers.forEach(p => {
  if (p.walletBalance > 500) {
    transactions.push({
      id: generateId('txn_'),
      userId: p.id,
      type: 'wallet_recharge',
      amount: getRandomNumber(500, 2000),
      status: 'completed',
      paymentMethod: getRandomElement(['card', 'upi'] as const),
      description: 'Wallet recharge',
      createdAt: new Date(Date.now() - getRandomNumber(1, 30) * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
});

// Generate Promo Codes
export const promoCodes: PromoCode[] = [
  {
    id: generateId('promo_'),
    code: 'WELCOME50',
    description: 'Welcome bonus for new users',
    discountType: 'fixed',
    discountValue: 50,
    minRideAmount: 100,
    validFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 1000,
    usedCount: 234,
    isActive: true,
  },
  {
    id: generateId('promo_'),
    code: 'SAVE20',
    description: '20% off on all rides',
    discountType: 'percentage',
    discountValue: 20,
    minRideAmount: 150,
    maxDiscount: 100,
    validFrom: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 5000,
    usedCount: 1823,
    isActive: true,
  },
  {
    id: generateId('promo_'),
    code: 'WEEKEND30',
    description: 'Weekend special - 30% off',
    discountType: 'percentage',
    discountValue: 30,
    minRideAmount: 200,
    maxDiscount: 150,
    validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 2000,
    usedCount: 567,
    isActive: true,
  },
  {
    id: generateId('promo_'),
    code: 'MONSOON100',
    description: 'Monsoon madness - Flat ₹100 off',
    discountType: 'fixed',
    discountValue: 100,
    minRideAmount: 300,
    validFrom: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 3000,
    usedCount: 1456,
    isActive: true,
  },
  {
    id: generateId('promo_'),
    code: 'FIRSTRIDE',
    description: 'First ride free up to ₹200',
    discountType: 'fixed',
    discountValue: 200,
    minRideAmount: 50,
    validFrom: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 10000,
    usedCount: 4567,
    isActive: true,
  },
  {
    id: generateId('promo_'),
    code: 'EXPIRED10',
    description: 'Expired offer',
    discountType: 'percentage',
    discountValue: 10,
    minRideAmount: 100,
    validFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    validUntil: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: 1000,
    usedCount: 1000,
    isActive: false,
  },
];

// Generate Incident Reports
export const incidentReports: IncidentReport[] = Array.from({ length: 8 }, (_, i) => {
  const ride = getRandomElement(rides.filter(r => r.status === 'completed'));
  const types = ['accident', 'safety', 'behavior', 'vehicle', 'other'] as const;
  const severities = ['low', 'medium', 'high', 'critical'] as const;
  const statuses = ['reported', 'investigating', 'resolved', 'closed'] as const;

  return {
    id: generateId('inc_'),
    rideId: ride.id,
    reportedBy: ride.passengerId,
    reportedAgainst: ride.driverId,
    type: getRandomElement(types),
    severity: getRandomElement(severities),
    status: getRandomElement(statuses),
    description: getRandomElement([
      'Minor scratch on vehicle door',
      'Driver was speeding',
      'Rude behavior from driver',
      'Vehicle AC not working',
      'Route deviation without consent',
      'Unclean vehicle interior',
      'Driver refused to follow GPS',
      'Payment dispute',
    ]),
    location: ride.pickup,
    createdAt: ride.endTime!,
    resolvedAt: Math.random() > 0.5 ? new Date(new Date(ride.endTime!).getTime() + getRandomNumber(1, 5) * 24 * 60 * 60 * 1000).toISOString() : undefined,
  };
});

// Generate Traffic Reports
export const trafficReports: TrafficReport[] = Array.from({ length: 15 }, () => {
  const loc1 = getRandomElement(indianLocations);
  const loc2 = getRandomElement(indianLocations.filter(l => l !== loc1));
  const congestionLevels = ['low', 'medium', 'high'] as const;
  
  return {
    id: generateId('trf_'),
    route: `${loc1.area} to ${loc2.area}`,
    congestionLevel: getRandomElement(congestionLevels),
    averageSpeed: getRandomNumber(15, 60),
    estimatedDelay: getRandomNumber(0, 30),
    reportedAt: new Date(Date.now() - getRandomNumber(0, 120) * 60 * 1000).toISOString(),
  };
});

// Generate Notifications
export const notifications: Notification[] = [];
passengers.slice(0, 10).forEach(p => {
  const userRides = rides.filter(r => r.passengerId === p.id).slice(0, 3);
  userRides.forEach(ride => {
    notifications.push({
      id: generateId('notif_'),
      userId: p.id,
      type: 'ride_completed',
      title: 'Ride Completed',
      message: `Your ride to ${ride.destination.address.split(',')[0]} has been completed`,
      isRead: Math.random() > 0.3,
      createdAt: ride.endTime || ride.createdAt,
      data: { rideId: ride.id },
    });
  });
});

// All users combined
export const allUsers = [...passengers, ...drivers, ...admins];
