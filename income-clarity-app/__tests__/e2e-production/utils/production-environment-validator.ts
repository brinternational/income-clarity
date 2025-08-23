/**
 * Production Environment Validator
 * 
 * CRITICAL RESPONSIBILITIES:
 * - Block ALL localhost testing attempts
 * - Validate production environment accessibility
 * - Verify SSL certificate validity
 * - Check network connectivity and DNS resolution
 * - Validate API endpoint availability
 */

import { chromium } from '@playwright/test'

export class ProductionEnvironmentValidator {
  private readonly PRODUCTION_URL = 'https://incomeclarity.ddns.net'
  private readonly BLOCKED_LOCALHOST_PATTERNS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'http://localhost',
    'https://localhost'
  ]

  /**
   * CRITICAL: Block all localhost testing attempts
   */
  async blockLocalhostAttempts(): Promise<void> {
    // Override process.env to prevent localhost fallbacks
    const originalNodeEnv = process.env.NODE_ENV
    
    // Set strict production environment
    process.env.NODE_ENV = 'production'
    process.env.PLAYWRIGHT_BASE_URL = this.PRODUCTION_URL
    process.env.TEST_ENVIRONMENT = 'production-only'
    
    // Block common localhost environment variables
    delete process.env.LOCALHOST_URL
    delete process.env.LOCAL_BASE_URL
    delete process.env.DEV_URL
    
    console.log('🚫 Localhost blocking activated')
    console.log('📍 Enforced production URL:', this.PRODUCTION_URL)
  }

  /**
   * Validate production environment connectivity
   */
  async validateProductionConnectivity(productionUrl: string): Promise<boolean> {
    console.log(`🔍 Validating production connectivity: ${productionUrl}`)
    
    try {
      // Step 1: DNS Resolution Check
      const dnsValid = await this.validateDNSResolution(productionUrl)
      if (!dnsValid) {
        throw new Error('DNS resolution failed')
      }
      
      // Step 2: HTTP/HTTPS Connectivity Check
      const response = await fetch(productionUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'ProductionE2EValidator/1.0'
        },
        timeout: 15000
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      // Step 3: SSL Certificate Validation
      if (productionUrl.startsWith('https://')) {
        await this.validateSSLCertificate(productionUrl)
      }
      
      // Step 4: Essential API Endpoints Validation
      await this.validateAPIEndpoints(productionUrl)
      
      console.log('✅ Production environment validation passed')
      return true
      
    } catch (error) {
      console.error('❌ Production environment validation failed:', error.message)
      return false
    }
  }

  /**
   * Validate DNS resolution
   */
  private async validateDNSResolution(url: string): Promise<boolean> {
    try {
      const hostname = new URL(url).hostname
      
      // Use node's dns module for resolution check
      const dns = require('dns').promises
      const addresses = await dns.lookup(hostname)
      
      console.log(`✅ DNS resolved: ${hostname} -> ${addresses.address}`)
      return true
      
    } catch (error) {
      console.error(`❌ DNS resolution failed: ${error.message}`)
      return false
    }
  }

  /**
   * Validate SSL certificate
   */
  private async validateSSLCertificate(httpsUrl: string): Promise<void> {
    const https = require('https')
    const url = require('url')
    
    return new Promise((resolve, reject) => {
      const options = url.parse(httpsUrl)
      options.method = 'HEAD'
      options.timeout = 10000
      
      const req = https.request(options, (res: any) => {
        const cert = res.socket.getPeerCertificate()
        
        if (res.socket.authorized) {
          console.log('✅ SSL certificate valid')
          resolve()
        } else {
          reject(new Error(`SSL certificate invalid: ${res.socket.authorizationError}`))
        }
      })
      
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('SSL validation timeout'))
      })
      
      req.on('error', (error: Error) => {
        reject(new Error(`SSL validation error: ${error.message}`))
      })
      
      req.end()
    })
  }

  /**
   * Validate essential API endpoints
   */
  private async validateAPIEndpoints(baseUrl: string): Promise<void> {
    const essentialEndpoints = [
      '/api/health',
      '/api/auth/me',
      '/auth/login'
    ]
    
    for (const endpoint of essentialEndpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`, {
          method: endpoint.includes('/auth/me') ? 'GET' : 'HEAD',
          timeout: 10000
        })
        
        // For auth endpoints, 401 is acceptable (not authenticated)
        const acceptableStatuses = endpoint.includes('/auth') ? [200, 401, 302] : [200]
        
        if (acceptableStatuses.includes(response.status)) {
          console.log(`✅ API endpoint accessible: ${endpoint}`)
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
        
      } catch (error) {
        throw new Error(`API endpoint validation failed ${endpoint}: ${error.message}`)
      }
    }
  }

  /**
   * Validate that no localhost URLs are being used in tests
   */
  async validateNoLocalhostInTestContext(page: any): Promise<void> {
    const currentUrl = page.url()
    
    for (const pattern of this.BLOCKED_LOCALHOST_PATTERNS) {
      if (currentUrl.includes(pattern)) {
        throw new Error(`❌ CRITICAL VIOLATION: Localhost detected in test: ${currentUrl}. Production-only testing required!`)
      }
    }
  }

  /**
   * Get production environment information
   */
  getProductionEnvironmentInfo(): Record<string, any> {
    return {
      productionUrl: this.PRODUCTION_URL,
      environment: 'production-only',
      localhostBlocked: true,
      validatedAt: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      testEnvironment: process.env.TEST_ENVIRONMENT
    }
  }
}