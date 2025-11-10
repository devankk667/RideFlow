import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Filter,
  Search,
  Star,
  Download,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  MessageSquare,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Rating } from '../../components/ui/Rating';
import { usePassenger } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDate, formatDistance, getVehicleIcon } from '../../utils/helpers';
import { Ride, RideStatus } from '../../types';
import { drivers, vehiclesData } from '../../data/mockData';

const RideHistory: React.FC = () => {
  const passenger = usePassenger();
  const { rides } = useRideStore();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | RideStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'fare'>('date');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingTags, setRatingTags] = useState<string[]>([]);

  // Get passenger rides
  const passengerRides = rides.filter((r) => r.passengerId === passenger?.id);

  // Filter and search
  const filteredRides = passengerRides
    .filter((ride) => {
      if (filterStatus !== 'all' && ride.status !== filterStatus) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ride.pickup.address.toLowerCase().includes(query) ||
          ride.destination.address.toLowerCase().includes(query) ||
          ride.id.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.requestTime).getTime() - new Date(a.requestTime).getTime();
      } else {
        return b.fare - a.fare;
      }
    });

  const RATING_TAGS = [
    'Polite Driver',
    'Clean Vehicle',
    'Safe Driving',
    'On Time',
    'Good Music',
    'Comfortable Ride',
    'Smooth Drive',
    'Helpful',
  ];

  const handleRateRide = (ride: Ride) => {
    setSelectedRide(ride);
    setRating(0);
    setRatingComment('');
    setRatingTags([]);
    setShowRatingModal(true);
  };

  const handleSubmitRating = () => {
    if (!selectedRide || rating === 0) {
      toast.error('Rating Required', 'Please select a rating');
      return;
    }

    // Simulate rating submission
    toast.success('Rating Submitted!', 'Thank you for your feedback');
    setShowRatingModal(false);
    setSelectedRide(null);
    setRating(0);
    setRatingComment('');
    setRatingTags([]);
  };

  const toggleTag = (tag: string) => {
    if (ratingTags.includes(tag)) {
      setRatingTags(ratingTags.filter((t) => t !== tag));
    } else {
      setRatingTags([...ratingTags, tag]);
    }
  };

  const getStatusIcon = (status: RideStatus) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'in_progress':
      case 'driver_arriving':
      case 'accepted':
        return Clock;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: RideStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/10';
      case 'cancelled':
        return 'text-red-600 dark:text-red-400 bg-red-500/10';
      case 'in_progress':
      case 'driver_arriving':
      case 'accepted':
        return 'text-blue-600 dark:text-blue-400 bg-blue-500/10';
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10';
    }
  };

  const stats = {
    total: passengerRides.length,
    completed: passengerRides.filter((r) => r.status === 'completed').length,
    cancelled: passengerRides.filter((r) => r.status === 'cancelled').length,
    totalSpent: passengerRides
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.fare, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ride History</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.total} total rides • {stats.completed} completed
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="glass">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Rides</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </Card>
          <Card variant="glass">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </Card>
          <Card variant="glass">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cancelled</p>
            <p className="text-3xl font-bold text-red-600">{stats.cancelled}</p>
          </Card>
          <Card variant="glass">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-primary-600">
              {formatCurrency(stats.totalSpent)}
            </p>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card variant="glass" className="mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by location or ID..."
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="in_progress">In Progress</option>
              <option value="requested">Requested</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="date">Sort by Date</option>
              <option value="fare">Sort by Fare</option>
            </select>
          </div>
        </Card>

        {/* Ride List */}
        {filteredRides.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              No Rides Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Your ride history will appear here'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const driver = drivers.find((d) => d.id === ride.driverId);
              const vehicle = vehiclesData.find((v) => v.id === ride.vehicleId);
              const StatusIcon = getStatusIcon(ride.status);
              const statusColor = getStatusColor(ride.status);

              return (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card variant="glass">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left: Route and Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-mono text-gray-500">
                                #{ride.id.slice(-8)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColor}`}
                              >
                                <StatusIcon className="h-3 w-3" />
                                {ride.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(ride.requestTime)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatCurrency(ride.fare)}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {ride.paymentMethod || 'Cash'}
                            </p>
                          </div>
                        </div>

                        {/* Route */}
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                Pickup
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {ride.pickup.address}
                              </p>
                            </div>
                          </div>

                          <div className="ml-4 border-l-2 border-dashed border-gray-300 dark:border-gray-600 h-6" />

                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-4 w-4 text-red-500" />
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

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <ArrowRight className="h-4 w-4" />
                            <span>{formatDistance(ride.distance)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{ride.duration} min</span>
                          </div>
                          {vehicle && (
                            <div className="flex items-center gap-1">
                              <span className="text-lg">{getVehicleIcon(vehicle.type)}</span>
                              <span>
                                {vehicle.make} {vehicle.model}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Driver and Actions */}
                      {driver && (
                        <div className="lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6">
                          <div className="flex items-center gap-3 mb-4">
                            <img
                              src={driver.avatar}
                              alt={driver.name}
                              className="h-12 w-12 rounded-full border-2 border-primary-500"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {driver.name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {driver.rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {ride.status === 'completed' && !ride.rating && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full"
                              onClick={() => handleRateRide(ride)}
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Rate Ride
                            </Button>
                          )}

                          {ride.status === 'completed' && ride.rating && (
                            <div className="bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-lg p-3">
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                Your Rating
                              </p>
                              <div className="flex items-center gap-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < ride.rating!
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && selectedRide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Rate Your Ride
                  </h3>
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Driver Info */}
                {(() => {
                  const driver = drivers.find((d) => d.id === selectedRide.driverId);
                  return driver ? (
                    <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="h-16 w-16 rounded-full border-2 border-primary-500"
                      />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{driver.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedRide.pickup.address} → {selectedRide.destination.address}
                        </p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white text-center">
                    How was your ride?
                  </label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {rating === 5 && 'Excellent! 🎉'}
                      {rating === 4 && 'Great! 👍'}
                      {rating === 3 && 'Good 👌'}
                      {rating === 2 && 'Fair 😐'}
                      {rating === 1 && 'Poor 😔'}
                    </p>
                  )}
                </div>

                {/* Quick Tags */}
                {rating >= 4 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-6"
                  >
                    <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                      What did you like?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {RATING_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            ratingTags.includes(tag)
                              ? 'bg-primary-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Add a comment (optional)
                  </label>
                  <textarea
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    placeholder="Share your experience..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitRating} className="flex-1">
                    Submit Rating
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

export default RideHistory;
