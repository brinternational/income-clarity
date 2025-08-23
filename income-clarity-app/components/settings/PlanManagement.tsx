'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Database, 
  BarChart3, 
  Infinity,
  Shield,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/design-system/core/Button';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { Alert } from '@/components/design-system/core/Alert';
import { logger } from '@/lib/logger';

// Plan definitions
const PLAN_FEATURES = {
  free: {
    name: 'Free Plan',
    price: '$0/month',
    description: 'Perfect for getting started',
    refreshRate: 'Weekly data refresh',
    analytics: 'Basic analytics',
    portfolios: '1 portfolio',
    bankSync: false,
    support: 'Community support',
    features: [
      'Weekly data refresh',
      'Basic portfolio analytics',
      '1 portfolio maximum',
      'Core dividend tracking',
      'Basic expense tracking',
      'Community support'
    ],
    limitations: [
      'Limited to 1 portfolio',
      'Weekly data refresh only',
      'No bank account sync',
      'Basic analytics only'
    ]
  },
  premium: {
    name: 'Premium Plan',
    price: '$29/month',
    description: 'Unlock advanced features and real-time data',
    refreshRate: 'Real-time data',
    analytics: 'Advanced analytics',
    portfolios: 'Unlimited portfolios',
    bankSync: true,
    support: 'Priority email support',
    features: [
      'Real-time data updates',
      'Advanced portfolio analytics',
      'Unlimited portfolios',
      'Automatic bank sync via Yodlee',
      'Advanced expense tracking',
      'Tax optimization insights',
      'Risk analysis & metrics',
      'Performance benchmarking',
      'Priority email support',
      'Export capabilities'
    ],
    limitations: []
  }
} as const;

interface PlanManagementProps {
  currentPlan?: 'free' | 'premium';
  onPlanChange?: (newPlan: 'free' | 'premium') => void;
}

interface CurrentPlanDisplayProps {
  plan: 'free' | 'premium';
  planDetails: typeof PLAN_FEATURES['free'];
  onChangePlan: () => void;
}

