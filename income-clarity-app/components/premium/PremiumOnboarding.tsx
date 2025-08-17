'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  action?: () => void;
  completed?: boolean;
  optional?: boolean;
}

interface PremiumOnboardingProps {
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Premium!',
    description: 'You now have access to advanced portfolio management features.',
    icon: '🎉'
  },
  {
    id: 'bank-connection',
    title: 'Connect Your Bank Accounts',
    description: 'Automatically sync transactions and holdings from your bank and brokerage accounts.',
    icon: '🏦'
  },
  {
    id: 'data-import',
    title: 'Import Your Portfolio Data',
    description: 'Upload existing portfolio data or let us sync it from your connected accounts.',
    icon: '📊'
  },
  {
    id: 'feature-tour',
    title: 'Explore Premium Features',
    description: 'Discover advanced analytics, tax optimization, and real-time tracking.',
    icon: '✨'
  },
  {
    id: 'success',
    title: 'You\'re All Set!',
    description: 'Start exploring your enhanced portfolio management experience.',
    icon: '🚀'
  }
];

const PREMIUM_FEATURES = [
  {
    title: 'Bank Account Sync',
    description: 'Connect checking, savings, and investment accounts',
    icon: '🏦',
    status: 'unlocked'
  },
  {
    title: 'Real-time Market Data',
    description: 'Live prices and instant portfolio updates',
    icon: '📈',
    status: 'unlocked'
  },
  {
    title: 'Advanced Analytics',
    description: 'Deep insights and performance projections',
    icon: '📊',
    status: 'unlocked'
  },
  {
    title: 'Tax Optimization',
    description: 'Smart strategies to minimize tax liability',
    icon: '💰',
    status: 'unlocked'
  },
  {
    title: 'Email Reports',
    description: 'Automated weekly and monthly summaries',
    icon: '📧',
    status: 'unlocked'
  },
  {
    title: 'Unlimited Portfolios',
    description: 'Track as many portfolios as you need',
    icon: '📂',
    status: 'unlocked'
  }
];

export function PremiumOnboarding({ onComplete, onSkip, autoStart = true }: PremiumOnboardingProps) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isConnectingBank, setIsConnectingBank] = useState(false);
  const [connectedBanks, setConnectedBanks] = useState<string[]>([]);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  useEffect(() => {
    // Auto-mark welcome step as completed
    if (currentStep === 0) {
      setTimeout(() => {
        setCompletedSteps(prev => new Set([...prev, 'welcome']));
      }, 2000);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkipStep = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    handleNext();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const handleConnectBank = async () => {
    setIsConnectingBank(true);
    try {
      // TODO: Integrate with Yodlee FastLink
      console.log('Connecting to bank account...');
      
      // Simulate bank connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectedBanks(['Chase Bank', 'Fidelity Investments']);
      setCompletedSteps(prev => new Set([...prev, 'bank-connection']));
    } catch (error) {
      console.error('Failed to connect bank:', error);
    } finally {
      setIsConnectingBank(false);
    }
  };

  const handleImportData = async () => {
    try {
      // TODO: Import portfolio data
      console.log('Importing portfolio data...');
      setCompletedSteps(prev => new Set([...prev, 'data-import']));
    } catch (error) {
      console.error('Failed to import data:', error);
    }
  };

  const handleTakeTour = () => {
    // TODO: Start feature tour
    console.log('Starting feature tour...');
    setCompletedSteps(prev => new Set([...prev, 'feature-tour']));
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="text-8xl mb-6"
            >
              {currentStepData.icon}
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
            >
              {currentStepData.title}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-600 dark:text-gray-300 mb-8"
            >
              {currentStepData.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto"
            >
              {PREMIUM_FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {feature.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-green-500 text-xs">✓</span>
                    <span className="text-green-700 dark:text-green-400 text-xs font-medium">
                      Unlocked
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        );

      case 'bank-connection':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">{currentStepData.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            {connectedBanks.length > 0 ? (
              <div className="space-y-4 mb-8">
                <div className="text-green-600 dark:text-green-400 font-medium">
                  ✓ Connected Accounts
                </div>
                {connectedBanks.map((bank, index) => (
                  <div key={index} className="flex items-center justify-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-w-sm mx-auto">
                    <span className="text-green-500">🏦</span>
                    <span className="text-gray-900 dark:text-white font-medium">{bank}</span>
                    <span className="text-green-500">✓</span>
                  </div>
                ))}
                <Button
                  onClick={handleConnectBank}
                  variant="outline"
                  size="sm"
                  disabled={isConnectingBank}
                >
                  Connect Another Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4 mb-8">
                <Button
                  onClick={handleConnectBank}
                  disabled={isConnectingBank}
                  size="lg"
                >
                  {isConnectingBank ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⚪</span>
                      Connecting...
                    </span>
                  ) : (
                    'Connect Bank Account'
                  )}
                </Button>
                <div className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  Your credentials are encrypted and secure. We use bank-level security.
                </div>
              </div>
            )}
          </div>
        );

      case 'data-import':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">{currentStepData.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Auto-Sync
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Automatically import data from connected accounts
                </p>
                <Button
                  onClick={handleImportData}
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  Start Auto-Sync
                </Button>
              </Card>

              <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow dark:bg-gray-800 dark:border-gray-700">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Upload CSV
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Import portfolio data from a CSV file
                </p>
                <Button
                  onClick={() => {
                    // TODO: Open file upload dialog
                    handleImportData();
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Upload File
                </Button>
              </Card>
            </div>
          </div>
        );

      case 'feature-tour':
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">{currentStepData.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
              {[
                { icon: '📊', title: 'Advanced Analytics', description: 'Deep portfolio insights' },
                { icon: '💰', title: 'Tax Optimization', description: 'Smart tax strategies' },
                { icon: '📈', title: 'Real-time Data', description: 'Live market updates' },
                { icon: '🎯', title: 'Rebalancing', description: 'Portfolio optimization' }
              ].map((feature, index) => (
                <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                    {feature.title}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleTakeTour}
              size="lg"
            >
              Take the Tour
            </Button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-8xl mb-6"
            >
              {currentStepData.icon}
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {currentStepData.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                What's Next?
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {[
                  { icon: '📊', title: 'View Dashboard', action: 'dashboard' },
                  { icon: '⚙️', title: 'Adjust Settings', action: 'settings' },
                  { icon: '💬', title: 'Get Support', action: 'support' }
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col gap-2 h-auto py-4"
                    onClick={() => {
                      // TODO: Handle quick actions
                      console.log(`Quick action: ${action.action}`);
                    }}
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-sm">{action.title}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Premium Setup
            </h1>
            <div className="flex items-center gap-2">
              {ONBOARDING_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep || completedSteps.has(step.id)
                      ? 'bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          {onSkip && (
            <Button
              onClick={onSkip}
              variant="ghost"
              size="sm"
            >
              Skip Setup
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
              >
                Previous
              </Button>
            )}
            
            {!completedSteps.has(currentStepData.id) && currentStep > 0 && (
              <Button
                onClick={handleSkipStep}
                variant="ghost"
              >
                Skip This Step
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              disabled={!completedSteps.has(currentStepData.id) && currentStep > 0}
            >
              {isLastStep ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PremiumOnboarding;