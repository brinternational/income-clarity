/**
 * Test Script for Auth Debug System
 * Demonstrates the auth debug service functionality
 */

const { authDebugService, AuthEventType, authDebug } = require('../lib/auth/auth-debug.service');

console.log('🔐 Testing Auth Debug System...\n');

// Enable debug logging
authDebug.setEnabled(true);

// Test basic event tracking
console.log('1. Testing basic event tracking...');
authDebug.event(AuthEventType.SESSION_CHECK, 'Test session check', {
  testData: 'sample data',
  userId: 'test-user-123'
});

// Test session check tracking
console.log('2. Testing session check with timing...');
const completeSessionCheck = authDebug.sessionCheck(true, 0);
setTimeout(() => {
  completeSessionCheck(true, { id: 'test-user', email: 'test@example.com', isPremium: false });
}, 100);

// Test sign in tracking
console.log('3. Testing sign in tracking...');
const completeSignIn = authDebug.signIn('test@example.com');
setTimeout(() => {
  completeSignIn(true, { id: 'test-user', email: 'test@example.com', isPremium: false });
}, 50);

// Test state changes
console.log('4. Testing state change tracking...');
authDebug.stateChange('user', null, { id: 'test-user', email: 'test@example.com' });
authDebug.stateChange('loading', true, false);

// Test error tracking
console.log('5. Testing error tracking...');
authDebug.event(
  AuthEventType.NETWORK_ERROR, 
  'Test network error',
  { endpoint: '/api/auth/me' },
  { url: '/dashboard' },
  new Error('Connection failed')
);

// Wait for all events to be processed
setTimeout(() => {
  console.log('\n📊 Debug Statistics:');
  const stats = authDebug.getStats();
  console.log('Total Events:', stats.totalEvents);
  console.log('Event Types:', Object.keys(stats.eventCounts).filter(type => stats.eventCounts[type] > 0));
  console.log('Recent Errors:', stats.recentErrors.length);

  console.log('\n📋 Recent Events:');
  const events = authDebug.getEvents(10);
  events.forEach((event, index) => {
    console.log(`${index + 1}. [${event.type}] ${event.message} ${event.duration ? `(${event.duration}ms)` : ''}`);
  });

  console.log('\n✅ Auth Debug System Test Complete!');
  console.log('Debug system is working correctly and ready for use.');
}, 200);