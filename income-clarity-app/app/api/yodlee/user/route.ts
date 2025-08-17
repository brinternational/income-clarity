import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { yodleeRateLimitedService } from '@/lib/services/yodlee/yodlee-rate-limited.service';
import { Logger } from '@/lib/logger';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('YodleeUserAPI');

/**
 * GET /api/yodlee/user
 * 
 * Gets Yodlee user information and connection status
 * Returns user data and connection details for debugging
 */
export async function GET(request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    // Get authenticated session from cookie
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('session-token');
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from session token (simplified auth)
    const userEmail = 'test@example.com'; // For demo, hardcoded
    logger.info('Fetching Yodlee user info', { userId: userEmail });

    // Get user and Yodlee connection from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let yodleeData = null;
    let connectionStatus = {
      isConnected: false,
      hasAccounts: false,
      lastSynced: null,
      yodleeUserId: null
    };

    if (user.yodleeConnection) {
      connectionStatus = {
        isConnected: true,
        hasAccounts: user.yodleeConnection.syncedAccounts.length > 0,
        lastSynced: user.yodleeConnection.lastSyncedAt,
        yodleeUserId: user.yodleeConnection.yodleeUserId
      };

      // Try to get fresh data from Yodlee if we have a connection
      try {
        const userToken = await yodleeRateLimitedService.getUserToken(user.yodleeConnection.yodleeUserId);
        const accounts = await yodleeRateLimitedService.getAccounts(userToken, user.id);
        
        yodleeData = {
          accounts: accounts || [],
          userToken: userToken ? 'PRESENT' : 'MISSING' // Don't expose actual token
        };
      } catch (error) {
        logger.warn('Failed to fetch live Yodlee data, using cached data', error);
      }
    }

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      connectionStatus,
      yodleeData,
      cachedAccountsSummary: {
        totalAccounts: user.yodleeConnection?.syncedAccounts.length || 0,
        accountTypes: user.yodleeConnection?.syncedAccounts.map(acc => ({
          id: acc.id,
          accountName: acc.accountName,
          accountType: acc.accountType,
          balance: acc.balance,
          yodleeAccountId: acc.yodleeAccountId,
          institution: acc.institution,
          lastRefreshed: acc.lastRefreshed
        })) || []
      },
      timestamp: new Date().toISOString(),
      environment: process.env.YODLEE_ENV || 'sandbox'
    };

    logger.info('Yodlee user info retrieved successfully', { 
      isConnected: connectionStatus.isConnected,
      cachedAccounts: response.cachedAccountsSummary.totalAccounts,
      liveAccounts: yodleeData?.accounts?.length || 0,
      environment: response.environment
    });

    return NextResponse.json(response);

  } catch (error: any) {
    logger.error('Failed to get Yodlee user info', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to retrieve user information',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}