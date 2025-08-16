export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  timezone: string;
  bio: string;
}

export interface ConnectedAccount {
  id: string;
  provider: 'google' | 'github' | 'apple';
  email: string;
  connectedAt: string;
  lastUsed: string;
}

export interface SecurityQuestion {
  id: string;
  question: string;
  answer: string; // hashed in real app
}

export interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  connectedAccounts: ConnectedAccount[];
  securityQuestions: SecurityQuestion[];
  loginHistory: LoginSession[];
  activeSessions: LoginSession[];
  passwordLastChanged: string;
  accountVerified: boolean;
}

export interface TaxSettings {
  location: string;
  residencyStatus: 'full-year' | 'part-year' | 'non-resident';
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_of_household';
  qualifiedDivOptimization: boolean;
  track19a: boolean;
  taxLotMethod: 'FIFO' | 'LIFO' | 'SpecificID';
  internationalWithholding: number;
  federalTaxRate: number;
  stateTaxRate: number;
  capitalGainsRate: number;
}

export interface NotificationChannel {
  dividendPayments: boolean;
  priceAlerts: boolean;
  portfolioChanges: boolean;
  taxReminders: boolean;
  rebalancingAlerts: boolean;
  securityAlerts: boolean;
  marketNews: boolean;
}

export interface SMSPreferences {
  enabled: boolean;
  phoneNumber: string;
  criticalAlertsOnly: boolean;
  quietHoursStart: string; // HH:mm format
  quietHoursEnd: string;
}

export interface NotificationSettings {
  email: NotificationChannel;
  push: NotificationChannel;
  sms: SMSPreferences;
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm
    end: string; // HH:mm
    timezone: string;
  };
}

export interface AppPreferences {
  theme: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  numberFormat: '1,000.00' | '1.000,00' | '1 000,00';
  language: 'en' | 'es' | 'fr' | 'de';
  dashboardLayout: string[];
  compactMode: boolean;
  showAnimations: boolean;
}

export interface PrivacySettings {
  analyticsEnabled: boolean;
  marketingEmails: boolean;
  dataRetention: number; // days
  privacyMode: boolean; // hide sensitive numbers
  shareAnonymousData: boolean;
  cookiesAccepted: boolean;
}

export interface UserSettings {
  personal: PersonalInfo;
  security: SecuritySettings;
  tax: TaxSettings;
  notifications: NotificationSettings;
  app: AppPreferences;
  privacy: PrivacySettings;
  lastUpdated: string;
}

// Default settings
export const defaultSettings: UserSettings = {
  personal: {
    name: '',
    email: '',
    phone: '',
    profilePicture: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: ''
  },
  security: {
    twoFactorEnabled: false,
    connectedAccounts: [],
    securityQuestions: [],
    loginHistory: [],
    activeSessions: [],
    passwordLastChanged: new Date().toISOString(),
    accountVerified: false
  },
  tax: {
    location: 'US-CA',
    residencyStatus: 'full-year',
    filingStatus: 'single',
    qualifiedDivOptimization: true,
    track19a: false,
    taxLotMethod: 'FIFO',
    internationalWithholding: 15,
    federalTaxRate: 22,
    stateTaxRate: 9.3,
    capitalGainsRate: 15
  },
  notifications: {
    email: {
      dividendPayments: true,
      priceAlerts: true,
      portfolioChanges: true,
      taxReminders: true,
      rebalancingAlerts: true,
      securityAlerts: true,
      marketNews: false
    },
    push: {
      dividendPayments: true,
      priceAlerts: false,
      portfolioChanges: true,
      taxReminders: true,
      rebalancingAlerts: true,
      securityAlerts: true,
      marketNews: false
    },
    sms: {
      enabled: false,
      phoneNumber: '',
      criticalAlertsOnly: true,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00'
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
  },
  app: {
    theme: 'modern-light',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    numberFormat: '1,000.00',
    language: 'en',
    dashboardLayout: ['income-clarity', 'portfolio-overview', 'spy-comparison', 'dividend-calendar'],
    compactMode: false,
    showAnimations: true
  },
  privacy: {
    analyticsEnabled: true,
    marketingEmails: true,
    dataRetention: 365 * 2, // 2 years
    privacyMode: false,
    shareAnonymousData: true,
    cookiesAccepted: true
  },
  lastUpdated: new Date().toISOString()
};

// Utility type for partial updates
export type SettingsUpdate = Partial<UserSettings>;

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface SaveMessage {
  type: 'success' | 'error';
  text: string;
}