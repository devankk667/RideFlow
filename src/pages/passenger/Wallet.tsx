import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet as WalletIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Filter,
  Download,
  TrendingUp,
  Gift,
  X,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { usePassenger } from '../../stores/authStore';
import { useRideStore } from '../../stores/rideStore';
import { useToast } from '../../stores/toastStore';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Transaction } from '../../types';
import { transactions as mockTransactions } from '../../data/mockData';

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000];

const Wallet: React.FC = () => {
  const passenger = usePassenger();
  const { rides } = useRideStore();
  const toast = useToast();
  
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [walletBalance, setWalletBalance] = useState(passenger?.walletBalance || 0);

  // Helper functions to determine transaction direction
  const isCreditTransaction = (type: string) => {
    return type === 'wallet_recharge' || type === 'refund';
  };

  const isDebitTransaction = (type: string) => {
    return type === 'ride' || type === 'withdrawal';
  };

  // Get passenger transactions
  const passengerTransactions = mockTransactions.filter(
    (t) => t.userId === passenger?.id
  );

  // Filter transactions
  const filteredTransactions = passengerTransactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'credit') return isCreditTransaction(t.type);
    if (filterType === 'debit') return isDebitTransaction(t.type);
    return true;
  });

  // Calculate stats
  const totalSpent = passengerTransactions
    .filter((t) => isDebitTransaction(t.type))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalAdded = passengerTransactions
    .filter((t) => isCreditTransaction(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthSpent = passengerTransactions
    .filter((t) => {
      const txDate = new Date(t.createdAt);
      const now = new Date();
      return (
        isDebitTransaction(t.type) &&
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const handleRecharge = () => {
    const amount = parseFloat(rechargeAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      toast.error('Minimum Amount', 'Minimum recharge amount is ₹50');
      return;
    }

    if (amount > 50000) {
      toast.error('Maximum Amount', 'Maximum recharge amount is ₹50,000');
      return;
    }

    // Simulate payment processing
    toast.info('Processing Payment', 'Please wait...');
    
    setTimeout(() => {
      setWalletBalance(walletBalance + amount);
      toast.success(
        'Recharge Successful!',
        `${formatCurrency(amount)} added to your wallet`
      );
      setRechargeAmount('');
      setShowRechargeModal(false);
    }, 2000);
  };

  const getTransactionIcon = (type: string) => {
    return isCreditTransaction(type) ? ArrowDownLeft : ArrowUpRight;
  };

  const getTransactionColor = (type: string) => {
    return isCreditTransaction(type)
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="glass-strong border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your wallet balance
              </p>
            </div>
            <Button onClick={() => setShowRechargeModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Money
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Balance Card */}
          <Card variant="gradient" className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Available Balance
                </p>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(walletBalance)}
                </h2>
              </div>
              <div className="h-16 w-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                <WalletIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(thisMonthSpent)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Added</p>
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(totalAdded)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {formatCurrency(totalSpent)}
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card variant="glass">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setShowRechargeModal(true)}
              >
                <Plus className="h-4 w-4 mr-3" />
                Add Money
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Gift className="h-4 w-4 mr-3" />
                Apply Promo
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-3" />
                Download Statement
              </Button>
            </div>
          </Card>
        </div>

        {/* Transaction History */}
        <Card variant="glass">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
              Transaction History
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
              </select>
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💸</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                No Transactions Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type);
                const colorClass = getTransactionColor(transaction.type);

                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          isCreditTransaction(transaction.type)
                            ? 'bg-green-500/10'
                            : 'bg-red-500/10'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${colorClass}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              transaction.status === 'completed'
                                ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                                : 'bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {transaction.status}
                          </span>
                          {transaction.paymentMethod && (
                            <span className="text-xs text-gray-500">
                              {transaction.paymentMethod}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${colorClass}`}>
                        {isCreditTransaction(transaction.type) ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      {isDebitTransaction(transaction.type) && transaction.rideId && (
                        <p className="text-xs text-gray-500">
                          Ride #{transaction.rideId.slice(-8)}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Offers Card */}
        <Card variant="glass" className="mt-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                Get Extra Cashback!
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add ₹1000 or more and get 10% cashback. Valid until end of month.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Add Money to Wallet
                  </h3>
                  <button
                    onClick={() => setShowRechargeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Enter Amount
                  </label>
                  <Input
                    type="number"
                    value={rechargeAmount}
                    onChange={(e) => setRechargeAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="50"
                    max="50000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum: ₹50 | Maximum: ₹50,000
                  </p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">
                    Quick Add
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {QUICK_AMOUNTS.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setRechargeAmount(amount.toString())}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          rechargeAmount === amount.toString()
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{amount}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {parseFloat(rechargeAmount) >= 1000 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                      🎉 You'll get{' '}
                      {formatCurrency(parseFloat(rechargeAmount) * 0.1)} cashback!
                    </p>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowRechargeModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleRecharge} className="flex-1">
                    Add {rechargeAmount ? formatCurrency(parseFloat(rechargeAmount)) : 'Money'}
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

export default Wallet;
