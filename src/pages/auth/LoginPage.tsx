import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Car, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const demoAccounts = [
    { role: 'passenger', email: 'passenger@demo.com', password: 'password123' },
    { role: 'driver', email: 'driver@demo.com', password: 'password123' },
    { role: 'admin', email: 'admin@rideflow.com', password: 'admin123' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = login(formData.email, formData.password);

    if (success) {
      toast.success('Welcome back!', 'Logged in successfully');
      const user = useAuthStore.getState().user;
      
      // Redirect based on role
      if (user?.role === 'passenger') {
        navigate('/passenger/dashboard');
      } else if (user?.role === 'driver') {
        navigate('/driver/dashboard');
      } else if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } else {
      toast.error('Login Failed', 'Invalid email or password');
      setErrors({ email: 'Invalid credentials', password: 'Invalid credentials' });
    }
  };

  const handleDemoLogin = (account: typeof demoAccounts[0]) => {
    setFormData({ email: account.email, password: account.password });
    setTimeout(() => {
      const success = login(account.email, account.password);
      if (success) {
        toast.success(`Welcome ${account.role}!`, 'Logged in with demo account');
        const user = useAuthStore.getState().user;
        if (user?.role === 'passenger') navigate('/passenger/dashboard');
        else if (user?.role === 'driver') navigate('/driver/dashboard');
        else if (user?.role === 'admin') navigate('/admin/dashboard');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Car className="h-12 w-12 text-white" />
            <span className="text-4xl font-bold text-white">RideFlow</span>
          </div>
          <p className="text-white/80 text-lg">Sign in to your account</p>
        </motion.div>

        <Card variant="glass" className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              leftIcon={<Mail className="h-5 w-5" />}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              leftIcon={<Lock className="h-5 w-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
            />

            <Button type="submit" className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign up
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
              Quick Demo Login:
            </p>
            <div className="space-y-2">
              {demoAccounts.map((account) => (
                <Button
                  key={account.role}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDemoLogin(account)}
                >
                  Login as {account.role.charAt(0).toUpperCase() + account.role.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-white/80 hover:text-white text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
