'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

interface UpgradePromptProps {
  feature?: string;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: 'button' | 'modal' | 'inline';
  className?: string;
}

interface PricingPlan {
  id: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlight?: boolean;
  buttonText: string;
  buttonAction: () => void;
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with portfolio tracking',
    features: [
      '3 portfolios',
      'Manual data entry',
      'Basic analytics',
      'Community support'
    ],
    buttonText: 'Current Plan',
    buttonAction: () => {}
  },
  {
    id: 'PREMIUM',
    name: 'Premium',
    price: '$9.99',
    period: 'month',
    description: 'Advanced features for serious investors',
    features: [
      'Unlimited portfolios',
      'Bank account sync',
      'Real-time market data',
      'Advanced analytics',
      'Email reports',
      'Priority support'
    ],
    highlight: true,
    buttonText: 'Upgrade Now',
    buttonAction: () => {
      // TODO: Integrate with Stripe
      console.log('Upgrading to Premium...');
    }
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'For financial advisors and family offices',
    features: [
      'Everything in Premium',
      'Multi-user access',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    buttonText: 'Contact Sales',
    buttonAction: () => {
      // TODO: Contact form or email
      window.open('mailto:sales@income-clarity.com', '_blank');
    }
  }
];

const FEATURE_BENEFITS = {
  BANK_SYNC: {
    icon: '🏦',
    title: 'Bank Account Sync',
    description: 'Automatically import transactions and balances',
    benefits: [
      'Save hours of manual data entry',
      'Never miss a transaction',
      'Real-time balance updates',
      'Secure bank-grade encryption'
    ]
  },
  REAL_TIME_PRICES: {
    icon: '📈',
    title: 'Real-time Market Data',
    description: 'Live prices and market insights',
    benefits: [
      'Up-to-the-minute portfolio values',
      'Real-time profit/loss tracking',
      'Market hours indicators',
      'Historical price charts'
    ]
  },
  ADVANCED_ANALYTICS: {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Deep insights into your portfolio performance',
    benefits: [
      'Sector allocation analysis',
      'Risk assessment metrics',
      'Performance benchmarking',
      'Tax optimization insights'
    ]
  },
  DEFAULT: {
    icon: '✨',
    title: 'Premium Features',
    description: 'Unlock the full potential of Income Clarity',
    benefits: [
      'All premium features included',
      'Priority customer support',
      'Early access to new features',
      'Advanced customization options'
    ]
  }
};

export function UpgradePrompt({
  feature,
  isOpen = false,
  onClose,
  trigger = 'button',
  className = ''
}: UpgradePromptProps) {
  const [showModal, setShowModal] = useState(isOpen);
  const [selectedPlan, setSelectedPlan] = useState<'PREMIUM' | 'ENTERPRISE'>('PREMIUM');
  const { user } = useUser();

  const featureBenefit = FEATURE_BENEFITS[feature as keyof typeof FEATURE_BENEFITS] || FEATURE_BENEFITS.DEFAULT;

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    onClose?.();
  };

  if (trigger === 'inline') {
    return (
      <div className={`p-6 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-3">{featureBenefit.icon}</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {featureBenefit.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {featureBenefit.description}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
          >
            <span>Upgrade to Premium</span>
            <span>→</span>
          </motion.button>
        </div>

        <UpgradeModal
          isOpen={showModal}
          onClose={handleCloseModal}
          feature={feature}
        />
      </div>
    );
  }

  if (trigger === 'button') {
    return (
      <>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpenModal}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
        >
          <span className="text-lg">✨</span>
          <span>Upgrade to Premium</span>
        </motion.button>

        <UpgradeModal
          isOpen={showModal}
          onClose={handleCloseModal}
          feature={feature}
        />
      </>
    );
  }

  return (
    <UpgradeModal
      isOpen={showModal}
      onClose={handleCloseModal}
      feature={feature}
    />
  );
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

function UpgradeModal({ isOpen, onClose, feature }: UpgradeModalProps) {
  const [currentTab, setCurrentTab] = useState<'benefits' | 'pricing'>('benefits');
  const featureBenefit = FEATURE_BENEFITS[feature as keyof typeof FEATURE_BENEFITS] || FEATURE_BENEFITS.DEFAULT;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{featureBenefit.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Unlock {featureBenefit.title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                      {featureBenefit.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex mt-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setCurrentTab('benefits')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'benefits'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Benefits
                </button>
                <button
                  onClick={() => setCurrentTab('pricing')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    currentTab === 'pricing'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Pricing
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {currentTab === 'benefits' && (
                <BenefitsTab featureBenefit={featureBenefit} />
              )}
              {currentTab === 'pricing' && (
                <PricingTab onClose={onClose} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BenefitsTab({ featureBenefit }: { featureBenefit: any }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {featureBenefit.benefits.map((benefit: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
          >
            <span className="text-green-500 text-xl mt-0.5">✓</span>
            <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Start 14-Day Free Trial
        </motion.button>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          No credit card required • Cancel anytime
        </p>
      </div>
    </div>
  );
}

function PricingTab({ onClose }: { onClose: () => void }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {PRICING_PLANS.map((plan) => (
        <motion.div
          key={plan.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative p-6 rounded-xl border-2 ${
            plan.highlight
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
          }`}
        >
          {plan.highlight && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Most Popular
              </span>
            </div>
          )}

          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {plan.name}
            </h3>
            <div className="mb-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {plan.price}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                /{plan.period}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {plan.description}
            </p>
          </div>

          <ul className="space-y-2 mb-6">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </li>
            ))}
          </ul>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              plan.buttonAction();
              if (plan.id !== 'FREE') {
                onClose();
              }
            }}
            className={`w-full py-3 rounded-lg font-medium transition-colors duration-200 ${
              plan.highlight
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : plan.id === 'FREE'
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
            }`}
            disabled={plan.id === 'FREE'}
          >
            {plan.buttonText}
          </motion.button>
        </motion.div>
      ))}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactUpgradePrompt({ feature, className = '' }: { feature?: string; className?: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className={`inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg cursor-pointer ${className}`}
        onClick={() => setShowModal(true)}
      >
        <span className="text-yellow-600 dark:text-yellow-400">🔒</span>
        <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          Premium Required
        </span>
      </motion.div>

      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={feature}
      />
    </>
  );
}