import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger'

// Initialize Prisma client
const prisma = new PrismaClient();

// Mock session management - In production, use proper authentication
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  // For development/demo purposes, return a fixed test user ID
  // In production, extract from session/JWT token
  return 'test-user-id';
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user settings from database
    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: userId
      }
    });

    if (!userSettings) {
      // Return default settings if no settings found
      const defaultSettings = {
        theme: 'light',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'America/New_York',
        notifications: {
          dividendAlerts: true,
          milestoneAlerts: true,
          weeklyReport: false,
          priceAlerts: true
        },
        privacy: {
          shareData: false,
          analytics: true
        },
        features: {
          developerMode: false,
          debugLogging: false
        }
      };

      return NextResponse.json({
        success: true,
        settings: defaultSettings
      });
    }

    // Parse JSON fields
    const notifications = userSettings.notifications 
      ? JSON.parse(userSettings.notifications)
      : {
          dividendAlerts: true,
          milestoneAlerts: true,
          weeklyReport: false,
          priceAlerts: true
        };

    const privacy = userSettings.privacy
      ? JSON.parse(userSettings.privacy)
      : {
          shareData: false,
          analytics: true
        };

    const features = userSettings.features
      ? JSON.parse(userSettings.features)
      : {
          developerMode: false,
          debugLogging: false
        };

    const settings = {
      theme: userSettings.theme,
      currency: userSettings.currency,
      locale: userSettings.locale,
      timezone: userSettings.timezone,
      notifications,
      privacy,
      features
    };

    return NextResponse.json({
      success: true,
      settings
    });

  } catch (error) {
    logger.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
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
    const { settings } = body;

    if (!settings) {
      return NextResponse.json({ error: 'Settings data is required' }, { status: 400 });
    }

    // Validate settings structure
    const validatedSettings = {
      theme: settings.theme || 'light',
      currency: settings.currency || 'USD',
      locale: settings.locale || 'en-US',
      timezone: settings.timezone || 'America/New_York',
      notifications: JSON.stringify(settings.notifications || {
        dividendAlerts: true,
        milestoneAlerts: true,
        weeklyReport: false,
        priceAlerts: true
      }),
      privacy: JSON.stringify(settings.privacy || {
        shareData: false,
        analytics: true
      }),
      features: JSON.stringify(settings.features || {
        developerMode: false,
        debugLogging: false
      })
    };

    // Upsert user settings (create or update)
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: userId
      },
      update: {
        theme: validatedSettings.theme,
        currency: validatedSettings.currency,
        locale: validatedSettings.locale,
        timezone: validatedSettings.timezone,
        notifications: validatedSettings.notifications,
        privacy: validatedSettings.privacy,
        features: validatedSettings.features,
        updatedAt: new Date()
      },
      create: {
        userId: userId,
        theme: validatedSettings.theme,
        currency: validatedSettings.currency,
        locale: validatedSettings.locale,
        timezone: validatedSettings.timezone,
        notifications: validatedSettings.notifications,
        privacy: validatedSettings.privacy,
        features: validatedSettings.features
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully',
      settings: {
        theme: userSettings.theme,
        currency: userSettings.currency,
        locale: userSettings.locale,
        timezone: userSettings.timezone,
        notifications: JSON.parse(userSettings.notifications || '{}'),
        privacy: JSON.parse(userSettings.privacy || '{}'),
        features: JSON.parse(userSettings.features || '{}')
      }
    });

  } catch (error) {
    logger.error('Error saving user settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
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