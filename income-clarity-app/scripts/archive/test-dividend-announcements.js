#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Dividend Announcement System
 * Tests API endpoints, notification preferences, and announcement processing
 */

const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = 'test-user-announce';

// ANSI color codes for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  // console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  // console.log(`\n${colors.bold}${colors.blue}=== ${message} ===${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

// Test helper functions
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    return { response, data };
  } catch (error) {
    return { error };
  }
}

// Test 1: Get default announcement preferences
async function testGetAnnouncementPreferences() {
  logHeader('Test 1: Get Default Announcement Preferences');
  
  const { response, data, error } = await makeRequest(
    `/api/notifications/dividend-announcements?userId=${TEST_USER_ID}`
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  // Validate response structure
  const expected = ['preferences', 'userId'];
  const missing = expected.filter(key => !(key in data));
  
  if (missing.length > 0) {
    logError(`Missing fields in response: ${missing.join(', ')}`);
    return false;
  }

  // Validate preferences structure
  const prefs = data.preferences;
  const requiredPrefs = ['enabled', 'holdings', 'announcementTypes', 'alertThresholds', 'deliveryMethods', 'quietHours'];
  const missingPrefs = requiredPrefs.filter(key => !(key in prefs));
  
  if (missingPrefs.length > 0) {
    logError(`Missing preference fields: ${missingPrefs.join(', ')}`);
    return false;
  }

  logSuccess('Default preferences retrieved successfully');
  logInfo(`Preferences enabled: ${prefs.enabled}`);
  logInfo(`Alert threshold: ${prefs.alertThresholds.minChangePercent}%`);
  logInfo(`Announcement types enabled: ${Object.entries(prefs.announcementTypes).filter(([k,v]) => v).map(([k]) => k).join(', ')}`);
  
  return true;
}

// Test 2: Update announcement preferences
async function testUpdateAnnouncementPreferences() {
  logHeader('Test 2: Update Announcement Preferences');
  
  const preferences = {
    enabled: true,
    holdings: {
      allHoldings: false,
      specificHoldings: ['SCHD', 'JEPI', 'O']
    },
    announcementTypes: {
      increase: true,
      decrease: true,
      special: true,
      initiation: false,
      suspension: true,
      frequencyChange: false
    },
    alertThresholds: {
      enabled: true,
      minChangePercent: 10.0,
      minAmount: 0.05
    },
    deliveryMethods: {
      pushNotification: true,
      inAppCenter: true
    },
    quietHours: {
      enabled: true,
      start: '23:00',
      end: '07:00',
      timezone: 'America/New_York'
    }
  };

  const { response, data, error } = await makeRequest(
    '/api/notifications/dividend-announcements',
    {
      method: 'POST',
      body: JSON.stringify({ userId: TEST_USER_ID, preferences })
    }
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  if (!data.message || !data.preferences) {
    logError('Invalid response structure');
    return false;
  }

  // Verify preferences were stored correctly
  if (data.preferences.alertThresholds.minChangePercent !== 10.0) {
    logError('Alert threshold not saved correctly');
    return false;
  }

  logSuccess('Announcement preferences updated successfully');
  logInfo(`Specific holdings: ${data.preferences.holdings.specificHoldings.join(', ')}`);
  logInfo(`Min change threshold: ${data.preferences.alertThresholds.minChangePercent}%`);
  
  return true;
}

// Test 3: Create dividend announcement
async function testCreateDividendAnnouncement() {
  logHeader('Test 3: Create Dividend Announcement');
  
  const announcementData = {
    userId: TEST_USER_ID,
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    announcementType: 'increase',
    oldAmount: 0.65,
    newAmount: 0.75,
    announcementDate: new Date().toISOString(),
    effectiveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Quarterly dividend increased by 15.4% due to strong portfolio performance'
  };

  const { response, data, error } = await makeRequest(
    '/api/dividend-announcements',
    {
      method: 'POST',
      body: JSON.stringify(announcementData)
    }
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  if (!data.announcement || !data.announcement.id) {
    logError('Announcement not created properly');
    return false;
  }

  // Verify calculated percentage change
  if (Math.abs(data.announcement.percentageChange - 15.38) > 0.1) {
    logError(`Percentage change calculation incorrect: expected ~15.38, got ${data.announcement.percentageChange}`);
    return false;
  }

  logSuccess('Dividend announcement created successfully');
  logInfo(`Announcement ID: ${data.announcement.id}`);
  logInfo(`Percentage change: ${data.announcement.percentageChange.toFixed(2)}%`);
  
  return true;
}

// Test 4: Get dividend announcements with filtering
async function testGetDividendAnnouncements() {
  logHeader('Test 4: Get Dividend Announcements');
  
  const { response, data, error } = await makeRequest(
    `/api/dividend-announcements?userId=${TEST_USER_ID}&limit=10`
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  const required = ['announcements', 'total', 'limit', 'offset', 'hasMore'];
  const missing = required.filter(key => !(key in data));
  
  if (missing.length > 0) {
    logError(`Missing fields in response: ${missing.join(', ')}`);
    return false;
  }

  if (!Array.isArray(data.announcements)) {
    logError('Announcements field is not an array');
    return false;
  }

  logSuccess('Dividend announcements retrieved successfully');
  logInfo(`Total announcements: ${data.total}`);
  logInfo(`Retrieved: ${data.announcements.length}`);
  logInfo(`Has more: ${data.hasMore}`);
  
  return true;
}

// Test 5: Simulate dividend announcements
async function testSimulateDividendAnnouncements() {
  logHeader('Test 5: Simulate Dividend Announcements');
  
  const { response, data, error } = await makeRequest(
    '/api/dividend-announcements/simulate',
    {
      method: 'POST',
      body: JSON.stringify({
        userId: TEST_USER_ID,
        count: 3,
        includeToday: true
      })
    }
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  if (!data.announcements || !Array.isArray(data.announcements)) {
    logError('Simulated announcements not created properly');
    return false;
  }

  if (data.announcements.length === 0) {
    logError('No simulated announcements were created');
    return false;
  }

  // Verify announcement types are diverse
  const types = [...new Set(data.announcements.map(a => a.announcementType))];
  
  logSuccess(`${data.count} simulated announcements created successfully`);
  logInfo(`Announcement types created: ${types.join(', ')}`);
  logInfo(`First announcement: ${data.announcements[0].symbol} - ${data.announcements[0].announcementType}`);
  
  return true;
}

// Test 6: Test announcement notification
async function testAnnouncementNotification() {
  logHeader('Test 6: Test Announcement Notification');
  
  const testTypes = [
    { type: 'increase', symbol: 'SCHD', oldAmount: 0.65, newAmount: 0.75 },
    { type: 'decrease', symbol: 'XOM', oldAmount: 0.91, newAmount: 0.75 },
    { type: 'special', symbol: 'O', newAmount: 0.50 },
    { type: 'initiation', symbol: 'NVDA', newAmount: 0.08 },
    { type: 'suspension', symbol: 'F', oldAmount: 0.15, newAmount: 0 }
  ];

  let successCount = 0;

  for (const test of testTypes) {
    const { response, data, error } = await makeRequest(
      '/api/notifications/dividend-announcements',
      {
        method: 'PATCH',
        body: JSON.stringify({
          userId: TEST_USER_ID,
          announcementType: test.type,
          symbol: test.symbol,
          oldAmount: test.oldAmount,
          newAmount: test.newAmount
        })
      }
    );

    if (error || !response.ok) {
      logError(`${test.type} notification test failed`);
      continue;
    }

    if (!data.payload || !data.payload.type.includes(test.type)) {
      logError(`${test.type} notification payload invalid`);
      continue;
    }

    logSuccess(`${test.type} notification test passed`);
    logInfo(`  Title: ${data.payload.title}`);
    logInfo(`  Body: ${data.payload.body}`);
    successCount++;
  }

  if (successCount === testTypes.length) {
    logSuccess(`All ${testTypes.length} notification types tested successfully`);
    return true;
  } else {
    logError(`${testTypes.length - successCount} notification tests failed`);
    return false;
  }
}

// Test 7: Filter announcements by symbol
async function testFilterAnnouncementsBySymbol() {
  logHeader('Test 7: Filter Announcements by Symbol');
  
  const { response, data, error } = await makeRequest(
    `/api/dividend-announcements?userId=${TEST_USER_ID}&symbol=SCHD`
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  // Verify all results are for SCHD
  const nonSCHD = data.announcements.filter(a => a.symbol !== 'SCHD');
  if (nonSCHD.length > 0) {
    logError(`Filter not working: found ${nonSCHD.length} non-SCHD results`);
    return false;
  }

  logSuccess('Symbol filtering works correctly');
  logInfo(`Found ${data.announcements.length} SCHD announcements`);
  
  return true;
}

// Test 8: Filter announcements by type
async function testFilterAnnouncementsByType() {
  logHeader('Test 8: Filter Announcements by Type');
  
  const { response, data, error } = await makeRequest(
    `/api/dividend-announcements?userId=${TEST_USER_ID}&type=increase`
  );

  if (error) {
    logError(`Request failed: ${error.message}`);
    return false;
  }

  if (!response.ok) {
    logError(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return false;
  }

  // Verify all results are increases
  const nonIncrease = data.announcements.filter(a => a.announcementType !== 'increase');
  if (nonIncrease.length > 0) {
    logError(`Type filter not working: found ${nonIncrease.length} non-increase results`);
    return false;
  }

  logSuccess('Type filtering works correctly');
  logInfo(`Found ${data.announcements.length} increase announcements`);
  
  return true;
}

// Main test runner
async function runAllTests() {
  logHeader('Dividend Announcement System - Comprehensive Test Suite');
  logInfo(`Testing against: ${BASE_URL}`);
  logInfo(`Test user ID: ${TEST_USER_ID}`);

  const tests = [
    testGetAnnouncementPreferences,
    testUpdateAnnouncementPreferences,
    testCreateDividendAnnouncement,
    testGetDividendAnnouncements,
    testSimulateDividendAnnouncements,
    testAnnouncementNotification,
    testFilterAnnouncementsBySymbol,
    testFilterAnnouncementsByType
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    try {
      const result = await tests[i]();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test ${i + 1} threw an error: ${error.message}`);
      failed++;
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  logHeader('Test Results Summary');
  logSuccess(`Passed: ${passed}/${tests.length}`);
  if (failed > 0) {
    logError(`Failed: ${failed}/${tests.length}`);
  }

  const successRate = ((passed / tests.length) * 100).toFixed(1);
  if (successRate === '100.0') {
    logSuccess(`🎉 All tests passed! Success rate: ${successRate}%`);
  } else if (successRate >= '80.0') {
    log(`⚠️ Most tests passed. Success rate: ${successRate}%`, 'yellow');
  } else {
    logError(`💥 Many tests failed. Success rate: ${successRate}%`);
  }

  logHeader('Manual Testing Instructions');
  logInfo('To test browser notifications:');
  logInfo('1. Open http://localhost:3000 in your browser');
  logInfo('2. Go to Settings page');
  logInfo('3. Enable push notifications when prompted');
  logInfo('4. Run: curl -X PATCH http://localhost:3000/api/notifications/dividend-announcements \\');
  logInfo('     -H "Content-Type: application/json" \\');
  logInfo('     -d \'{"userId":"test-user","announcementType":"increase","symbol":"SCHD"}\'');
  logInfo('5. You should see a push notification appear');

  logHeader('API Endpoints Available');
  logInfo('GET  /api/notifications/dividend-announcements?userId=X - Get preferences');
  logInfo('POST /api/notifications/dividend-announcements - Update preferences');
  logInfo('PATCH /api/notifications/dividend-announcements - Test notification');
  logInfo('GET  /api/dividend-announcements?userId=X - Get announcements');
  logInfo('POST /api/dividend-announcements - Create announcement');
  logInfo('POST /api/dividend-announcements/simulate - Create demo data');

  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
if (require.main === module) {
  runAllTests().catch(error => {
    logError(`Test runner crashed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testGetAnnouncementPreferences,
  testUpdateAnnouncementPreferences,
  testCreateDividendAnnouncement,
  testGetDividendAnnouncements,
  testSimulateDividendAnnouncements,
  testAnnouncementNotification,
  testFilterAnnouncementsBySymbol,
  testFilterAnnouncementsByType
};