const CurrentPlanDisplay: React.FC<CurrentPlanDisplayProps> = ({
  plan,
  planDetails,
  onChangePlan
}) => {
  const isPremium = plan === 'premium';

  return (
    <div className={`p-6 rounded-xl border-2 ${
      isPremium 
        ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 dark:border-purple-700'
        : 'border-slate-200 bg-slate-50 dark:border-slate-600 dark:bg-slate-700'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {isPremium ? (
            <div className="p-2 bg-purple-600 rounded-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
          ) : (
            <div className="p-2 bg-slate-500 rounded-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-foreground">
              {planDetails.name}
            </h3>
            <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
              {planDetails.price}
            </p>
          </div>
        </div>
        
        {isPremium && (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-sm font-medium rounded-full">
            Current Plan
          </span>
        )}
      </div>

      <p className="text-muted-foreground mb-4">
        {planDetails.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground/90">
            {planDetails.refreshRate}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground/90">
            {planDetails.analytics}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-foreground/90">
            {planDetails.portfolios}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {planDetails.bankSync ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <X className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-foreground/90">
            Bank sync {planDetails.bankSync ? 'enabled' : 'disabled'}
          </span>
        </div>
      </div>

      <Button
        onClick={onChangePlan}
        variant={isPremium ? "outline" : "primary"}
        size="md"
        className="w-full"
        leftIcon={<ChevronRight className="w-4 h-4" />}
      >
        {isPremium ? 'Change Plan' : 'Upgrade to Premium'}
      </Button>
    </div>
  );
};

interface PlanComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: 'free' | 'premium';
  onSelectPlan: (plan: 'free' | 'premium') => void;
  loading: boolean;
}

const PlanComparisonModal: React.FC<PlanComparisonModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
  loading
}) => {
  if (!isOpen) return null;

  const handleSelectPlan = (plan: 'free' | 'premium') => {
    if (plan === currentPlan) {
      onClose();
      return;
    }
    onSelectPlan(plan);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            Choose Your Plan
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            iconOnly
            ariaLabel="Close modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Plan Comparison */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className={`relative ${
              currentPlan === 'free' 
                ? 'ring-2 ring-slate-500 border-slate-300' 
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <CardContent className="p-6">
                {currentPlan === 'free' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-slate-100 text-foreground/90 text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-slate-100 dark:bg-slate-700 rounded-lg mb-4">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {PLAN_FEATURES.free.name}
                  </h3>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    $0
                  </div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <div className="space-y-3 mb-6">
                  {PLAN_FEATURES.free.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground/90">
                        {feature}
                      </span>
                    </div>
                  ))}
                  {PLAN_FEATURES.free.limitations.map((limitation, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {limitation}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan('free')}
                  disabled={loading}
                  variant={currentPlan === 'free' ? 'outline' : 'outline'}
                  size="lg"
                  className="w-full"
                  loading={loading && currentPlan !== 'free'}
                >
                  {currentPlan === 'free' ? 'Current Plan' : 'Select Free'}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className={`relative ${
              currentPlan === 'premium' 
                ? 'ring-2 ring-purple-500 border-purple-300' 
                : 'border-purple-200 hover:border-purple-300'
            }`}>
              <CardContent className="p-6">
                {currentPlan === 'premium' && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                      Current
                    </span>
                  </div>
                )}
                
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-full">
                    Most Popular
                  </span>
                </div>
                
                <div className="text-center mb-6">
                  <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
                    <Crown className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {PLAN_FEATURES.premium.name}
                  </h3>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                    $29
                  </div>
                  <div className="text-muted-foreground">per month</div>
                </div>

                <div className="space-y-3 mb-6">
                  {PLAN_FEATURES.premium.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground/90">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan('premium')}
                  disabled={loading}
                  variant={currentPlan === 'premium' ? 'outline' : 'primary'}
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  loading={loading && currentPlan !== 'premium'}
                  leftIcon={currentPlan === 'premium' ? undefined : <Crown className="w-4 h-4" />}
                >
                  {currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Comparison */}
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-xl">
            <h4 className="text-lg font-semibold text-foreground mb-4">
              Why Upgrade to Premium?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-medium text-foreground mb-2">
                  Real-time Data
                </h5>
                <p className="text-sm text-muted-foreground">
                  Get live portfolio updates instead of waiting a week
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-medium text-foreground mb-2">
                  Bank Sync
                </h5>
                <p className="text-sm text-muted-foreground">
                  Automatically import transactions from your bank accounts
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h5 className="font-medium text-foreground mb-2">
                  Advanced Analytics
                </h5>
                <p className="text-sm text-muted-foreground">
                  Deep insights, risk analysis, and performance benchmarking
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PlanManagement: React.FC<PlanManagementProps> = ({ 
  currentPlan = 'free', 
  onPlanChange 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePlanSelection = async (newPlan: 'free' | 'premium') => {
    if (newPlan === currentPlan) {
      setIsModalOpen(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: newPlan
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update plan');
      }

      setSuccess(true);
      setIsModalOpen(false);
      
      if (onPlanChange) {
        onPlanChange(newPlan);
      }

      // Show success message
      setTimeout(() => setSuccess(false), 3000);

      logger.info(`Plan updated successfully from ${currentPlan} to ${newPlan}`);

    } catch (error: any) {
      logger.error('Error updating plan:', error);
      setError(error.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Error Message */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Success Message */}
        {success && (
          <Alert variant="success">
            Plan updated successfully! Please refresh the page to see new features.
          </Alert>
        )}

        {/* Current Plan Display */}
        <CurrentPlanDisplay
          plan={currentPlan}
          planDetails={PLAN_FEATURES[currentPlan]}
          onChangePlan={() => setIsModalOpen(true)}
        />

        {/* Plan Benefits for Free Users */}
        {currentPlan === 'free' && (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
            <div className="flex items-center mb-4">
              <Crown className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Unlock Premium Features
              </h4>
            </div>
            <p className="text-purple-700 dark:text-purple-300 mb-4">
              Get the most out of Income Clarity with real-time data, unlimited portfolios, and advanced analytics.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-purple-700 dark:text-purple-300">Real-time Updates</div>
              </div>
              <div className="text-center">
                <Infinity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-purple-700 dark:text-purple-300">Unlimited Portfolios</div>
              </div>
              <div className="text-center">
                <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-purple-700 dark:text-purple-300">Bank Sync</div>
              </div>
              <div className="text-center">
                <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-sm text-purple-700 dark:text-purple-300">Advanced Analytics</div>
              </div>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="primary"
              size="md"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              leftIcon={<Crown className="w-4 h-4" />}
            >
              Upgrade to Premium - $29/month
            </Button>
          </div>
        )}
      </div>

      {/* Plan Comparison Modal */}
      <PlanComparisonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={handlePlanSelection}
        loading={loading}
      />
    </>
  );
};

export default PlanManagement;