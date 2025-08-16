import React from 'react';
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return React.createElement('img', props);
  },
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver  
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
});

// Set up global test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
  Line: () => React.createElement('div', { 'data-testid': 'line' }),
  XAxis: () => React.createElement('div', { 'data-testid': 'x-axis' }),
  YAxis: () => React.createElement('div', { 'data-testid': 'y-axis' }),
  CartesianGrid: () => React.createElement('div', { 'data-testid': 'grid' }),
  Tooltip: () => React.createElement('div', { 'data-testid': 'tooltip' }),
  PieChart: ({ children }) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  Pie: () => React.createElement('div', { 'data-testid': 'pie' }),
  Cell: () => React.createElement('div', { 'data-testid': 'cell' }),
  BarChart: ({ children }) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  Bar: () => React.createElement('div', { 'data-testid': 'bar' }),
  Legend: () => React.createElement('div', { 'data-testid': 'legend' }),
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  const mockIcon = (props) => 
    React.createElement('div', { 'data-testid': 'icon', ...props });
  
  return new Proxy({}, {
    get: () => mockIcon
  });
});