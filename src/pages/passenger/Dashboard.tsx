import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Car,
  Clock,
  TrendingUp,
  CreditCard,
  Gift,
  User as UserIcon,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore, usePassenger } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { formatCurrency, formatDateTime } from '../../utils/helpers';

const PassengerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const passenger = usePassenger();
  const { rides } = useRideStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  if (!passenger) {
    navigate('/login');
    return null;
  }

  const userRides = rides.filter((r) => r.passengerId === passenger.id);
  const completedRides = userRides.filter((r) => r.status === 'completed');
  const activeRide = userRides.find(
    (r) => r.status === 'in_progress' || r.status === 'driver_arriving' || r.status === 'accepted'
  );

  const stats = [
    {
      label: 'Total Rides',
      value: completedRides.length,
      icon: <Car className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(passenger.walletBalance),
      icon: <CreditCard className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Your Rating',
      value: `${passenger.rating.toFixed(1)} ★`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      label: 'Active Promos',
      value: '3',
      icon: <Gift className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const menuItems = [
    { icon: <Car />, label: 'Dashboard', path: '/passenger/dashboard' },
    { icon: <MapPin />, label: 'Book Ride', path: '/passenger/book-ride' },
    { icon: <Clock />, label: 'Ride History', path: '/passenger/rides' },
    { icon: <CreditCard />, label: 'Payments', path: '/passenger/payments' },
    { icon: <CreditCard />, label: 'Wallet', path: '/passenger/wallet' },
    { icon: <Gift />, label: 'Promo Codes', path: '/passenger/promos' },
    { icon: <UserIcon />, label: 'Profile', path: '/passenger/profile' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 glass-strong border-r border-white/20 z-50 transform transition-transform duration-300 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Car className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold gradient-text">RideFlow</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-2">
              <img
                src={passenger.avatar}
                alt={passenger.name}
                className="h-12 w-12 rounded-full border-2 border-primary-500"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {passenger.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Passenger</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Rating</span>
              <span className="font-semibold text-yellow-600">
                {passenger.rating.toFixed(1)} ★
              </span>
            </div>
          </div>

          {/* Menu */}
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                whileHover={{ x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.path === '/passenger/dashboard'
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-6 left-6 right-6">
            <Button
              variant="outline"
              className="w-full"
              leftIcon={<LogOut />}
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Header */}
        <header className="glass-strong border-b border-white/20 sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden text-gray-700 dark:text-gray-300"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {passenger.name.split(' ')[0]}!
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDateTime(new Date())}
                </p>
              </div>
            </div>

            <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          {/* Active Ride Alert */}
          {activeRide && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card variant="gradient" className="border-2 border-primary-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      You have an active ride!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Track your ride in real-time
                    </p>
                  </div>
                  <Button onClick={() => navigate('/passenger/active-ride')}>
                    Track Ride
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  variant="glass"
                  className="cursor-pointer"
                  onClick={() => navigate('/passenger/book-ride')}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 text-white">
                      <MapPin className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        Book a Ride
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Quick booking in seconds
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card
                  variant="glass"
                  className="cursor-pointer"
                  onClick={() => navigate('/passenger/wallet')}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                      <CreditCard className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        Wallet: {formatCurrency(passenger.walletBalance)}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add money or view transactions
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Stats
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="glass">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                      >
                        {stat.icon}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {stat.label}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Rides */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Recent Rides
              </h2>
              <Button variant="ghost" onClick={() => navigate('/passenger/rides')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {completedRides.slice(0, 3).map((ride) => (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card variant="glass">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {ride.pickup.address.split(',')[0]} →{' '}
                          {ride.destination.address.split(',')[0]}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(ride.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatCurrency(ride.fare)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {ride.distance.toFixed(1)} km
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {completedRides.length === 0 && (
                <Card variant="glass" className="text-center py-12">
                  <Car className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No rides yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Book your first ride to get started!
                  </p>
                  <Button onClick={() => navigate('/passenger/book-ride')}>
                    Book Now
                  </Button>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PassengerDashboard;
