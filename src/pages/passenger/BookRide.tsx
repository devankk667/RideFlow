import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  ArrowRight,
  Clock,
  Users,
  Star,
  Zap,
  Shield,
  Info,
  Navigation,
  Calendar,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore, usePassenger } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import {
  formatCurrency,
  formatDistance,
  calculateFare,
  getVehicleIcon,
} from '../../utils/helpers';
import { VehicleType } from '../../types';
import { drivers, vehiclesData } from '../../data/mockData';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

const VEHICLE_TYPES = [
  {
    type: 'economy' as VehicleType,
    name: 'Economy',
    description: 'Affordable rides',
    icon: '🚗',
    capacity: 4,
    priceMultiplier: 1,
    features: ['AC', 'Music'],
  },
  {
    type: 'premium' as VehicleType,
    name: 'Premium',
    description: 'Comfortable sedans',
    icon: '🚙',
    capacity: 4,
    priceMultiplier: 1.5,
    features: ['AC', 'Leather Seats', 'Premium Audio'],
  },
  {
    type: 'luxury' as VehicleType,
    name: 'Luxury',
    description: 'Top-class experience',
    icon: '🏎️',
    capacity: 4,
    priceMultiplier: 2.5,
    features: ['AC', 'Luxury Interiors', 'WiFi', 'Refreshments'],
  },
  {
    type: 'shared' as VehicleType,
    name: 'Shared',
    description: 'Share & save',
    icon: '🚐',
    capacity: 6,
    priceMultiplier: 0.6,
    features: ['AC', 'Multiple Stops'],
  },
  {
    type: 'bike' as VehicleType,
    name: 'Bike',
    description: 'Quick & easy',
    icon: '🏍️',
    capacity: 1,
    priceMultiplier: 0.5,
    features: ['Helmet', 'Fast'],
  },
];

