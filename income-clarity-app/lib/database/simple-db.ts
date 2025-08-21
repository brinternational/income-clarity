import Database from 'better-sqlite3';
import { join } from 'path';

// Simple SQLite database for single-user portfolio data
const dbPath = join(process.cwd(), 'data', 'income-clarity-simple.db');
const db = new Database(dbPath);

// Initialize database with simple schema
export function initializeDatabase() {
  try {
    // Users table (single user)
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

    // Portfolios table
    db.exec(`
      CREATE TABLE IF NOT EXISTS portfolios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Holdings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS holdings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        portfolio_id INTEGER NOT NULL,
        symbol TEXT NOT NULL,
        shares REAL NOT NULL,
        cost_basis REAL NOT NULL,
        current_price REAL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (portfolio_id) REFERENCES portfolios (id)
      )
    `);

    // Dividends table
    db.exec(`
      CREATE TABLE IF NOT EXISTS dividends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        holding_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        ex_date DATE NOT NULL,
        pay_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (holding_id) REFERENCES holdings (id)
      )
    `);

    // Simple settings table
    db.exec(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        setting_key TEXT NOT NULL,
        setting_value TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        UNIQUE(user_id, setting_key)
      )
    `);

    console.log('✅ Simple database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Database operations
export const simpleDB = {
  // User operations
  createUser: (email: string, passwordHash: string, name?: string) => {
    const stmt = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)');
    return stmt.run(email, passwordHash, name);
  },

  getUserByEmail: (email: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  getUserById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  // Portfolio operations
  createPortfolio: (userId: number, name: string, description?: string) => {
    const stmt = db.prepare('INSERT INTO portfolios (user_id, name, description) VALUES (?, ?, ?)');
    return stmt.run(userId, name, description);
  },

  getUserPortfolios: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM portfolios WHERE user_id = ?');
    return stmt.all(userId);
  },

  // Holdings operations
  addHolding: (portfolioId: number, symbol: string, shares: number, costBasis: number) => {
    const stmt = db.prepare('INSERT INTO holdings (portfolio_id, symbol, shares, cost_basis) VALUES (?, ?, ?, ?)');
    return stmt.run(portfolioId, symbol, shares, costBasis);
  },

  getPortfolioHoldings: (portfolioId: number) => {
    const stmt = db.prepare('SELECT * FROM holdings WHERE portfolio_id = ?');
    return stmt.all(portfolioId);
  },

  updateHoldingPrice: (holdingId: number, currentPrice: number) => {
    const stmt = db.prepare('UPDATE holdings SET current_price = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(currentPrice, holdingId);
  },

  // Dividend operations
  addDividend: (holdingId: number, amount: number, exDate: string, payDate: string) => {
    const stmt = db.prepare('INSERT INTO dividends (holding_id, amount, ex_date, pay_date) VALUES (?, ?, ?, ?)');
    return stmt.run(holdingId, amount, exDate, payDate);
  },

  getHoldingDividends: (holdingId: number) => {
    const stmt = db.prepare('SELECT * FROM dividends WHERE holding_id = ?');
    return stmt.all(holdingId);
  },

  // Settings operations
  setSetting: (userId: number, key: string, value: string) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO user_settings (user_id, setting_key, setting_value) VALUES (?, ?, ?)');
    return stmt.run(userId, key, value);
  },

  getSetting: (userId: number, key: string) => {
    const stmt = db.prepare('SELECT setting_value FROM user_settings WHERE user_id = ? AND setting_key = ?');
    const result = stmt.get(userId, key) as any;
    return result?.setting_value;
  },

  // Close database
  close: () => {
    db.close();
  }
};

// Initialize on import
initializeDatabase();

export default simpleDB;