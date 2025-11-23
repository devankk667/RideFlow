import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Car, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'passenger' | 'driver'>('passenger');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNo: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone Number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (role === 'driver' && !formData.licenseNo) newErrors.licenseNo = 'License Number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const userData = {
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      userType: role,
      ...(role === 'driver' && { licenseNo: formData.licenseNo }),
    };

    const success = await register(userData);

    if (success) {
      toast.success('Account created!', 'Welcome to RideFlow');
      if (role === 'passenger') navigate('/passenger/dashboard');
      else navigate('/driver/dashboard');
    } else {
      toast.error('Registration Failed', 'Please try again');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Car className="h-12 w-12 text-white" />
            <span className="text-4xl font-bold text-white">RideFlow</span>
          </div>
          <p className="text-white/80 text-lg">Create your account</p>
        </motion.div>

        <Card variant="glass" className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95">
          {/* Role Selection */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setRole('passenger')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${role === 'passenger'
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              Passenger
            </button>
            <button
              onClick={() => setRole('driver')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${role === 'driver'
                  ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              Driver
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              leftIcon={<User className="h-5 w-5" />}
            />

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
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                setErrors({ ...errors, phone: '' });
              }}
              error={errors.phone}
              leftIcon={<Phone className="h-5 w-5" />}
            />

            {role === 'driver' && (
              <Input
                label="License Number"
                type="text"
                placeholder="DL-1234567890123"
                value={formData.licenseNo}
                onChange={(e) => {
                  setFormData({ ...formData, licenseNo: e.target.value });
                  setErrors({ ...errors, licenseNo: '' });
                }}
                error={errors.licenseNo}
                leftIcon={<FileText className="h-5 w-5" />}
              />
            )}

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
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-5 w-5" />}
            />

            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </div>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link to="/" className="text-white/80 hover:text-white text-sm transition-colors">
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
