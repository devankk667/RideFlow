import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Car,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Calendar,
  BarChart3,
  X,
  Download,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAdmin } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDate, formatDistance } from '../../utils/helpers';
import { passengers, drivers, rides as mockRides, vehiclesData } from '../../data/mockData';

const AdminDashboard: React.FC = () => {
  const admin = useAdmin();
  const { rides } = useRideStore();
  const toast = useToast();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month'>('today');
  const [showReportsModal, setShowReportsModal] = useState(false);

  if (!admin) return null;

  // Calculate platform stats
  const totalPassengers = passengers.length;
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.totalRides > 0).length;
  const totalVehicles = vehiclesData.length;

  // Ride stats
  const allRides = [...rides, ...mockRides];
  
  // Filter rides based on timeFilter
  const getFilteredRides = (ridesList: typeof allRides) => {
    const now = new Date();
    return ridesList.filter((r) => {
      const rideDate = new Date(r.requestTime || r.createdAt);
      switch (timeFilter) {
        case 'today':
          return rideDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return rideDate >= weekAgo;
        case 'month':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return rideDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredRides = getFilteredRides(allRides);
  const completedRides = filteredRides.filter((r) => r.status === 'completed');
  const activeRides = filteredRides.filter(
    (r) => r.status === 'accepted' || r.status === 'driver_arriving' || r.status === 'in_progress'
  );
  const cancelledRides = filteredRides.filter((r) => r.status === 'cancelled');

  // Revenue stats based on filter
  const totalRevenue = completedRides.reduce((sum, r) => sum + r.fare, 0);
  const platformRevenue = totalRevenue * 0.15; // 15% commission
  const driverEarnings = totalRevenue * 0.85;

  // Get filter label
  const getFilterLabel = () => {
    switch (timeFilter) {
      case 'today':
        return 'Today Revenue';
      case 'week':
        return 'This Week Revenue';
      case 'month':
        return 'This Month Revenue';
      default:
        return 'Revenue';
    }
  };

  // Recent rides for monitoring (from filtered rides)
  const recentRides = filteredRides
    .sort((a, b) => new Date(b.requestTime || b.createdAt).getTime() - new Date(a.requestTime || a.createdAt).getTime())
    .slice(0, 10);

  // Top performers
  const topDrivers = drivers
    .sort((a, b) => b.totalRides - a.totalRides)
    .slice(0, 5);

  const topPassengers = passengers
    .sort((a, b) => b.totalRides - a.totalRides)
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-500/10';
      case 'cancelled':
        return 'text-red-600 bg-red-500/10';
      case 'in_progress':
      case 'driver_arriving':
      case 'accepted':
        return 'text-blue-600 bg-blue-500/10';
      default:
        return 'text-yellow-600 bg-yellow-500/10';
    }
  };

  // Export reports functionality
  const handleExportReport = (reportType: 'summary' | 'detailed' | 'financial') => {
    try {
      let csvContent = '';
      const filename = `admin-report-${reportType}-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`;

      if (reportType === 'summary') {
        // Summary report
        csvContent = [
          'Platform Summary Report',
          `Period: ${timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}`,
          `Generated: ${new Date().toLocaleString()}`,
          '',
          'Overview',
          `Total Passengers,${totalPassengers}`,
          `Total Drivers,${totalDrivers}`,
          `Active Drivers,${activeDrivers}`,
          `Total Vehicles,${totalVehicles}`,
          '',
          'Ride Statistics',
          `Total Rides,${filteredRides.length}`,
          `Completed Rides,${completedRides.length}`,
          `Active Rides,${activeRides.length}`,
          `Cancelled Rides,${cancelledRides.length}`,
          `Completion Rate,${filteredRides.length > 0 ? ((completedRides.length / filteredRides.length) * 100).toFixed(2) : 0}%`,
          '',
          'Revenue',
          `Total Revenue,${totalRevenue.toFixed(2)}`,
          `Platform Revenue (15%),${platformRevenue.toFixed(2)}`,
          `Driver Earnings (85%),${driverEarnings.toFixed(2)}`,
        ].join('\n');
      } else if (reportType === 'detailed') {
        // Detailed rides report
        const headers = ['Date', 'Ride ID', 'Passenger', 'Driver', 'Pickup', 'Destination', 'Distance', 'Fare', 'Status'];
        const rows = filteredRides.map((ride) => {
          const passenger = passengers.find((p) => p.id === ride.passengerId);
          const driver = drivers.find((d) => d.id === ride.driverId);
          return [
            formatDate(ride.requestTime || ride.createdAt),
            ride.id.slice(-8),
            passenger?.name || 'Unknown',
            driver?.name || 'Unassigned',
            ride.pickup.address.split(',')[0],
            ride.destination.address.split(',')[0],
            `${ride.distance.toFixed(2)} km`,
            ride.fare.toFixed(2),
            ride.status,
          ];
        });

        csvContent = [
          'Detailed Rides Report',
          `Period: ${timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}`,
          `Generated: ${new Date().toLocaleString()}`,
          '',
          headers.join(','),
          ...rows.map((row) => row.join(',')),
        ].join('\n');
      } else if (reportType === 'financial') {
        // Financial report
        csvContent = [
          'Financial Report',
          `Period: ${timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}`,
          `Generated: ${new Date().toLocaleString()}`,
          '',
          'Revenue Breakdown',
          `Total Revenue,${totalRevenue.toFixed(2)}`,
          `Platform Commission (15%),${platformRevenue.toFixed(2)}`,
          `Driver Earnings (85%),${driverEarnings.toFixed(2)}`,
          '',
          'Ride Revenue Details',
          'Date,Ride ID,Fare,Platform Fee,Driver Earnings',
          ...completedRides.map((ride) => [
            formatDate(ride.requestTime || ride.createdAt),
            ride.id.slice(-8),
            ride.fare.toFixed(2),
            (ride.fare * 0.15).toFixed(2),
            (ride.fare * 0.85).toFixed(2),
          ].join(',')),
        ].join('\n');
      }

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report Exported', `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', 'Unable to export report. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {admin.name}! Here's your platform overview.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <Button variant="primary" onClick={() => setShowReportsModal(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passengers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPassengers}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drivers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalDrivers}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rides</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {activeRides.length}
                </p>
              </div>
            </div>
          </Card>

          <Card variant="gradient">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{getFilterLabel()}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Revenue & Performance Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card variant="glass">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Revenue Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Platform Share</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(platformRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Driver Earnings</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(driverEarnings)}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Ride Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {completedRides.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {activeRides.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cancelled</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                  {cancelledRides.length}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  Total Rides
                </span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  {filteredRides.length}
                </span>
              </div>
            </div>
          </Card>

          <Card variant="glass">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Platform Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Active Drivers</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((activeDrivers / totalDrivers) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                    style={{ width: `${(activeDrivers / totalDrivers) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredRides.length > 0 ? Math.round((completedRides.length / filteredRides.length) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-600"
                    style={{ width: `${filteredRides.length > 0 ? (completedRides.length / filteredRides.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Avg Rating</span>
                  <span className="font-semibold text-gray-900 dark:text-white">4.7 ⭐</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-600"
                    style={{ width: '94%' }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Rides Monitor */}
          <div className="lg:col-span-2">
            <Card variant="glass">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Live Ride Monitoring
                </h3>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-3">
                {recentRides.slice(0, 6).map((ride) => {
                  const passenger = passengers.find((p) => p.id === ride.passengerId);
                  const driver = drivers.find((d) => d.id === ride.driverId);

                  return (
                    <motion.div
                      key={ride.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">
                              #{ride.id.slice(-8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(
                                ride.status
                              )}`}
                            >
                              {ride.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {passenger?.name} → {driver?.name || 'Assigning driver...'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">
                            {formatCurrency(ride.fare)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistance(ride.distance)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[200px]">
                            {ride.pickup.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(ride.requestTime || ride.createdAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Top Performers Sidebar */}
          <div className="space-y-6">
            {/* Top Drivers */}
            <Card variant="glass">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Top Drivers
              </h3>
              <div className="space-y-3">
                {topDrivers.map((driver, index) => (
                  <div
                    key={driver.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                    <img
                      src={driver.avatar}
                      alt={driver.name}
                      className="h-10 w-10 rounded-full border-2 border-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {driver.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {driver.totalRides} rides • ⭐ {driver.rating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Passengers */}
            <Card variant="glass">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Top Passengers
              </h3>
              <div className="space-y-3">
                {topPassengers.map((passenger, index) => (
                  <div
                    key={passenger.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                    <img
                      src={passenger.avatar}
                      alt={passenger.name}
                      className="h-10 w-10 rounded-full border-2 border-yellow-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {passenger.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {passenger.totalRides} rides
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Alerts */}
            <Card variant="glass" className="border-2 border-yellow-500/20">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    System Alerts
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {activeRides.length} active rides need monitoring
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    3 pending support tickets
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Reports Modal */}
      <AnimatePresence>
        {showReportsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReportsModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Platform Reports
                  </h3>
                  <button
                    onClick={() => setShowReportsModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Period: <span className="font-semibold">{timeFilter === 'today' ? 'Today' : timeFilter === 'week' ? 'This Week' : 'This Month'}</span>
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {/* Summary Report */}
                  <Card variant="glass" className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExportReport('summary')}>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                        <BarChart3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Summary Report</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Platform overview and key metrics
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </Card>

                  {/* Detailed Report */}
                  <Card variant="glass" className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExportReport('detailed')}>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                        <Activity className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Detailed Report</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Complete ride-by-ride breakdown
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </Card>

                  {/* Financial Report */}
                  <Card variant="glass" className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" onClick={() => handleExportReport('financial')}>
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Financial Report</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Revenue and earnings breakdown
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </Card>
                </div>

                {/* Quick Stats Preview */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Stats Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Rides</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{filteredRides.length}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Revenue</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Platform Share</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(platformRevenue)}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {filteredRides.length > 0 ? Math.round((completedRides.length / filteredRides.length) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setShowReportsModal(false)}>Close</Button>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
