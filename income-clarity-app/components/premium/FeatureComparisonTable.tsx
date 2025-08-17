'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFeatureAccess } from './FeatureGate';

interface FeatureRow {
  category?: string;
  feature: string;
  description?: string;
  tooltip?: string;
  free: string | boolean | number;
  premium: string | boolean | number;
  enterprise: string | boolean | number;
  highlight?: boolean;
  icon?: string;
}

interface FeatureComparisonTableProps {
  compact?: boolean;
  highlightPlan?: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  showActions?: boolean;
  className?: string;
}

const FEATURE_DATA: FeatureRow[] = [
  {
    category: 'Portfolio Management',
    feature: 'Portfolio Count',
    description: 'Number of portfolios you can track',
    icon: '📂',
    free: 3,
    premium: 'Unlimited',
    enterprise: 'Unlimited',
    highlight: true
  },
  {
    feature: 'Holdings Tracking',
    description: 'Track individual stocks, bonds, and funds',
    icon: '📊',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    feature: 'Performance Analytics',
    description: 'Basic return calculations and charts',
    icon: '📈',
    free: 'Basic',
    premium: 'Advanced',
    enterprise: 'Advanced + Custom'
  },
  {
    feature: 'Portfolio Rebalancing',
    description: 'Automated rebalancing suggestions',
    icon: '⚖️',
    free: false,
    premium: true,
    enterprise: true,
    highlight: true
  },
  {
    category: 'Data Sources',
    feature: 'Manual Entry',
    description: 'Manually add transactions and holdings',
    icon: '✏️',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    feature: 'Bank Account Sync',
    description: 'Automatic transaction sync via Yodlee',
    icon: '🏦',
    free: false,
    premium: true,
    enterprise: true,
    highlight: true
  },
  {
    feature: 'Real-time Market Data',
    description: 'Live prices and market updates',
    icon: '📡',
    free: 'End of day',
    premium: 'Real-time',
    enterprise: 'Real-time',
    highlight: true
  },
  {
    feature: 'API Access',
    description: 'Programmatic access to your data',
    icon: '🔌',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    category: 'Analytics & Insights',
    feature: 'Basic Charts',
    description: 'Performance charts and graphs',
    icon: '📊',
    free: true,
    premium: true,
    enterprise: true
  },
  {
    feature: 'Tax Optimization',
    description: 'Tax-loss harvesting and strategies',
    icon: '💰',
    free: false,
    premium: true,
    enterprise: true,
    highlight: true
  },
  {
    feature: 'Dividend Forecasting',
    description: 'Predict future dividend income',
    icon: '💵',
    free: false,
    premium: true,
    enterprise: true
  },
  {
    feature: 'Risk Analysis',
    description: 'Portfolio risk metrics and analysis',
    icon: '⚠️',
    free: 'Basic',
    premium: 'Advanced',
    enterprise: 'Advanced + Stress Testing'
  },
  {
    category: 'Reports & Communication',
    feature: 'Email Reports',
    description: 'Automated performance summaries',
    icon: '📧',
    free: false,
    premium: 'Weekly/Monthly',
    enterprise: 'Custom Schedule',
    highlight: true
  },
  {
    feature: 'PDF Export',
    description: 'Export reports and statements',
    icon: '📄',
    free: 'Basic',
    premium: 'Professional',
    enterprise: 'White-label'
  },
  {
    feature: 'Custom Reports',
    description: 'Build custom analytics reports',
    icon: '📋',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    category: 'Collaboration & Access',
    feature: 'User Accounts',
    description: 'Number of users per subscription',
    icon: '👤',
    free: 1,
    premium: 1,
    enterprise: 'Unlimited'
  },
  {
    feature: 'Team Collaboration',
    description: 'Share portfolios with team members',
    icon: '👥',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    feature: 'Client Portal',
    description: 'White-label client access portal',
    icon: '🏢',
    free: false,
    premium: false,
    enterprise: true
  },
  {
    category: 'Support & Service',
    feature: 'Support Level',
    description: 'Level of customer support provided',
    icon: '💬',
    free: 'Community',
    premium: 'Priority Email',
    enterprise: 'Dedicated Manager'
  },
  {
    feature: 'Response Time',
    description: 'Expected support response time',
    icon: '⏱️',
    free: '48+ hours',
    premium: '24 hours',
    enterprise: '4 hours'
  },
  {
    feature: 'Phone Support',
    description: 'Direct phone support access',
    icon: '📞',
    free: false,
    premium: false,
    enterprise: true
  }
];

