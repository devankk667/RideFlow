import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  AlertTriangle,
  Share2,
  Star,
  Clock,
  User,
  Car as CarIcon,
  X,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore, usePassenger } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDistance, getVehicleIcon } from '../../utils/helpers';
import { drivers, vehiclesData } from '../../data/mockData';

const ActiveRide: React.FC = () => {
  const navigate = useNavigate();
  const passenger = usePassenger();
  const toast = useToast();
  const { rides, currentRide, updateRide, setCurrentRide } = useRideStore();
  
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [rideProgress, setRideProgress] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(15);
  const [currentFare, setCurrentFare] = useState(0);

  // Find active ride - prefer currentRide, otherwise search in rides array
  const activeRide = currentRide && currentRide.passengerId === passenger?.id
    ? currentRide
    : rides.find(
        (r) =>
          r.passengerId === passenger?.id &&
          (r.status === 'accepted' || r.status === 'driver_arriving' || r.status === 'in_progress' || r.status === 'pending')
      );

  const driver = activeRide ? drivers.find((d) => d.id === activeRide.driverId) : null;
  const vehicle = activeRide ? vehiclesData.find((v) => v.id === activeRide.vehicleId) : null;

  useEffect(() => {
    if (!activeRide) {
      navigate('/passenger/dashboard');
      return;
    }

    // Simulate ride progress
    const progressInterval = setInterval(() => {
      setRideProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          completeRide();
          return 100;
        }
        return prev + 0.5; // 0.5% every second = ~3.3 minutes for full ride
      });
    }, 1000);

    // Update ETA countdown
    const etaInterval = setInterval(() => {
      setEtaMinutes((prev) => {
        if (prev <= 0) return 0;
        return prev - 0.25; // Decrease by 15 seconds
      });
    }, 1000);

    // Simulate fare meter for in-progress rides
    if (activeRide.status === 'in_progress') {
      const fareInterval = setInterval(() => {
        setCurrentFare((prev) => prev + 0.5);
      }, 2000);
      return () => clearInterval(fareInterval);
    }

    return () => {
      clearInterval(progressInterval);
      clearInterval(etaInterval);
    };
  }, [activeRide?.id]);

  const completeRide = () => {
    if (activeRide) {
      updateRide(activeRide.id, {
        status: 'completed',
        endTime: new Date().toISOString(),
      });
      setCurrentRide(null);
      toast.success('Ride Completed!', 'Thank you for riding with us');
      setTimeout(() => {
        navigate('/passenger/dashboard');
      }, 2000);
    }
  };

  const handleSOS = () => {
    toast.error('Emergency Alert Sent', 'Help is on the way. Stay safe!');
    setShowSOSModal(false);
  };

  const handleShare = () => {
    toast.success('Ride Details Shared', 'Your live location has been shared');
    setShowShareModal(false);
  };

  if (!activeRide) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card variant="glass" className="text-center p-8">
          <p className="text-gray-600 dark:text-gray-400">No active ride found</p>
          <Button onClick={() => navigate('/passenger/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Use fallback driver/vehicle if not found
  const displayDriver = driver || {
    id: activeRide.driverId,
    email: 'driver@demo.com',
    password: 'password123',
    role: 'driver' as const,
    name: 'Demo Driver',
    phone: '+91 00000 00000',
    rating: 4.5,
    totalRides: 100,
    createdAt: new Date().toISOString(),
    licenseNumber: 'DL-01-12345678',
    licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    vehicleIds: [activeRide.vehicleId],
    isOnline: true,
    totalEarnings: 50000,
    documentsVerified: true,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=driver',
  };

  const displayVehicle = vehicle || {
    id: activeRide.vehicleId,
    type: activeRide.vehicleType,
    make: 'Demo',
    model: 'Vehicle',
    plateNumber: 'DL-XX-XXXX',
    color: 'White',
  };

  const rideStages = [
    { label: 'Driver Assigned', completed: true },
    {
      label: 'Driver Arriving',
      completed: activeRide.status !== 'accepted',
    },
    {
      label: 'In Progress',
      completed: activeRide.status === 'in_progress' || activeRide.status === 'completed',
    },
    { label: 'Completed', completed: activeRide.status === 'completed' },
  ];

  const displayFare = activeRide.status === 'in_progress' 
    ? Math.min(activeRide.fare, activeRide.fare * 0.5 + currentFare)
    : activeRide.fare;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Active Ride</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeRide.status === 'accepted'
                  ? 'Driver is on the way'
                  : activeRide.status === 'driver_arriving'
                  ? 'Driver arriving soon'
                  : 'Ride in progress'}
              </p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowSOSModal(true)}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              SOS
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Map and Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Simulation */}
            <Card variant="glass">
              <div className="relative h-96 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg overflow-hidden">
                {/* Simulated map with route */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🗺️</div>
                    <p className="text-gray-600 dark:text-gray-400">Live Map Simulation</p>
                  </div>
                </div>

                {/* Pickup marker */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-8 left-8 bg-green-500 text-white p-3 rounded-full shadow-lg"
                >
                  <MapPin className="h-6 w-6" />
                </motion.div>

                {/* Destination marker */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute bottom-8 right-8 bg-red-500 text-white p-3 rounded-full shadow-lg"
                >
                  <MapPin className="h-6 w-6" />
                </motion.div>

                {/* Driver location (animated) */}
                <motion.div
                  animate={{
                    top: ['8%', '45%', '92%'],
                    left: ['8%', '45%', '92%'],
                  }}
                  transition={{
                    duration: activeRide.duration * 60,
                    ease: 'linear',
                    repeat: Infinity,
                    repeatType: 'reverse' as const,
                  }}
                  className="absolute bg-primary-600 text-white p-4 rounded-full shadow-xl z-10"
                >
                  <CarIcon className="h-6 w-6" />
                </motion.div>

                {/* ETA Badge */}
                <div className="absolute top-4 right-4 glass px-4 py-2 rounded-full">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary-600" />
                    <span className="font-semibold">
                      ETA: {Math.max(0, Math.ceil(etaMinutes))} min
                    </span>
                  </div>
                </div>

                {/* Fare Meter (only during ride) */}
                {activeRide.status === 'in_progress' && (
                  <div className="absolute bottom-4 left-4 glass px-6 py-3 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Current Fare</p>
                      <p className="text-2xl font-bold text-primary-600">
                        {formatCurrency(displayFare)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Progress Bar */}
            <Card variant="glass">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Ride Progress
              </h3>
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: `${rideProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary-600 to-purple-600 rounded-full"
                  />
                </div>

                {/* Stages */}
                <div className="flex justify-between">
                  {rideStages.map((stage, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${
                          stage.completed
                            ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {stage.completed ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </motion.div>
                      <p
                        className={`text-xs text-center ${
                          stage.completed
                            ? 'text-gray-900 dark:text-white font-semibold'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Route Details */}
            <Card variant="glass">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Route</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Pickup</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activeRide.pickup.address}
                    </p>
                  </div>
                </div>

                <div className="ml-5 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-8" />

                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Destination</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activeRide.destination.address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Distance</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDistance(activeRide.distance)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Est. Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {activeRide.duration} min
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Fare</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(activeRide.fare)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Driver Info and Actions */}
          <div className="space-y-6">
            {/* Driver Card */}
            <Card variant="glass">
              <div className="text-center mb-4">
                <img
                  src={displayDriver.avatar}
                  alt={displayDriver.name}
                  className="h-24 w-24 rounded-full mx-auto mb-3 border-4 border-primary-500"
                />
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  {displayDriver.name}
                </h3>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{displayDriver.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {displayDriver.totalRides ? `(${displayDriver.totalRides} rides)` : ''}
                  </span>
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getVehicleIcon(displayVehicle.type)}</div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {displayVehicle.make} {displayVehicle.model}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {displayVehicle.color} • {displayVehicle.plateNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card variant="glass">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowShareModal(true)}
                >
                  <Share2 className="h-4 w-4 mr-3" />
                  Share Ride Details
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowSOSModal(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-3" />
                  Emergency SOS
                </Button>
              </div>
            </Card>

            {/* Safety Info */}
            <Card variant="gradient">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Safety First
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your ride is being tracked. Press SOS if you need immediate assistance.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Emergency SOS
                  </h3>
                  <button
                    onClick={() => setShowSOSModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  This will immediately alert emergency services and share your live location.
                  Are you sure you want to proceed?
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowSOSModal(false)}>
                    Cancel
                  </Button>
                  <Button variant="danger" onClick={handleSOS} className="flex-1">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send SOS Alert
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Share Ride Details
                  </h3>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Share your live ride details with friends and family for added safety.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setShowShareModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleShare} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveRide;
