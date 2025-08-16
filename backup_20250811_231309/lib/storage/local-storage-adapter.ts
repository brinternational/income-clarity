// Local Storage Adapter - Offline persistence for LOCAL_MODE
// Provides database-like interface using browser localStorage

import { LocalModeUtils, LOCAL_MODE_CONFIG } from '../config/local-mode';
import { mockData } from '../mock-data/super-cards-mock-data';

export class LocalStorageAdapter {
  private static instance: LocalStorageAdapter;
  private initialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeStorage();
    }
  }

  static getInstance(): LocalStorageAdapter {
    if (!LocalStorageAdapter.instance) {
      LocalStorageAdapter.instance = new LocalStorageAdapter();
    }
    return LocalStorageAdapter.instance;
  }

  // Initialize storage with mock data if not exists
  private initializeStorage(): void {
    if (this.initialized || !LocalModeUtils.isEnabled()) return;

    try {
      // Initialize user profile
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('USER_PROFILE'))) {
        this.setItem('USER_PROFILE', mockData.user);
      }

      // Initialize portfolios
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('PORTFOLIOS'))) {
        this.setItem('PORTFOLIOS', [mockData.portfolio]);
      }

      // Initialize holdings
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('HOLDINGS'))) {
        this.setItem('HOLDINGS', mockData.holdings);
      }

      // Initialize expenses
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('EXPENSES'))) {
        this.setItem('EXPENSES', mockData.expenses);
      }

      // Initialize super cards data
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('SUPER_CARDS_DATA'))) {
        this.setItem('SUPER_CARDS_DATA', mockData.superCards);
      }

      // Initialize auth session
      if (!localStorage.getItem(LocalModeUtils.getStorageKey('AUTH_SESSION'))) {
        this.setItem('AUTH_SESSION', {
          user: mockData.user,
          session: {
            access_token: 'local-mode-token',
            refresh_token: 'local-mode-refresh',
            expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
          },
          authenticated: true,
          created_at: new Date().toISOString()
        });
      }

      this.initialized = true;
      LocalModeUtils.log('LocalStorageAdapter initialized with mock data');
    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  // Generic storage methods
  setItem(key: keyof typeof LOCAL_MODE_CONFIG.STORAGE_KEYS, data: any): boolean {
    if (!LocalModeUtils.isEnabled() || typeof window === 'undefined') {
      return false;
    }

    try {
      const storageKey = LocalModeUtils.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
      LocalModeUtils.log(`Saved to localStorage: ${key}`, { dataSize: JSON.stringify(data).length });
      return true;
    } catch (error) {
      // console.error(`Failed to save ${key} to localStorage:`, error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    try {
      const storageKey = LocalModeUtils.getStorageKey(key);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return defaultValue;
      }

      const parsed = JSON.parse(stored);
      LocalModeUtils.log(`Retrieved from localStorage: ${key}`, { timestamp: parsed.timestamp });
      return parsed.data;
    } catch (error) {
      // console.error(`Failed to retrieve ${key} from localStorage:`, error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    try {
      const storageKey = LocalModeUtils.getStorageKey(key);
      localStorage.removeItem(storageKey);
      LocalModeUtils.log(`Removed from localStorage: ${key}`);
      return true;
    } catch (error) {
      // console.error(`Failed to remove ${key} from localStorage:`, error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    try {
      Object.keys(LOCAL_MODE_CONFIG.STORAGE_KEYS).forEach(key => {
        this.removeItem(key as keyof typeof LOCAL_MODE_CONFIG.STORAGE_KEYS);
      });
      this.initialized = false;
      LocalModeUtils.log('Cleared all localStorage data');
      return true;
    } catch (error) {
      // console.error('Failed to clear localStorage:', error);
      return false;
    }
  }

  async findUserById(userId: string): Promise<any> {
    const user = this.getItem('USER_PROFILE');
    return user && user.id === userId ? user : null;
  }

  async findPortfoliosByUserId(userId: string): Promise<any[]> {
    await LocalModeUtils.simulateDelay(100);
    const portfolios = this.getItem('PORTFOLIOS', []);
    return portfolios.filter((p: any) => p.userId === userId);
  }

  async findHoldingsByPortfolioId(portfolioId: string): Promise<any[]> {
    await LocalModeUtils.simulateDelay(75);
    const holdings = this.getItem('HOLDINGS', []);
    return holdings.filter((h: any) => h.portfolio_id === portfolioId);
  }

  async findExpensesByUserId(userId: string): Promise<any[]> {
    await LocalModeUtils.simulateDelay(50);
    const expenses = this.getItem('EXPENSES', []);
    return expenses; // For simplicity, return all expenses in local mode
  }

  async getSuperCardsData(userId: string, cards?: string[]): Promise<any> {
    await LocalModeUtils.simulateDelay(100);
    const allData = this.getItem('SUPER_CARDS_DATA', {});
    
    if (!cards || cards.length === 0) {
      return allData;
    }

    // Return only requested cards
    const requestedData: any = {};
    cards.forEach(card => {
      if (allData[card]) {
        requestedData[card] = allData[card];
      }
    });

    return requestedData;
  }

  // Update methods for real-time simulation
  async updateHolding(holdingId: string, updates: Partial<any>): Promise<boolean> {
    await LocalModeUtils.simulateDelay(50);
    
    const holdings = this.getItem('HOLDINGS', []);
    const updatedHoldings = holdings.map((h: any) => 
      h.id === holdingId ? { ...h, ...updates, updated_at: new Date().toISOString() } : h
    );
    
    return this.setItem('HOLDINGS', updatedHoldings);
  }

  async addHolding(holding: any): Promise<boolean> {
    await LocalModeUtils.simulateDelay(100);
    
    const holdings = this.getItem('HOLDINGS', []);
    const newHolding = {
      ...holding,
      id: `holding-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    holdings.push(newHolding);
    return this.setItem('HOLDINGS', holdings);
  }

  async removeHolding(holdingId: string): Promise<boolean> {
    await LocalModeUtils.simulateDelay(75);
    
    const holdings = this.getItem('HOLDINGS', []);
    const filteredHoldings = holdings.filter((h: any) => h.id !== holdingId);
    
    return this.setItem('HOLDINGS', filteredHoldings);
  }

  // Stock price updates (simulated real-time)
  async getStockPrice(ticker: string): Promise<{ price: number; change: number; changePercent: number } | null> {
    await LocalModeUtils.simulateDelay(25);
    
    const stockPrices = mockData.stockPrices;
    if (stockPrices[ticker as keyof typeof stockPrices]) {
      // Add small random variation to simulate real-time updates
      const basePrice = stockPrices[ticker as keyof typeof stockPrices];
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      
      return {
        price: basePrice.price * (1 + variation),
        change: basePrice.change + (basePrice.price * variation),
        changePercent: basePrice.changePercent + (variation * 100)
      };
    }
    
    return null;
  }

  // Get storage statistics
  getStorageStats(): { 
    totalKeys: number; 
    totalSize: number; 
    lastUpdated: string | null;
    initialized: boolean;
  } {
    if (typeof window === 'undefined') {
      return { totalKeys: 0, totalSize: 0, lastUpdated: null, initialized: false };
    }

    let totalSize = 0;
    let totalKeys = 0;
    let lastUpdated: string | null = null;

    Object.values(LOCAL_MODE_CONFIG.STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalKeys++;
        totalSize += item.length;
        
        try {
          const parsed = JSON.parse(item);
          if (!lastUpdated || parsed.timestamp > lastUpdated) {
            lastUpdated = parsed.timestamp;
          }
        } catch {
          // Ignore parse errors for stats
        }
      }
    });

    return {
      totalKeys,
      totalSize,
      lastUpdated,
      initialized: this.initialized
    };
  }
}

// Export singleton instance
export const localStorageAdapter = LocalStorageAdapter.getInstance();
export default localStorageAdapter;