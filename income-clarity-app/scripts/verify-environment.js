#!/usr/bin/env node

// Environment Verification Script
// Checks if environment variables are properly loaded and configured

// console.log('🔧 Environment Variable Verification\n');

// Check if we're in the right directory
const path = require('path');
const fs = require('fs');

const envFiles = ['.env.local', '.env.production', '.env'];
const foundEnvFiles = envFiles.filter(file => fs.existsSync(file));

// console.log('📁 Environment Files Found:', foundEnvFiles);

// Load environment variables manually if needed
if (foundEnvFiles.includes('.env.local')) {
  require('dotenv').config({ path: '.env.local' });
  // console.log('✅ Loaded .env.local');
} else if (foundEnvFiles.includes('.env.production')) {
  require('dotenv').config({ path: '.env.production' });  
  // console.log('✅ Loaded .env.production');
} else if (foundEnvFiles.includes('.env')) {
  require('dotenv').config();
  // console.log('✅ Loaded .env');
}

// console.log('\n🔍 Current Environment Variables:');
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
// console.log(`LOCAL_MODE: ${process.env.LOCAL_MODE}`);
// console.log(`NEXT_PUBLIC_LOCAL_MODE: ${process.env.NEXT_PUBLIC_LOCAL_MODE}`);
// console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...`);
// console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...`);

// Run analysis
const localMode = process.env.LOCAL_MODE === 'true' || process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const isLocalhost = supabaseUrl.includes('localhost');
const isPlaceholder = supabaseUrl.includes('placeholder');

// console.log('\n📊 Configuration Analysis:');
// console.log(`LOCAL_MODE Enabled: ${localMode}`);
// console.log(`Supabase URL Type: ${isLocalhost ? 'localhost' : isPlaceholder ? 'placeholder' : 'production'}`);

// Provide recommendations
// console.log('\n💡 Recommendations:');

if (!localMode && isLocalhost) {
  // console.log('❌ CRITICAL: LOCAL_MODE=false but Supabase URL is localhost');
  // console.log('   Fix: Either set LOCAL_MODE=true OR update NEXT_PUBLIC_SUPABASE_URL to production URL');
  process.exit(1);
}

if (!localMode && isPlaceholder) {
  // console.log('⚠️ WARNING: LOCAL_MODE=false but Supabase URL is placeholder');
  // console.log('   Result: App will fall back to mock mode automatically');
}

if (localMode) {
  // console.log('✅ LOCAL_MODE enabled - app will run in offline mode with mock data');
}

if (!localMode && !isLocalhost && !isPlaceholder) {
  // console.log('✅ Production mode - attempting to connect to real Supabase');
}

// console.log('\n🎉 Environment verification complete!');