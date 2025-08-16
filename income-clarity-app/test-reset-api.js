/**
 * Quick test script for the demo reset API endpoint
 * Run this to test DEMO-008 functionality
 */

async function testResetAPI() {
  try {
    console.log('Testing Demo Reset API endpoint...');
    
    const response = await fetch('http://localhost:3000/api/demo/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Reset API successful!');
      console.log('Response:', data);
    } else {
      console.log('❌ Reset API failed:', data);
    }
    
  } catch (error) {
    console.error('❌ Error testing reset API:', error);
  }
}

// Check environment
if (process.env.NODE_ENV !== 'development') {
  console.log('⚠️  Setting NODE_ENV=development for testing');
  process.env.NODE_ENV = 'development';
}

console.log('🧪 Demo Reset API Test');
console.log('===================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log('Note: Make sure Next.js server is running on localhost:3000');
console.log('');

// Run test
testResetAPI();