import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Plus,
  Trash2,
  Check,
  X,
  Building,
  Smartphone,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePassenger } from '../../stores/authStore';
import { useToast } from '../../stores/toastStore';
import { PaymentMethod } from '../../types';

const PaymentMethods: React.FC = () => {
  const passenger = usePassenger();
  const toast = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'wallet'>('card');
  
  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    passenger?.paymentMethods || []
  );

  const handleAddPaymentMethod = () => {
    if (paymentType === 'card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast.error('Missing Information', 'Please fill all card details');
        return;
      }

      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'card',
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName: cardName,
        expiryDate,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success('Card Added', 'Your card has been added successfully');
    } else if (paymentType === 'upi') {
      if (!upiId) {
        toast.error('Missing Information', 'Please enter your UPI ID');
        return;
      }

      const newMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        type: 'upi',
        upiId,
        isDefault: paymentMethods.length === 0,
      };

      setPaymentMethods([...paymentMethods, newMethod]);
      toast.success('UPI Added', 'Your UPI ID has been added successfully');
    }

    // Reset form
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setUpiId('');
    setShowAddModal(false);
  };

  const handleDeleteMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
    toast.success('Payment Method Removed', 'The payment method has been deleted');
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((m) => ({
        ...m,
        isDefault: m.id === id,
      }))
    );
    toast.success('Default Updated', 'Default payment method has been updated');
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted;
  };

  const maskCardNumber = (number: string) => {
    return `**** **** **** ${number.slice(-4)}`;
  };

  const getCardBrand = (number: string) => {
    const firstDigit = number[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    return 'Card';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Payment Methods
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your cards and UPI
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {paymentMethods.length === 0 ? (
          <Card variant="glass" className="text-center py-12">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              No Payment Methods
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add your first payment method to start booking rides
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card variant={method.isDefault ? 'gradient' : 'glass'}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
                        {method.type === 'card' ? (
                          <CreditCard className="h-6 w-6 text-white" />
                        ) : method.type === 'upi' ? (
                          <Smartphone className="h-6 w-6 text-white" />
                        ) : (
                          <WalletIcon className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        {method.type === 'card' && (
                          <>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">
                                {getCardBrand(method.cardNumber!)} {method.type.toUpperCase()}
                              </h3>
                              {method.isDefault && (
                                <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {maskCardNumber(method.cardNumber!)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Expires {method.expiryDate}
                            </p>
                          </>
                        )}
                        {method.type === 'upi' && (
                          <>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">UPI</h3>
                              {method.isDefault && (
                                <span className="px-2 py-0.5 text-xs bg-green-500 text-white rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {method.upiId}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(method.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Set Default
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card variant="glass" className="mt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
              <Building className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Secure Payments
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your payment information is encrypted and secure. We never store your CVV or
                sensitive card details.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Payment Method Modal */}
      <AnimatePresence>
        {showAddModal && (
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
                    Add Payment Method
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Payment Type Selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentType('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentType === 'card'
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-900 dark:text-white" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      Card
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentType('upi')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentType === 'upi'
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Smartphone className="h-6 w-6 mx-auto mb-2 text-gray-900 dark:text-white" />
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">UPI</p>
                  </button>
                </div>

                {/* Card Form */}
                {paymentType === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Card Number
                      </label>
                      <Input
                        type="text"
                        value={formatCardNumber(cardNumber)}
                        onChange={(e) =>
                          setCardNumber(e.target.value.replace(/\s/g, '').slice(0, 16))
                        }
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                        Cardholder Name
                      </label>
                      <Input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                          Expiry Date
                        </label>
                        <Input
                          type="text"
                          value={expiryDate}
                          onChange={(e) => {
                            let value = e.target.value.replace(/\D/g, '');
                            if (value.length >= 2) {
                              value = value.slice(0, 2) + '/' + value.slice(2, 4);
                            }
                            setExpiryDate(value);
                          }}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                          CVV
                        </label>
                        <Input
                          type="password"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.slice(0, 4))}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* UPI Form */}
                {paymentType === 'upi' && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      UPI ID
                    </label>
                    <Input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter your UPI ID (e.g., yourname@paytm, yourname@gpay)
                    </p>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod} className="flex-1">
                    Add Payment Method
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

export default PaymentMethods;
