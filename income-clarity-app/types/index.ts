// User and location types
export interface User {
  id: string;
  email: string;
  name: string;
  onboardingCompleted?: boolean;  // Track if user has completed onboarding
  location: {
    country: 'US' | 'PR';
    state: string;
    taxRates: {
      capitalGains: number;    // 0.0 (PR) | 0.15 | 0.20
      ordinaryIncome: number;  // 0.0 (PR) | state rates
      qualified: number;       // 0.0 (PR) | 0.15
    };
  };
  goals: {
    monthlyExpenses: number;   // 3800
    targetCoverage: number;    // 1.0 = 100%
    stressFreeLiving: number;  // 5000
    monthlyContribution?: number;  // NEW FIELD - Monthly investment contribution
  };
  financialProfile?: {  // NEW SECTION
    currentAge?: number;
    retirementAge?: number;
    currentPortfolioValue?: number;
    monthlyContribution?: number;
  };
}

// Portfolio and holding types
export interface Holding {
  id: string;
  portfolio_id: string;
  ticker: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  currentValue?: number;
  monthlyIncome?: number;
  monthlyDividend?: number;
  annualYield?: number;
  yieldPercent?: number;
  taxTreatment?: 'qualified' | 'ordinary' | 'roc' | 'mixed';
  strategy?: 'dividend' | 'covered_call' | 'growth' | 'reit';
  ytdPerformance: number;     // vs SPY
  sector?: string;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: string;
  userId: string;
  name?: string;
  totalValue: number;
  monthlyGrossIncome: number;
  monthlyNetIncome: number;   // After taxes
  monthlyAvailable: number;   // After expenses
  marginUsed: number;
  marginCost: number;         // Monthly cost
  spyComparison: {
    portfolioReturn: number;  // YTD %
    spyReturn: number;        // YTD %
    outperformance: number;   // Difference
  };
  holdings?: Holding[];
  created_at?: string;
  updated_at?: string;
}

// Calculation result types
export interface IncomeClarityResult {
  grossMonthly: number;
  taxOwed: number;
  netMonthly: number;
  monthlyExpenses: number;
  availableToReinvest: number;
  aboveZeroLine: boolean;
}

// Enhanced Income Clarity with new features
export interface EnhancedIncomeClarityResult extends IncomeClarityResult {
  monthsAboveZero: number;
  taxBreakdownByType: TaxBreakdown[];
  viewMode: 'monthly' | 'quarterly';
  projectedIncome: number;
  incomeTrend: number[]; // last 6 months
  incomeGrowthRate: number; // percentage growth month over month
}

// Tax breakdown by holding type
export interface TaxBreakdown {
  type: 'qualified' | 'ordinary' | 'roc' | 'mixed';
  label: string;
  amount: number;
  percentage: number;
  color: string;
  description: string;
}

// Above Zero Streak Tracking
export interface MonthlyStreakData {
  month: string;     // Format: "2024-01", "2024-02", etc.
  aboveZero: boolean;
  surplus: number;   // Positive if above zero, negative if below
  milestoneReached?: boolean; // True if this month completed a milestone
}

export interface StreakTracker {
  currentStreak: number;      // Current consecutive months above zero
  longestStreak: number;      // All-time longest streak
  totalAboveZeroMonths: number; // Total months above zero (non-consecutive)
  monthlyHistory: MonthlyStreakData[]; // Last 12 months of data
  milestones: {
    threeMonths: boolean;     // Has achieved 3+ months streak
    sixMonths: boolean;       // Has achieved 6+ months streak
    twelveMonths: boolean;    // Has achieved 12+ months streak
    lastMilestone?: number;   // Last milestone achieved (3, 6, or 12)
  };
  riskLevel: 'low' | 'moderate' | 'high'; // Based on current streak and trend
  warningTriggered: boolean; // True if approaching zero line
}

