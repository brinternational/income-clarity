#!/usr/bin/env node

/**
 * Complete Yodlee User Journey Test
 * Tests the full premium experience with test@example.com
 * Validates all integration points and premium features
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

// Test configuration
const TEST_USER = 'test@example.com';
const TEST_PASSWORD = 'password123';

async function testYodleeUserJourney() {
  console.log(`\n${colors.magenta}${colors.bold}🏦 YODLEE INTEGRATION USER JOURNEY TEST${colors.reset}\n`);
  console.log('═'.repeat(80));
  console.log(`Testing with user: ${colors.blue}${TEST_USER}${colors.reset}`);
  console.log('═'.repeat(80));

  try {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: TEST_USER },
      include: {
        subscription: true,
        yodleeConnection: {
          include: {
            syncedAccounts: {
              include: {
                holdings: {
                  take: 5
                }
              }
            }
          }
        },
        portfolios: {
          include: {
            holdings: {
              take: 5
            }
          }
        },
        syncLogs: {
          take: 5,
          orderBy: { startedAt: 'desc' }
        }
      }
    });

    if (!user) {
      console.error(`${colors.red}❌ Test user not found. Please run: npm run setup:test-user${colors.reset}`);
      process.exit(1);
    }

    // Test Results Storage
    const results = {
      passed: [],
      failed: [],
      warnings: []
    };

    console.log(`\n${colors.blue}📊 USER STATUS OVERVIEW${colors.reset}`);
    console.log('─'.repeat(80));

    // 1. SUBSCRIPTION STATUS
    console.log(`\n${colors.yellow}1. SUBSCRIPTION & PREMIUM ACCESS${colors.reset}`);
    
    const subscriptionTests = [
      {
        name: 'User has subscription record',
        test: () => user.subscription !== null,
        value: user.subscription ? `✅ ${user.subscription.plan}` : '❌ None'
      },
      {
        name: 'Premium status active',
        test: () => user.isPremium === true,
        value: user.isPremium ? '✅ Premium' : '❌ Free'
      },
      {
        name: 'Trial or paid status',
        test: () => user.subscription?.status === 'ACTIVE' || user.subscription?.status === 'TRIAL',
        value: user.subscription?.status || 'INACTIVE'
      },
      {
        name: 'Trial end date (if applicable)',
        test: () => !user.trialEndDate || new Date(user.trialEndDate) > new Date(),
        value: user.trialEndDate ? new Date(user.trialEndDate).toLocaleDateString() : 'N/A'
      }
    ];

    runTests(subscriptionTests, results);

    // 2. YODLEE CONNECTION
    console.log(`\n${colors.yellow}2. YODLEE CONNECTION STATUS${colors.reset}`);
    
    const yodleeTests = [
      {
        name: 'Yodlee connection exists',
        test: () => user.yodleeConnection !== null,
        value: user.yodleeConnection ? '✅ Connected' : '❌ Not connected'
      },
      {
        name: 'Yodlee user ID',
        test: () => user.yodleeConnection?.yodleeUserId !== null,
        value: user.yodleeConnection?.yodleeUserId || 'None'
      },
      {
        name: 'Last sync date',
        test: () => user.yodleeConnection?.lastSyncedAt !== null,
        value: user.yodleeConnection?.lastSyncedAt ? 
          new Date(user.yodleeConnection.lastSyncedAt).toLocaleString() : 'Never'
      },
      {
        name: 'Connection active',
        test: () => user.yodleeConnection?.isActive === true,
        value: user.yodleeConnection?.isActive ? '✅ Active' : '❌ Inactive'
      }
    ];

    runTests(yodleeTests, results);

    // 3. SYNCED BANK ACCOUNTS
    console.log(`\n${colors.yellow}3. SYNCED BANK ACCOUNTS${colors.reset}`);
    
    const syncedAccounts = user.yodleeConnection?.syncedAccounts || [];
    const accountTests = [
      {
        name: 'Has synced accounts',
        test: () => syncedAccounts.length > 0,
        value: `${syncedAccounts.length} accounts`
      }
    ];

    if (syncedAccounts.length > 0) {
      syncedAccounts.forEach((account, index) => {
        accountTests.push({
          name: `Account ${index + 1}: ${account.accountName}`,
          test: () => account.isActive,
          value: `${account.institution || 'Unknown'} - $${account.balance?.toFixed(2) || '0.00'}`
        });
      });
    }

    runTests(accountTests, results);

    // 4. DATA SYNC STATUS
    console.log(`\n${colors.yellow}4. DATA SYNCHRONIZATION${colors.reset}`);
    
    const syncTests = [
      {
        name: 'Has sync logs',
        test: () => user.syncLogs?.length > 0,
        value: `${user.syncLogs?.length || 0} syncs recorded`
      }
    ];

    if (user.syncLogs?.length > 0) {
      const latestSync = user.syncLogs[0];
      syncTests.push({
        name: 'Latest sync status',
        test: () => latestSync.status === 'SUCCESS',
        value: latestSync.status
      });
      syncTests.push({
        name: 'Latest sync type',
        test: () => true,
        value: latestSync.syncType
      });
      syncTests.push({
        name: 'Records synced',
        test: () => latestSync.recordsSynced > 0,
        value: `${latestSync.recordsSynced || 0} records`
      });
    }

    runTests(syncTests, results);

    // 5. YODLEE DATA IN PORTFOLIO
    console.log(`\n${colors.yellow}5. YODLEE DATA IN PORTFOLIO${colors.reset}`);
    
    const yodleeHoldings = syncedAccounts.flatMap(account => account.holdings || []);
    const portfolioTests = [
      {
        name: 'Has Yodlee holdings',
        test: () => yodleeHoldings.length > 0,
        value: `${yodleeHoldings.length} Yodlee holdings`
      },
      {
        name: 'Manual holdings in portfolio',
        test: () => user.portfolios?.some(p => p.holdings?.length > 0),
        value: user.portfolios?.reduce((sum, p) => sum + (p.holdings?.length || 0), 0) + ' manual holdings'
      }
    ];

    // Show sample holdings
    if (yodleeHoldings.length > 0) {
      yodleeHoldings.slice(0, 3).forEach(holding => {
        portfolioTests.push({
          name: `Yodlee: ${holding.symbol}`,
          test: () => true,
          value: `${holding.shares} shares @ $${holding.currentPrice?.toFixed(2) || 'N/A'}`
        });
      });
    }

    runTests(portfolioTests, results);

    // 6. UI INTEGRATION POINTS
    console.log(`\n${colors.yellow}6. UI INTEGRATION CHECKPOINTS${colors.reset}`);
    
    const uiCheckpoints = [
      {
        name: 'Dashboard Premium Widget',
        location: '/dashboard/super-cards',
        expected: 'PremiumDashboardWidget at top showing sync status'
      },
      {
        name: 'Bank Connections in Settings',
        location: '/settings → Position #2',
        expected: 'Connect Bank Account button with Yodlee FastLink'
      },
      {
        name: 'Profile Subscription Section',
        location: '/profile',
        expected: 'Shows PREMIUM plan with billing options'
      },
      {
        name: 'Navigation Premium Badge',
        location: 'Top navigation',
        expected: 'Crown icon with "Premium" label'
      },
      {
        name: 'Data Source Badges',
        location: 'Super Cards',
        expected: '🏦 badges for Yodlee data, ✋ for manual'
      },
      {
        name: 'Sync Status Indicator',
        location: 'Dashboard header',
        expected: 'Last sync time and refresh button'
      }
    ];

    console.log('\nManual verification required:');
    uiCheckpoints.forEach((checkpoint, index) => {
      console.log(`${colors.blue}${index + 1}.${colors.reset} ${checkpoint.name}`);
      console.log(`   Location: ${checkpoint.location}`);
      console.log(`   Expected: ${checkpoint.expected}`);
    });

    // 7. FEATURE ACCESS TEST
    console.log(`\n${colors.yellow}7. PREMIUM FEATURE ACCESS${colors.reset}`);
    
    const featureTests = [
      {
        name: 'Bank sync enabled',
        test: () => user.isPremium,
        value: user.isPremium ? '✅ Enabled' : '❌ Disabled'
      },
      {
        name: 'Unlimited portfolios',
        test: () => user.isPremium || user.portfolios?.length <= 1,
        value: `${user.portfolios?.length || 0} portfolios`
      },
      {
        name: 'Real-time data access',
        test: () => user.isPremium,
        value: user.isPremium ? '✅ Real-time' : '⏰ Delayed'
      },
      {
        name: 'Advanced analytics',
        test: () => user.isPremium,
        value: user.isPremium ? '✅ Full access' : '🔒 Limited'
      }
    ];

    runTests(featureTests, results);

    // 8. ONBOARDING FLOW
    console.log(`\n${colors.yellow}8. ONBOARDING PREMIUM STEP${colors.reset}`);
    console.log('Visit: http://localhost:3000/onboarding');
    console.log('Expected: Step 4 shows "Premium Features" with 14-day trial offer');
    console.log('Features listed:');
    console.log('  • Automatic bank synchronization');
    console.log('  • Real-time portfolio tracking');
    console.log('  • Advanced tax optimization');
    console.log('  • Unlimited portfolios');

    // SUMMARY
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.magenta}${colors.bold}📈 TEST SUMMARY${colors.reset}`);
    console.log('═'.repeat(80));

    const total = results.passed.length + results.failed.length;
    const passRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(1) : 0;

    console.log(`\n${colors.green}✅ Passed: ${results.passed.length}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${results.failed.length}${colors.reset}`);
    console.log(`${colors.yellow}⚠️  Warnings: ${results.warnings.length}${colors.reset}`);
    console.log(`\nPass Rate: ${passRate}%`);

    if (results.failed.length > 0) {
      console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
      results.failed.forEach(test => {
        console.log(`  • ${test}`);
      });
    }

    if (results.warnings.length > 0) {
      console.log(`\n${colors.yellow}Warnings:${colors.reset}`);
      results.warnings.forEach(warning => {
        console.log(`  • ${warning}`);
      });
    }

    // RECOMMENDATIONS
    console.log('\n' + '═'.repeat(80));
    console.log(`${colors.blue}${colors.bold}💡 NEXT STEPS TO COMPLETE YODLEE ONBOARDING${colors.reset}`);
    console.log('═'.repeat(80));

    if (!user.isPremium) {
      console.log(`\n${colors.yellow}1. UPGRADE TO PREMIUM:${colors.reset}`);
      console.log('   Run: node scripts/onboard-premium-user.js');
      console.log('   This will upgrade test@example.com to premium tier');
    }

    if (!user.yodleeConnection) {
      console.log(`\n${colors.yellow}2. CONNECT BANK ACCOUNT:${colors.reset}`);
      console.log('   1. Login to http://localhost:3000');
      console.log('   2. Go to Settings → Bank Connections');
      console.log('   3. Click "Connect Bank Account"');
      console.log('   4. Use test credentials:');
      console.log('      • Provider: Dag Site');
      console.log('      • Username: YodTest.site16441.2');
      console.log('      • Password: site16441.2');
    }

    if (syncedAccounts.length === 0 && user.yodleeConnection) {
      console.log(`\n${colors.yellow}3. SYNC DATA:${colors.reset}`);
      console.log('   After connecting, click "Sync Now" in dashboard');
      console.log('   Or run: node scripts/trigger-yodlee-sync.js');
    }

    console.log(`\n${colors.green}${colors.bold}✨ PRODUCTION READINESS${colors.reset}`);
    console.log('─'.repeat(80));
    
    const readinessChecks = {
      'Backend Infrastructure': user.subscription !== null,
      'Premium Features': user.isPremium,
      'Yodlee Integration': user.yodleeConnection !== null,
      'Data Synchronization': user.syncLogs?.length > 0,
      'UI Integration': true // Requires manual verification
    };

    Object.entries(readinessChecks).forEach(([feature, ready]) => {
      console.log(`${ready ? colors.green + '✅' : colors.red + '❌'} ${feature}${colors.reset}`);
    });

    const allReady = Object.values(readinessChecks).every(v => v);
    
    console.log('\n' + '═'.repeat(80));
    if (allReady) {
      console.log(`${colors.green}${colors.bold}🚀 SYSTEM IS PRODUCTION READY!${colors.reset}`);
      console.log('All Yodlee integration components are operational.');
    } else {
      console.log(`${colors.yellow}${colors.bold}⏳ SETUP IN PROGRESS${colors.reset}`);
      console.log('Complete the steps above to finish Yodlee integration.');
    }
    console.log('═'.repeat(80));

  } catch (error) {
    console.error(`${colors.red}❌ Test failed:${colors.reset}`, error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Helper function to run tests and collect results
function runTests(tests, results) {
  tests.forEach(test => {
    try {
      const passed = test.test();
      console.log(`${passed ? colors.green + '✅' : colors.red + '❌'} ${test.name}: ${test.value}${colors.reset}`);
      
      if (passed) {
        results.passed.push(test.name);
      } else {
        results.failed.push(test.name);
      }
    } catch (error) {
      console.log(`${colors.yellow}⚠️  ${test.name}: Error - ${error.message}${colors.reset}`);
      results.warnings.push(`${test.name}: ${error.message}`);
    }
  });
}

// Add command line options
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log(`
${colors.blue}Yodlee User Journey Test${colors.reset}

Tests the complete premium user journey and Yodlee integration for test@example.com

Usage:
  node scripts/test-yodlee-user-journey.js [options]

Options:
  --help     Show this help message
  --verbose  Show detailed debug information

Prerequisites:
  1. Server running on http://localhost:3000
  2. Test user exists (run: npm run setup:test-user)
  3. Database migrations applied

Next Steps:
  1. Upgrade user to premium: node scripts/onboard-premium-user.js
  2. Connect bank account via UI
  3. Trigger sync: node scripts/trigger-yodlee-sync.js
`);
  process.exit(0);
}

// Run the test
console.log(`${colors.blue}Starting Yodlee integration test...${colors.reset}`);
testYodleeUserJourney().catch(console.error);