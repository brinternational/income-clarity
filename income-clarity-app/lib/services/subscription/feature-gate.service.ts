/**
 * Feature Gate Service
 * Controls access to premium features based on user subscription
 */

import { subscriptionService } from './subscription.service';

export enum Feature {
  // Data Sources
  BANK_SYNC = 'Bank account synchronization',
  REAL_TIME_PRICES = 'Real-time market data',
  HISTORICAL_DATA_EXTENDED = 'Extended historical data',
  
  // Portfolio Features
  UNLIMITED_PORTFOLIOS = 'Unlimited portfolios',
  PORTFOLIO_REBALANCING = 'Portfolio rebalancing suggestions',
  ADVANCED_ANALYTICS = 'Advanced portfolio analytics',
  
  // Tax Features
  TAX_OPTIMIZATION = 'Advanced tax optimization',
  TAX_LOSS_HARVESTING = 'Tax loss harvesting',
  STATE_TAX_COMPARISON = 'Multi-state tax comparison',
  
  // Income Features
  DIVIDEND_FORECASTING = 'Dividend forecasting',
  INCOME_SCENARIOS = 'Income scenario planning',
  RETIREMENT_PLANNING = 'Advanced retirement planning',
  
  // Alerts & Notifications
  CUSTOM_ALERTS = 'Custom price and dividend alerts',
  EMAIL_REPORTS = 'Email reports and summaries',
  WEBHOOK_INTEGRATION = 'Webhook integrations',
  
  // Data Management
  BULK_IMPORT = 'Bulk data import',
  DATA_EXPORT = 'Advanced data export',
  API_ACCESS = 'API access',
  
  // Support
  PRIORITY_SUPPORT = 'Priority customer support',
  DEDICATED_MANAGER = 'Dedicated account manager',
}

export class FeatureGateService {
  private featurePlanMapping: Record<Feature, string[]> = {
    // Free features (available to all)
    [Feature.HISTORICAL_DATA_EXTENDED]: ['FREE', 'PREMIUM', 'ENTERPRISE'],
    
    // Premium features
    [Feature.BANK_SYNC]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.REAL_TIME_PRICES]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.UNLIMITED_PORTFOLIOS]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.PORTFOLIO_REBALANCING]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.ADVANCED_ANALYTICS]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.TAX_OPTIMIZATION]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.TAX_LOSS_HARVESTING]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.STATE_TAX_COMPARISON]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.DIVIDEND_FORECASTING]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.INCOME_SCENARIOS]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.RETIREMENT_PLANNING]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.CUSTOM_ALERTS]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.EMAIL_REPORTS]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.BULK_IMPORT]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.DATA_EXPORT]: ['PREMIUM', 'ENTERPRISE'],
    [Feature.PRIORITY_SUPPORT]: ['PREMIUM', 'ENTERPRISE'],
    
    // Enterprise only
    [Feature.WEBHOOK_INTEGRATION]: ['ENTERPRISE'],
    [Feature.API_ACCESS]: ['ENTERPRISE'],
    [Feature.DEDICATED_MANAGER]: ['ENTERPRISE'],
  };

  /**
   * Check if user has access to a feature
   */
  async hasAccess(userId: string, feature: Feature): Promise<boolean> {
    const subscription = await subscriptionService.getUserSubscription(userId);
    const userPlan = subscription?.plan || 'FREE';
    const allowedPlans = this.featurePlanMapping[feature] || [];
    
    return allowedPlans.includes(userPlan);
  }

  /**
   * Check multiple features at once
   */
  async checkFeatures(
    userId: string,
    features: Feature[]
  ): Promise<Record<Feature, boolean>> {
    const subscription = await subscriptionService.getUserSubscription(userId);
    const userPlan = subscription?.plan || 'FREE';
    
    const result: Record<Feature, boolean> = {} as any;
    
    for (const feature of features) {
      const allowedPlans = this.featurePlanMapping[feature] || [];
      result[feature] = allowedPlans.includes(userPlan);
    }
    
    return result;
  }

  /**
   * Get all available features for a user
   */
  async getAvailableFeatures(userId: string): Promise<Feature[]> {
    const subscription = await subscriptionService.getUserSubscription(userId);
    const userPlan = subscription?.plan || 'FREE';
    
    const availableFeatures: Feature[] = [];
    
    for (const [feature, allowedPlans] of Object.entries(this.featurePlanMapping)) {
      if (allowedPlans.includes(userPlan)) {
        availableFeatures.push(feature as Feature);
      }
    }
    
    return availableFeatures;
  }

  /**
   * Get features that would be unlocked with an upgrade
   */
  async getUpgradeFeatures(userId: string, targetPlan: 'PREMIUM' | 'ENTERPRISE'): Promise<Feature[]> {
    const subscription = await subscriptionService.getUserSubscription(userId);
    const currentPlan = subscription?.plan || 'FREE';
    
    if (currentPlan === targetPlan) return [];
    
    const currentFeatures = await this.getAvailableFeatures(userId);
    const upgradeFeatures: Feature[] = [];
    
    for (const [feature, allowedPlans] of Object.entries(this.featurePlanMapping)) {
      if (allowedPlans.includes(targetPlan) && !currentFeatures.includes(feature as Feature)) {
        upgradeFeatures.push(feature as Feature);
      }
    }
    
    return upgradeFeatures;
  }

  /**
   * Throw error if user doesn't have access to feature
   */
  async requireFeature(userId: string, feature: Feature): Promise<void> {
    const hasAccess = await this.hasAccess(userId, feature);
    
    if (!hasAccess) {
      throw new Error(`Premium feature required: ${feature}. Please upgrade your subscription.`);
    }
  }

  /**
   * Check resource limits
   */
  async checkResourceLimit(
    userId: string,
    resource: 'portfolios' | 'bankAccounts' | 'apiCalls',
    currentCount: number
  ): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    const limit = await subscriptionService.checkLimit(userId, resource);
    const numLimit = typeof limit === 'number' ? limit : parseInt(limit as string, 10);
    
    // -1 means unlimited
    if (numLimit === -1) {
      return { allowed: true, limit: -1, remaining: -1 };
    }
    
    const allowed = currentCount < numLimit;
    const remaining = Math.max(0, numLimit - currentCount);
    
    return { allowed, limit: numLimit, remaining };
  }

  /**
   * Log feature usage for analytics
   */
  async logFeatureUsage(userId: string, feature: Feature): Promise<void> {
    const featureKey = `feature_${feature.replace(/\s+/g, '_').toLowerCase()}`;
    await subscriptionService.updateUsage(userId, featureKey, 1);
  }
}

// Export singleton instance
export const featureGate = new FeatureGateService();