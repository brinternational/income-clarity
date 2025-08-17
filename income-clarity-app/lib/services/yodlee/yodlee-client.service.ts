import { Logger } from '@/lib/logger';

const logger = new Logger('YodleeClient');

export interface YodleeUser {
  id: string;
  loginName: string;
  email: string;
  createdAt: string;
}

export interface YodleeTokenResponse {
  token: {
    accessToken: string;
    issuedAt: number;
    expiresIn: number;
  };
}

export interface YodleeAccount {
  id: string;
  accountName: string;
  accountType: string;
  accountNumber: string;
  balance: {
    amount: number;
    currency: string;
  };
  lastUpdated: string;
  isActive: boolean;
}

export interface YodleeTransaction {
  id: string;
  amount: {
    amount: number;
    currency: string;
  };
  transactionDate: string;
  postDate: string;
  description: {
    original: string;
    simple?: string;
  };
  category: string[];
  baseType: 'CREDIT' | 'DEBIT';
  accountId: string;
  merchantName?: string;
}

export interface YodleeHolding {
  id: string;
  accountId: string;
  symbol: string;
  description: string;
  quantity: number;
  price: number;
  value: number;
  costBasis?: number;
  assetClassification?: string;
}

export class YodleeClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private adminLogin: string;
  private apiVersion: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private isConfigured: boolean = false;

  constructor() {
    this.baseUrl = process.env.YODLEE_API_URL || 'https://sandbox.api.yodlee.com/ysl';
    this.clientId = process.env.YODLEE_CLIENT_ID || '';
    this.clientSecret = process.env.YODLEE_CLIENT_SECRET || '';
    this.adminLogin = process.env.YODLEE_ADMIN_LOGIN || '';
    this.apiVersion = process.env.YODLEE_API_VERSION || '1.1';

    // Validate configuration
    this.isConfigured = !!(this.clientId && this.clientSecret && this.adminLogin);
    
    if (!this.isConfigured) {
      logger.warn('Yodlee service not configured - missing required environment variables');
      logger.warn('Required: YODLEE_CLIENT_ID, YODLEE_CLIENT_SECRET, YODLEE_ADMIN_LOGIN');
    } else {
      logger.info('Yodlee service configured successfully');
    }
  }

  /**
   * Check if Yodlee service is properly configured
   */
  isServiceConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get configuration status for API responses
   */
  getConfigurationStatus() {
    return {
      configured: this.isConfigured,
      missingVars: this.getMissingEnvironmentVariables(),
      message: this.isConfigured 
        ? 'Yodlee service is configured and ready'
        : 'Yodlee service is not configured - bank connections unavailable'
    };
  }

  /**
   * Get list of missing environment variables
   */
  private getMissingEnvironmentVariables(): string[] {
    const missing: string[] = [];
    if (!this.clientId) missing.push('YODLEE_CLIENT_ID');
    if (!this.clientSecret) missing.push('YODLEE_CLIENT_SECRET');
    if (!this.adminLogin) missing.push('YODLEE_ADMIN_LOGIN');
    return missing;
  }

  /**
   * Get access token using client credentials flow
   * For sandbox, uses admin login credentials
   */
  async getAccessToken(): Promise<string> {
    // Check configuration first
    if (!this.isConfigured) {
      throw new Error('Yodlee service not configured - missing environment variables');
    }

    // Check if we have a valid cached token
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    try {
      // Sandbox authentication using clientId and admin login
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: 'POST',
        headers: {
          'Api-Version': this.apiVersion,
          'Content-Type': 'application/x-www-form-urlencoded',
          'loginName': this.adminLogin,
        },
        body: new URLSearchParams({
          clientId: this.clientId,
          secret: this.clientSecret,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Auth response:', errorText);
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const data: YodleeTokenResponse = await response.json();
      
      this.accessToken = data.token.accessToken;
      // Set expiry with 5 minute buffer
      this.tokenExpiresAt = Date.now() + (data.token.expiresIn * 1000) - 300000;
      
      logger.info('Successfully obtained Yodlee access token');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get Yodlee access token', error);
      throw error;
    }
  }

  /**
   * Create a Yodlee user for an Income Clarity user
   * In sandbox mode, returns the test user
   */
  async createUser(email: string): Promise<YodleeUser> {
    // In sandbox, use the predefined test user
    if (this.baseUrl.includes('sandbox')) {
      logger.info('Using sandbox test user for', email);
      return {
        id: process.env.YODLEE_TEST_USER || 'sbMem68a0d5bfa0b691',
        loginName: process.env.YODLEE_TEST_USER || 'sbMem68a0d5bfa0b691',
        email: email,
        createdAt: new Date().toISOString(),
      };
    }
    
    const token = await this.getAccessToken();
    
    try {
      const response = await fetch(`${this.baseUrl}/user/register`, {
        method: 'POST',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            loginName: `ic_${email.replace('@', '_').replace('.', '_')}`,
            email: email,
            preferences: {
              currency: 'USD',
              timeZone: 'PST',
              dateFormat: 'MM/dd/yyyy',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create Yodlee user: ${response.statusText}`);
      }

      const data = await response.json();
      logger.info(`Created Yodlee user for ${email}`);
      return data.user;
    } catch (error) {
      logger.error('Failed to create Yodlee user', error);
      throw error;
    }
  }

  /**
   * Get user token for FastLink
   * In sandbox mode, returns a JWT token for the test user
   */
  async getUserToken(yodleeUserId: string): Promise<string> {
    const adminToken = await this.getAccessToken();
    
    // For sandbox, we might need to use a different approach
    // The test user token might be the same as admin token or generated differently
    if (this.baseUrl.includes('sandbox')) {
      logger.info('Using sandbox mode - generating token for test user');
      // In sandbox, the admin token can be used for the test user
      // or we generate a JWT token
      try {
        // Try the JWT token endpoint for sandbox
        const response = await fetch(`${this.baseUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Api-Version': this.apiVersion,
            'Content-Type': 'application/x-www-form-urlencoded',
            'loginName': yodleeUserId, // Use test user as loginName
          },
          body: new URLSearchParams({
            clientId: this.clientId,
            secret: this.clientSecret,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.token.accessToken;
        }
      } catch (error) {
        logger.warn('Could not get user-specific token, using admin token');
      }
      
      // Fallback: use admin token for sandbox
      return adminToken;
    }
    
    // Production flow
    try {
      const response = await fetch(`${this.baseUrl}/user/accessTokens`, {
        method: 'POST',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'loginName': yodleeUserId,
        },
        body: new URLSearchParams({
          appIds: '10003600', // FastLink app ID
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get user token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.user.accessTokens[0].value;
    } catch (error) {
      logger.error('Failed to get user token', error);
      throw error;
    }
  }

  /**
   * Get accounts for a user
   */
  async getAccounts(userToken: string): Promise<YodleeAccount[]> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'GET',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get accounts: ${response.statusText}`);
      }

      const data = await response.json();
      return data.account || [];
    } catch (error) {
      logger.error('Failed to get accounts', error);
      throw error;
    }
  }

  /**
   * Get transactions for a user
   */
  async getTransactions(
    userToken: string,
    fromDate?: string,
    toDate?: string,
    accountIds?: string[]
  ): Promise<YodleeTransaction[]> {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      if (accountIds?.length) params.append('accountId', accountIds.join(','));

      const response = await fetch(`${this.baseUrl}/transactions?${params}`, {
        method: 'GET',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get transactions: ${response.statusText}`);
      }

      const data = await response.json();
      return data.transaction || [];
    } catch (error) {
      logger.error('Failed to get transactions', error);
      throw error;
    }
  }

  /**
   * Get investment holdings for a user
   */
  async getHoldings(userToken: string, accountIds?: string[]): Promise<YodleeHolding[]> {
    try {
      const params = new URLSearchParams();
      if (accountIds?.length) params.append('accountId', accountIds.join(','));

      const response = await fetch(`${this.baseUrl}/holdings?${params}`, {
        method: 'GET',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get holdings: ${response.statusText}`);
      }

      const data = await response.json();
      return data.holding || [];
    } catch (error) {
      logger.error('Failed to get holdings', error);
      throw error;
    }
  }

  /**
   * Delete a user account link
   */
  async deleteAccount(userToken: string, accountId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete account: ${response.statusText}`);
      }

      logger.info(`Deleted account ${accountId}`);
    } catch (error) {
      logger.error('Failed to delete account', error);
      throw error;
    }
  }

  /**
   * Refresh account data
   */
  async refreshAccount(userToken: string, accountId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'PUT',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountId: parseInt(accountId),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh account: ${response.statusText}`);
      }

      logger.info(`Initiated refresh for account ${accountId}`);
    } catch (error) {
      logger.error('Failed to refresh account', error);
      throw error;
    }
  }

  /**
   * Get refresh status
   */
  async getRefreshStatus(userToken: string, accountId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh/${accountId}`, {
        method: 'GET',
        headers: {
          'Api-Version': this.apiVersion,
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get refresh status: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.error('Failed to get refresh status', error);
      throw error;
    }
  }
}

// Export singleton instance
export const yodleeClient = new YodleeClient();