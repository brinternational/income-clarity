#!/usr/bin/env node
/**
 * Environment Validation Script
 * Purpose: Validate required environment variables are present
 * Usage: node scripts/validate-env.js
 * Lifecycle: Permanent utility script
 */

require('dotenv').config({ path: '.env.local' });

const chalk = require('chalk');

console.log(chalk.blue('\n🔍 Income Clarity - Environment Validation\n'));

// Required variables for Lite Production mode
const requiredVars = {
  'POLYGON_API_KEY': 'Stock price API access',
  'SESSION_SECRET': 'Session security', 
  'DATABASE_URL': 'Database connection',
  'LITE_PRODUCTION_MODE': 'Production mode flag'
};

// Optional but recommended for production
const recommendedVars = {
  'NEXT_PUBLIC_SUPABASE_URL': 'Supabase database (future)',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase auth (future)',
  'SUPABASE_SERVICE_ROLE_KEY': 'Supabase admin access (future)'
};

let hasAllRequired = true;
let hasRecommended = 0;

console.log(chalk.yellow('Required Variables:'));
Object.entries(requiredVars).forEach(([varName, description]) => {
  if (process.env[varName]) {
    console.log(chalk.green(`✅ ${varName}: ${description}`));
  } else {
    console.log(chalk.red(`❌ ${varName}: ${description} - MISSING`));
    hasAllRequired = false;
  }
});

console.log(chalk.yellow('\nRecommended Variables (Future Production):'));
Object.entries(recommendedVars).forEach(([varName, description]) => {
  if (process.env[varName]) {
    console.log(chalk.green(`✅ ${varName}: ${description}`));
    hasRecommended++;
  } else {
    console.log(chalk.gray(`⚪ ${varName}: ${description} - Not configured`));
  }
});

// Summary
console.log('\n' + chalk.blue('='.repeat(50)));
if (hasAllRequired) {
  console.log(chalk.green('🎉 All required variables present - Lite Production ready!'));
  console.log(chalk.yellow(`📊 Recommended variables: ${hasRecommended}/${Object.keys(recommendedVars).length} configured`));
  
  if (hasRecommended === 0) {
    console.log(chalk.gray('💡 Consider configuring Supabase for full production deployment'));
  }
  
  process.exit(0);
} else {
  console.log(chalk.red('❌ Missing required environment variables!'));
  console.log(chalk.yellow('📝 Add missing variables to .env.local file'));
  process.exit(1);
}