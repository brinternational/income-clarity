#!/usr/bin/env node

/**
 * Test script for push notifications functionality
 * Tests the complete push notification workflow for dividend alerts
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const TEST_USER_ID = 'test-user-123';

// Mock holdings data for testing
const testHoldings = [
  {
    id: 'holding-schd',
    ticker: 'SCHD',
    shares: 500,
    avgCost: 72.50,
    currentPrice: 72.50
  },
  {
    id: 'holding-jepi', 
    ticker: 'JEPI',
    shares: 1000,
    avgCost: 55.00,
    currentPrice: 55.00
  },
  {
    id: 'holding-vym',
    ticker: 'VYM',
    shares: 300, 
    avgCost: 110.00,
    currentPrice: 110.00
  }
];

// Mock dividend calendar (matches mock-dividend-calendar.ts)
const testDividendCalendar = [
  {
    id: 'div-schd-2025-q1',
    symbol: 'SCHD',
    companyName: 'Schwab US Dividend Equity ETF',
    exDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ahead
    recordDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dividendAmount: 0.74,
    frequency: 'quarterly',
    divType: 'regular',
    currency: 'USD',
    source: 'api'
  },
  {
    id: 'div-jepi-2025-m1',
    symbol: 'JEPI',
    companyName: 'JPMorgan Equity Premium Income ETF',
    exDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days ahead
    recordDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dividendAmount: 0.42,
    frequency: 'monthly',
    divType: 'regular',
    currency: 'USD',
    source: 'api'
  }
];

// Test notification preferences
const testPreferences = {
  enabled: true,
  types: {
    exDividend24h: true,
    exDividendMorning: true,
    weeklyS: true,
    dividendPayments: true,
    portfolioAlerts: false
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'America/New_York'
  },
  platforms: {
    web: true,
    mobile: true
  }
};

async function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_BASE}${endpoint}`);
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  // console.log('🔔 Starting Push Notification Tests...\n');

  try {
    // Test 1: Update notification preferences
    // console.log('1️⃣ Testing notification preferences update...');
    const prefsResult = await makeRequest('PUT', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      preferences: testPreferences
    });
    
    // console.log(`   Status: ${prefsResult.status}`);
    // console.log(`   Response: ${JSON.stringify(prefsResult.data, null, 2)}`);
    // console.log(prefsResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 2: Schedule notifications
    // console.log('2️⃣ Testing notification scheduling...');
    const scheduleResult = await makeRequest('POST', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      holdings: testHoldings,
      dividendCalendar: testDividendCalendar
    });
    
    // console.log(`   Status: ${scheduleResult.status}`);
    // console.log(`   Response: ${JSON.stringify(scheduleResult.data, null, 2)}`);
    // console.log(scheduleResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 3: Get scheduled notifications
    // console.log('3️⃣ Testing notification retrieval...');
    const getResult = await makeRequest('GET', `/api/notifications/schedule?userId=${TEST_USER_ID}`);
    
    // console.log(`   Status: ${getResult.status}`);
    // console.log(`   Found ${getResult.data.count} notifications`);
    if (getResult.data.notifications && getResult.data.notifications.length > 0) {
      // console.log(`   First notification: ${getResult.data.notifications[0].symbol} - ${getResult.data.notifications[0].notificationType}`);
    }
    // console.log(getResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 4: Send test notification - 24h warning
    // console.log('4️⃣ Testing 24-hour warning notification...');
    const test24hResult = await makeRequest('PATCH', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      type: 'ex-dividend-24h',
      symbol: 'SCHD',
      amount: 370.00 // 500 shares * $0.74
    });
    
    // console.log(`   Status: ${test24hResult.status}`);
    // console.log(`   Response: ${JSON.stringify(test24hResult.data, null, 2)}`);
    // console.log(test24hResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 5: Send test notification - morning reminder
    // console.log('5️⃣ Testing morning reminder notification...');
    const testMorningResult = await makeRequest('PATCH', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      type: 'ex-dividend-morning',
      symbol: 'JEPI',
      amount: 420.00 // 1000 shares * $0.42
    });
    
    // console.log(`   Status: ${testMorningResult.status}`);
    // console.log(`   Response: ${JSON.stringify(testMorningResult.data, null, 2)}`);
    // console.log(testMorningResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 6: Send test notification - weekly summary
    // console.log('6️⃣ Testing weekly summary notification...');
    const testWeeklyResult = await makeRequest('PATCH', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      type: 'weekly-summary'
    });
    
    // console.log(`   Status: ${testWeeklyResult.status}`);
    // console.log(`   Response: ${JSON.stringify(testWeeklyResult.data, null, 2)}`);
    // console.log(testWeeklyResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 7: Filter notifications by type
    // console.log('7️⃣ Testing notification filtering...');
    const filterResult = await makeRequest('GET', `/api/notifications/schedule?userId=${TEST_USER_ID}&type=ex-dividend-24h`);
    
    // console.log(`   Status: ${filterResult.status}`);
    // console.log(`   Found ${filterResult.data.count} 24h warning notifications`);
    // console.log(filterResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // Test 8: Disable notifications
    // console.log('8️⃣ Testing notification disable...');
    const disableResult = await makeRequest('PUT', '/api/notifications/schedule', {
      userId: TEST_USER_ID,
      preferences: { ...testPreferences, enabled: false }
    });
    
    // console.log(`   Status: ${disableResult.status}`);
    // console.log(`   Response: ${JSON.stringify(disableResult.data, null, 2)}`);
    // console.log(disableResult.status === 200 ? '   ✅ PASS\n' : '   ❌ FAIL\n');

    // console.log('🎉 All push notification tests completed!');
    // console.log('\n📊 Test Summary:');
    // console.log('   ✅ Notification preferences management');
    // console.log('   ✅ Notification scheduling from holdings & calendar');
    // console.log('   ✅ Notification retrieval and filtering');
    // console.log('   ✅ Test notification sending');
    // console.log('   ✅ Multiple notification types (24h, morning, weekly)');
    // console.log('   ✅ Notification disable/enable workflow');

  } catch (error) {
    // console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Additional manual tests for browser-specific features
function printManualTestInstructions() {
  // console.log('\n🧪 Manual Browser Tests:');
  // console.log('1. Open Income Clarity app in browser');
  // console.log('2. Navigate to Settings page');
  // console.log('3. Test notification permission flow:');
  // console.log('   - Click "Enable Notifications"');
  // console.log('   - Allow notifications in browser prompt');
  // console.log('   - Verify success message and preferences UI');
  // console.log('');
  // console.log('4. Test notification types:');
  // console.log('   - Toggle different notification types on/off');
  // console.log('   - Set quiet hours');
  // console.log('   - Verify preferences are saved');
  // console.log('');
  // console.log('5. Test platform-specific behavior:');
  // console.log('   - Chrome: Should work fully');
  // console.log('   - Safari: Should work with PWA');
  // console.log('   - iOS Safari: Should prompt for PWA install');
  // console.log('   - Android Chrome: Should work fully');
  // console.log('');
  // console.log('6. Test actual notifications:');
  // console.log('   - Use browser dev tools to simulate push events');
  // console.log('   - Verify notification appearance and actions');
  // console.log('   - Test notification click-through to app');
  // console.log('');
  // console.log('📱 PWA Tests:');
  // console.log('1. Install app as PWA on desktop/mobile');
  // console.log('2. Verify notifications work when app is closed');
  // console.log('3. Test notification actions (View Calendar, etc.)');
  // console.log('4. Verify deep linking works correctly');
}

// Run the tests
if (require.main === module) {
  runTests().then(() => {
    printManualTestInstructions();
  }).catch((error) => {
    // console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runTests,
  testHoldings,
  testDividendCalendar,
  testPreferences
};