import { NextRequest, NextResponse } from 'next/server';
import type { DividendAnnouncement, PushNotificationPayload } from '@/types';

// Mock database for dividend announcements (in production, this would be Supabase)
let dividendAnnouncements: DividendAnnouncement[] = [];

/**
 * Get dividend announcements with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    let announcements = dividendAnnouncements.filter(a => a.userId === userId);

    // Filter by symbol if provided
    if (symbol) {
      announcements = announcements.filter(a => 
        a.symbol.toLowerCase() === symbol.toLowerCase()
      );
    }

    // Filter by announcement type if provided
    if (type) {
      announcements = announcements.filter(a => a.announcementType === type);
    }

    // Sort by announcement date (most recent first)
    announcements.sort((a, b) => 
      new Date(b.announcementDate).getTime() - new Date(a.announcementDate).getTime()
    );

    // Apply pagination
    const paginatedAnnouncements = announcements.slice(offset, offset + limit);

    return NextResponse.json({
      announcements: paginatedAnnouncements,
      total: announcements.length,
      limit,
      offset,
      hasMore: offset + limit < announcements.length
    });

  } catch (error) {
    console.error('Get dividend announcements error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Create a new dividend announcement (typically called by data service)
 */
export async function POST(request: NextRequest) {
  try {
    const announcementData = await request.json();

    if (!announcementData.userId || !announcementData.symbol || !announcementData.announcementType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, symbol, announcementType' },
        { status: 400 }
      );
    }

    const announcement: DividendAnnouncement = {
      id: `ann-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: announcementData.userId,
      symbol: announcementData.symbol.toUpperCase(),
      companyName: announcementData.companyName || announcementData.symbol,
      announcementType: announcementData.announcementType,
      oldAmount: announcementData.oldAmount || undefined,
      newAmount: announcementData.newAmount || 0,
      percentageChange: announcementData.percentageChange || undefined,
      oldFrequency: announcementData.oldFrequency || undefined,
      newFrequency: announcementData.newFrequency || undefined,
      announcementDate: announcementData.announcementDate || new Date().toISOString(),
      effectiveDate: announcementData.effectiveDate || new Date().toISOString(),
      recordDate: announcementData.recordDate || undefined,
      payDate: announcementData.payDate || undefined,
      description: announcementData.description || '',
      source: announcementData.source || 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Calculate percentage change if not provided
    if (!announcement.percentageChange && announcement.oldAmount && announcement.newAmount) {
      announcement.percentageChange = ((announcement.newAmount - announcement.oldAmount) / announcement.oldAmount) * 100;
    }

    // Store the announcement
    dividendAnnouncements.push(announcement);

    return NextResponse.json({
      message: 'Dividend announcement created successfully',
      announcement
    });

  } catch (error) {
    console.error('Create dividend announcement error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}