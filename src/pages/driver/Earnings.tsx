import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Award,
  Target,
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useDriver } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

const Earnings: React.FC = () => {
  const driver = useDriver();
  const { rides } = useRideStore();
  const toast = useToast();
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [showPayoutHistory, setShowPayoutHistory] = useState(false);

  if (!driver) return null;

  // Get driver rides
  const driverRides = rides.filter((r) => r.driverId === driver.id && r.status === 'completed');

  // Calculate earnings based on time filter
  const getFilteredRides = () => {
    const now = new Date();
    return driverRides.filter((r) => {
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

  const filteredRides = getFilteredRides();
  const totalEarnings = filteredRides.reduce((sum, r) => sum + r.fare, 0);
  const platformFee = totalEarnings * 0.15; // 15% commission
  const netEarnings = totalEarnings - platformFee;
  const averagePerRide = filteredRides.length > 0 ? totalEarnings / filteredRides.length : 0;

  // Calculate tips and bonuses
  const totalTips = filteredRides.length * 25; // Simulated tips
  const surgeBonuses = filteredRides.filter((r) => {
    const rideTime = r.requestTime || r.createdAt;
    if (!rideTime) return false;
    const hours = new Date(rideTime).getHours();
    return hours >= 17 && hours <= 20;
  }).length * 50;

  // Daily breakdown for chart simulation
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayRides = driverRides.filter((r) => {
      const rideDate = new Date(r.requestTime || r.createdAt);
      return rideDate.toDateString() === date.toDateString();
    });
    const dayEarnings = dayRides.reduce((sum, r) => sum + r.fare, 0);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      earnings: dayEarnings,
      rides: dayRides.length,
    };
  });

  const maxEarnings = Math.max(...last7Days.map((d) => d.earnings), 1);

  // Export report functionality
  const handleExportReport = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Ride ID', 'Fare', 'Platform Fee', 'Net Earnings', 'Status'];
      const rows = filteredRides.map((ride) => [
        formatDate(ride.requestTime || ride.createdAt),
        ride.id.slice(-8),
        ride.fare.toString(),
        (ride.fare * 0.15).toFixed(2),
        (ride.fare * 0.85).toFixed(2),
        ride.status,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
        '',
        'Summary',
        `Total Earnings,${totalEarnings.toFixed(2)}`,
        `Platform Fee,${platformFee.toFixed(2)}`,
        `Net Earnings,${netEarnings.toFixed(2)}`,
        `Tips & Bonuses,${(totalTips + surgeBonuses).toFixed(2)}`,
        `Total Net,${(netEarnings + totalTips + surgeBonuses).toFixed(2)}`,
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `earnings-report-${timeFilter}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report Exported', 'Your earnings report has been downloaded');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export Failed', 'Unable to export report. Please try again.');
    }
  };

  // Generate payout history data
  const payoutHistory = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthRides = driverRides.filter((r) => {
      const rideDate = new Date(r.requestTime || r.createdAt);
      return rideDate.getMonth() === date.getMonth() && rideDate.getFullYear() === date.getFullYear();
    });
    const monthEarnings = monthRides.reduce((sum, r) => sum + r.fare, 0);
    const monthNet = monthEarnings * 0.85;
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      earnings: monthNet,
      rides: monthRides.length,
      status: i === 0 ? 'Pending' : 'Paid',
      paidDate: i === 0 ? null : new Date(date.getFullYear(), date.getMonth() + 1, 1).toLocaleDateString('en-US'),
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Earnings</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Track your income and performance
              </p>
            </div>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Time Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setTimeFilter(filter.value as any)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                timeFilter === filter.value
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Main Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card variant="gradient">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(totalEarnings)}
            </p>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              +12% from last period
            </p>
          </Card>

          <Card variant="glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Net Earnings</p>
              <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(netEarnings)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              After 15% commission
            </p>
          </Card>

          <Card variant="glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Average per Ride</p>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(averagePerRide)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {filteredRides.length} rides
            </p>
          </Card>

          <Card variant="glass">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Tips & Bonuses</p>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {formatCurrency(totalTips + surgeBonuses)}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Extra income
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart - Weekly Earnings */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                  Weekly Earnings
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>Last 7 days</span>
                </div>
              </div>

              {/* Simple Bar Chart */}
              <div className="space-y-3">
                {last7Days.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-12">
                        {day.date}
                      </span>
                      <div className="flex-1 relative">
                        <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(day.earnings / maxEarnings) * 100}%` }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="h-full bg-gradient-to-r from-primary-600 to-purple-600 flex items-center justify-end px-3"
                          >
                            {day.earnings > 0 && (
                              <span className="text-white text-sm font-semibold">
                                {formatCurrency(day.earnings)}
                              </span>
                            )}
                          </motion.div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-16 text-right">
                        {day.rides} rides
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Earnings Breakdown */}
            <Card variant="glass">
              <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">
                Earnings Breakdown
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Ride Fares</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Base earnings from rides
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalEarnings)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Tips</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        From passengers
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(totalTips)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Surge Bonuses</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Peak hour earnings
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatCurrency(surgeBonuses)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Platform Fee</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">15% commission</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    -{formatCurrency(platformFee)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-lg border-2 border-primary-500/20">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Net Earnings</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total after deductions
                    </p>
                  </div>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatCurrency(netEarnings + totalTips + surgeBonuses)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar - Performance & Goals */}
          <div className="space-y-6">
            {/* Performance Score */}
            <Card variant="gradient">
              <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white dark:bg-gray-800 mb-3">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-600">92</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Score</p>
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                  Excellent Performance!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Keep up the great work
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Acceptance Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">94%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">98%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Customer Rating</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ⭐ {driver.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Weekly Goal */}
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Weekly Goal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(15000)} target
                  </p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {Math.round((netEarnings / 15000) * 100)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((netEarnings / 15000) * 100, 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-primary-600 to-purple-600"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {formatCurrency(Math.max(15000 - netEarnings, 0))} to go
              </p>
            </Card>

            {/* Peak Hours */}
            <Card variant="glass">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">Peak Hours</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Maximize your earnings
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    8:00 - 10:00 AM
                  </span>
                  <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                    1.5x
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded-lg">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    5:00 - 8:00 PM
                  </span>
                  <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded-full">
                    2.0x
                  </span>
                </div>
              </div>
            </Card>

            {/* Payout Info */}
            <Card variant="glass">
              <h3 className="font-bold mb-3 text-gray-900 dark:text-white">Next Payout</h3>
              <div className="text-center py-4 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-lg mb-3">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {formatCurrency(netEarnings * 0.85)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Scheduled for Friday
                </p>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setShowPayoutHistory(true)}>
                View Payout History
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Payout History Modal */}
      <AnimatePresence>
        {showPayoutHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPayoutHistory(false)}>
            <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Payout History
                </h3>
                <button
                  onClick={() => setShowPayoutHistory(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-3">
                {payoutHistory.map((payout, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{payout.date}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payout.rides} rides • {payout.status}
                        {payout.paidDate && ` • Paid on ${payout.paidDate}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(payout.earnings)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          payout.status === 'Paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowPayoutHistory(false)}>Close</Button>
              </div>
            </Card>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Earnings;
