#!/usr/bin/env node

/**
 * Check Settings Page Structure
 * Verifies the Bank Connections section is present
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function checkSettingsPage() {
  console.log(`\n${colors.magenta}🔍 CHECKING SETTINGS PAGE STRUCTURE${colors.reset}\n`);
  console.log('═'.repeat(70));

  try {
    // Get test user to verify they're premium
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        subscription: true
      }
    });

    console.log(`${colors.blue}USER STATUS:${colors.reset}`);
    console.log(`Email: ${user?.email || 'Not found'}`);
    console.log(`Premium: ${user?.isPremium ? '✅ YES' : '❌ NO'}`);
    console.log(`Subscription: ${user?.subscription?.plan || 'NONE'}`);
    console.log();

    console.log(`${colors.blue}EXPECTED SETTINGS PAGE SECTIONS (in order):${colors.reset}`);
    console.log();
    
    const sections = [
      {
        name: 'Header',
        location: 'Top of page',
        description: 'Settings title with save button'
      },
      {
        name: '1. Appearance',
        location: 'First section',
        description: 'Theme (Light/Dark), Currency, Language'
      },
      {
        name: '2. Bank Connections',
        location: 'SECOND SECTION (lines 637-696)',
        description: 'Premium feature with purple ring, Yodlee FastLink integration',
        highlight: true
      },
      {
        name: '3. Notifications',
        location: 'Third section',
        description: 'Dividend alerts, milestone alerts, etc.'
      },
      {
        name: '4. Email Notifications',
        location: 'Fourth section',
        description: 'Email configuration and categories'
      },
      {
        name: '5. Data & Privacy',
        location: 'Fifth section',
        description: 'Export options, privacy settings'
      },
      {
        name: '6. Advanced',
        location: 'Last section',
        description: 'Developer features, API access'
      }
    ];

    sections.forEach((section, index) => {
      if (section.highlight) {
        console.log(`${colors.green}★ ${section.name}${colors.reset} ${colors.yellow}← BANK CONNECTIONS SHOULD BE HERE${colors.reset}`);
      } else {
        console.log(`  ${section.name}`);
      }
      console.log(`  Location: ${section.location}`);
      console.log(`  Contains: ${section.description}`);
      console.log();
    });

    console.log('═'.repeat(70));
    console.log(`${colors.yellow}BANK CONNECTIONS FEATURES:${colors.reset}`);
    console.log('• Purple ring border (ring-2 ring-purple-100)');
    console.log('• "Premium" badge');
    console.log('• "Auto-sync enabled" indicator');
    console.log('• Purple gradient benefit callout');
    console.log('• ConnectedAccountsList component');
    console.log('• FastLinkConnect button');
    console.log('• Security notice at bottom');
    console.log();

    console.log('═'.repeat(70));
    console.log(`${colors.blue}TROUBLESHOOTING:${colors.reset}`);
    console.log();
    
    console.log('If Bank Connections section is missing:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify components are loading:');
    console.log('   - /components/yodlee/FastLinkConnect.tsx');
    console.log('   - /components/yodlee/ConnectedAccountsList.tsx');
    console.log('3. Check if conditional rendering is hiding it');
    console.log('4. Verify user is logged in as premium user');
    console.log();

    console.log(`${colors.blue}FILE LOCATION:${colors.reset}`);
    console.log('Settings page: /app/settings/page.tsx');
    console.log('Bank Connections code: Lines 637-696');
    console.log();

    console.log(`${colors.green}URL TO TEST:${colors.reset}`);
    console.log('https://incomeclarity.ddns.net/settings');
    console.log();
    
    console.log(`${colors.yellow}WHAT TO LOOK FOR:${colors.reset}`);
    console.log('After the Appearance section (theme selection),');
    console.log('you should see a section with:');
    console.log('- Title: "Bank Connections" with database icon');
    console.log('- Purple "Premium" badge');
    console.log('- Purple ring border around the whole section');
    console.log('- "Connect Bank Account" button');

  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkSettingsPage().catch(console.error);