const { chromium } = require('playwright');

async function testAPIDirectly() {
  console.log('🚀 Testing Export APIs Directly...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // First login to get session cookies
    console.log('🔑 Getting session cookies...');
    await page.goto('https://incomeclarity.ddns.net/login', { waitUntil: 'networkidle' });
    
    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForLoadState('networkidle');
    
    // Now test the export APIs with session cookies
    const apis = [
      { name: 'Portfolio Export', url: '/api/user/export/portfolio' },
      { name: 'Transactions Export', url: '/api/user/export/transactions' },
      { name: 'Tax Export', url: '/api/user/export/tax' }
    ];
    
    for (const api of apis) {
      console.log(`📊 Testing ${api.name}...`);
      
      try {
        const response = await page.request.get(`https://incomeclarity.ddns.net${api.url}`);
        
        console.log(`   Status: ${response.status()}`);
        console.log(`   Content-Type: ${response.headers()['content-type'] || 'Not set'}`);
        
        if (response.status() === 200) {
          const contentType = response.headers()['content-type'];
          if (contentType && contentType.includes('text/csv')) {
            const content = await response.text();
            const lines = content.split('\n').slice(0, 3);
            console.log('   ✅ CSV Content Preview:');
            lines.forEach((line, i) => {
              console.log(`      ${i === 0 ? 'Headers' : `Row ${i}`}: ${line.substring(0, 80)}${line.length > 80 ? '...' : ''}`);
            });
          } else {
            const content = await response.text();
            console.log(`   Content: ${content.substring(0, 200)}...`);
          }
        } else if (response.status() === 404) {
          const content = await response.text();
          console.log(`   ❌ 404 Error: ${content.substring(0, 200)}`);
        } else {
          const content = await response.text();
          console.log(`   Response: ${content.substring(0, 200)}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await browser.close();
  }
}

testAPIDirectly().catch(console.error);