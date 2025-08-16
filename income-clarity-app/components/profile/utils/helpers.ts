// Deep merge utility for combining settings objects
export function deepMerge<T extends Record<string, any>>(...objects: Partial<T>[]): T {
  const result = {} as T;
  
  for (const obj of objects) {
    if (!obj) continue;
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = deepMerge(result[key] || {}, value) as T[Extract<keyof T, string>];
        } else if (value !== undefined) {
          result[key] = value as T[Extract<keyof T, string>];
        }
      }
    }
  }
  
  return result;
}

// Format phone number for display
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Validate phone number
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

// Get timezone display name
export function getTimezoneDisplay(timezone: string): string {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'long'
    });
    
    const parts = formatter.formatToParts(date);
    const timeZoneName = parts.find(part => part.type === 'timeZoneName')?.value;
    
    if (timeZoneName) {
      const offset = getTimezoneOffset(timezone);
      return `${timezone.replace('_', ' ')} (${timeZoneName}, UTC${offset})`;
    }
  } catch (error) {
    // logger.error('Error formatting timezone:', error);
  }
  
  return timezone;
}

// Get timezone offset
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const offset = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    
    const sign = offset >= 0 ? '+' : '-';
    const hours = Math.floor(Math.abs(offset));
    const minutes = Math.floor((Math.abs(offset) % 1) * 60);
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    return '+00:00';
  }
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Generate secure password
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

// Check password strength
export function checkPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];
  
  // Length check
  if (password.length >= 8) score += 1;
  else suggestions.push('Use at least 8 characters');
  
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else suggestions.push('Include lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else suggestions.push('Include uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else suggestions.push('Include numbers');
  
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else suggestions.push('Include special characters');
  
  // Common patterns penalty
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score -= 1; // Common sequences
  
  // Determine strength
  let label, color;
  if (score <= 2) {
    label = 'Weak';
    color = 'red';
  } else if (score <= 4) {
    label = 'Fair';
    color = 'yellow';
  } else if (score <= 5) {
    label = 'Good';
    color = 'blue';
  } else {
    label = 'Strong';
    color = 'green';
  }
  
  return { score, label, color, suggestions };
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Get country name from country code
export function getCountryName(countryCode: string): string {
  const countries: Record<string, string> = {
    'US': 'United States',
    'PR': 'Puerto Rico',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'AU': 'Australia',
    'JP': 'Japan'
  };
  
  return countries[countryCode] || countryCode;
}

// Format currency based on app preferences
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (error) {
    return `$${amount.toFixed(2)}`;
  }
}

// Format date based on app preferences
export function formatDate(
  date: string | Date,
  format: string = 'MM/DD/YYYY',
  locale: string = 'en-US'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'DD/MM/YYYY') {
    return d.toLocaleDateString('en-GB');
  } else if (format === 'YYYY-MM-DD') {
    return d.toISOString().split('T')[0];
  }
  
  return d.toLocaleDateString(locale);
}

// Get available timezones grouped by region
export function getTimezoneOptions(): { label: string; value: string; group: string }[] {
  const timezones = [
    // US Timezones
    { label: 'Eastern Time (New York)', value: 'America/New_York', group: 'United States' },
    { label: 'Central Time (Chicago)', value: 'America/Chicago', group: 'United States' },
    { label: 'Mountain Time (Denver)', value: 'America/Denver', group: 'United States' },
    { label: 'Pacific Time (Los Angeles)', value: 'America/Los_Angeles', group: 'United States' },
    { label: 'Alaska Time (Anchorage)', value: 'America/Anchorage', group: 'United States' },
    { label: 'Hawaii Time (Honolulu)', value: 'Pacific/Honolulu', group: 'United States' },
    { label: 'Puerto Rico', value: 'America/Puerto_Rico', group: 'United States' },
    
    // Major International
    { label: 'London', value: 'Europe/London', group: 'Europe' },
    { label: 'Paris', value: 'Europe/Paris', group: 'Europe' },
    { label: 'Berlin', value: 'Europe/Berlin', group: 'Europe' },
    { label: 'Tokyo', value: 'Asia/Tokyo', group: 'Asia' },
    { label: 'Sydney', value: 'Australia/Sydney', group: 'Australia' },
    { label: 'Toronto', value: 'America/Toronto', group: 'North America' }
  ];
  
  return timezones;
}