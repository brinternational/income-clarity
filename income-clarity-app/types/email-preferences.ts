// TypeScript interfaces for email notification preferences

export interface EmailNotificationCategories {
  portfolioAlerts: boolean; // Price movements, performance alerts
  dividendNotifications: boolean; // Dividend payments and announcements
  taxOptimization: boolean; // Tax optimization suggestions
  milestoneAchievements: boolean; // Financial milestone celebrations
  systemUpdates: boolean; // App updates and maintenance
  monthlyReports: boolean; // Monthly performance summaries
  weeklyDigests: boolean; // Weekly portfolio digests
  marketAlerts: boolean; // Important market news affecting portfolio
}

export interface EmailPreferences {
  id: string;
  userId: string;
  email: string | null;
  emailVerified: boolean;
  notificationsEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: EmailNotificationCategories;
  lastEmailSent: Date | null;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailPreferencesFormData {
  email: string;
  notificationsEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  categories: EmailNotificationCategories;
}

export interface EmailPreferencesApiResponse {
  success: boolean;
  preferences?: EmailPreferences;
  error?: string;
  message?: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface EmailVerificationResponse {
  success: boolean;
  message: string;
  verificationSent?: boolean;
}

export interface TestEmailRequest {
  category: keyof EmailNotificationCategories;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
}

// Default email notification categories
export const DEFAULT_EMAIL_CATEGORIES: EmailNotificationCategories = {
  portfolioAlerts: true,
  dividendNotifications: true,
  taxOptimization: true,
  milestoneAchievements: true,
  systemUpdates: false,
  monthlyReports: true,
  weeklyDigests: false,
  marketAlerts: false,
};

// Email frequency options for UI
export const EMAIL_FREQUENCY_OPTIONS = [
  { value: 'immediate' as const, label: 'Immediate', description: 'Send emails as events occur' },
  { value: 'daily' as const, label: 'Daily Digest', description: 'One email per day with all updates' },
  { value: 'weekly' as const, label: 'Weekly Summary', description: 'Weekly portfolio and activity summary' },
];

// Category descriptions for UI
export const EMAIL_CATEGORY_DESCRIPTIONS: Record<keyof EmailNotificationCategories, { title: string; description: string }> = {
  portfolioAlerts: {
    title: 'Portfolio Alerts',
    description: 'Significant price movements and performance changes',
  },
  dividendNotifications: {
    title: 'Dividend Notifications',
    description: 'Dividend payments, announcements, and schedule updates',
  },
  taxOptimization: {
    title: 'Tax Optimization',
    description: 'Tax-saving suggestions and strategy recommendations',
  },
  milestoneAchievements: {
    title: 'Milestone Achievements',
    description: 'Celebrations when you reach financial milestones',
  },
  systemUpdates: {
    title: 'System Updates',
    description: 'App updates, maintenance notices, and new features',
  },
  monthlyReports: {
    title: 'Monthly Reports',
    description: 'Comprehensive monthly performance and progress reports',
  },
  weeklyDigests: {
    title: 'Weekly Digests',
    description: 'Weekly portfolio summaries and market insights',
  },
  marketAlerts: {
    title: 'Market Alerts',
    description: 'Important market news and events affecting your portfolio',
  },
};