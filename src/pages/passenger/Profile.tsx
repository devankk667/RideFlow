import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Bell,
  Moon,
  Globe,
  Lock,
  Camera,
  Save,
  Edit2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore, usePassenger } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { formatDate } from '../../utils/helpers';

const Profile: React.FC = () => {
  const passenger = usePassenger();
  const { updateProfile } = useAuthStore();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(passenger?.name || '');
  const [email, setEmail] = useState(passenger?.email || '');
  const [phone, setPhone] = useState(passenger?.phone || '');
  const [address, setAddress] = useState('');

  // Settings
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('english');

  const handleSaveProfile = () => {
    if (!name || !email || !phone) {
      toast.error('Missing Information', 'Please fill all required fields');
      return;
    }

    updateProfile({
      name,
      email,
      phone,
    });

    toast.success('Profile Updated', 'Your profile has been updated successfully');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setName(passenger?.name || '');
    setEmail(passenger?.email || '');
    setPhone(passenger?.phone || '');
    setAddress('');
    setIsEditing(false);
  };

  if (!passenger) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account settings
              </p>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Avatar and Stats */}
          <div className="space-y-6">
            <Card variant="gradient">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <img
                    src={passenger.avatar}
                    alt={passenger.name}
                    className="h-24 w-24 rounded-full border-4 border-white dark:border-gray-800"
                  />
                  <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-1">
                  {passenger.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {passenger.email}
                </p>
                <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">Verified User</span>
                </div>
              </div>
            </Card>

            <Card variant="glass">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Rides</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {passenger.totalRides || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ⭐ {(passenger.rating || 0).toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Date(passenger.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Profile Form and Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card variant="glass">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      disabled={!isEditing}
                      rows={3}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* App Settings */}
            <Card variant="glass">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                App Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Push Notifications
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Receive ride updates
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <Moon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Use dark theme
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Language</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Choose your language
                      </p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी</option>
                    <option value="bengali">বাংলা</option>
                    <option value="tamil">தமிழ்</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Security */}
            <Card variant="glass">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                Security
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-3" />
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-3" />
                  Two-Factor Authentication
                </Button>
              </div>
            </Card>

            {/* Danger Zone */}
            <Card variant="glass" className="border-2 border-red-500/20">
              <h3 className="font-bold text-lg mb-4 text-red-600 dark:text-red-400">
                Danger Zone
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/10">
                  Deactivate Account
                </Button>
                <Button variant="danger" className="w-full justify-start">
                  Delete Account Permanently
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Once you delete your account, there is no going back. Please be certain.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
