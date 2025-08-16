// LOCAL_MODE Configuration - Complete offline mode for Income Clarity
// Allows full app testing without external dependencies

export const LOCAL_MODE_CONFIG = {
  // Enhanced LOCAL_MODE detection with better environment variable handling
  ENABLED: (() => {
    // Try environment variables with multiple fallbacks
    const localModeEnv = process.env.LOCAL_MODE;
    const publicLocalModeEnv = process.env.NEXT_PUBLIC_LOCAL_MODE;
    
    const envLocalMode = localModeEnv === 'true' || publicLocalModeEnv === 'true';
    
    // Fallback: Check if we're on localhost (client-side only)
    const isLocalhost = typeof window !== 'undefined' && 
                       (window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1');
    
    // Fallback: Check for localhost in Supabase URL (indicates development setup)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const isSupabaseLocalhost = supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1');
    
    // Final calculation with explicit logic
    const shouldEnableLocalMode = envLocalMode || isLocalhost || isSupabaseLocalhost;
    
    // Return true if any condition indicates local mode should be enabled
    return shouldEnableLocalMode;
  })(),
  
  // Feature flags for local mode
  FEATURES: {
    SKIP_AUTH: true,           // Skip Supabase authentication
    USE_MOCK_DATA: true,       // Use mock data for all operations
    USE_LOCAL_STORAGE: true,   // Persist data to localStorage
    SKIP_POLYGON_API: true,    // Skip stock price API calls
    INSTANT_RESPONSES: true,   // No artificial delays
    DEMO_NOTIFICATIONS: true,  // Show demo notifications
  },
  
  // Local storage keys
  STORAGE_KEYS: {
    USER_PROFILE: 'income-clarity-user-profile',
    PORTFOLIOS: 'income-clarity-portfolios',
    HOLDINGS: 'income-clarity-holdings',
    EXPENSES: 'income-clarity-expenses',
    SUPER_CARDS_DATA: 'income-clarity-super-cards',
    PREFERENCES: 'income-clarity-preferences',
    AUTH_SESSION: 'income-clarity-auth-session',
  },
  
  // Mock user configuration
  MOCK_USER: {
    id: 'local-user-1',
    email: 'demo@incomeClarity.local',
    name: 'Demo User',
    created_at: new Date().toISOString(),
    location: {
      country: 'PR',
      state: 'PR',
      taxRates: {
        capitalGains: 0.0,      // Puerto Rico tax advantage
        ordinaryIncome: 0.0,    // No income tax on qualified dividends
        qualified: 0.0          // 0% qualified dividend tax
      }
    },
    goals: {
      monthlyExpenses: 3800,
      targetCoverage: 1.0,
      stressFreeLiving: 5000
    }
  },
  
  // Mock data refresh intervals (for simulating real-time updates)
  REFRESH_INTERVALS: {
    STOCK_PRICES: 30000,      // 30 seconds
    PORTFOLIO_VALUE: 60000,   // 1 minute
    DIVIDEND_INCOME: 300000,  // 5 minutes
  }
} as const;

// Utility functions for local mode
export const LocalModeUtils = {
  // Check if local mode is enabled
  isEnabled(): boolean {
    return LOCAL_MODE_CONFIG.ENABLED;
  },
  
  // Check if a specific feature is enabled
  isFeatureEnabled(feature: keyof typeof LOCAL_MODE_CONFIG.FEATURES): boolean {
    return LOCAL_MODE_CONFIG.ENABLED && LOCAL_MODE_CONFIG.FEATURES[feature];
  },
  
  // Get storage key
  getStorageKey(key: keyof typeof LOCAL_MODE_CONFIG.STORAGE_KEYS): string {
    return LOCAL_MODE_CONFIG.STORAGE_KEYS[key];
  },
  
  // Log local mode action (disabled - no console.log)
  log(action: string, data?: any): void {
    // Console logging disabled to meet ZERO console errors requirement
  },
  
  // Simulate network delay (optional for testing)
  async simulateDelay(ms: number = 0): Promise<void> {
    if (ms > 0 && LOCAL_MODE_CONFIG.ENABLED && !LOCAL_MODE_CONFIG.FEATURES.INSTANT_RESPONSES) {
      await new Promise(resolve => setTimeout(resolve, ms));
    }
  }
};

// Type definitions for local mode
export type LocalModeConfig = typeof LOCAL_MODE_CONFIG;
export type LocalModeFeature = keyof typeof LOCAL_MODE_CONFIG.FEATURES;
export type LocalModeStorageKey = keyof typeof LOCAL_MODE_CONFIG.STORAGE_KEYS;