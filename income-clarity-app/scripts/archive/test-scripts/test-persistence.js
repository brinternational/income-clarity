#!/usr/bin/env node

/**
 * Data persistence testing for Income Clarity Lite
 * Tests data saves, loads, backup, and restore functionality
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Test configuration
const TEST_DB_PATH = path.join(__dirname, '..', 'prisma', 'test_persistence.db');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper functions
function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  // console.log(`${icon} ${name}${details ? ` - ${details}` : ''}`);
  
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Database persistence tests
async function testDatabasePersistence() {
  // console.log('\n💾 Testing Database Persistence...');
  
  // Generate unique timestamp for this test run
  const timestamp = Date.now();
  
  try {
    // Import Prisma client and use main database for persistence testing
    const { PrismaClient } = require('../lib/generated/prisma');
    const prisma = new PrismaClient({
      log: ['error']
    });
    
    await prisma.$connect();
    
    // Create test data with unique email
    const testUser = await prisma.user.create({
      data: {
        email: `persistence-test-${timestamp}@incomeclarity.local`,
        passwordHash: 'test_hash_12345',
        settings: JSON.stringify({ theme: 'dark', currency: 'USD' }),
        taxProfile: JSON.stringify({ state: 'CA', filingStatus: 'single' })
      }
    });
    
    const testPortfolio = await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        name: 'Persistence Test Portfolio',
        type: 'Taxable',
        isPrimary: true
      }
    });
    
    const testHolding = await prisma.holding.create({
      data: {
        portfolioId: testPortfolio.id,
        ticker: 'SPY',
        shares: 25.5,
        costBasis: 10800.0,
        purchaseDate: new Date()
      }
    });
    
    const testIncome = await prisma.income.create({
      data: {
        userId: testUser.id,
        source: 'Dividend',
        category: 'DIVIDEND',
        amount: 287.50,
        date: new Date(),
        recurring: true,
        frequency: 'quarterly'
      }
    });
    
    const testExpense = await prisma.expense.create({
      data: {
        userId: testUser.id,
        category: 'RENT',
        merchant: 'Landlord Inc',
        amount: 2800.00,
        date: new Date(),
        recurring: true,
        frequency: 'monthly'
      }
    });
    
    logTest('Create Test Data', true, 'User, Portfolio, Holding, Income, Expense created');
    
    // Disconnect and reconnect to test persistence
    await prisma.$disconnect();
    await sleep(100); // Brief pause
    
    const prisma2 = new PrismaClient({
      log: ['error']
    });
    
    await prisma2.$connect();
    
    // Verify data persists after reconnection
    const persistedUser = await prisma2.user.findUnique({
      where: { email: `persistence-test-${timestamp}@incomeclarity.local` },
      include: {
        portfolios: {
          include: {
            holdings: true
          }
        },
        incomes: true,
        expenses: true
      }
    });
    
    logTest('Data Persistence After Reconnection', 
      persistedUser && 
      persistedUser.portfolios.length === 1 && 
      persistedUser.portfolios[0].holdings.length === 1 &&
      persistedUser.incomes.length === 1 &&
      persistedUser.expenses.length === 1,
      'All relationships maintained'
    );
    
    // Test data integrity
    const portfolio = persistedUser.portfolios[0];
    const holding = portfolio.holdings[0];
    const income = persistedUser.incomes[0];
    const expense = persistedUser.expenses[0];
    
    logTest('Portfolio Data Integrity', 
      portfolio.name === 'Persistence Test Portfolio' && portfolio.type === 'Taxable',
      'Name and type preserved'
    );
    
    logTest('Holding Data Integrity',
      holding.ticker === 'SPY' && holding.shares === 25.5 && holding.costBasis === 10800.0,
      'Ticker, shares, and cost basis preserved'
    );
    
    logTest('Income Data Integrity',
      income.source === 'Dividend' && income.amount === 287.50 && income.category === 'DIVIDEND',
      'Source, amount, and category preserved'
    );
    
    logTest('Expense Data Integrity',
      expense.category === 'RENT' && expense.amount === 2800.00,
      'Category and amount preserved'
    );
    
    // Test JSON field integrity
    const settings = JSON.parse(persistedUser.settings);
    const taxProfile = JSON.parse(persistedUser.taxProfile);
    
    logTest('JSON Fields Integrity',
      settings.theme === 'dark' && settings.currency === 'USD' &&
      taxProfile.state === 'CA' && taxProfile.filingStatus === 'single',
      'JSON serialization preserved'
    );
    
    // Cleanup
    await prisma2.income.delete({ where: { id: income.id } });
    await prisma2.expense.delete({ where: { id: expense.id } });
    await prisma2.holding.delete({ where: { id: holding.id } });
    await prisma2.portfolio.delete({ where: { id: portfolio.id } });
    await prisma2.user.delete({ where: { id: persistedUser.id } });
    
    await prisma2.$disconnect();
    
    logTest('Test Cleanup', true, 'All test data removed');
    
  } catch (error) {
    logTest('Database Persistence', false, `Error: ${error.message}`);
  }
}

// Backup functionality tests
async function testBackupFunctionality() {
  // console.log('\n💿 Testing Backup Functionality...');
  
  try {
    // Check if backup script exists
    const backupScriptPath = path.join(__dirname, 'backup-database.js');
    const backupExists = fs.existsSync(backupScriptPath);
    
    logTest('Backup Script Exists', backupExists, 'backup-database.js found');
    
    if (!backupExists) {
      // console.log('⚠️  Backup script not found, creating simple backup test...');
      
      // Create basic backup functionality test
      const dbPath = path.join(__dirname, '..', 'prisma', 'income_clarity.db');
      const dbExists = fs.existsSync(dbPath);
      
      logTest('Main Database Exists', dbExists, 'income_clarity.db found');
      
      if (dbExists) {
        const stats = fs.statSync(dbPath);
        logTest('Database File Size', stats.size > 0, `${stats.size} bytes`);
        
        // Test backup directory creation
        if (!fs.existsSync(BACKUP_DIR)) {
          fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
        logTest('Backup Directory Created', fs.existsSync(BACKUP_DIR));
        
        // Simple file copy backup test
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(BACKUP_DIR, `test_backup_${timestamp}.db`);
        
        try {
          fs.copyFileSync(dbPath, backupPath);
          const backupStats = fs.statSync(backupPath);
          logTest('Backup File Created', backupStats.size === stats.size, 'Same size as original');
          
          // Cleanup test backup
          fs.unlinkSync(backupPath);
          logTest('Backup Cleanup', true, 'Test backup file removed');
          
        } catch (copyError) {
          logTest('Backup Creation', false, `Copy failed: ${copyError.message}`);
        }
      }
      return;
    }
    
    // Test npm backup command if available
    try {
      const { stdout } = await execAsync('npm run backup', { 
        cwd: path.join(__dirname, '..'),
        timeout: 10000 
      });
      
      logTest('NPM Backup Command', stdout.includes('backup') || stdout.includes('success'), 'Command executed');
      
      // Check if backup files were created
      const backupFiles = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.db') || f.endsWith('.json'));
      logTest('Backup Files Created', backupFiles.length > 0, `${backupFiles.length} backup files found`);
      
    } catch (execError) {
      logTest('NPM Backup Command', false, `Command failed: ${execError.message}`);
    }
    
  } catch (error) {
    logTest('Backup Functionality', false, `Error: ${error.message}`);
  }
}

// Restore functionality tests
async function testRestoreFunctionality() {
  // console.log('\n🔄 Testing Restore Functionality...');
  
  try {
    // Check if restore script or command exists
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJsonExists = fs.existsSync(packageJsonPath);
    
    if (packageJsonExists) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const hasRestoreScript = packageJson.scripts && (
        packageJson.scripts['backup:restore'] || 
        packageJson.scripts['restore']
      );
      
      logTest('Restore Script Available', hasRestoreScript, 'Found in package.json');
    }
    
    // Check backup directory for existing backups
    if (fs.existsSync(BACKUP_DIR)) {
      const backupFiles = fs.readdirSync(BACKUP_DIR)
        .filter(f => f.endsWith('.db'))
        .sort()
        .reverse(); // Most recent first
      
      logTest('Available Backups', backupFiles.length > 0, `${backupFiles.length} backup files found`);
      
      if (backupFiles.length > 0) {
        const latestBackup = backupFiles[0];
        const backupPath = path.join(BACKUP_DIR, latestBackup);
        const backupStats = fs.statSync(backupPath);
        
        logTest('Latest Backup Integrity', backupStats.size > 0, `${latestBackup} - ${backupStats.size} bytes`);
        
        // Test backup file readability (basic integrity check)
        try {
          const { PrismaClient } = require('../lib/generated/prisma');
          const testPrisma = new PrismaClient({
            log: ['error'],
            datasources: {
              db: {
                url: `file:${backupPath}`
              }
            }
          });
          
          await testPrisma.$connect();
          await testPrisma.$queryRaw`SELECT COUNT(*) FROM sqlite_master WHERE type='table'`;
          await testPrisma.$disconnect();
          
          logTest('Backup File Readability', true, 'Database structure intact');
          
        } catch (readError) {
          logTest('Backup File Readability', false, `Cannot read backup: ${readError.message}`);
        }
      }
    } else {
      logTest('Backup Directory', false, 'Backup directory does not exist');
    }
    
  } catch (error) {
    logTest('Restore Functionality', false, `Error: ${error.message}`);
  }
}

// File system integrity tests
async function testFileSystemIntegrity() {
  // console.log('\n🗂️  Testing File System Integrity...');
  
  try {
    const dbPath = path.join(__dirname, '..', 'prisma', 'income_clarity.db');
    const dbExists = fs.existsSync(dbPath);
    
    logTest('Main Database File Exists', dbExists);
    
    if (dbExists) {
      const stats = fs.statSync(dbPath);
      logTest('Database File Readable', stats.isFile() && stats.size > 0);
      
      // Test file permissions
      try {
        fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        logTest('Database File Permissions', true, 'Read/Write access confirmed');
      } catch (accessError) {
        logTest('Database File Permissions', false, 'Access denied');
      }
      
      // Test SQLite database integrity
      try {
        const { PrismaClient } = require('../lib/generated/prisma');
        const prisma = new PrismaClient({ log: ['error'] });
        
        await prisma.$connect();
        
        // Run SQLite integrity check
        const integrityResult = await prisma.$queryRaw`PRAGMA integrity_check`;
        const isIntact = integrityResult.some(row => 
          Object.values(row).includes('ok') || Object.values(row).includes('OK')
        );
        
        logTest('SQLite Integrity Check', isIntact, 'Database structure verified');
        
        // Test schema consistency
        const tableCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'`;
        const hasExpectedTables = Array.isArray(tableCount) && tableCount[0] && tableCount[0].count >= 10;
        
        logTest('Database Schema Integrity', hasExpectedTables, `${tableCount[0]?.count || 0} tables found`);
        
        await prisma.$disconnect();
        
      } catch (dbError) {
        logTest('Database Integrity', false, `SQLite error: ${dbError.message}`);
      }
    }
    
    // Test data directory structure
    const dataDir = path.join(__dirname, '..', 'data');
    if (fs.existsSync(dataDir)) {
      const dataDirStats = fs.statSync(dataDir);
      logTest('Data Directory Structure', dataDirStats.isDirectory(), 'Data folder exists');
      
      const backupDirExists = fs.existsSync(BACKUP_DIR);
      logTest('Backup Directory Structure', backupDirExists, 'Backup folder exists');
    }
    
  } catch (error) {
    logTest('File System Integrity', false, `Error: ${error.message}`);
  }
}

// Transaction integrity tests
async function testTransactionIntegrity() {
  // console.log('\n🔄 Testing Transaction Integrity...');
  
  try {
    const { PrismaClient } = require('../lib/generated/prisma');
    const prisma = new PrismaClient({ log: ['error'] });
    
    await prisma.$connect();
    
    // Test transaction rollback on error
    let transactionFailed = false;
    try {
      await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email: 'transaction-test@incomeclarity.local',
            passwordHash: 'test_hash',
            settings: JSON.stringify({}),
            taxProfile: JSON.stringify({})
          }
        });
        
        // Create portfolio
        await tx.portfolio.create({
          data: {
            userId: user.id,
            name: 'Transaction Test Portfolio',
            type: 'Taxable',
            isPrimary: true
          }
        });
        
        // Intentionally fail the transaction
        throw new Error('Intentional transaction failure');
      });
    } catch (error) {
      transactionFailed = true;
    }
    
    // Verify rollback worked
    const userExists = await prisma.user.findUnique({
      where: { email: 'transaction-test@incomeclarity.local' }
    });
    
    logTest('Transaction Rollback', transactionFailed && !userExists, 'Failed transaction properly rolled back');
    
    // Test successful transaction
    let transactionUser = null;
    await prisma.$transaction(async (tx) => {
      transactionUser = await tx.user.create({
        data: {
          email: 'transaction-success@incomeclarity.local',
          passwordHash: 'test_hash',
          settings: JSON.stringify({}),
          taxProfile: JSON.stringify({})
        }
      });
      
      await tx.portfolio.create({
        data: {
          userId: transactionUser.id,
          name: 'Success Transaction Portfolio',
          type: 'Taxable',
          isPrimary: true
        }
      });
    });
    
    // Verify successful transaction
    const successUser = await prisma.user.findUnique({
      where: { email: 'transaction-success@incomeclarity.local' },
      include: { portfolios: true }
    });
    
    logTest('Transaction Success', 
      successUser && successUser.portfolios.length === 1,
      'Successful transaction committed'
    );
    
    // Cleanup
    if (successUser) {
      await prisma.portfolio.deleteMany({ where: { userId: successUser.id } });
      await prisma.user.delete({ where: { id: successUser.id } });
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    logTest('Transaction Integrity', false, `Error: ${error.message}`);
  }
}

// Main test runner
async function runPersistenceTests() {
  // console.log('💾 Income Clarity Persistence Test Suite');
  // console.log('=========================================');
  
  try {
    await testDatabasePersistence();
    await testBackupFunctionality();
    await testRestoreFunctionality();
    await testFileSystemIntegrity();
    await testTransactionIntegrity();
    
    // console.log('\n📊 Test Results Summary:');
    // console.log('========================');
    // console.log(`✅ Passed: ${testResults.passed}`);
    // console.log(`❌ Failed: ${testResults.failed}`);
    // console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    if (testResults.failed === 0) {
      // console.log('\n🎉 All persistence tests passed successfully!');
      // console.log('✅ Data persistence and backup systems are ready for production');
      process.exit(0);
    } else {
      // console.log('\n⚠️  Some tests failed. Review the issues above.');
      // console.log('\nFailed tests:');
      testResults.tests
        .filter(t => !t.passed)
        .forEach(t => console.log(`❌ ${t.name}${t.details ? ` - ${t.details}` : ''}`));
      process.exit(1);
    }
    
  } catch (error) {
    // console.error('❌ Persistence test suite failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPersistenceTests();
}

module.exports = { runPersistenceTests, testResults };