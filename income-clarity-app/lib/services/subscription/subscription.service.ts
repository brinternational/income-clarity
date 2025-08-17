/**
 * Subscription Service
 * Manages user subscription tiers and premium features
 */

import { PrismaClient } from '@prisma/client';
import type { User, UserSubscription } from '@prisma/client';

const prisma = new PrismaClient();

export interface SubscriptionPlan {
  id: string;
  name: string;
  features: string[];
  limits: {
    portfolios?: number;
    bankAccounts?: number;
    syncFrequency?: string;
    historicalData?: string;
    apiCalls?: number;
  };
}

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  FREE: {
    id: 'FREE',
    name: 'Free',
    features: [
      'Manual portfolio entry',
      'Up to 3 portfolios',
      'Basic dividend tracking',
      'Monthly income projections',
      'Standard tax calculations',
    ],
    limits: {
      portfolios: 3,
      bankAccounts: 0,
      syncFrequency: 'none',
      historicalData: '1 year',
      apiCalls: 100,
    },
  },
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    features: [
      'Automatic bank sync via Yodlee',
      'Unlimited portfolios',
      'Real-time market data',
      'Advanced tax optimization',
      'Dividend forecasting',
      'Portfolio rebalancing suggestions',
      'Custom alerts',
      'Priority support',
    ],
    limits: {
      portfolios: -1, // unlimited
      bankAccounts: 10,
      syncFrequency: 'daily',
      historicalData: '5 years',
      apiCalls: 10000,
    },
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    features: [
      'All Premium features',
      'Multi-user support',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced analytics',
      'API access',
    ],
    limits: {
      portfolios: -1, // unlimited
      bankAccounts: -1, // unlimited
      syncFrequency: 'real-time',
      historicalData: 'unlimited',
      apiCalls: -1, // unlimited
    },
  },
};

export class SubscriptionService {
  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    return await prisma.userSubscription.findUnique({
      where: { userId },
    });
  }

  /**
   * Check if user has premium features
   */
  async isPremiumUser(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumEndDate: true },
    });

    if (!user?.isPremium) return false;
    
    // Check if premium hasn't expired
    if (user.premiumEndDate && new Date(user.premiumEndDate) < new Date()) {
      // Premium expired, update user
      await this.downgradeUser(userId);
      return false;
    }

    return true;
  }

  /**
   * Upgrade user to premium
   */
  async upgradeUser(
    userId: string,
    plan: 'PREMIUM' | 'ENTERPRISE',
    stripeCustomerId?: string,
    stripeSubId?: string
  ): Promise<UserSubscription> {
    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumStartDate: new Date(),
          premiumEndDate: null, // No end date for active subscriptions
        },
      });

      // Create or update subscription
      const subscription = await tx.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          plan,
          status: 'ACTIVE',
          stripeCustomerId,
          stripeSubId,
          features: JSON.stringify(SUBSCRIPTION_PLANS[plan].features),
        },
        update: {
          plan,
          status: 'ACTIVE',
          stripeCustomerId,
          stripeSubId,
          features: JSON.stringify(SUBSCRIPTION_PLANS[plan].features),
        },
      });

      return subscription;
    });

    return result;
  }

  /**
   * Downgrade user to free tier
   */
  async downgradeUser(userId: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumEndDate: new Date(),
        },
      });

      // Update subscription
      await tx.userSubscription.update({
        where: { userId },
        data: {
          plan: 'FREE',
          status: 'CANCELLED',
        },
      });
    });
  }

  /**
   * Start free trial
   */
  async startFreeTrial(userId: string, durationDays: number = 14): Promise<void> {
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + durationDays);

    await prisma.$transaction(async (tx) => {
      // Update user
      await tx.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          trialEndDate,
        },
      });

      // Create trial subscription
      await tx.userSubscription.upsert({
        where: { userId },
        create: {
          userId,
          plan: 'PREMIUM',
          status: 'TRIAL',
          features: JSON.stringify(SUBSCRIPTION_PLANS.PREMIUM.features),
        },
        update: {
          plan: 'PREMIUM',
          status: 'TRIAL',
        },
      });
    });
  }

  /**
   * Check feature access
   */
  async canAccessFeature(
    userId: string,
    feature: string
  ): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription?.plan || 'FREE';
    
    return SUBSCRIPTION_PLANS[plan].features.includes(feature);
  }

  /**
   * Check resource limits
   */
  async checkLimit(
    userId: string,
    resource: keyof SubscriptionPlan['limits']
  ): Promise<number | string> {
    const subscription = await this.getUserSubscription(userId);
    const plan = subscription?.plan || 'FREE';
    
    return SUBSCRIPTION_PLANS[plan].limits[resource] || 0;
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string): Promise<any> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription?.usage) return {};
    
    return JSON.parse(subscription.usage);
  }

  /**
   * Update usage statistics
   */
  async updateUsage(
    userId: string,
    usageType: string,
    increment: number = 1
  ): Promise<void> {
    const subscription = await this.getUserSubscription(userId);
    if (!subscription) return;

    const usage = subscription.usage ? JSON.parse(subscription.usage) : {};
    usage[usageType] = (usage[usageType] || 0) + increment;
    usage.lastUpdated = new Date().toISOString();

    await prisma.userSubscription.update({
      where: { userId },
      data: { usage: JSON.stringify(usage) },
    });
  }

  /**
   * Check if user can sync bank accounts
   */
  async canSyncBankAccounts(userId: string): Promise<boolean> {
    return await this.isPremiumUser(userId);
  }

  /**
   * Get subscription status for UI display
   */
  async getSubscriptionStatus(userId: string): Promise<{
    isPremium: boolean;
    plan: string;
    status: string;
    features: string[];
    trialEndsAt?: Date;
    expiresAt?: Date;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const plan = user.subscription?.plan || 'FREE';
    const status = user.subscription?.status || 'INACTIVE';
    const features = SUBSCRIPTION_PLANS[plan].features;

    return {
      isPremium: user.isPremium,
      plan,
      status,
      features,
      trialEndsAt: user.trialEndDate || undefined,
      expiresAt: user.premiumEndDate || undefined,
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();