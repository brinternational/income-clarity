import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management - In production, use proper authentication
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  // For development/demo purposes, return a fixed test user ID
  // In production, extract from session/JWT token
  return 'test-user-id';
};

// Valid plan types
type PlanType = 'free' | 'premium';

// Plan validation
const isValidPlan = (plan: any): plan is PlanType => {
  return typeof plan === 'string' && ['free', 'premium'].includes(plan);
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user subscription from database using UserSubscription model
    const userSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId: userId
      }
    });

    // Default to free plan if no subscription found
    const currentPlan: PlanType = userSubscription?.plan === 'PREMIUM' ? 'premium' : 'free';
    
    return NextResponse.json({
      success: true,
      plan: currentPlan,
      subscription: userSubscription ? {
        plan: userSubscription.plan,
        status: userSubscription.status,
        features: userSubscription.features ? JSON.parse(userSubscription.features) : null,
        usage: userSubscription.usage ? JSON.parse(userSubscription.usage) : null
      } : null
    });

  } catch (error) {
    logger.error('Error fetching user plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan information' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    // Validate plan type
    if (!isValidPlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Must be "free" or "premium"' },
        { status: 400 }
      );
    }

    // Convert to database format
    const dbPlan = plan === 'premium' ? 'PREMIUM' : 'FREE';
    const dbStatus = 'ACTIVE';

    // Define plan features
    const planFeatures = {
      free: {
        dataRefresh: 'weekly',
        maxPortfolios: 1,
        bankSync: false,
        advancedAnalytics: false,
        prioritySupport: false
      },
      premium: {
        dataRefresh: 'realtime',
        maxPortfolios: null, // unlimited
        bankSync: true,
        advancedAnalytics: true,
        prioritySupport: true,
        taxOptimization: true,
        riskAnalysis: true,
        performanceBenchmarking: true,
        exportCapabilities: true
      }
    };

    const features = planFeatures[plan];

    // Upsert user subscription
    const userSubscription = await prisma.userSubscription.upsert({
      where: {
        userId: userId
      },
      update: {
        plan: dbPlan,
        status: dbStatus,
        features: JSON.stringify(features),
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        plan: dbPlan,
        status: dbStatus,
        features: JSON.stringify(features),
        usage: JSON.stringify({
          portfoliosCreated: 0,
          dataRefreshesUsed: 0,
          lastRefresh: null
        })
      }
    });

    logger.info(`Plan updated successfully for user ${userId}: ${plan}`);

    return NextResponse.json({
      success: true,
      message: 'Plan updated successfully',
      new_plan: plan,
      subscription: {
        plan: userSubscription.plan,
        status: userSubscription.status,
        features: JSON.parse(userSubscription.features || '{}'),
        usage: JSON.parse(userSubscription.usage || '{}')
      }
    });

  } catch (error) {
    logger.error('Error updating user plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}