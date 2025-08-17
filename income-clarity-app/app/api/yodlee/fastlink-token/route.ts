import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { yodleeClient } from '@/lib/services/yodlee/yodlee-client.service';
import { Logger } from '@/lib/logger';

const logger = new Logger('API:Yodlee:FastLinkToken');

export async function POST(request: NextRequest) {
  try {
    // ROUTE UPDATE TEST - This should appear in logs
    console.log('YODLEE DEBUG: FastLink route accessed with NEW CODE');
    
    // Check Yodlee service configuration first
    if (!yodleeClient.isServiceConfigured()) {
      const configStatus = yodleeClient.getConfigurationStatus();
      logger.warn('Yodlee FastLink token requested but service not configured', configStatus);
      
      return NextResponse.json(
        { 
          error: 'Bank connection service not configured',
          message: 'Bank connections are currently unavailable. Please contact support.',
          configured: false,
          missingVars: configStatus.missingVars
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Check authentication - using same method as /api/auth/me
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'FIXED_AUTH: No session token found' },
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
        { error: 'FIXED_AUTH: Session expired or invalid' },
        { status: 401 }
      );
    }

    const authUser = session.user;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: { yodleeConnection: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    let yodleeUserId: string;
    
    // Check if user already has a Yodlee connection
    if (user.yodleeConnection) {
      yodleeUserId = user.yodleeConnection.yodleeUserId;
      logger.info(`Using existing Yodlee user: ${yodleeUserId}`);
    } else {
      // Create new Yodlee user
      const yodleeUser = await yodleeClient.createUser(user.email);
      yodleeUserId = yodleeUser.id;
      
      // Store connection in database
      await prisma.yodleeConnection.create({
        data: {
          userId: user.id,
          yodleeUserId,
          accessToken: '', // Will be populated after first successful connection
          isActive: true,
        },
      });
      
      logger.info(`Created new Yodlee user: ${yodleeUserId}`);
    }

    // Get user token for FastLink
    const userToken = await yodleeClient.getUserToken(yodleeUserId);
    
    // Return token and FastLink URL
    return NextResponse.json({
      token: userToken,
      fastlinkUrl: process.env.YODLEE_FASTLINK_URL,
      yodleeUserId,
    });
  } catch (error: any) {
    logger.error('Failed to generate FastLink token', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}