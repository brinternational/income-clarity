import { NextRequest, NextResponse } from 'next/server';
import type { 
  DividendNotification, 
  DividendCalendarEntry, 
  NotificationPreferences,
  PushNotificationPayload 
} from '@/types';

// Mock database (in production, this would be Supabase)
let scheduledNotifications: DividendNotification[] = [];
let userPreferences: Record<string, NotificationPreferences> = {};

// VAPID keys for push notifications (in production, these would be environment variables)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

/**
 * Schedule dividend notifications for a user's holdings
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, holdings, dividendCalendar } = await request.json();

    if (!userId || !holdings || !dividendCalendar) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, holdings, dividendCalendar' },
        { status: 400 }
      );
    }

    // Get user's notification preferences
    const preferences = userPreferences[userId] || getDefaultPreferences();
    
    if (!preferences.enabled) {
      return NextResponse.json({ 
        message: 'Notifications disabled for user', 
        scheduled: 0 
      });
    }

    const now = new Date();
    const scheduledCount = scheduleUserNotifications(userId, holdings, dividendCalendar, preferences, now);

    return NextResponse.json({
      message: `Successfully scheduled ${scheduledCount} notifications`,
      scheduled: scheduledCount,
      userId
    });

  } catch (error) {
    console.error('Notification scheduling error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Get scheduled notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    let notifications = scheduledNotifications.filter(n => n.userId === userId);

    // Filter by status if provided
    if (status) {
      notifications = notifications.filter(n => n.status === status);
    }

    // Filter by type if provided
    if (type) {
      notifications = notifications.filter(n => n.notificationType === type);
    }

    return NextResponse.json({
      notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Update user notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, preferences' },
        { status: 400 }
      );
    }

    // Validate preferences structure
    if (!isValidPreferences(preferences)) {
      return NextResponse.json(
        { error: 'Invalid preferences format' },
        { status: 400 }
      );
    }

    // Store user preferences
    userPreferences[userId] = preferences;

    // If notifications are disabled, cancel all scheduled notifications
    if (!preferences.enabled) {
      const cancelledCount = cancelUserNotifications(userId);
      return NextResponse.json({
        message: `Preferences updated. ${cancelledCount} notifications cancelled.`,
        preferences
      });
    }

    return NextResponse.json({
      message: 'Preferences updated successfully',
      preferences
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Send immediate test notification
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId, type = 'generic', symbol, amount } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId required' },
        { status: 400 }
      );
    }

    // Create test notification payload
    const payload: PushNotificationPayload = {
      type: type as any,
      title: getTestNotificationTitle(type, symbol),
      body: getTestNotificationBody(type, symbol, amount),
      data: {
        symbol,
        amount,
        url: symbol ? `/holdings/${symbol}` : '/dashboard'
      },
      timestamp: Date.now()
    };

    // In production, this would send to actual push service
    // console.log('Test notification sent:', payload);
    return NextResponse.json({
      message: 'Test notification sent',
      payload
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

// Helper functions

function scheduleUserNotifications(
  userId: string,
  holdings: any[],
  dividendCalendar: DividendCalendarEntry[],
  preferences: NotificationPreferences,
  now: Date
): number {
  let scheduledCount = 0;

  for (const holding of holdings) {
    const calendarEntries = dividendCalendar.filter(entry => entry.symbol === holding.ticker);
    
    for (const entry of calendarEntries) {
      const exDate = new Date(entry.exDate);
      
      // Only schedule for future dates
      if (exDate <= now) continue;

      // Calculate expected dividend payment
      const totalDividend = holding.shares * entry.dividendAmount;

      // Schedule 24-hour warning
      if (preferences.types.exDividend24h) {
        const warningTime = new Date(exDate);
        warningTime.setDate(warningTime.getDate() - 1);
        warningTime.setHours(16, 0, 0, 0); // 4 PM day before
        
        if (warningTime > now && !isInQuietHours(warningTime, preferences)) {
          scheduledNotifications.push(createNotification(
            userId,
            holding,
            entry,
            totalDividend,
            'ex-dividend-24h',
            warningTime
          ));
          scheduledCount++;
        }
      }

      // Schedule morning reminder
      if (preferences.types.exDividendMorning) {
        const morningTime = new Date(exDate);
        morningTime.setHours(8, 0, 0, 0); // 8 AM on ex-date
        
        if (morningTime > now && !isInQuietHours(morningTime, preferences)) {
          scheduledNotifications.push(createNotification(
            userId,
            holding,
            entry,
            totalDividend,
            'ex-dividend-morning',
            morningTime
          ));
          scheduledCount++;
        }
      }
    }
  }

  // Schedule weekly summaries if enabled
  if (preferences.types.weeklySummary) {
    scheduleWeeklySummaries(userId, holdings, dividendCalendar, preferences, now);
    scheduledCount++; // Simplified count
  }

  return scheduledCount;
}

function createNotification(
  userId: string,
  holding: any,
  calendarEntry: DividendCalendarEntry,
  totalDividend: number,
  type: 'ex-dividend-24h' | 'ex-dividend-morning' | 'weekly-summary' | 'dividend-payment',
  scheduledTime: Date
): DividendNotification {
  return {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    holdingId: holding.id,
    symbol: holding.ticker,
    companyName: calendarEntry.companyName || holding.ticker,
    exDate: calendarEntry.exDate,
    recordDate: calendarEntry.recordDate,
    payDate: calendarEntry.payDate,
    dividendAmount: calendarEntry.dividendAmount,
    shares: holding.shares,
    totalDividend,
    notificationType: type,
    scheduledTime: scheduledTime.toISOString(),
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function scheduleWeeklySummaries(
  userId: string,
  holdings: any[],
  dividendCalendar: DividendCalendarEntry[],
  preferences: NotificationPreferences,
  now: Date
): void {
  // Schedule for next 4 Sunday evenings
  for (let i = 0; i < 4; i++) {
    const nextSunday = getNextSunday(now, i);
    nextSunday.setHours(19, 0, 0, 0); // 7 PM

    if (!isInQuietHours(nextSunday, preferences)) {
      // Create weekly summary notification
      scheduledNotifications.push({
        id: `weekly-${nextSunday.getTime()}-${userId}`,
        userId,
        holdingId: 'summary',
        symbol: 'SUMMARY',
        companyName: 'Weekly Summary',
        exDate: nextSunday.toISOString(),
        recordDate: nextSunday.toISOString(),
        payDate: nextSunday.toISOString(),
        dividendAmount: 0,
        shares: 0,
        totalDividend: calculateWeeklyDividendTotal(holdings, dividendCalendar, nextSunday),
        notificationType: 'weekly-summary',
        scheduledTime: nextSunday.toISOString(),
        status: 'scheduled',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }
}

function isInQuietHours(time: Date, preferences: NotificationPreferences): boolean {
  if (!preferences.quietHours.enabled) return false;

  const timeStr = time.toTimeString().slice(0, 5); // "HH:MM" format
  const start = preferences.quietHours.start;
  const end = preferences.quietHours.end;

  // Handle overnight quiet hours (e.g., 22:00 to 08:00)
  if (start > end) {
    return timeStr >= start || timeStr <= end;
  } else {
    return timeStr >= start && timeStr <= end;
  }
}

function getNextSunday(date: Date, weeksOffset: number = 0): Date {
  const nextSunday = new Date(date);
  const daysUntilSunday = (7 - date.getDay()) % 7;
  nextSunday.setDate(date.getDate() + daysUntilSunday + (weeksOffset * 7));
  return nextSunday;
}

function calculateWeeklyDividendTotal(
  holdings: any[],
  dividendCalendar: DividendCalendarEntry[],
  weekDate: Date
): number {
  const weekStart = new Date(weekDate);
  weekStart.setDate(weekDate.getDate() - 7);
  
  let total = 0;
  for (const holding of holdings) {
    const relevantDividends = dividendCalendar.filter(entry => {
      if (entry.symbol !== holding.ticker) return false;
      const exDate = new Date(entry.exDate);
      return exDate >= weekStart && exDate < weekDate;
    });
    
    total += relevantDividends.reduce((sum, entry) => 
      sum + (holding.shares * entry.dividendAmount), 0);
  }
  
  return total;
}

function cancelUserNotifications(userId: string): number {
  const initialCount = scheduledNotifications.length;
  scheduledNotifications = scheduledNotifications.filter(n => n.userId !== userId);
  return initialCount - scheduledNotifications.length;
}

function isValidPreferences(preferences: any): boolean {
  return (
    typeof preferences === 'object' &&
    typeof preferences.enabled === 'boolean' &&
    typeof preferences.types === 'object' &&
    typeof preferences.quietHours === 'object'
  );
}

function getDefaultPreferences(): NotificationPreferences {
  return {
    enabled: false,
    types: {
      exDividend24h: true,
      exDividendMorning: true,
      weeklySummary: false,
      dividendPayments: true,
      portfolioAlerts: false
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: 'UTC'
    },
    platforms: {
      web: true,
      mobile: true
    }
  };
}

function getTestNotificationTitle(type: string, symbol?: string): string {
  switch (type) {
    case 'ex-dividend-24h':
      return `Ex-dividend tomorrow: ${symbol || 'Stock'}`;
    case 'ex-dividend-morning':
      return `Today is ex-dividend: ${symbol || 'Stock'}`;
    case 'weekly-summary':
      return 'Weekly Dividend Summary';
    case 'dividend-payment':
      return `Dividend payment: ${symbol || 'Stock'}`;
    default:
      return 'Income Clarity Test';
  }
}

function getTestNotificationBody(type: string, symbol?: string, amount?: number): string {
  switch (type) {
    case 'ex-dividend-24h':
      return `Own by market close to receive ${amount ? `$${amount.toFixed(2)}` : 'payment'}`;
    case 'ex-dividend-morning':
      return `Last chance to buy for ${amount ? `$${amount.toFixed(2)}` : 'this'} payment`;
    case 'weekly-summary':
      return `${symbol ? `${symbol} and others` : 'Multiple stocks'} going ex-dividend this week`;
    case 'dividend-payment':
      return `${amount ? `$${amount.toFixed(2)}` : 'Payment'} received in your account`;
    default:
      return 'This is a test notification from Income Clarity';
  }
}