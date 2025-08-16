import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EmailPreferences, DEFAULT_EMAIL_CATEGORIES, EmailNotificationCategories } from '@/types/email-preferences';
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management - In production, use proper authentication
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  // For development/demo purposes, return a fixed test user ID
  // In production, extract from session/JWT token
  return 'test-user-id';
};

// Utility function to generate verification token
const generateVerificationToken = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// GET - Fetch user email preferences
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Fetch email preferences from database
    const emailPrefs = await prisma.emailPreferences.findUnique({
      where: {
        userId: userId
      }
    });

    if (!emailPrefs) {
      // Return default preferences if no preferences found
      const defaultPreferences = {
        id: '',
        userId,
        email: null,
        emailVerified: false,
        notificationsEnabled: false,
        frequency: 'daily' as const,
        categories: DEFAULT_EMAIL_CATEGORIES,
        lastEmailSent: null,
        emailVerifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      return NextResponse.json({
        success: true,
        preferences: defaultPreferences
      });
    }

    // Parse JSON categories
    const categories: EmailNotificationCategories = emailPrefs.categories 
      ? JSON.parse(emailPrefs.categories)
      : DEFAULT_EMAIL_CATEGORIES;

    const preferences: EmailPreferences = {
      id: emailPrefs.id,
      userId: emailPrefs.userId,
      email: emailPrefs.email,
      emailVerified: emailPrefs.emailVerified,
      notificationsEnabled: emailPrefs.notificationsEnabled,
      frequency: emailPrefs.frequency as 'immediate' | 'daily' | 'weekly',
      categories,
      lastEmailSent: emailPrefs.lastEmailSent,
      emailVerifiedAt: emailPrefs.emailVerifiedAt,
      createdAt: emailPrefs.createdAt,
      updatedAt: emailPrefs.updatedAt
    };

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    logger.error('Error fetching email preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch email preferences'
    }, { status: 500 });
  }
}

// POST - Update user email preferences
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
    const { email, notificationsEnabled, frequency, categories } = body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate frequency
    if (frequency && !['immediate', 'daily', 'weekly'].includes(frequency)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid frequency value'
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // Handle email changes
    if (email !== undefined) {
      const currentPrefs = await prisma.emailPreferences.findUnique({
        where: { userId }
      });

      // If email is changing, reset verification status
      if (currentPrefs?.email !== email) {
        updateData.email = email;
        updateData.emailVerified = false;
        updateData.emailVerifiedAt = null;
        if (email) {
          updateData.emailVerificationToken = generateVerificationToken();
        } else {
          updateData.emailVerificationToken = null;
        }
      }
    }

    // Update other fields
    if (notificationsEnabled !== undefined) {
      updateData.notificationsEnabled = notificationsEnabled;
    }
    if (frequency !== undefined) {
      updateData.frequency = frequency;
    }
    if (categories !== undefined) {
      updateData.categories = JSON.stringify(categories);
    }

    // Upsert email preferences (create or update)
    const emailPrefs = await prisma.emailPreferences.upsert({
      where: {
        userId: userId
      },
      update: updateData,
      create: {
        userId: userId,
        email: email || null,
        emailVerified: false,
        emailVerificationToken: email ? generateVerificationToken() : null,
        notificationsEnabled: notificationsEnabled ?? true,
        frequency: frequency || 'daily',
        categories: JSON.stringify(categories || DEFAULT_EMAIL_CATEGORIES),
      }
    });

    // Parse categories for response
    const parsedCategories: EmailNotificationCategories = emailPrefs.categories 
      ? JSON.parse(emailPrefs.categories)
      : DEFAULT_EMAIL_CATEGORIES;

    const preferences: EmailPreferences = {
      id: emailPrefs.id,
      userId: emailPrefs.userId,
      email: emailPrefs.email,
      emailVerified: emailPrefs.emailVerified,
      notificationsEnabled: emailPrefs.notificationsEnabled,
      frequency: emailPrefs.frequency as 'immediate' | 'daily' | 'weekly',
      categories: parsedCategories,
      lastEmailSent: emailPrefs.lastEmailSent,
      emailVerifiedAt: emailPrefs.emailVerifiedAt,
      createdAt: emailPrefs.createdAt,
      updatedAt: emailPrefs.updatedAt
    };

    return NextResponse.json({
      success: true,
      message: 'Email preferences updated successfully',
      preferences
    });

  } catch (error) {
    logger.error('Error updating email preferences:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update email preferences'
    }, { status: 500 });
  }
}

// Handle unsupported methods
export async function PUT() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ 
    success: false, 
    error: 'Method not allowed' 
  }, { status: 405 });
}