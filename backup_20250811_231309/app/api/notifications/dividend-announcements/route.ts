import { NextRequest, NextResponse } from 'next/server';
import type { 
  DividendAnnouncementPreferences,
  DividendAnnouncement,
  PushNotificationPayload 
} from '@/types';

// Mock database for dividend announcement preferences (in production, this would be Supabase)
let announcementPreferences: Record<string, DividendAnnouncementPreferences> = {};

/**
 * Get user's dividend announcement preferences
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    const preferences = announcementPreferences[userId] || getDefaultAnnouncementPreferences();

    return NextResponse.json({
      preferences,
      userId
    });

  } catch (error) {
    console.error('Get announcement preferences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Update user's dividend announcement preferences
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, preferences' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (!isValidAnnouncementPreferences(preferences)) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Store user preferences
    announcementPreferences[userId] = preferences;

    return NextResponse.json({
      message: 'Announcement preferences updated successfully',
      preferences,
      userId
    });

  } catch (error) {
    console.error('Update announcement preferences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Test announcement notification
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, announcementType = 'increase', symbol = 'SCHD', oldAmount = 0.65, newAmount = 0.75 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    const changePercent = oldAmount > 0 ? ((newAmount - oldAmount) / oldAmount) * 100 : 100;

    // Create test notification payload
    const payload: PushNotificationPayload = {
      type: `announcement-${announcementType}` as any,
      title: getAnnouncementNotificationTitle(announcementType, symbol, changePercent),
      body: getAnnouncementNotificationBody(announcementType, symbol, oldAmount, newAmount, changePercent),
      data: {
        symbol,
        announcementType,
        changePercent: Math.round(changePercent * 100) / 100,
        url: `/holdings/${symbol}`,
        announcementId: `test-${Date.now()}`
      },
      timestamp: Date.now()
    };

    // In production, this would send to actual push service
    // console.log('Test announcement notification sent:', payload);
    return NextResponse.json({
      message: 'Test announcement notification sent',
      payload
    });

  } catch (error) {
    console.error('Test announcement notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// Helper functions

function getDefaultAnnouncementPreferences(): DividendAnnouncementPreferences {
  return {
    enabled: true,
    holdings: {
      allHoldings: true,
      specificHoldings: []
    },
    announcementTypes: {
      increase: true,
      decrease: true,
      special: true,
      initiation: true,
      suspension: true,
      frequencyChange: false  // Less common, default off
    },
    alertThresholds: {
      enabled: true,
      minChangePercent: 5.0,  // Only alert for changes >= 5%
      minAmount: 0.01         // Only alert for dividends >= $0.01
    },
    deliveryMethods: {
      pushNotification: true,
      inAppCenter: true
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC'
    }
  };
}

function isValidAnnouncementPreferences(preferences: any): boolean {
  return (
    typeof preferences === 'object' &&
    typeof preferences.enabled === 'boolean' &&
    typeof preferences.holdings === 'object' &&
    typeof preferences.holdings.allHoldings === 'boolean' &&
    Array.isArray(preferences.holdings.specificHoldings) &&
    typeof preferences.announcementTypes === 'object' &&
    typeof preferences.alertThresholds === 'object' &&
    typeof preferences.deliveryMethods === 'object' &&
    typeof preferences.quietHours === 'object'
  );
}

function getAnnouncementNotificationTitle(type: string, symbol: string, changePercent: number): string {
  switch (type) {
    case 'increase':
      return `🎉 ${symbol} Dividend Increased`;
    case 'decrease':
      return `📉 ${symbol} Dividend Decreased`;
    case 'special':
      return `💎 ${symbol} Special Dividend`;
    case 'initiation':
      return `🆕 ${symbol} Starts Dividend`;
    case 'suspension':
      return `⚠️ ${symbol} Dividend Suspended`;
    case 'frequency_change':
      return `📅 ${symbol} Payment Frequency Change`;
    default:
      return `📢 ${symbol} Dividend News`;
  }
}

function getAnnouncementNotificationBody(
  type: string, 
  symbol: string, 
  oldAmount: number, 
  newAmount: number, 
  changePercent: number
): string {
  switch (type) {
    case 'increase':
      return `Raised from $${oldAmount.toFixed(3)} to $${newAmount.toFixed(3)} (+${changePercent.toFixed(1)}%)`;
    case 'decrease':
      return `Reduced from $${oldAmount.toFixed(3)} to $${newAmount.toFixed(3)} (${changePercent.toFixed(1)}%)`;
    case 'special':
      return `Special dividend of $${newAmount.toFixed(3)} per share announced`;
    case 'initiation':
      return `New dividend program: $${newAmount.toFixed(3)} per share`;
    case 'suspension':
      return `Dividend payments have been suspended`;
    case 'frequency_change':
      return `Payment frequency has been modified`;
    default:
      return `Dividend announcement for ${symbol}`;
  }
}