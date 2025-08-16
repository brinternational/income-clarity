import '@testing-library/jest-dom'

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
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    return <img {...props} />
  },
}))

// Mock Supabase client (conditional mock)
const mockSupabaseClient = () => ({
  createClientComponentClient: () => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOtp: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      updateUser: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      mfa: {
        enroll: jest.fn(),
        verify: jest.fn(),
      },
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
      containedBy: jest.fn().mockReturnThis(),
      rangeGt: jest.fn().mockReturnThis(),
      rangeLt: jest.fn().mockReturnThis(),
      rangeGte: jest.fn().mockReturnThis(),
      rangeLte: jest.fn().mockReturnThis(),
      rangeAdjacent: jest.fn().mockReturnThis(),
      overlaps: jest.fn().mockReturnThis(),
      textSearch: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn(),
      maybeSingle: jest.fn(),
      csv: jest.fn(),
      upsert: jest.fn().mockReturnThis(),
    })),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        list: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
        createSignedUrl: jest.fn(),
      })),
    },
  }),
}));

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
})

// Set up global test environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock isows module
jest.mock('isows', () => ({
  __esModule: true,
  default: class MockWebSocket {
    constructor() {}
    close() {}
    send() {}
  },
  WebSocket: class MockWebSocket {
    constructor() {}
    close() {}
    send() {}
  }
}))

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => children,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  Legend: () => <div data-testid="legend" />,
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => {
  const mockIcon = ({ className, ...props }) => 
    <div data-testid="icon" className={className} {...props} />
  
  return new Proxy({}, {
    get: () => mockIcon
  })
})

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
)

// Mock theme colors for dividend alerts - needs to handle all possible alert types
const mockDividendColors = {
  increases: {
    primary: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '#10b981',
  },
  cuts: {
    primary: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '#ef4444',
  },
  special: {
    primary: '#3b82f6',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '#3b82f6',
  },
  suspensions: {
    primary: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '#f59e0b',
  },
  // Add fallback for incorrect test types
  increase: {
    primary: '#10b981',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '#10b981',
  },
  cut: {
    primary: '#ef4444',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '#ef4444',
  },
  suspension: {
    primary: '#f59e0b',
    background: 'rgba(245, 158, 11, 0.1)',
    border: '#f59e0b',
  },
}

jest.mock('@/types/dividendAlerts', () => ({
  DIVIDEND_ALERT_COLORS: mockDividendColors,
  DIVIDEND_ALERT_ICONS: {
    increases: 'TrendingUp',
    cuts: 'TrendingDown',
    special: 'Gift',
    suspensions: 'Pause',
    // Add fallback for incorrect test types
    increase: 'TrendingUp',
    cut: 'TrendingDown',
    suspension: 'Pause',
  },
  DEFAULT_DIVIDEND_ALERT_SETTINGS: {
    enabled: true,
    alertTypes: {
      increases: true,
      cuts: true,
      special: true,
      suspensions: true,
    },
    thresholds: {
      minimumChangePercent: 5,
      holdingsOnly: false,
    },
    notifications: {
      browser: true,
      email: false,
    },
  },
}))

// Mock Theme Context
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    currentTheme: {
      name: 'Professional Dark',
      id: 'professional-dark',
      colors: {
        primary: '#0f172a',
        secondary: '#1e293b',
        accent: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
        textPrimary: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textMuted: '#64748b',
        border: '#334155',
        divider: '#475569'
      }
    },
    setTheme: jest.fn(),
    themes: [
      {
        name: 'Professional Dark',
        id: 'professional-dark',
        colors: {
          primary: '#0f172a',
          secondary: '#1e293b',
          accent: '#3b82f6'
        }
      }
    ]
  }),
  ThemeProvider: ({ children }) => children
}))