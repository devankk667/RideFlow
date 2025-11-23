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
import { formatCurrency, formatDistance, getVehicleIcon, simulateLocationUpdate } from '../../utils/helpers';
import { drivers, vehiclesData } from '../../data/mockData';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent: React.FC<{
  pickup: { lat: number; lng: number; address: string };
  destination: { lat: number; lng: number; address: string };
  status: string;
  progress: number;
}> = ({ pickup, destination, status, progress }) => {
  // Default to New Delhi if coordinates are missing (0,0)
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };

  const start = (pickup.lat === 0 && pickup.lng === 0)
    ? { lat: defaultCenter.lat - 0.02, lng: defaultCenter.lng - 0.02 }
    : pickup;

  const end = (destination.lat === 0 && destination.lng === 0)
    ? { lat: defaultCenter.lat + 0.02, lng: defaultCenter.lng + 0.02 }
    : destination;

  const driverPos = simulateLocationUpdate(start, end, progress / 100);

  // Custom Icons
  const carIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #2563eb; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-size: 16px;">🚗</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });

  const pickupIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #16a34a; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const destIcon = new L.DivIcon({
    className: 'custom-icon',
    html: `<div style="background-color: #dc2626; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">🏁</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  function ChangeView({ center }: { center: { lat: number, lng: number } }) {
    const map = useMap();
    map.setView(center);
    return null;
  }

  return (
    <MapContainer
      center={[driverPos.lat, driverPos.lng]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ChangeView center={driverPos} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[start.lat, start.lng]} icon={pickupIcon}>
        <Popup>Pickup: {pickup.address}</Popup>
      </Marker>

      <Marker position={[end.lat, end.lng]} icon={destIcon}>
        <Popup>Destination: {destination.address}</Popup>
      </Marker>

      <Marker position={[driverPos.lat, driverPos.lng]} icon={carIcon} zIndexOffset={1000}>
        <Popup>Your Ride</Popup>
      </Marker>

      <Polyline
        positions={[[start.lat, start.lng], [end.lat, end.lng]]}
        pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
      />
    </MapContainer>
  );
};

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

  // Handle ride completion when progress hits 100%
  useEffect(() => {
    if (rideProgress >= 100) {
      completeRide();
    }
  }, [rideProgress]);

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
            <Card variant="glass" className="overflow-hidden p-0">
              <div className="h-96 w-full relative z-0">
                <MapComponent
                  pickup={activeRide.pickup}
                  destination={activeRide.destination}
                  status={activeRide.status}
                  progress={rideProgress}
                />
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
                        className={`h-8 w-8 rounded-full flex items-center justify-center mb-2 ${stage.completed
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
                        className={`text-xs text-center ${stage.completed
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
