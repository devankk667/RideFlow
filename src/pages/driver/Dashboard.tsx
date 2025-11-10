import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  DollarSign,
  Clock,
  Star,
  TrendingUp,
  MapPin,
  Navigation,
  Phone,
  MessageSquare,
  Check,
  X,
  AlertCircle,
  Calendar,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore, useDriver } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import {
  formatCurrency,
  formatDate,
  formatDistance,
  getVehicleIcon,
} from '../../utils/helpers';
import { rides as mockRides, passengers, vehiclesData } from '../../data/mockData';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();
  const driver = useDriver();
  const { rides, updateRide } = useRideStore();
  const toast = useToast();

  const [isOnline, setIsOnline] = useState(true);
  const [incomingRides, setIncomingRides] = useState(
    mockRides.filter((r) => r.status === 'requested').slice(0, 3)
  );

  // Get driver stats
  const driverRides = rides.filter((r) => r.driverId === driver?.id);
  const completedRides = driverRides.filter((r) => r.status === 'completed');
  const activeRide = driverRides.find(
    (r) =>
      r.status === 'accepted' || r.status === 'driver_arriving' || r.status === 'in_progress'
  );

  const todayEarnings = completedRides
    .filter((r) => {
      const rideDate = new Date(r.requestTime);
      const today = new Date();
      return rideDate.toDateString() === today.toDateString();
    })
    .reduce((sum, r) => sum + r.fare, 0);

  const thisWeekEarnings = completedRides
    .filter((r) => {
      const rideDate = new Date(r.requestTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return rideDate >= weekAgo;
    })
    .reduce((sum, r) => sum + r.fare, 0);

  const handleAcceptRide = (rideId: string) => {
    const ride = incomingRides.find((r) => r.id === rideId);
    if (!ride) return;

    updateRide(rideId, {
      status: 'accepted',
      driverId: driver?.id,
    });

    setIncomingRides(incomingRides.filter((r) => r.id !== rideId));
    toast.success('Ride Accepted!', 'Navigate to pickup location');
    
    // Simulate navigation to active ride after 1 second
    setTimeout(() => {
      navigate('/driver/active-ride');
    }, 1000);
  };

  const handleDeclineRide = (rideId: string) => {
    setIncomingRides(incomingRides.filter((r) => r.id !== rideId));
    toast.info('Ride Declined', 'Looking for other rides nearby');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      toast.success('You are Online', 'You can now receive ride requests');
    } else {
      toast.info('You are Offline', 'You will not receive new ride requests');
    }
  };

  // Simulate new ride requests
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      if (incomingRides.length < 3 && Math.random() > 0.7) {
        const newRide = mockRides.find(
          (r) => r.status === 'requested' && !incomingRides.find((ir) => ir.id === r.id)
        );
        if (newRide) {
          setIncomingRides([...incomingRides, newRide]);
          toast.info('New Ride Request!', 'Check your dashboard for details');
        }
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [isOnline, incomingRides]);

  if (!driver) {
    return null;
  }

  const vehicle = vehiclesData.find((v) => v.driverId === driver.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Driver Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {driver.name}!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2 rounded-full font-semibold text-sm ${
                  isOnline
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {isOnline ? '🟢 Online' : '⚫ Offline'}
              </div>
              <Button variant={isOnline ? 'outline' : 'primary'} onClick={toggleOnlineStatus}>
                {isOnline ? 'Go Offline' : 'Go Online'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(todayEarnings)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(thisWeekEarnings)}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driver.totalRides}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {driver.rating.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Incoming Rides */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Ride Alert */}
            {activeRide && (
              <Card variant="gradient">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      Active Ride in Progress
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Continue your current ride
                    </p>
                  </div>
                  <Button onClick={() => navigate('/driver/active-ride')}>
                    View Ride
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </Card>
            )}

            {/* Incoming Ride Requests */}
            <Card variant="glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Incoming Requests
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    incomingRides.length > 0
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-gray-500/10 text-gray-600'
                  }`}
                >
                  {incomingRides.length} pending
                </span>
              </div>

              <AnimatePresence>
                {incomingRides.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {isOnline ? 'Waiting for Rides' : 'You are Offline'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOnline
                        ? 'New ride requests will appear here'
                        : 'Go online to start receiving ride requests'}
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    {incomingRides.map((ride, index) => {
                      const passenger = passengers.find((p) => p.id === ride.passengerId);

                      return (
                        <motion.div
                          key={ride.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="p-4 bg-gradient-to-br from-primary-500/5 to-purple-500/5 border-2 border-primary-500/20 rounded-lg">
                            {/* Passenger Info */}
                            {passenger && (
                              <div className="flex items-center gap-3 mb-4">
                                <img
                                  src={passenger.avatar}
                                  alt={passenger.name}
                                  className="h-12 w-12 rounded-full border-2 border-primary-500"
                                />
                                <div className="flex-1">
                                  <p className="font-bold text-gray-900 dark:text-white">
                                    {passenger.name}
                                  </p>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                    <span>{passenger.rating.toFixed(1)}</span>
                                    <span>•</span>
                                    <span>{passenger.totalRides} rides</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button className="h-10 w-10 rounded-full bg-green-500 text-white flex items-center justify-center hover:bg-green-600 transition-colors">
                                    <Phone className="h-5 w-5" />
                                  </button>
                                  <button className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
                                    <MessageSquare className="h-5 w-5" />
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Route */}
                            <div className="space-y-3 mb-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Pickup
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {ride.pickup.address}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-500">2.3 km away</span>
                              </div>

                              <div className="ml-4 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-4" />

                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                  <MapPin className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Destination
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {ride.destination.address}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Ride Details */}
                            <div className="flex items-center gap-4 mb-4 text-sm">
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Navigation className="h-4 w-4" />
                                <span>{formatDistance(ride.distance)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                <Clock className="h-4 w-4" />
                                <span>{ride.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1 font-bold text-green-600">
                                <DollarSign className="h-4 w-4" />
                                <span>{formatCurrency(ride.fare)}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                variant="outline"
                                onClick={() => handleDeclineRide(ride.id)}
                                className="w-full"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                              <Button
                                onClick={() => handleAcceptRide(ride.id)}
                                className="w-full"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Info */}
            {vehicle && (
              <Card variant="gradient">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-5xl">{getVehicleIcon(vehicle.type)}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {vehicle.color} • {vehicle.plateNumber}
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/driver/vehicles')}>
                  Manage Vehicle
                </Button>
              </Card>
            )}

            {/* Quick Stats */}
            <Card variant="glass">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Today's Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Rides Completed
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {completedRides.filter((r) => {
                      const rideDate = new Date(r.requestTime);
                      return rideDate.toDateString() === new Date().toDateString();
                    }).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Hours Online
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">6.5 hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Acceptance Rate
                  </span>
                  <span className="font-semibold text-green-600">92%</span>
                </div>
              </div>
            </Card>

            {/* Earnings This Month */}
            <Card variant="glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">This Month</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/driver/earnings')}
                >
                  View All
                </Button>
              </div>
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatCurrency(driver.totalEarnings)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(driver.totalEarnings * 0.85)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Paid Out</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary-600">
                    {formatCurrency(driver.totalEarnings * 0.15)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pending</p>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card variant="glass">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Maximize Your Earnings
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Accept more rides during peak hours (8-10 AM, 5-8 PM) to earn surge bonuses!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
