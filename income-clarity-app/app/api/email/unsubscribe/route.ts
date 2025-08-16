import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EmailNotificationCategories, DEFAULT_EMAIL_CATEGORIES } from '@/types/email-preferences';
import { logger } from '@/lib/logger'

const prisma = new PrismaClient();

/**
 * Handle unsubscribe requests from email links
 * GET /api/email/unsubscribe?userId=xxx&category=yyy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const category = searchParams.get('category');
    
    if (!userId) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Unsubscribe Error</h1>
          <p class="error">Invalid unsubscribe link. Please contact support.</p>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }
    
    // Get current preferences
    const currentPrefs = await prisma.emailPreferences.findUnique({
      where: { userId }
    });
    
    if (!currentPrefs) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe - Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .warning { color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>User Not Found</h1>
          <p class="warning">No email preferences found for this user.</p>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' }, status: 404 }
      );
    }
    
    const categories = currentPrefs.categories 
      ? JSON.parse(currentPrefs.categories) 
      : DEFAULT_EMAIL_CATEGORIES;
    
    let unsubscribeAction = '';
    let updatedCategories = categories;
    
    if (category && category in categories) {
      // Unsubscribe from specific category
      updatedCategories = {
        ...categories,
        [category]: false
      };
      unsubscribeAction = `unsubscribed from ${category} notifications`;
    } else {
      // Unsubscribe from all
      updatedCategories = Object.keys(categories).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {} as EmailNotificationCategories);
      unsubscribeAction = 'unsubscribed from all email notifications';
    }
    
    // Update database
    await prisma.emailPreferences.update({
      where: { userId },
      data: {
        categories: JSON.stringify(updatedCategories),
        updatedAt: new Date()
      }
    });
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Successfully Unsubscribed</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            line-height: 1.6;
            color: #374151;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            text-align: center;
          }
          .success { 
            color: #10b981; 
            font-size: 48px; 
            margin-bottom: 20px;
          }
          h1 { color: #1f2937; margin-bottom: 16px; }
          p { margin-bottom: 16px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 16px 8px;
          }
          .button-secondary {
            background: #6b7280;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Successfully Unsubscribed</h1>
          <p>You have been ${unsubscribeAction}.</p>
          <p>You can update your email preferences at any time by visiting your account settings.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings" class="button">
            Update Preferences
          </a>
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button button-secondary">
            Return to Dashboard
          </a>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p>If you unsubscribed by mistake, you can re-enable notifications in your settings.</p>
          </div>
        </div>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
    
  } catch (error) {
    logger.error('Unsubscribe error:', error);
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe - Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Unsubscribe Error</h1>
        <p class="error">An error occurred while processing your unsubscribe request. Please try again later or contact support.</p>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}

/**
 * Handle POST requests for unsubscribing (from settings page)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category } = body;
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get current preferences
    const currentPrefs = await prisma.emailPreferences.findUnique({
      where: { userId }
    });
    
    if (!currentPrefs) {
      return NextResponse.json(
        { success: false, error: 'User preferences not found' },
        { status: 404 }
      );
    }
    
    const categories = currentPrefs.categories 
      ? JSON.parse(currentPrefs.categories) 
      : DEFAULT_EMAIL_CATEGORIES;
    
    let updatedCategories = categories;
    
    if (category && category in categories) {
      // Unsubscribe from specific category
      updatedCategories = {
        ...categories,
        [category]: false
      };
    } else {
      // Unsubscribe from all
      updatedCategories = Object.keys(categories).reduce((acc, key) => ({
        ...acc,
        [key]: false
      }), {} as EmailNotificationCategories);
    }
    
    // Update database
    await prisma.emailPreferences.update({
      where: { userId },
      data: {
        categories: JSON.stringify(updatedCategories),
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: category 
        ? `Unsubscribed from ${category} notifications`
        : 'Unsubscribed from all email notifications'
    });
    
  } catch (error) {
    logger.error('Unsubscribe POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process unsubscribe request' },
      { status: 500 }
    );
  }
}