export interface ExpenseMilestone {
  id: string;
  name: string;
  amount: number;
  covered: boolean;
  percentageCovered: number;
  monthlyIncomeNeeded: number;
  isCustom?: boolean;
  icon?: string;
  priority?: number;
}

export interface TaxSmartAlert {
  id: string;
  type: 'optimization' | 'warning' | 'info';
  title: string;
  description: string;
  potentialSavings?: number;
  actionRequired: boolean;
}

// Profile type for user profile data
export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  tax_rate: number;
  state: string;
  monthly_expenses: number;
  created_at: string;
  updated_at: string;
}

// Expense type for expense tracking
export interface Expense {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  recurring?: boolean;
  created_at: string;
  updated_at: string;
}

// Push notification types
export interface NotificationPreferences {
  enabled: boolean;
  types: {
    exDividend24h: boolean;      // 24-hour warning notifications
    exDividendMorning: boolean;  // Morning-of notifications (8 AM)
    weeklySummary: boolean;      // Weekly summary notifications (Sunday)
    dividendPayments: boolean;   // Payment received notifications
    portfolioAlerts: boolean;    // General portfolio alerts
  };
  quietHours: {
    enabled: boolean;
    start: string;  // "22:00" format
    end: string;    // "08:00" format
    timezone?: string; // User's timezone
  };
  platforms: {
    web: boolean;     // Web push notifications
    mobile: boolean;  // Mobile push (if PWA installed)
  };
}

