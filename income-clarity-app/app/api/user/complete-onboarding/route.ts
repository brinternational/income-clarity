import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session token' },
        { status: 401 }
      );
    }

    // Find session with user
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    // Update user to mark onboarding as completed
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        onboarding_completed: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        onboarding_completed: updatedUser.onboarding_completed,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    logger.error('Complete onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}