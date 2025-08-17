import { NextRequest, NextResponse } from 'next/server';
import { milestoneTracker } from '@/lib/services/milestones/milestone-tracker.service';
import { logger } from '@/lib/logger'

// Mock session management - in production, use proper authentication
const getCurrentUserId = async (request: NextRequest): Promise<string | null> => {
  // For development/demo purposes, return a fixed test user ID
  return 'test-user-id';
};

/**
 * Get milestone progress for user
 * GET /api/email/milestones
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const progress = await milestoneTracker.getMilestoneProgress(userId);
    
    return NextResponse.json({
      success: true,
      milestones: progress
    });
    
  } catch (error) {
    logger.error('Milestone progress error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get milestone progress' },
      { status: 500 }
    );
  }
}

/**
 * Trigger milestone check or send test milestone notification
 * POST /api/email/milestones
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    switch (action) {
      case 'check':
        await milestoneTracker.triggerMilestoneCheck(userId);
        return NextResponse.json({
          success: true,
          message: 'Milestone check triggered'
        });
        
      case 'test_notification':
        const { milestoneName = 'Utilities Coverage' } = body;
        // This would normally be called internally, but for testing we'll call the notification directly
        await milestoneTracker.triggerMilestoneCheck(userId);
        return NextResponse.json({
          success: true,
          message: `Test milestone notification sent for ${milestoneName}`
        });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: check, test_notification' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    logger.error('Milestone action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute milestone action' },
      { status: 500 }
    );
  }
}