/**
 * 🔔 Browser Notification API Endpoint
 * Handles browser notifications for deployment events
 */

import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NotificationPayload {
  level: 'info' | 'success' | 'warning' | 'error' | 'deployment';
  title: string;
  message: string;
  timestamp?: string;
}

// Store recent notifications for retrieval
const recentNotifications: Array<NotificationPayload & { id: string; timestamp: string }> = [];
const MAX_NOTIFICATIONS = 100;

function addNotification(notification: NotificationPayload): string {
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestampedNotification = {
    ...notification,
    id,
    timestamp: notification.timestamp || new Date().toISOString()
  };
  
  // Add to beginning of array
  recentNotifications.unshift(timestampedNotification);
  
  // Trim to max size
  if (recentNotifications.length > MAX_NOTIFICATIONS) {
    recentNotifications.splice(MAX_NOTIFICATIONS);
  }
  
  return id;
}

export async function POST(request: NextRequest) {
  try {
    const payload: NotificationPayload = await request.json();
    
    // Validate payload
    if (!payload.level || !payload.title || !payload.message) {
      return Response.json({
        success: false,
        error: 'Missing required fields: level, title, message'
      }, { status: 400 });
    }
    
    // Validate level
    const validLevels = ['info', 'success', 'warning', 'error', 'deployment'];
    if (!validLevels.includes(payload.level)) {
      return Response.json({
        success: false,
        error: 'Invalid level. Must be one of: ' + validLevels.join(', ')
      }, { status: 400 });
    }
    
    // Store notification
    const notificationId = addNotification(payload);
    
    // Log notification (for debugging)
    const timestamp = new Date().toLocaleString();
    console.log(`🔔 [${timestamp}] ${payload.level.toUpperCase()}: ${payload.title} - ${payload.message}`);
    
    return Response.json({
      success: true,
      id: notificationId,
      message: 'Notification received and stored',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing notification:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to process notification'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), MAX_NOTIFICATIONS);
    const since = url.searchParams.get('since'); // ISO timestamp
    
    let notifications = recentNotifications;
    
    // Filter by since timestamp if provided
    if (since) {
      const sinceTime = new Date(since);
      notifications = notifications.filter(n => new Date(n.timestamp) > sinceTime);
    }
    
    // Apply limit
    notifications = notifications.slice(0, limit);
    
    return Response.json({
      success: true,
      notifications,
      total: notifications.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error retrieving notifications:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to retrieve notifications'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      // Delete specific notification
      const index = recentNotifications.findIndex(n => n.id === id);
      if (index >= 0) {
        recentNotifications.splice(index, 1);
        return Response.json({
          success: true,
          message: 'Notification deleted',
          id
        });
      } else {
        return Response.json({
          success: false,
          error: 'Notification not found'
        }, { status: 404 });
      }
    } else {
      // Clear all notifications
      const deletedCount = recentNotifications.length;
      recentNotifications.splice(0);
      
      return Response.json({
        success: true,
        message: `Cleared ${deletedCount} notifications`,
        deleted_count: deletedCount
      });
    }
    
  } catch (error) {
    console.error('Error deleting notifications:', error);
    
    return Response.json({
      success: false,
      error: 'Failed to delete notifications'
    }, { status: 500 });
  }
}