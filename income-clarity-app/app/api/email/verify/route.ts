import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { emailService } from '@/lib/services/email/email.service';
import { logger } from '@/lib/logger'

const prisma = new PrismaClient();

/**
 * Send email verification
 * POST /api/email/verify
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email } = body;
    
    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'User ID and email are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!emailService.isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/email/verify?token=${verificationToken}&userId=${userId}`;
    
    // Update user preferences with verification token
    await prisma.emailPreferences.upsert({
      where: { userId },
      update: {
        email,
        emailVerified: false,
        emailVerificationToken: verificationToken,
        updatedAt: new Date()
      },
      create: {
        userId,
        email,
        emailVerified: false,
        emailVerificationToken: verificationToken,
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
    
    // Send verification email
    const verificationResult = await emailService.sendEmail({
      to: email,
      subject: 'Verify your email - Income Clarity',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Email Verification</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #374151;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1f2937 0%, #3b82f6 100%);
              color: white;
              padding: 32px 24px;
              text-align: center;
            }
            .content {
              padding: 32px 24px;
            }
            .button {
              display: inline-block;
              padding: 16px 32px;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
              text-align: center;
            }
            .footer {
              background: #f8fafc;
              padding: 24px;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .code {
              background: #f1f5f9;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 16px;
              text-align: center;
              margin: 16px 0;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verify Your Email</h1>
              <p>Welcome to Income Clarity!</p>
            </div>
            
            <div class="content">
              <p>Thank you for joining Income Clarity! To complete your account setup and start receiving portfolio notifications, please verify your email address.</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <div class="code">${verificationUrl}</div>
              
              <p><strong>Why verify your email?</strong></p>
              <ul>
                <li>📊 Receive dividend payment notifications</li>
                <li>🎯 Get notified when you reach FIRE milestones</li>
                <li>📈 Weekly portfolio performance summaries</li>
                <li>💡 Tax optimization opportunities</li>
              </ul>
              
              <p style="color: #6b7280; font-size: 14px;">This verification link expires in 24 hours. If you didn't request this, please ignore this email.</p>
            </div>
            
            <div class="footer">
              <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
Verify Your Email - Income Clarity

Thank you for joining Income Clarity! To complete your account setup and start receiving portfolio notifications, please verify your email address.

Click here to verify: ${verificationUrl}

Why verify your email?
- Receive dividend payment notifications
- Get notified when you reach FIRE milestones
- Weekly portfolio performance summaries
- Tax optimization opportunities

This verification link expires in 24 hours. If you didn't request this, please ignore this email.

---
Income Clarity - Your Path to Financial Independence
      `,
      category: 'systemUpdates'
    });
    
    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully'
    });
    
  } catch (error) {
    logger.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

/**
 * Handle email verification
 * GET /api/email/verify?token=xxx&userId=yyy
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    
    if (!token || !userId) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification - Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .error { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Verification Error</h1>
          <p class="error">Invalid verification link. Please contact support.</p>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' }, status: 400 }
      );
    }
    
    // Find user with matching token
    const emailPrefs = await prisma.emailPreferences.findFirst({
      where: {
        userId,
        emailVerificationToken: token,
        emailVerified: false
      }
    });
    
    if (!emailPrefs) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification - Invalid</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .warning { color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>Invalid Verification Link</h1>
          <p class="warning">This verification link is invalid or has already been used.</p>
        </body>
        </html>
        `,
        { headers: { 'Content-Type': 'text/html' }, status: 404 }
      );
    }
    
    // Mark email as verified
    await prisma.emailPreferences.update({
      where: { id: emailPrefs.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        updatedAt: new Date()
      }
    });
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified Successfully</title>
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
          .features {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: left;
          }
          .features ul {
            margin: 0;
            padding-left: 20px;
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
          <h1>Email Verified Successfully!</h1>
          <p>Your email address has been verified and you're now ready to receive notifications from Income Clarity.</p>
          
          <div class="features">
            <h3 style="margin: 0 0 12px 0; color: #166534;">🎉 You'll now receive:</h3>
            <ul>
              <li>💰 Dividend payment notifications</li>
              <li>🎯 FIRE milestone achievements</li>
              <li>📊 Weekly portfolio summaries</li>
              <li>💡 Tax optimization opportunities</li>
            </ul>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="button">
            Go to Dashboard
          </a>
          
          <div class="footer">
            <p><strong>Income Clarity</strong> - Your Path to Financial Independence</p>
            <p>You can manage your notification preferences in your account settings.</p>
          </div>
        </div>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' } }
    );
    
  } catch (error) {
    logger.error('Email verification GET error:', error);
    
    return new Response(
      `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verification - Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          .error { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Verification Error</h1>
        <p class="error">An error occurred while verifying your email. Please try again later or contact support.</p>
      </body>
      </html>
      `,
      { headers: { 'Content-Type': 'text/html' }, status: 500 }
    );
  }
}