const POPULAR_LOCATIONS = [
  { address: 'Connaught Place, New Delhi', lat: 28.6304, lng: 77.2177 },
  { address: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { address: 'Koramangala, Bangalore', lat: 12.9352, lng: 77.6245 },
  { address: 'MG Road, Pune', lat: 18.5314, lng: 73.8446 },
  { address: 'Park Street, Kolkata', lat: 22.5542, lng: 88.3516 },
];

const BookRide: React.FC = () => {
  const navigate = useNavigate();
  const passenger = usePassenger();
  const toast = useToast();
  const { createRide, setCurrentRide, updateRide } = useRideStore();

  const [step, setStep] = useState<'location' | 'vehicle' | 'confirm'>('location');
  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [pickupSearch, setPickupSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(null);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [scheduleRide, setScheduleRide] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const calculateDistance = (loc1: Location, loc2: Location): number => {
    // Haversine formula
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = pickup && destination ? calculateDistance(pickup, destination) : 0;
  const duration = Math.ceil(distance / 0.5); // Assume 30 km/h average speed

  useEffect(() => {
    // Auto-advance to vehicle selection when both locations are set
    if (pickup && destination && step === 'location') {
      setTimeout(() => setStep('vehicle'), 500);
    }
  }, [pickup, destination, step]);

  const handleLocationSelect = (location: Location, isPickup: boolean) => {
    if (isPickup) {
      setPickup(location);
      setPickupSearch(location.address);
      setShowPickupSuggestions(false);
    } else {
      setDestination(location);
      setDestinationSearch(location.address);
      setShowDestinationSuggestions(false);
    }
  };

  const handleSwapLocations = () => {
    const temp = pickup;
    setPickup(destination);
    setDestination(temp);
    setPickupSearch(destination?.address || '');
    setDestinationSearch(temp?.address || '');
  };

  const handleBookRide = () => {
    if (!passenger || !pickup || !destination || !selectedVehicle) {
      toast.error('Missing Information', 'Please complete all required fields');
      return;
    }

    // Find driver with selected vehicle type (prefer online drivers, but use any for demo)
    const vehiclesWithType = vehiclesData.filter((v) => v.type === selectedVehicle && v.isActive);
    const onlineDrivers = drivers.filter((d) => 
      d.isOnline && vehiclesWithType.some((v) => v.driverId === d.id)
    );
    
    // Use online drivers if available, otherwise use any driver with the vehicle type
    const availableDrivers = onlineDrivers.length > 0 
      ? onlineDrivers 
      : drivers.filter((d) => vehiclesWithType.some((v) => v.driverId === d.id));

    // If still no drivers, use the first driver and create a vehicle for demo
    let selectedDriver = availableDrivers.length > 0
      ? availableDrivers[Math.floor(Math.random() * availableDrivers.length)]
      : drivers[0]; // Fallback to first driver for demo

    let selectedVehicleData = vehiclesWithType.find((v) => v.driverId === selectedDriver.id);
    
    // If no vehicle found, create a demo vehicle for this driver
    if (!selectedVehicleData) {
      selectedVehicleData = {
        id: `veh_demo_${Date.now()}`,
        driverId: selectedDriver.id,
        type: selectedVehicle,
        make: 'Demo',
        model: 'Vehicle',
        year: 2023,
        color: 'White',
        plateNumber: 'DL-01-DEMO-123',
        capacity: selectedVehicle === 'bike' ? 1 : selectedVehicle === 'auto' ? 3 : 4,
        features: ['AC', 'Music System'],
        insuranceExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        insuranceNumber: 'INS-DEMO-123',
        isActive: true,
      };
    }

    const fare = calculateFare(distance, selectedVehicle);

    try {
      // Create ride using the store's createRide method
      const newRide = createRide({
        passengerId: passenger.id,
        driverId: selectedDriver.id,
        vehicleId: selectedVehicleData.id,
        pickup,
        destination,
        fare,
        distance,
        duration,
        scheduledTime: scheduleRide ? scheduledTime : undefined,
        vehicleType: selectedVehicle,
        paymentMethod: 'card' as const,
      });

      // Update ride status to accepted
      updateRide(newRide.id, { 
        status: 'accepted',
        requestTime: new Date().toISOString(),
      });

      // Navigate to active ride page immediately
      toast.success('Ride Booked!', `${selectedDriver.name} will pick you up shortly`);
      setTimeout(() => {
        navigate('/passenger/active-ride');
      }, 500);
    } catch (error) {
      console.error('Error creating ride:', error);
      toast.error('Booking Failed', 'Please try again');
    }
  };

  const filteredPickupSuggestions = POPULAR_LOCATIONS.filter((loc) =>
    loc.address.toLowerCase().includes(pickupSearch.toLowerCase())
  );

  const filteredDestinationSuggestions = POPULAR_LOCATIONS.filter((loc) =>
    loc.address.toLowerCase().includes(destinationSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book a Ride</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {step === 'location' && 'Enter your pickup and destination'}
                {step === 'vehicle' && 'Choose your vehicle'}
                {step === 'confirm' && 'Review your booking'}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/passenger/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {['Location', 'Vehicle', 'Confirm'].map((label, index) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      step === label.toLowerCase() ||
                      (step === 'vehicle' && index === 0) ||
                      (step === 'confirm' && index < 2)
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">{label}</p>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-16 rounded-full ${
                      (step === 'vehicle' && index === 0) || (step === 'confirm' && index < 2)
                        ? 'bg-gradient-to-r from-primary-600 to-purple-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Location Selection */}
          {step === 'location' && (
            <motion.div
              key="location"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card variant="glass" className="mb-6">
                <div className="space-y-4">
                  {/* Pickup Input */}
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Pickup Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                      <Input
                        value={pickupSearch}
                        onChange={(e) => {
                          setPickupSearch(e.target.value);
                          setShowPickupSuggestions(true);
                        }}
                        onFocus={() => setShowPickupSuggestions(true)}
                        placeholder="Enter pickup location"
                        className="pl-10"
                      />
                    </div>
                    {showPickupSuggestions && pickupSearch && (
                      <Card className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto">
                        {filteredPickupSuggestions.map((loc) => (
                          <button
                            key={loc.address}
                            onClick={() => handleLocationSelect(loc, true)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{loc.address}</span>
                            </div>
                          </button>
                        ))}
                      </Card>
                    )}
                  </div>

                  {/* Swap Button */}
                  {pickup && destination && (
                    <div className="flex justify-center">
                      <button
                        onClick={handleSwapLocations}
                        className="h-10 w-10 rounded-full bg-primary-500 text-white hover:bg-primary-600 flex items-center justify-center transform transition-transform hover:rotate-180"
                      >
                        <ArrowRight className="h-5 w-5 rotate-90" />
                      </button>
                    </div>
                  )}

                  {/* Destination Input */}
                  <div className="relative">
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Destination
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                      <Input
                        value={destinationSearch}
                        onChange={(e) => {
                          setDestinationSearch(e.target.value);
                          setShowDestinationSuggestions(true);
                        }}
                        onFocus={() => setShowDestinationSuggestions(true)}
                        placeholder="Enter destination"
                        className="pl-10"
                      />
                    </div>
                    {showDestinationSuggestions && destinationSearch && (
                      <Card className="absolute z-10 w-full mt-2 max-h-60 overflow-y-auto">
                        {filteredDestinationSuggestions.map((loc) => (
                          <button
                            key={loc.address}
                            onClick={() => handleLocationSelect(loc, false)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-200 dark:border-gray-700 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-900 dark:text-white">{loc.address}</span>
                            </div>
                          </button>
                        ))}
                      </Card>
                    )}
                  </div>

                  {/* Schedule Ride Option */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleRide}
                        onChange={(e) => setScheduleRide(e.target.checked)}
                        className="h-5 w-5 text-primary-600"
                      />
                      <span className="font-semibold text-gray-900 dark:text-white">
                        Schedule for later
                      </span>
                    </label>
                    {scheduleRide && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                        <Input
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                {pickup && destination && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600 dark:text-gray-400">Estimated Distance</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatDistance(distance)}
                      </span>
                    </div>
                    <Button onClick={() => setStep('vehicle')} className="w-full">
                      Choose Vehicle
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </Card>

              {/* Current Location Button */}
              <Button variant="outline" className="w-full">
                <Navigation className="h-4 w-4 mr-2" />
                Use Current Location
              </Button>
            </motion.div>
          )}

          {/* Step 2: Vehicle Selection */}
          {step === 'vehicle' && pickup && destination && (
            <motion.div
              key="vehicle"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {VEHICLE_TYPES.map((vehicle) => {
                const fare = calculateFare(distance, vehicle.type);
                const eta = duration + Math.floor(Math.random() * 5);

                return (
                  <motion.div
                    key={vehicle.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      variant={selectedVehicle === vehicle.type ? 'gradient' : 'glass'}
                      className={`cursor-pointer transition-all ${
                        selectedVehicle === vehicle.type
                          ? 'ring-2 ring-primary-500'
                          : ''
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-5xl">{vehicle.icon}</div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {vehicle.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {vehicle.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Users className="h-4 w-4" />
                                <span>{vehicle.capacity}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{eta} min</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {vehicle.features.map((feature) => (
                                <span
                                  key={feature}
                                  className="text-xs px-2 py-1 bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-full"
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatCurrency(fare)}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Estimated</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep('location')} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedVehicle}
                  className="flex-1"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && pickup && destination && selectedVehicle && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card variant="glass">
                <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                  Trip Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-500 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Pickup</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{pickup.address}</p>
                    </div>
                  </div>
                  
                  <div className="ml-2.5 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-8" />
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Destination</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{destination.address}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vehicle</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {VEHICLE_TYPES.find((v) => v.type === selectedVehicle)?.name}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {formatDistance(distance)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{duration} min</p>
                  </div>
                </div>
              </Card>

              <Card variant="gradient">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Fare</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(calculateFare(distance, selectedVehicle))}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Shield className="h-4 w-4" />
                      <span>Safe & Secure</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400">
                      <Zap className="h-4 w-4" />
                      <span>Instant Booking</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('vehicle')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleBookRide} className="flex-1">
                  Confirm Booking
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookRide;
