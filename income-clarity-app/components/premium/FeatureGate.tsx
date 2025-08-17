'use client';

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/hooks/useUser';

interface FeatureGateProps {
  feature: string;
  fallback?: ReactNode;
  children: ReactNode;
  className?: string;
  showBlur?: boolean;
  lockIcon?: boolean;
  upgradeAction?: () => void;
}

interface FeatureConfig {
  name: string;
  description: string;
  tier: 'PREMIUM' | 'ENTERPRISE';
  icon: string;
}

const FEATURE_CONFIGS: Record<string, FeatureConfig> = {
  BANK_SYNC: {
    name: 'Bank Sync',
    description: 'Automatically sync transactions from your bank accounts',
    tier: 'PREMIUM',
    icon: '🏦'
  },
  REAL_TIME_PRICES: {
    name: 'Real-time Prices',
    description: 'Live market data and price updates',
    tier: 'PREMIUM',
    icon: '📈'
  },
  ADVANCED_ANALYTICS: {
    name: 'Advanced Analytics',
    description: 'Detailed performance insights and projections',
    tier: 'PREMIUM',
    icon: '📊'
  },
  UNLIMITED_PORTFOLIOS: {
    name: 'Unlimited Portfolios',
    description: 'Create as many portfolios as you need',
    tier: 'PREMIUM',
    icon: '📂'
  },
  EMAIL_REPORTS: {
    name: 'Email Reports',
    description: 'Automated portfolio performance reports',
    tier: 'PREMIUM',
    icon: '📧'
  },
  API_ACCESS: {
    name: 'API Access',
    description: 'Programmatic access to your financial data',
    tier: 'ENTERPRISE',
    icon: '🔌'
  },
  MULTI_USER: {
    name: 'Multi-user Access',
    description: 'Share your portfolio with family or advisors',
    tier: 'ENTERPRISE',
    icon: '👥'
  },
  CUSTOM_INTEGRATIONS: {
    name: 'Custom Integrations',
    description: 'Connect with your existing financial tools',
    tier: 'ENTERPRISE',
    icon: '🔗'
  }
};

export function FeatureGate({
  feature,
  fallback,
  children,
  className = '',
  showBlur = true,
  lockIcon = true,
  upgradeAction
}: FeatureGateProps) {
  const { user } = useUser();
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const featureConfig = FEATURE_CONFIGS[feature];
  const hasAccess = checkFeatureAccess(user, featureConfig?.tier || 'PREMIUM');

  if (hasAccess) {
    return <>{children}</>;
  }

  const handleUpgradeClick = () => {
    if (upgradeAction) {
      upgradeAction();
    } else {
      setShowUpgradePrompt(true);
    }
  };

  // If fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked state
  return (
    <div className={`relative ${className}`}>
      {/* Blurred content */}
      <div className={showBlur ? 'filter blur-sm pointer-events-none select-none' : 'hidden'}>
        {children}
      </div>

      {/* Lock overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
      >
        {lockIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-4xl mb-3"
          >
            🔒
          </motion.div>
        )}

        <div className="text-center px-6 max-w-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {featureConfig?.name || 'Premium Feature'}
          </h3>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {featureConfig?.description || 'This feature is available with a premium subscription.'}
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
          >
            {featureConfig?.icon}
            <span>Upgrade to {featureConfig?.tier || 'Premium'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Upgrade prompt modal */}
      <AnimatePresence>
        {showUpgradePrompt && (
          <UpgradePromptModal
            feature={featureConfig}
            onClose={() => setShowUpgradePrompt(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini version for smaller spaces
interface MiniFeatureGateProps {
  feature: string;
  size?: 'sm' | 'md' | 'lg';
  upgradeAction?: () => void;
}

export function MiniFeatureGate({
  feature,
  size = 'md',
  upgradeAction
}: MiniFeatureGateProps) {
  const { user } = useUser();
  const featureConfig = FEATURE_CONFIGS[feature];
  const hasAccess = checkFeatureAccess(user, featureConfig?.tier || 'PREMIUM');

  if (hasAccess) {
    return null;
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={upgradeAction}
      className={`
        inline-flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/20 
        text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700
        rounded-full font-medium transition-colors duration-200
        hover:bg-yellow-200 dark:hover:bg-yellow-900/40
        ${getSizeClasses()}
      `}
    >
      <span className="text-xs">🔒</span>
      <span>{featureConfig?.tier || 'Premium'}</span>
    </motion.button>
  );
}

// Upgrade prompt modal
interface UpgradePromptModalProps {
  feature?: FeatureConfig;
  onClose: () => void;
}

function UpgradePromptModal({ feature, onClose }: UpgradePromptModalProps) {
  return (
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
        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">{feature?.icon || '🔒'}</div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Unlock {feature?.name || 'Premium Features'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {feature?.description || 'Get access to advanced features with a premium subscription.'}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Unlimited portfolios</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Real-time market data</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Advanced analytics</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-green-500">✓</span>
              <span>Bank account sync</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                // TODO: Integrate with Stripe checkout
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Helper function to check feature access
function checkFeatureAccess(user: any, requiredTier: 'PREMIUM' | 'ENTERPRISE'): boolean {
  if (!user) return false;

  // Check if user has premium access
  if (user.isPremium) {
    return true;
  }

  // Check subscription tier
  if (user.subscription?.plan === 'PREMIUM' && requiredTier === 'PREMIUM') {
    return true;
  }

  if (user.subscription?.plan === 'ENTERPRISE') {
    return true;
  }

  return false;
}

// Hook for feature access checking
export function useFeatureAccess() {
  const { user } = useUser();

  const hasFeature = (feature: string): boolean => {
    const featureConfig = FEATURE_CONFIGS[feature];
    return checkFeatureAccess(user, featureConfig?.tier || 'PREMIUM');
  };

  const requireFeature = (feature: string): void => {
    if (!hasFeature(feature)) {
      throw new Error(`Feature ${feature} requires premium access`);
    }
  };

  const getFeatureConfig = (feature: string): FeatureConfig | undefined => {
    return FEATURE_CONFIGS[feature];
  };

  return {
    hasFeature,
    requireFeature,
    getFeatureConfig,
    isFreeTier: !user?.isPremium && user?.subscription?.plan !== 'PREMIUM' && user?.subscription?.plan !== 'ENTERPRISE',
    isPremium: user?.isPremium || user?.subscription?.plan === 'PREMIUM',
    isEnterprise: user?.subscription?.plan === 'ENTERPRISE'
  };
}