import { NextRequest, NextResponse } from 'next/server';
import { yodleeClient } from '@/lib/services/yodlee/yodlee-client.service';
import { prisma } from '@/lib/db';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:Accounts');

export async function GET(request: NextRequest) {
  try {
    // Check authentication - using same method as /api/auth/me
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      );
    }

    // Find session with user - same as /api/auth/me
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({
          where: { id: session.id }
        });
      }

      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const authUser = session.user;

    // Check Yodlee service configuration
    if (!yodleeClient.isServiceConfigured()) {
      logger.info('Yodlee accounts requested but service not configured - returning empty array');
      // Return empty array with success status when not configured (graceful degradation)
      return NextResponse.json([]);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return empty array if no connection
    if (!user.yodleeConnection) {
      return NextResponse.json([]);
    }

    // Map synced accounts to response format
    const accounts = user.yodleeConnection.syncedAccounts.map(account => ({
      id: account.id,
      accountName: account.accountName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      balance: account.balance,
      currency: account.currency,
      institution: account.institution,
      lastRefreshed: account.lastRefreshed,
      isActive: account.isActive,
    }));

    return NextResponse.json(accounts);
  } catch (error: any) {
    logger.error('Failed to fetch accounts', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}