#!/usr/bin/env node

/**
 * Debug script to test Yodlee FastLink URL generation
 * This script helps diagnose issues with the FastLink iframe showing "Internal Server Error"
 */

require('dotenv').config();
const https = require('https');
const querystring = require('querystring');

class YodleeDebugger {
  constructor() {
    this.baseUrl = process.env.YODLEE_API_URL || 'https://sandbox.api.yodlee.com/ysl';
    this.fastlinkUrl = process.env.YODLEE_FASTLINK_URL || 'https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink';
    this.clientId = process.env.YODLEE_CLIENT_ID;
    this.clientSecret = process.env.YODLEE_CLIENT_SECRET;
    this.adminLogin = process.env.YODLEE_ADMIN_LOGIN;
    this.testUser = process.env.YODLEE_TEST_USER;
    this.apiVersion = process.env.YODLEE_API_VERSION || '1.1';
  }

  log(message, data = null) {
    console.log(`[${new Date().toISOString()}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'IncomeClarity/1.0',
          ...options.headers
        }
      };

      if (options.body) {
        requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
      }

      const req = https.request(requestOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const result = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: data
            };
            
            // Try to parse JSON
            try {
              result.json = JSON.parse(data);
            } catch (e) {
              // Not JSON, keep as text
            }
            
            resolve(result);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  async getAccessToken() {
    this.log('🔑 Getting Yodlee access token...');
    
    const body = querystring.stringify({
      clientId: this.clientId,
      secret: this.clientSecret
    });

    const response = await this.makeRequest(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': this.apiVersion,
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': this.adminLogin
      },
      body
    });

    this.log(`Token request status: ${response.statusCode}`);
    
    if (response.statusCode !== 200 && response.statusCode !== 201) {
      this.log('❌ Failed to get access token', {
        status: response.statusCode,
        headers: response.headers,
        body: response.body
      });
      throw new Error(`Failed to get access token: ${response.statusCode}`);
    }

    if (response.json && response.json.token) {
      this.log('✅ Access token obtained successfully');
      return response.json.token.accessToken;
    } else {
      this.log('❌ Invalid token response format', response.json);
      throw new Error('Invalid token response format');
    }
  }

  async getUserToken(accessToken) {
    this.log('👤 Getting user token for FastLink...');
    
    // For sandbox, try using the test user directly
    const body = querystring.stringify({
      clientId: this.clientId,
      secret: this.clientSecret
    });

    const response = await this.makeRequest(`${this.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': this.apiVersion,
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': this.testUser
      },
      body
    });

    this.log(`User token request status: ${response.statusCode}`);
    
    if ((response.statusCode === 200 || response.statusCode === 201) && response.json && response.json.token) {
      this.log('✅ User token obtained successfully');
      return response.json.token.accessToken;
    } else {
      this.log('⚠️ User-specific token failed, using admin token');
      return accessToken;
    }
  }

  testFastLinkUrl(token, extraParams) {
    const params = new URLSearchParams({
      token,
      extraParams: JSON.stringify(extraParams)
    });
    
    return `${this.fastlinkUrl}?${params}`;
  }

  async testFastLinkAccess(fastlinkUrl) {
    this.log('🌐 Testing FastLink URL access...');
    
    try {
      const response = await this.makeRequest(fastlinkUrl);
      
      this.log(`FastLink URL test status: ${response.statusCode}`);
      this.log('Response headers:', response.headers);
      
      if (response.body.includes('Internal Server Error')) {
        this.log('❌ FastLink URL returns Internal Server Error');
        return false;
      } else if (response.body.includes('yodlee') || response.body.includes('fastlink')) {
        this.log('✅ FastLink URL appears to be working');
        return true;
      } else {
        this.log('⚠️ FastLink URL returns unexpected content');
        this.log('Response body (first 200 chars):', response.body.substring(0, 200));
        return false;
      }
    } catch (error) {
      this.log('❌ Failed to test FastLink URL', error.message);
      return false;
    }
  }

  async debugConfiguration() {
    this.log('🔧 Debugging Yodlee configuration...');
    
    const config = {
      baseUrl: this.baseUrl,
      fastlinkUrl: this.fastlinkUrl,
      clientId: this.clientId ? `${this.clientId.substring(0, 8)}...` : 'MISSING',
      clientSecret: this.clientSecret ? `${this.clientSecret.substring(0, 8)}...` : 'MISSING',
      adminLogin: this.adminLogin || 'MISSING',
      testUser: this.testUser || 'MISSING',
      apiVersion: this.apiVersion
    };
    
    this.log('Configuration:', config);
    
    const missing = [];
    if (!this.clientId) missing.push('YODLEE_CLIENT_ID');
    if (!this.clientSecret) missing.push('YODLEE_CLIENT_SECRET');
    if (!this.adminLogin) missing.push('YODLEE_ADMIN_LOGIN');
    if (!this.testUser) missing.push('YODLEE_TEST_USER');
    
    if (missing.length > 0) {
      this.log('❌ Missing required environment variables:', missing);
      return false;
    }
    
    this.log('✅ All required environment variables are configured');
    return true;
  }

  async run() {
    console.log('🚀 Starting Yodlee FastLink Debug Session\n');
    
    try {
      // Check configuration
      const configOk = await this.debugConfiguration();
      if (!configOk) {
        process.exit(1);
      }
      
      console.log('\n' + '='.repeat(50));
      
      // Get access token
      const accessToken = await this.getAccessToken();
      
      console.log('\n' + '='.repeat(50));
      
      // Get user token
      const userToken = await this.getUserToken(accessToken);
      
      console.log('\n' + '='.repeat(50));
      
      // Test different FastLink URL configurations
      const testConfigs = [
        {
          name: 'Standard Configuration',
          extraParams: {
            callback: '/api/yodlee/callback',
            flow: 'aggregation',
            configName: 'Aggregation'
          }
        },
        {
          name: 'Absolute Callback URL',
          extraParams: {
            callback: 'http://localhost:3000/api/yodlee/callback',
            flow: 'aggregation',
            configName: 'Aggregation'
          }
        },
        {
          name: 'Minimal Configuration',
          extraParams: {
            flow: 'aggregation'
          }
        },
        {
          name: 'Alternative Config Name',
          extraParams: {
            callback: '/api/yodlee/callback',
            flow: 'aggregation',
            configName: 'FastLinkDev'
          }
        }
      ];
      
      for (const config of testConfigs) {
        this.log(`\n🧪 Testing: ${config.name}`);
        const fastlinkUrl = this.testFastLinkUrl(userToken, config.extraParams);
        this.log('Generated URL:', fastlinkUrl);
        
        const works = await this.testFastLinkAccess(fastlinkUrl);
        if (works) {
          this.log(`✅ SUCCESS: ${config.name} works!`);
          this.log('Use this configuration in your app');
          break;
        } else {
          this.log(`❌ FAILED: ${config.name} doesn't work`);
        }
      }
      
      console.log('\n' + '='.repeat(50));
      this.log('🏁 Debug session complete');
      
    } catch (error) {
      this.log('💥 Debug session failed', error.message);
      console.error(error);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const debug = new YodleeDebugger();
  debug.run();
}

module.exports = YodleeDebugger;