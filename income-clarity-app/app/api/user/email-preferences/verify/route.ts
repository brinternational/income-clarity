import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  return 'test-user-id';
};

// POST - Send verification email
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Valid email address is required'
      }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    // Update email preferences with new token
    await prisma.emailPreferences.upsert({
      where: { userId },
      update: {
        email,
        emailVerificationToken: verificationToken,
        emailVerified: false,
        emailVerifiedAt: null,
        updatedAt: new Date()
      },
      create: {
        userId,
        email,
        emailVerificationToken: verificationToken,
        emailVerified: false,
        notificationsEnabled: true,
        frequency: 'daily',
        categories: JSON.stringify({
          portfolioAlerts: true,
          dividendNotifications: true,
          taxOptimization: true,
          milestoneAchievements: true,
          systemUpdates: false,
          monthlyReports: true,
          weeklyDigests: false,
          marketAlerts: false,
        })
      }
    });

    // TODO: In production, send actual verification email
    // For now, just return success with a mock verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    
    logger.log(`[MOCK] Verification email would be sent to: ${email}`);
    logger.log(`[MOCK] Verification URL: ${verificationUrl}`);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
      verificationSent: true,
      // Include token in development for testing
      ...(process.env.NODE_ENV === 'development' && { 
        verificationUrl,
        token: verificationToken 
      })
    });

  } catch (error) {
    logger.error('Error sending verification email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send verification email'
    }, { status: 500 });
  }
}

// GET - Verify email with token
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Verification token is required'
      }, { status: 400 });
    }

    // Find email preferences by verification token
    const emailPrefs = await prisma.emailPreferences.findUnique({
      where: {
        emailVerificationToken: token
      }
    });

    if (!emailPrefs) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification token'
      }, { status: 400 });
    }

    // Mark email as verified
    await prisma.emailPreferences.update({
      where: {
        id: emailPrefs.id
      },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null, // Clear token after successful verification
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    logger.error('Error verifying email:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify email'
    }, { status: 500 });
  }
}