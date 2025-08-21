// Setup demo user for simplified authentication
const bcryptjs = require('bcryptjs');
const Database = require('better-sqlite3');
const { join } = require('path');

// Simple SQLite database for single-user portfolio data
const dbPath = join(process.cwd(), 'data', 'income-clarity-simple.db');

async function setupDemoUser() {
  try {
    console.log('🔍 Setting up demo user...');
    
    const db = new Database(dbPath);
    
    // Initialize database tables if they don't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if demo user already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('test@example.com');
    
    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email);
      db.close();
      return;
    }

    // Create demo user
    const email = 'test@example.com';
    const password = 'password123';
    const name = 'Demo User';
    
    // Hash password
    const passwordHash = await bcryptjs.hash(password, 12);
    
    // Insert user
    const result = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)').run(email, passwordHash, name);
    
    console.log('✅ Demo user created successfully!');
    console.log(`   ID: ${result.lastInsertRowid}`);
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    
    db.close();
    
  } catch (error) {
    console.error('❌ Error setting up demo user:', error);
    throw error;
  }
}

setupDemoUser()
  .then(() => {
    console.log('\n🎉 Demo user setup complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });