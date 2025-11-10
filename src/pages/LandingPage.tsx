import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Shield,
  Clock,
  DollarSign,
  Star,
  MapPin,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Quick Booking',
      description: 'Book your ride in seconds with our streamlined interface',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Safe & Secure',
      description: 'Verified drivers, live tracking, and 24/7 support',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: 'Best Prices',
      description: 'Transparent pricing with no hidden charges',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Always Available',
      description: 'Ride anytime, anywhere, 24/7 service',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const vehicleTypes = [
    { name: 'Bike', icon: '🏍️', desc: 'Quick & Economic', price: '₹8/km' },
    { name: 'Auto', icon: '🛺', desc: 'Local Travel', price: '₹12/km' },
    { name: 'Car', icon: '🚗', desc: 'Comfortable', price: '₹15/km' },
    { name: 'SUV', icon: '🚙', desc: 'Spacious', price: '₹20/km' },
    { name: 'Luxury', icon: '🚘', desc: 'Premium', price: '₹30/km' },
  ];

  const stats = [
    { value: '1M+', label: 'Happy Riders', icon: <Users /> },
    { value: '50K+', label: 'Active Drivers', icon: <Car /> },
    { value: '4.8★', label: 'Average Rating', icon: <Star /> },
    { value: '100+', label: 'Cities', icon: <MapPin /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="glass-strong sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <Car className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold gradient-text">RideFlow</span>
            </motion.div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/signup')}>Get Started</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Your Ride,
              <br />
              <span className="gradient-text">Your Way</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Experience seamless ridesharing with real-time tracking, verified drivers,
              and unbeatable prices. Your journey starts here.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate('/signup')}
                rightIcon={<ArrowRight />}
              >
                Book Your First Ride
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-12">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-center"
                >
                  <div className="text-primary-600 mb-2 flex justify-center">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image / Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              <Card variant="glass" className="p-8">
                <div className="text-6xl mb-4 text-center">🚗</div>
                <h3 className="text-2xl font-bold text-center mb-4">
                  Book in 3 Easy Steps
                </h3>
                <div className="space-y-4">
                  {['Choose your destination', 'Select vehicle type', 'Enjoy your ride'].map(
                    (step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-600 to-purple-600 flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <span className="text-gray-700 dark:text-gray-300">{step}</span>
                      </motion.div>
                    )
                  )}
                </div>
              </Card>
            </div>
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-purple-400/20 blur-3xl -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose RideFlow?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Experience the future of transportation
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" hover className="h-full">
                <div
                  className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-4`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vehicle Types */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Choose Your Ride</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            From budget to premium, we've got you covered
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {vehicleTypes.map((vehicle, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="glass" hover className="text-center">
                <div className="text-5xl mb-3">{vehicle.icon}</div>
                <h3 className="font-bold text-lg mb-1">{vehicle.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {vehicle.desc}
                </p>
                <div className="text-primary-600 font-bold">{vehicle.price}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card variant="gradient" className="text-center p-12">
            <TrendingUp className="h-16 w-16 mx-auto mb-6 text-primary-600" />
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join millions of happy riders and experience the future of transportation.
              Sign up now and get your first ride free!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" onClick={() => navigate('/signup')}>
                Sign Up as Passenger
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/signup')}>
                Become a Driver
              </Button>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="glass-strong border-t border-white/20 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© 2024 RideFlow. All rights reserved. Built with ❤️ for seamless travel.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
