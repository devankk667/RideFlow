import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  Tag,
  Plus,
  Check,
  Clock,
  AlertCircle,
  Copy,
  CheckCircle,
  Percent,
  DollarSign,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePassenger } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { promoCodes } from '../../data/mockData';

const PromoCodes: React.FC = () => {
  const passenger = usePassenger();
  const toast = useToast();
  
  const [applyCode, setApplyCode] = useState('');
  const [appliedCodes, setAppliedCodes] = useState<string[]>([]);

  // Filter available promo codes
  const availablePromos = promoCodes.filter((promo) => {
    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);
    return (
      promo.isActive &&
      now >= validFrom &&
      now <= validUntil &&
      promo.usedCount < promo.usageLimit
    );
  });

  const expiredPromos = promoCodes.filter((promo) => {
    const now = new Date();
    const validUntil = new Date(promo.validUntil);
    return now > validUntil || !promo.isActive;
  });

  const handleApplyCode = () => {
    const code = applyCode.trim().toUpperCase();
    
    if (!code) {
      toast.error('Enter Code', 'Please enter a promo code');
      return;
    }

    const promo = promoCodes.find((p) => p.code === code);
    
    if (!promo) {
      toast.error('Invalid Code', 'This promo code does not exist');
      return;
    }

    if (appliedCodes.includes(code)) {
      toast.error('Already Applied', 'You have already applied this code');
      return;
    }

    const now = new Date();
    const validFrom = new Date(promo.validFrom);
    const validUntil = new Date(promo.validUntil);

    if (now < validFrom) {
      toast.error('Not Yet Valid', 'This promo code is not yet active');
      return;
    }

    if (now > validUntil) {
      toast.error('Expired', 'This promo code has expired');
      return;
    }

    if (!promo.isActive) {
      toast.error('Inactive', 'This promo code is no longer active');
      return;
    }

    if (promo.usedCount >= promo.usageLimit) {
      toast.error('Limit Reached', 'This promo code has reached its usage limit');
      return;
    }

    // Success
    setAppliedCodes([...appliedCodes, code]);
    setApplyCode('');
    toast.success(
      'Promo Applied!',
      `${promo.discountType === 'percentage' ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)} discount added`
    );
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!', 'Promo code copied to clipboard');
  };

  const getDiscountDisplay = (promo: typeof promoCodes[0]) => {
    if (promo.discountType === 'percentage') {
      return `${promo.discountValue}% OFF`;
    } else {
      return `${formatCurrency(promo.discountValue)} OFF`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promo Codes</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {availablePromos.length} active offers available
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Apply Code Section */}
        <Card variant="gradient" className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="h-5 w-5 text-primary-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Have a Promo Code?</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your promo code to get instant discounts
          </p>
          <div className="flex gap-3">
            <Input
              value={applyCode}
              onChange={(e) => setApplyCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., FIRST50)"
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
            />
            <Button onClick={handleApplyCode}>
              <Plus className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </Card>

        {/* Applied Codes */}
        {appliedCodes.length > 0 && (
          <Card variant="glass" className="mb-6">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Applied Codes
            </h3>
            <div className="space-y-2">
              {appliedCodes.map((code) => {
                const promo = promoCodes.find((p) => p.code === code);
                return promo ? (
                  <div
                    key={code}
                    className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{promo.code}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {promo.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {getDiscountDisplay(promo)}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </Card>
        )}

        {/* Available Promo Codes */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
            Available Offers
          </h3>
          {availablePromos.length === 0 ? (
            <Card variant="glass" className="text-center py-12">
              <div className="text-6xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Active Offers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for exciting promo codes
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availablePromos.map((promo) => {
                const isApplied = appliedCodes.includes(promo.code);
                const daysLeft = Math.ceil(
                  (new Date(promo.validUntil).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <motion.div
                    key={promo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card variant={isApplied ? 'gradient' : 'glass'}>
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Left: Discount Badge */}
                        <div className="flex-shrink-0">
                          <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-primary-500 to-purple-500 flex flex-col items-center justify-center">
                            {promo.discountType === 'percentage' ? (
                              <>
                                <Percent className="h-6 w-6 text-white mb-1" />
                                <span className="text-2xl font-bold text-white">
                                  {promo.discountValue}
                                </span>
                                <span className="text-xs text-white/80">OFF</span>
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-6 w-6 text-white mb-1" />
                                <span className="text-2xl font-bold text-white">
                                  {promo.discountValue}
                                </span>
                                <span className="text-xs text-white/80">OFF</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Middle: Details */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                                {promo.description}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {promo.minRideAmount && promo.minRideAmount > 0
                                  ? `Min. ride amount: ${formatCurrency(promo.minRideAmount)}`
                                  : 'No minimum amount'}
                              </p>
                            </div>
                            {isApplied && (
                              <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Applied
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <AlertCircle className="h-4 w-4" />
                              <span>
                                {promo.usageLimit - promo.usedCount} uses left
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Promo Code
                              </p>
                              <p className="font-bold text-lg text-gray-900 dark:text-white tracking-wider">
                                {promo.code}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyCode(promo.code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expired Codes */}
        {expiredPromos.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              Expired Offers
            </h3>
            <div className="grid gap-4">
              {expiredPromos.slice(0, 3).map((promo) => (
                <Card key={promo.id} variant="glass" className="opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {promo.description}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Code: {promo.code}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Expired on {formatDate(promo.validUntil)}
                        </p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-400">
                      {getDiscountDisplay(promo)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Info Card */}
        <Card variant="glass" className="mt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Gift className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                How to Use Promo Codes?
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Copy or enter the promo code at checkout</li>
                <li>• Discount will be automatically applied to eligible rides</li>
                <li>• Each code can be used only once per user</li>
                <li>• Codes cannot be combined with other offers</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PromoCodes;
