// User types
export type UserRole = 'passenger' | 'driver' | 'admin';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalRides: number;
  createdAt: string;
}

export interface Passenger extends User {
  role: 'passenger';
  walletBalance: number;
  savedAddresses: SavedAddress[];
  paymentMethods: PaymentMethod[];
}

export interface Driver extends User {
  role: 'driver';
  licenseNumber: string;
  licenseExpiry: string;
  vehicleIds: string[];
  isOnline: boolean;
  totalEarnings: number;
  currentLocation?: Location;
  documentsVerified: boolean;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

// Vehicle types
export type VehicleType = 'car' | 'bike' | 'auto' | 'suv' | 'luxury';

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
  capacity: number;
  features: string[];
  insuranceExpiry: string;
  insuranceNumber: string;
  isActive: boolean;
  registrationNumber?: string;
  registrationExpiry?: string;
  lastServiceDate?: string;
}

// Ride types
export type RideStatus = 
  | 'pending'
  | 'accepted'
  | 'driver_arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_driver_available';

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  location: Location;
}

export interface Ride {
  id: string;
  passengerId: string;
  driverId?: string;
  vehicleId?: string;
  pickup: Location;
  destination: Location;
  status: RideStatus;
  fare: number;
  distance: number; // in km
  duration: number; // in minutes
  vehicleType: VehicleType;
  paymentMethod: PaymentMethodType;
  promoCode?: string;
  discount?: number;
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  rating?: Rating;
  createdAt: string;
  requestTime?: string; // Alias for createdAt, when ride was requested
}

export interface Rating {
  stars: number;
  comment?: string;
  createdAt: string;
}

// Payment types
export type PaymentMethodType = 'cash' | 'card' | 'upi' | 'wallet';
export type TransactionType = 'ride' | 'wallet_recharge' | 'refund' | 'withdrawal';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi';
  isDefault: boolean;
  cardNumber?: string; // Last 4 digits
  cardholderName?: string;
  expiryDate?: string;
  upiId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethodType;
  rideId?: string;
  description: string;
  createdAt: string;
}

// Promo code types
export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minRideAmount: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

// Report types
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'reported' | 'investigating' | 'resolved' | 'closed';

export interface IncidentReport {
  id: string;
  rideId: string;
  reportedBy: string;
  reportedAgainst?: string;
  type: 'accident' | 'safety' | 'behavior' | 'vehicle' | 'other';
  severity: IncidentSeverity;
  status: IncidentStatus;
  description: string;
  location?: Location;
  attachments?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface TrafficReport {
  id: string;
  route: string;
  congestionLevel: 'low' | 'medium' | 'high';
  averageSpeed: number; // km/h
  estimatedDelay: number; // minutes
  reportedAt: string;
}

// Notification types
export type NotificationType = 
  | 'ride_request'
  | 'ride_accepted'
  | 'driver_arriving'
  | 'ride_started'
  | 'ride_completed'
  | 'payment_success'
  | 'promo_available'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

// Analytics types
export interface PlatformStats {
  totalRides: number;
  totalRevenue: number;
  activePassengers: number;
  activeDrivers: number;
  averageRating: number;
  completionRate: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  rides: number;
}

export interface PopularRoute {
  route: string;
  count: number;
  averageFare: number;
}

export interface PeakHour {
  hour: number;
  rides: number;
  revenue: number;
}