export function FeatureComparisonTable({
  compact = false,
  highlightPlan,
  showActions = true,
  className = ''
}: FeatureComparisonTableProps) {
  const { isPremium, isEnterprise, isFreeTier } = useFeatureAccess();
  const [showAllFeatures, setShowAllFeatures] = useState(!compact);
  
  const currentPlan = isEnterprise ? 'ENTERPRISE' : isPremium ? 'PREMIUM' : 'FREE';
  const planToHighlight = highlightPlan || currentPlan;

  const handleUpgrade = (plan: 'PREMIUM' | 'ENTERPRISE') => {
    if (plan === 'ENTERPRISE') {
      window.location.href = 'mailto:sales@incomeclarity.com?subject=Enterprise Inquiry';
    } else {
      window.location.href = '/pricing';
    }
  };

  const renderCell = (value: string | boolean | number, isHighlighted: boolean = false) => {
    if (typeof value === 'boolean') {
      return (
        <span className={`text-2xl ${value ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`}>
          {value ? '✓' : '✗'}
        </span>
      );
    }
    
    if (typeof value === 'number') {
      return (
        <span className={`font-medium ${isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
          {value}
        </span>
      );
    }
    
    // Handle special values
    if (value === 'Unlimited' || value === '∞') {
      return (
        <span className={`font-medium ${isHighlighted ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
          ∞
        </span>
      );
    }
    
    return (
      <span className={`text-sm ${isHighlighted ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}`}>
        {value}
      </span>
    );
  };

  const getColumnClass = (plan: string) => {
    const isHighlighted = plan === planToHighlight;
    const isCurrent = 
      (plan === 'FREE' && isFreeTier) ||
      (plan === 'PREMIUM' && isPremium && !isEnterprise) ||
      (plan === 'ENTERPRISE' && isEnterprise);

    return `px-4 py-3 text-center ${
      isHighlighted 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
        : 'bg-white dark:bg-gray-800'
    } ${
      isCurrent ? 'ring-2 ring-green-500 ring-opacity-50' : ''
    }`;
  };

  const visibleFeatures = showAllFeatures ? FEATURE_DATA : FEATURE_DATA.slice(0, 8);
  
  // Group features by category
  const groupedFeatures = visibleFeatures.reduce((acc, feature) => {
    const category = feature.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, FeatureRow[]>);

  return (
    <Card className={`overflow-hidden ${className} dark:bg-gray-800 dark:border-gray-700`}>
      <CardHeader>
        <CardTitle className="text-center">
          {compact ? 'Feature Comparison' : 'Complete Feature Comparison'}
        </CardTitle>
        {!compact && (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Compare plans and find the perfect fit for your needs
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-4 text-left font-medium text-gray-900 dark:text-white w-1/3">
                  Feature
                </th>
                <th className={`py-4 font-medium text-gray-900 dark:text-white ${getColumnClass('FREE')}`}>
                  <div className="flex flex-col items-center gap-1">
                    <span>FREE</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">$0/month</span>
                    {planToHighlight === 'FREE' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </th>
                <th className={`py-4 font-medium text-gray-900 dark:text-white ${getColumnClass('PREMIUM')}`}>
                  <div className="flex flex-col items-center gap-1">
                    <span>PREMIUM</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">$9.99/month</span>
                    {planToHighlight === 'PREMIUM' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        {isPremium ? 'Current' : 'Popular'}
                      </span>
                    )}
                  </div>
                </th>
                <th className={`py-4 font-medium text-gray-900 dark:text-white ${getColumnClass('ENTERPRISE')}`}>
                  <div className="flex flex-col items-center gap-1">
                    <span>ENTERPRISE</span>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">Custom</span>
                    {planToHighlight === 'ENTERPRISE' && (
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            
            {/* Features */}
            <tbody>
              {Object.entries(groupedFeatures).map(([category, features]) => (
                <motion.tbody
                  key={category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Category Header */}
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <td 
                      colSpan={4} 
                      className="px-4 py-2 text-sm font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600"
                    >
                      {category}
                    </td>
                  </tr>
                  
                  {/* Category Features */}
                  {features.map((feature, index) => (
                    <tr 
                      key={`${category}-${index}`}
                      className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                        feature.highlight ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {feature.icon && (
                            <span className="text-lg">{feature.icon}</span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {feature.feature}
                              {feature.highlight && (
                                <span className="ml-2 px-1.5 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                                  Popular
                                </span>
                              )}
                            </div>
                            {feature.description && !compact && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {feature.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={getColumnClass('FREE')}>
                        {renderCell(feature.free, planToHighlight === 'FREE')}
                      </td>
                      <td className={getColumnClass('PREMIUM')}>
                        {renderCell(feature.premium, planToHighlight === 'PREMIUM')}
                      </td>
                      <td className={getColumnClass('ENTERPRISE')}>
                        {renderCell(feature.enterprise, planToHighlight === 'ENTERPRISE')}
                      </td>
                    </tr>
                  ))}
                </motion.tbody>
              ))}
            </tbody>
            
            {/* Action Row */}
            {showActions && (
              <tfoot>
                <tr className="bg-gray-50 dark:bg-gray-700 border-t-2 border-gray-200 dark:border-gray-600">
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                    Get Started
                  </td>
                  <td className={getColumnClass('FREE')}>
                    <Button
                      variant={isFreeTier ? "outline" : "ghost"}
                      size="sm"
                      onClick={() => window.location.href = '/auth/signup'}
                      disabled={isFreeTier}
                    >
                      {isFreeTier ? 'Current Plan' : 'Downgrade'}
                    </Button>
                  </td>
                  <td className={getColumnClass('PREMIUM')}>
                    <Button
                      variant={isPremium && !isEnterprise ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleUpgrade('PREMIUM')}
                      disabled={isPremium && !isEnterprise}
                    >
                      {isPremium && !isEnterprise ? 'Current Plan' : 'Start Trial'}
                    </Button>
                  </td>
                  <td className={getColumnClass('ENTERPRISE')}>
                    <Button
                      variant={isEnterprise ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleUpgrade('ENTERPRISE')}
                      disabled={isEnterprise}
                    >
                      {isEnterprise ? 'Current Plan' : 'Contact Sales'}
                    </Button>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        
        {/* Show More/Less Button */}
        {compact && (
          <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              onClick={() => setShowAllFeatures(!showAllFeatures)}
            >
              {showAllFeatures ? 'Show Less' : 'Show All Features'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default FeatureComparisonTable;