// Dividend notification data structure
export interface DividendNotification {
  id: string;
  userId: string;
  holdingId: string;
  symbol: string;
  companyName: string;
  exDate: string;           // ISO date string
  recordDate: string;       // ISO date string  
  payDate: string;          // ISO date string
  dividendAmount: number;   // Per share amount
  shares: number;           // User's shares
  totalDividend: number;    // Expected total payment
  notificationType: 'ex-dividend-24h' | 'ex-dividend-morning' | 'weekly-summary' | 'dividend-payment';
  scheduledTime: string;    // When to send notification
  sentAt?: string;         // When notification was sent
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Dividend calendar entry (for ex-dividend date tracking)
export interface DividendCalendarEntry {
  id: string;
  symbol: string;
  companyName: string;
  exDate: string;           // ISO date string
  recordDate: string;       // ISO date string
  payDate: string;          // ISO date string
  dividendAmount: number;   // Per share
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'special';
  divType: 'regular' | 'special' | 'extra';
  currency: 'USD' | string;
  source: 'manual' | 'api' | 'estimated';
  created_at: string;
  updated_at: string;
}

// Dividend announcement types
export interface DividendAnnouncement {
  id: string;
  userId: string;
  symbol: string;
  companyName: string;
  announcementType: 'increase' | 'decrease' | 'special' | 'initiation' | 'suspension' | 'frequency_change';
  oldAmount?: number;        // Previous dividend amount (null for initiation)
  newAmount: number;         // New dividend amount (0 for suspension)
  percentageChange?: number; // Percentage change (null for initiation/suspension)
  oldFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  newFrequency?: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  announcementDate: string;  // ISO date when announcement was made
  effectiveDate: string;     // ISO date when change takes effect
  recordDate?: string;       // ISO date for special dividends
  payDate?: string;          // ISO date for payment (special dividends)
  description?: string;      // Additional announcement details
  source: 'api' | 'manual' | 'estimated';
  created_at: string;
  updated_at: string;
}

// Dividend announcement preferences
export interface DividendAnnouncementPreferences {
  enabled: boolean;
  holdings: {
    allHoldings: boolean;      // Alert for all holdings
    specificHoldings: string[]; // Array of ticker symbols
  };
  announcementTypes: {
    increase: boolean;         // Dividend increases
    decrease: boolean;         // Dividend decreases  
    special: boolean;          // Special dividends
    initiation: boolean;       // New dividend programs
    suspension: boolean;       // Dividend cuts/eliminations
    frequencyChange: boolean;  // Frequency changes
  };
  alertThresholds: {
    enabled: boolean;
    minChangePercent: number;  // Only alert if change >= this percentage (default: 5%)
    minAmount: number;         // Only alert if dividend >= this amount (default: 0.01)
  };
  deliveryMethods: {
    pushNotification: boolean; // Web/mobile push notifications
    inAppCenter: boolean;      // In-app notification center
  };
  quietHours: {
    enabled: boolean;
    start: string;             // "22:00" format
    end: string;               // "08:00" format
    timezone?: string;         // User's timezone
  };
}

// Multi-Factor Authentication (MFA) types
export interface MFAFactor {
  id: string;
  userId: string;
  type: 'totp';  // Time-based One-Time Password
  status: 'verified' | 'unverified' | 'disabled';
  friendlyName: string;     // User-defined name for the factor (e.g., "iPhone", "Google Authenticator")
  secret?: string;          // Secret key (only shown during enrollment)
  qrCodeUrl?: string;       // QR code URL for enrollment
  backupCodes?: string[];   // Recovery codes (only shown once during enrollment)
  createdAt: string;        // ISO timestamp
  updatedAt: string;        // ISO timestamp
  lastUsed?: string;        // ISO timestamp of last successful verification
}

export interface MFAEnrollmentRequest {
  factorType: 'totp';
  friendlyName: string;
}

export interface MFAEnrollmentResponse {
  success: boolean;
  factor?: MFAFactor;
  qrCode?: string;          // Base64 encoded QR code image
  manualEntryKey?: string;  // Manual entry key for authenticator apps
  backupCodes?: string[];   // One-time recovery codes
  error?: string;
}

export interface MFAVerificationRequest {
  factorId: string;
  code: string;             // 6-digit TOTP code
  challengeId?: string;     // Challenge ID from auth system
}

export interface MFAVerificationResponse {
  success: boolean;
  sessionValid?: boolean;   // Whether the user session is now fully authenticated
  error?: string;
  remainingAttempts?: number; // For rate limiting feedback
}

export interface MFADisableRequest {
  factorId: string;
  password: string;         // User must confirm password to disable MFA
}

export interface MFAStatus {
  enabled: boolean;
  factorCount: number;
  factors: MFAFactor[];
  canDisable: boolean;      // Whether user can disable (e.g., must have password auth enabled)
  lastVerification?: string; // ISO timestamp of last successful MFA verification
}

export interface MFASettings {
  requireForLogin: boolean;      // Whether MFA is required for all logins
  requireForSensitiveActions: boolean; // Whether MFA is required for sensitive operations
  backupCodeUsageAlert: boolean; // Alert user when backup codes are used
  newDeviceAlert: boolean;       // Alert user when logging in from new device
}

export interface BackupCode {
  id: string;
  code: string;     // 8-character alphanumeric code
  used: boolean;
  usedAt?: string;  // ISO timestamp when used
  usedFrom?: string; // IP address or device info
  createdAt: string;
}

// Push notification payload structure (updated with MFA events)
export interface PushNotificationPayload {
  type: 'ex-dividend-24h' | 'ex-dividend-morning' | 'weekly-summary' | 'dividend-payment' | 'portfolio-alert' | 'announcement-increase' | 'announcement-decrease' | 'announcement-special' | 'announcement-initiation' | 'announcement-suspension' | 'announcement-frequency' | 'mfa-enabled' | 'mfa-disabled' | 'backup-code-used' | 'new-device-login' | 'generic';
  title: string;
  body: string;
  data?: {
    symbol?: string;
    holdingId?: string;
    portfolioId?: string;
    amount?: number;
    exDate?: string;
    announcementId?: string;   // For dividend announcements
    announcementType?: string; // Type of announcement
    changePercent?: number;    // Percentage change for announcements
    deviceInfo?: string;       // For security-related notifications
    ip?: string;              // IP address for security notifications
    url?: string;              // Deep link URL
    [key: string]: any;
  };
  timestamp: number;
}