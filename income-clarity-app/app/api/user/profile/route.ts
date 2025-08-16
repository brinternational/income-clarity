import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger'

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    logger.log('🔍 Profile API: Starting request');
    
    // For development, get the test user by email since we know it exists
    let user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    logger.log('👤 User found:', user ? `ID: ${user.id}` : 'None');

    // If user doesn't exist, return error - no auto-creation in production
    if (!user) {
      logger.error('❌ User not found with email: test@example.com');
      return NextResponse.json({ 
        error: 'User not found. Please run setup-test-user.js script.' 
      }, { status: 404 });
    }

    // Parse settings JSON if it exists
    let parsedSettings: any = {};
    try {
      if (user.settings) {
        parsedSettings = JSON.parse(user.settings);
        logger.log('⚙️ Parsed settings:', parsedSettings);
      }
    } catch (e) {
      logger.error('❌ Failed to parse user settings:', e);
      parsedSettings = {};
    }

    // Parse tax profile JSON if it exists
    let parsedTaxProfile: any = {};
    try {
      if (user.taxProfile) {
        parsedTaxProfile = JSON.parse(user.taxProfile);
        logger.log('🏛️ Parsed tax profile:', parsedTaxProfile);
      }
    } catch (e) {
      logger.error('❌ Failed to parse tax profile:', e);
      parsedTaxProfile = {};
    }

    // Try to get separate TaxProfile and UserSettings if they exist
    // (These may exist for users who have updated their profiles)
    const [taxProfile, userSettings] = await Promise.allSettled([
      prisma.taxProfile.findUnique({ where: { userId: user.id } }),
      prisma.userSettings.findUnique({ where: { userId: user.id } })
    ]);

    logger.log('📊 Separate records found:');
    logger.log('- TaxProfile:', taxProfile.status === 'fulfilled' ? 'Found' : 'Not found');
    logger.log('- UserSettings:', userSettings.status === 'fulfilled' ? 'Found' : 'Not found');

    // Build response with fallbacks
    const responseData = {
      fullName: parsedSettings?.fullName || '',
      email: user.email,
      state: (taxProfile.status === 'fulfilled' && taxProfile.value?.state) || 
             parsedTaxProfile?.location || 
             '',
      filingStatus: (taxProfile.status === 'fulfilled' && taxProfile.value?.filingStatus) || 
                   parsedTaxProfile?.filingStatus || 
                   'single',
      federalBracket: (taxProfile.status === 'fulfilled' && taxProfile.value?.federalBracket) || 
                     parsedTaxProfile?.federalRate || 
                     0.22,
      stateBracket: (taxProfile.status === 'fulfilled' && taxProfile.value?.stateBracket) || 
                   parsedTaxProfile?.stateRate || 
                   0,
      monthlyExpenses: parsedSettings?.monthlyExpenses || 0,
      targetIncome: parsedSettings?.targetIncome || 0,
      retirementAge: parsedSettings?.retirementAge || 65,
      currency: (userSettings.status === 'fulfilled' && userSettings.value?.currency) || 
               parsedSettings?.currency || 
               'USD',
      timezone: (userSettings.status === 'fulfilled' && userSettings.value?.timezone) || 
               parsedSettings?.timezone || 
               'America/New_York'
    };

    logger.log('✅ Profile API: Response data prepared');
    return NextResponse.json(responseData);
    
  } catch (error) {
    logger.error('❌ Profile fetch error:', error);
    logger.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
    
    // Return detailed error in development
    return NextResponse.json({ 
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.log('💾 Profile API: Starting POST request');
    const data = await request.json();
    logger.log('📨 Profile update data:', data);
    
    // Get the test user by email
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      logger.error('❌ User not found for profile update');
      return NextResponse.json({ 
        error: 'User not found. Please run setup-test-user.js script.' 
      }, { status: 404 });
    }

    const userId = user.id;
    logger.log('👤 Updating profile for user ID:', userId);
    
    // Validate required fields
    if (!data.fullName || !data.email || !data.state) {
      logger.error('❌ Missing required fields:', { fullName: !!data.fullName, email: !!data.email, state: !!data.state });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prepare settings data
    const settingsData = {
      fullName: data.fullName,
      monthlyExpenses: data.monthlyExpenses || 0,
      targetIncome: data.targetIncome || 0,
      retirementAge: data.retirementAge || 65,
      currency: data.currency || 'USD',
      timezone: data.timezone || 'America/New_York'
    };

    // Prepare tax profile data
    const taxProfileData = {
      location: data.state,
      filingStatus: data.filingStatus || 'single',
      federalRate: data.federalBracket || 0.22,
      stateRate: data.stateBracket || 0
    };

    logger.log('📊 Updating user settings:', settingsData);
    logger.log('🏛️ Updating tax profile:', taxProfileData);

    // Update user basic info and settings in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user basic info and settings JSON
      await tx.user.update({
        where: { id: userId },
        data: {
          email: data.email,
          settings: JSON.stringify(settingsData),
          taxProfile: JSON.stringify(taxProfileData)
        }
      });
      
      // Update or create separate tax profile record
      await tx.taxProfile.upsert({
        where: { userId },
        update: {
          state: data.state,
          filingStatus: data.filingStatus || 'single',
          federalBracket: data.federalBracket || 0.22,
          stateBracket: data.stateBracket || 0,
          effectiveRate: (data.federalBracket || 0.22) + (data.stateBracket || 0),
          marginalRate: (data.federalBracket || 0.22) + (data.stateBracket || 0)
        },
        create: {
          userId,
          state: data.state,
          filingStatus: data.filingStatus || 'single',
          federalBracket: data.federalBracket || 0.22,
          stateBracket: data.stateBracket || 0,
          effectiveRate: (data.federalBracket || 0.22) + (data.stateBracket || 0),
          marginalRate: (data.federalBracket || 0.22) + (data.stateBracket || 0)
        }
      });

      // Update or create user settings record
      await tx.userSettings.upsert({
        where: { userId },
        update: {
          currency: data.currency || 'USD',
          timezone: data.timezone || 'America/New_York'
        },
        create: {
          userId,
          currency: data.currency || 'USD',
          timezone: data.timezone || 'America/New_York'
        }
      });
    });
    
    logger.log('✅ Profile update completed successfully');
    return NextResponse.json({ success: true });
    
  } catch (error) {
    logger.error('❌ Profile save error:', error);
    logger.error('Stack trace:', error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json({ 
      error: 'Failed to save profile',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}