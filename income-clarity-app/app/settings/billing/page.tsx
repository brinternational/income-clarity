'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
  downloadUrl: string;
  period: {
    start: string;
    end: string;
  };
}

interface SubscriptionDetails {
  plan: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  priceId: string;
  interval: 'month' | 'year';
  amount: number;
}

// Mock data - replace with actual API calls
const mockSubscription: SubscriptionDetails = {
  plan: 'PREMIUM',
  status: 'active',
  currentPeriodStart: '2024-01-15',
  currentPeriodEnd: '2024-02-15',
  cancelAtPeriodEnd: false,
  priceId: 'price_premium_monthly',
  interval: 'month',
  amount: 999
};

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    expiryMonth: 12,
    expiryYear: 2025,
    isDefault: true
  },
  {
    id: 'pm_2',
    type: 'paypal',
    email: 'user@example.com',
    isDefault: false
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'inv_1',
    amount: 999,
    status: 'paid',
    date: '2024-01-15',
    downloadUrl: '#',
    period: {
      start: '2024-01-15',
      end: '2024-02-15'
    }
  },
  {
    id: 'inv_2',
    amount: 999,
    status: 'paid',
    date: '2023-12-15',
    downloadUrl: '#',
    period: {
      start: '2023-12-15',
      end: '2024-01-15'
    }
  }
];

export default function BillingPage() {
  const { user } = useUser();
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(mockSubscription);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleDowngrade = () => {
    setShowCancelConfirm(true);
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      // TODO: API call to cancel subscription
      console.log('Canceling subscription...');
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: true } : null);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      // TODO: API call to reactivate subscription
      console.log('Reactivating subscription...');
      setSubscription(prev => prev ? { ...prev, cancelAtPeriodEnd: false } : null);
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // TODO: Open Stripe payment method setup
    console.log('Adding payment method...');
  };

  const handleRemovePaymentMethod = async (methodId: string) => {
    setLoading(true);
    try {
      // TODO: API call to remove payment method
      console.log('Removing payment method:', methodId);
      setPaymentMethods(prev => prev.filter(pm => pm.id !== methodId));
    } catch (error) {
      console.error('Failed to remove payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    setLoading(true);
    try {
      // TODO: API call to set default payment method
      console.log('Setting default payment method:', methodId);
      setPaymentMethods(prev => 
        prev.map(pm => ({ ...pm, isDefault: pm.id === methodId }))
      );
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      incomplete: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    };
    
    return badges[status as keyof typeof badges] || badges.incomplete;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Billing & Subscription
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Current Plan
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    subscription ? getStatusBadge(subscription.status) : ''
                  }`}>
                    {subscription?.status || 'Free'}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {subscription.plan}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {formatAmount(subscription.amount)} per {subscription.interval}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.trialEnd ? 'Trial ends' : 'Next billing'}
                        </div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.trialEnd || subscription.currentPeriodEnd)}
                        </div>
                      </div>
                    </div>

                    {subscription.cancelAtPeriodEnd && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                          <div>
                            <div className="font-medium text-yellow-800 dark:text-yellow-200">
                              Subscription Ending
                            </div>
                            <div className="text-sm text-yellow-700 dark:text-yellow-300">
                              Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={handleReactivate}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          disabled={loading}
                        >
                          Reactivate Subscription
                        </Button>
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      {subscription.plan !== 'ENTERPRISE' && (
                        <Button
                          onClick={handleUpgrade}
                          variant="default"
                        >
                          Upgrade Plan
                        </Button>
                      )}
                      {!subscription.cancelAtPeriodEnd && (
                        <Button
                          onClick={handleDowngrade}
                          variant="outline"
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Free Plan
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      You're currently on the free plan. Upgrade to unlock premium features.
                    </p>
                    <Button onClick={handleUpgrade}>
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Payment Methods
                  <Button
                    onClick={handleAddPaymentMethod}
                    variant="outline"
                    size="sm"
                  >
                    Add Method
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {method.type === 'card' ? '💳' : '🔵'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {method.type === 'card' ? (
                                <>
                                  {method.brand?.toUpperCase()} •••• {method.last4}
                                </>
                              ) : (
                                `PayPal ${method.email}`
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {method.type === 'card' && (
                                `Expires ${method.expiryMonth}/${method.expiryYear}`
                              )}
                              {method.isDefault && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs rounded">
                                  Default
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!method.isDefault && (
                            <Button
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              variant="ghost"
                              size="sm"
                              disabled={loading}
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            onClick={() => handleRemovePaymentMethod(method.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">💳</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Payment Methods
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Add a payment method to subscribe to premium features
                    </p>
                    <Button onClick={handleAddPaymentMethod}>
                      Add Payment Method
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice History */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatAmount(invoice.amount)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {formatDate(invoice.date)} • {formatDate(invoice.period.start)} - {formatDate(invoice.period.end)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invoice.status === 'paid'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : invoice.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}>
                            {invoice.status}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(invoice.downloadUrl, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Invoices
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your invoice history will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push('/pricing')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  🔄 Compare Plans
                </Button>
                <Button
                  onClick={() => router.push('/settings')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  ⚙️ Account Settings
                </Button>
                <Button
                  onClick={() => window.open('mailto:support@incomeclarity.com', '_blank')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  💬 Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Billing Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Billing Email
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Customer ID
                  </div>
                  <div className="font-mono text-sm text-gray-900 dark:text-white">
                    cus_{user.id?.substring(0, 8)}...
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Powered by Stripe • PCI DSS Compliant
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCancelConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">😢</div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Cancel Subscription?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You'll lose access to premium features at the end of your current billing period.
                    Your data will be preserved and you can reactivate anytime.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Keep Subscription
                    </Button>
                    <Button
                      onClick={handleCancelSubscription}
                      variant="destructive"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? 'Canceling...' : 'Cancel Subscription'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}