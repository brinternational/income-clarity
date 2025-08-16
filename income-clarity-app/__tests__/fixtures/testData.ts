// Test fixtures for Income Clarity app
import React from 'react';
import { IncomeClarityResult } from '@/types';

export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  isOnboarded: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  profile: {
    riskTolerance: 'moderate' as const,
    experienceLevel: 'intermediate' as const,
    taxLocation: 'TX' as const,
  }
};

export const mockPortfolio = {
  id: 'test-portfolio-id',
  name: 'Test Portfolio',
  description: 'Test portfolio for unit tests',
  userId: 'test-user-id',
  isActive: true,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

export const mockHoldings = [
  {
    id: 'holding-1',
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    shares: 100,
    avgPrice: 150.00,
    currentPrice: 160.00,
    totalValue: 16000,
    gainLoss: 1000,
    gainLossPercent: 6.67,
    dividendYield: 0.46,
    annualDividend: 73.60,
    portfolioId: 'test-portfolio-id',
    sector: 'Technology',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'holding-2', 
    symbol: 'MSFT',
    companyName: 'Microsoft Corporation',
    shares: 50,
    avgPrice: 250.00,
    currentPrice: 275.00,
    totalValue: 13750,
    gainLoss: 1250,
    gainLossPercent: 10.00,
    dividendYield: 0.72,
    annualDividend: 99.00,
    portfolioId: 'test-portfolio-id',
    sector: 'Technology',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'holding-3',
    symbol: 'SPY',
    companyName: 'SPDR S&P 500 ETF Trust',
    shares: 25,
    avgPrice: 400.00,
    currentPrice: 420.00,
    totalValue: 10500,
    gainLoss: 500,
    gainLossPercent: 5.00,
    dividendYield: 1.25,
    annualDividend: 131.25,
    portfolioId: 'test-portfolio-id',
    sector: 'ETF',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  }
];

export const mockExpenses = [
  {
    id: 'expense-1',
    name: 'Housing',
    amount: 2000,
    category: 'housing' as const,
    priority: 'essential' as const,
    userId: 'test-user-id',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'expense-2',
    name: 'Food',
    amount: 600,
    category: 'food' as const,
    priority: 'essential' as const,
    userId: 'test-user-id',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'expense-3',
    name: 'Entertainment',
    amount: 300,
    category: 'entertainment' as const,
    priority: 'discretionary' as const,
    userId: 'test-user-id',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  }
];

export const mockClarityData: IncomeClarityResult = {
  grossMonthly: 25.32,
  taxOwed: 0,
  netMonthly: 25.32,
  monthlyExpenses: 2900,
  availableToReinvest: -2874.68,
  aboveZeroLine: false
};

export const mockStockPrices = {
  AAPL: 160.00,
  MSFT: 275.00,
  SPY: 420.00,
};

export const mockAPIResponse = <T>(data: T, delay = 0) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

export const mockAPIError = (message: string, status = 500) => {
  return Promise.reject(new Error(message));
};

export const mockPolygonAPI = {
  aggregates: {
    AAPL: {
      status: 'OK',
      results: [{
        c: 160.00, // close
        h: 162.00, // high
        l: 158.00, // low
        n: 100000, // transactions
        o: 159.00, // open
        t: Date.now(), // timestamp
        v: 50000000, // volume
        vw: 160.00 // volume weighted average
      }]
    },
    SPY: {
      status: 'OK',
      results: [{
        c: 420.00,
        h: 422.00,
        l: 418.00,
        n: 200000,
        o: 419.00,
        t: Date.now(),
        v: 100000000,
        vw: 420.00
      }]
    }
  }
};

export const mockChartData = [
  { date: '2024-01-01', value: 100000, income: 250 },
  { date: '2024-02-01', value: 101000, income: 255 },
  { date: '2024-03-01', value: 102500, income: 262 },
  { date: '2024-04-01', value: 104000, income: 268 },
  { date: '2024-05-01', value: 105800, income: 275 },
  { date: '2024-06-01', value: 107200, income: 282 },
];

export const mockEmailPreferences = {
  enabled: true,
  email: 'test@example.com',
  frequency: 'weekly' as const,
  alertTypes: {
    dividendAnnouncements: true,
    portfolioPerformance: true,
    milestoneAchievements: true,
    taxOptimizations: true,
  },
  isVerified: true,
  verificationToken: null,
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

export const mockImportData = {
  csv: `Symbol,Shares,Price
AAPL,100,150.00
MSFT,50,250.00
SPY,25,400.00`,
  validatedData: [
    { symbol: 'AAPL', shares: 100, price: 150.00, valid: true, errors: [] },
    { symbol: 'MSFT', shares: 50, price: 250.00, valid: true, errors: [] },
    { symbol: 'SPY', shares: 25, price: 400.00, valid: true, errors: [] },
  ],
  summary: {
    totalRows: 3,
    validRows: 3,
    invalidRows: 0,
    totalValue: 40250.00,
  }
};

// Mock context providers
export const MockAuthProvider = ({ children, user = mockUser }: { children: any; user?: typeof mockUser | null }) => {
  const value = {
    user,
    loading: false,
    error: null,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    updateProfile: jest.fn(),
  };
  
  return children;
};

export const MockPortfolioProvider = ({ children, portfolio = mockPortfolio, holdings = mockHoldings }: { 
  children: any; 
  portfolio?: typeof mockPortfolio | null;
  holdings?: typeof mockHoldings;
}) => {
  const value = {
    activePortfolio: portfolio,
    portfolios: portfolio ? [portfolio] : [],
    holdings,
    loading: false,
    error: null,
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    addHolding: jest.fn(),
    updateHolding: jest.fn(),
    deleteHolding: jest.fn(),
    importHoldings: jest.fn(),
  };
  
  return children;
};

export const MockThemeProvider = ({ children }: { children: any }) => {
  return children;
};

// Test utilities
export const createMockComponent = (name: string) => {
  return ({ children, ...props }: any) => {
    return React.createElement('div', {
      'data-testid': name.toLowerCase(),
      ...props
    }, children);
  };
};

export const waitForLoadingToFinish = async () => {
  const { waitFor } = await import('@testing-library/react');
  await waitFor(() => {
    const loadingElement = document.querySelector('[data-testid*="loading"]');
    expect(loadingElement).not.toBeInTheDocument();
  });
};

export const mockConsoleError = () => {
  const originalError = console.error;
  console.error = jest.fn();
  
  return () => {
    console.error = originalError;
  };
};

export const mockLocalStorage = () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    
    return {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        store = {};
      }),
    };
  })();

  Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  return localStorageMock;
};