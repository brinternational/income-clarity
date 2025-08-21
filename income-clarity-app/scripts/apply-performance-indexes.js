/**
 * Apply Performance Optimization Database Indexes
 * Adds indexes to commonly queried fields for better performance
 */

const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('fs');
const { join } = require('path');

const prisma = new PrismaClient();

async function applyPerformanceIndexes() {
  try {
    console.log('🚀 Applying performance optimization indexes...');
    
    // Read the SQL file
    const sqlPath = join(__dirname, '..', 'prisma', 'migrations', 'performance_indexes.sql');
    const sql = readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements and execute each one
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let skipCount = 0;
    
    for (const statement of statements) {
      try {
        if (statement === 'ANALYZE') {
          // Handle ANALYZE separately
          await prisma.$executeRawUnsafe('ANALYZE');
          console.log('✅ ANALYZE completed');
          successCount++;
        } else if (statement.includes('CREATE INDEX')) {
          // Extract index name for better logging
          const match = statement.match(/CREATE INDEX IF NOT EXISTS (\w+)/);
          const indexName = match ? match[1] : 'unnamed';
          
          await prisma.$executeRawUnsafe(statement);
          console.log(`✅ Created index: ${indexName}`);
          successCount++;
        } else {
          await prisma.$executeRawUnsafe(statement);
          successCount++;
        }
      } catch (error) {
        if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
          console.log(`⚠️ Index already exists: ${statement.substring(0, 50)}...`);
          skipCount++;
        } else {
          console.error(`❌ Error executing: ${statement.substring(0, 50)}...`);
          console.error('Error:', error.message);
        }
      }
    }
    
    console.log('🎉 Performance indexes applied successfully!');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️ Skipped (already exist): ${skipCount}`);
    
    // Test query performance
    console.log('🔍 Testing index performance...');
    
    const testQueries = [
      { name: 'Users by email', query: () => prisma.user.findUnique({ where: { email: 'test@example.com' } }) },
      { name: 'User portfolios', query: () => prisma.portfolio.findMany({ where: { userId: { not: null } }, take: 5 }) },
      { name: 'Holdings by ticker', query: () => prisma.holding.findMany({ where: { ticker: 'AAPL' }, take: 5 }) },
      { name: 'Recent transactions', query: () => prisma.transaction.findMany({ orderBy: { date: 'desc' }, take: 5 }) }
    ];
    
    for (const test of testQueries) {
      const start = Date.now();
      try {
        await test.query();
        const duration = Date.now() - start;
        console.log(`⚡ ${test.name}: ${duration}ms`);
      } catch (error) {
        console.log(`❌ ${test.name}: Error - ${error.message}`);
      }
    }
    
    console.log('🏁 Performance optimization complete!');
    
  } catch (error) {
    console.error('❌ Error applying performance indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
applyPerformanceIndexes().catch(console.error);