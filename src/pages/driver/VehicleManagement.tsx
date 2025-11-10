import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle } from '../../types';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  FileText,
  Calendar,
  Shield,
  Wrench,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useDriver } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { getVehicleIcon, formatDate } from '../../utils/helpers';
import { vehiclesData } from '../../data/mockData';
import { VehicleType } from '../../types';

const VehicleManagement: React.FC = () => {
  const driver = useDriver();
  const toast = useToast();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  
  // Form states
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  // Get driver vehicles
  const [driverVehicles, setDriverVehicles] = useState(
    vehiclesData.filter((v) => v.driverId === driver?.id)
  );

  const VEHICLE_TYPES = [
    { value: 'car', label: 'Car', icon: '🚗' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'luxury', label: 'Luxury', icon: '🏎️' },
    { value: 'bike', label: 'Bike', icon: '🏍️' },
    { value: 'auto', label: 'Auto', icon: '🛺' },
  ];

  const POPULAR_MAKES = [
    'Maruti Suzuki',
    'Hyundai',
    'Tata',
    'Honda',
    'Mahindra',
    'Toyota',
    'Kia',
    'Royal Enfield',
    'Hero',
    'Bajaj',
  ];

  const handleAddVehicle = () => {
    if (!make || !model || !year || !color || !plateNumber) {
      toast.error('Missing Information', 'Please fill all required fields');
      return;
    }

    const newVehicle: Vehicle = {
      id: `vehicle_${Date.now()}`,
      driverId: driver?.id || '',
      type: vehicleType,
      make,
      model,
      year: parseInt(year),
      color,
      plateNumber,
      capacity: vehicleType === 'bike' ? 1 : vehicleType === 'auto' ? 3 : 4,
      features: ['AC', 'Music System'],
      insuranceExpiry: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      insuranceNumber: `INS-${Date.now()}`,
      isActive: true,
      registrationNumber,
      registrationExpiry: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toISOString(),
      lastServiceDate: new Date().toISOString(),
    };

    setDriverVehicles([...driverVehicles, newVehicle]);
    toast.success('Vehicle Added!', 'Your vehicle has been added successfully');
    resetForm();
    setShowAddModal(false);
  };

  const handleDeleteVehicle = (id: string) => {
    setDriverVehicles(driverVehicles.filter((v) => v.id !== id));
    toast.success('Vehicle Removed', 'The vehicle has been deleted');
  };

  const resetForm = () => {
    setVehicleType('car');
    setMake('');
    setModel('');
    setYear('');
    setColor('');
    setPlateNumber('');
    setRegistrationNumber('');
  };

  if (!driver) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Vehicles
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {driverVehicles.length} vehicle{driverVehicles.length !== 1 ? 's' : ''} registered
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Vehicle
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {driverVehicles.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="text-6xl mb-4">🚗</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              No Vehicles Registered
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first vehicle to start accepting rides
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Vehicle
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {driverVehicles.map((vehicle) => {
              const isExpiringSoon = (dateStr: string) => {
                const date = new Date(dateStr);
                const daysLeft = Math.ceil(
                  (date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return daysLeft < 30;
              };

              const regExpiring = vehicle.registrationExpiry && isExpiringSoon(vehicle.registrationExpiry);
              const insExpiring = vehicle.insuranceExpiry && isExpiringSoon(vehicle.insuranceExpiry);

              return (
                <motion.div
                  key={vehicle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card variant="glass">
                    {/* Header with Vehicle Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-6xl">{getVehicleIcon(vehicle.type)}</div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                            {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {vehicle.year} • {vehicle.color}
                          </p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/10 text-primary-700 dark:text-primary-300 rounded-full text-xs font-semibold">
                            {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingVehicle(vehicle.id)}
                          className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Plate Number
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {vehicle.plateNumber}
                        </span>
                      </div>

                      {vehicle.registrationNumber && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Registration
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {vehicle.registrationNumber}
                          </span>
                        </div>
                      )}

                      {/* Registration Expiry */}
                      {vehicle.registrationExpiry && (
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            regExpiring
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar
                              className={`h-4 w-4 ${
                                regExpiring
                                  ? 'text-red-600'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                regExpiring
                                  ? 'text-red-600'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              Reg. Expiry
                            </span>
                          </div>
                          <span
                            className={`font-semibold ${
                              regExpiring
                                ? 'text-red-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {formatDate(vehicle.registrationExpiry)}
                          </span>
                        </div>
                      )}

                      {/* Insurance Expiry */}
                      {vehicle.insuranceExpiry && (
                        <div
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            insExpiring
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                              : 'bg-gray-50 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Shield
                              className={`h-4 w-4 ${
                                insExpiring
                                  ? 'text-red-600'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                insExpiring
                                  ? 'text-red-600'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}
                            >
                              Insurance Expiry
                            </span>
                          </div>
                          <span
                            className={`font-semibold ${
                              insExpiring
                                ? 'text-red-600'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {formatDate(vehicle.insuranceExpiry)}
                          </span>
                        </div>
                      )}

                      {/* Last Service */}
                      {vehicle.lastServiceDate && (
                        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Last Service
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {formatDate(vehicle.lastServiceDate)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expiry Warnings */}
                    {(regExpiring || insExpiring) && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
                              Action Required
                            </p>
                            <p className="text-xs text-yellow-700 dark:text-yellow-500">
                              {regExpiring && insExpiring
                                ? 'Registration and insurance expiring soon'
                                : regExpiring
                                ? 'Registration expiring soon'
                                : 'Insurance expiring soon'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Card */}
        <Card variant="glass" className="mt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Keep Your Documents Updated
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Ensure registration and insurance are always valid</li>
                <li>• Regular vehicle maintenance improves passenger ratings</li>
                <li>• You can manage multiple vehicles from this page</li>
                <li>• Expired documents will prevent you from accepting rides</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
                    Add New Vehicle
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      Vehicle Type
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {VEHICLE_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setVehicleType(type.value as VehicleType)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            vehicleType === type.value
                              ? 'border-primary-500 bg-primary-500/10'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="text-3xl mb-1">{type.icon}</div>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">
                            {type.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Make */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Make
                      </label>
                      <select
                        value={make}
                        onChange={(e) => setMake(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Select make</option>
                        {POPULAR_MAKES.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Model
                      </label>
                      <Input
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g., Swift, City, Activa"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Year */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Year
                      </label>
                      <Input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="2020"
                        min="2000"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>

                    {/* Color */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Color
                      </label>
                      <Input
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="e.g., White, Black, Silver"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Plate Number */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Plate Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                        placeholder="DL01AB1234"
                      />
                    </div>

                    {/* Registration Number */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Registration Number
                      </label>
                      <Input
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddVehicle} className="flex-1">
                    <Check className="h-4 w-4 mr-2" />
                    Add Vehicle
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

export default VehicleManagement;
