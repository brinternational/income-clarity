// API-008: Load Testing and Capacity Planning for Super Cards API
// Test with 1000+ concurrent users to identify bottlenecks
// Comprehensive performance testing suite

const { performance } = require('perf_hooks')
const fetch = require('node-fetch')
const fs = require('fs')
const path = require('path')

// Load test configuration
const CONFIG = {
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  MAX_CONCURRENT_USERS: process.env.MAX_USERS ? parseInt(process.env.MAX_USERS) : 1000,
  TEST_DURATION_MINUTES: process.env.TEST_DURATION ? parseInt(process.env.TEST_DURATION) : 5,
  RAMP_UP_DURATION_SECONDS: 30, // Gradually increase load over 30 seconds
  REPORT_INTERVAL_SECONDS: 10, // Report progress every 10 seconds
  
  // Performance targets
  TARGETS: {
    RESPONSE_TIME_P95: 200, // 95th percentile under 200ms
    RESPONSE_TIME_P99: 500, // 99th percentile under 500ms
    ERROR_RATE: 0.01, // Less than 1% error rate
    THROUGHPUT_RPS: 100, // At least 100 requests per second
  },

  // Test scenarios
  SCENARIOS: {
    SINGLE_CARD: { weight: 30, cards: ['performance'] },
    DASHBOARD_VIEW: { weight: 40, cards: ['performance', 'income', 'lifestyle'] },
    FULL_OVERVIEW: { weight: 20, cards: ['performance', 'income', 'lifestyle', 'strategy', 'quickActions'] },
    BATCH_REQUEST: { weight: 10, type: 'batch' }
  }
}

// Test data generators
class TestDataGenerator {
  constructor() {
    this.testUsers = []
    this.requestCounter = 0
  }

  // Generate test user credentials
  generateTestUsers(count) {
    // console.log(`🔧 Generating ${count} test users...`)
    
    for (let i = 0; i < count; i++) {
      this.testUsers.push({
        id: `test-user-${i}`,
        email: `loadtest${i}@incomerarity.test`,
        token: `test-token-${i}`, // Mock JWT token
        profile: {
          subscription_tier: i % 10 === 0 ? 'premium' : 'free',
          portfolioValue: 10000 + (Math.random() * 90000),
          hasData: Math.random() > 0.2 // 80% have data
        }
      })
    }
    
    // console.log(`✅ Generated ${this.testUsers.length} test users`)
  }

  // Get random test user
  getRandomUser() {
    return this.testUsers[Math.floor(Math.random() * this.testUsers.length)]
  }

  // Generate random Super Card request
  generateRequest(scenario = null) {
    const user = this.getRandomUser()
    const requestId = `req-${++this.requestCounter}-${Date.now()}`
    
    if (!scenario) {
      // Randomly select scenario based on weights
      const rand = Math.random() * 100
      let cumulative = 0
      
      for (const [name, config] of Object.entries(CONFIG.SCENARIOS)) {
        cumulative += config.weight
        if (rand <= cumulative) {
          scenario = config
          break
        }
      }
    }

    if (scenario.type === 'batch') {
      return this.generateBatchRequest(user, requestId)
    }

    // Regular Super Card request
    const baseRequest = {
      userId: user.id,
      cards: scenario.cards,
      timeRange: this.getRandomTimeRange(),
      includeProjections: Math.random() > 0.7,
      includeComparisons: Math.random() > 0.8
    }

    // Add field selection for some requests
    if (Math.random() > 0.6) {
      baseRequest.fields = this.generateFieldSelection(scenario.cards)
    }

    return {
      type: 'single',
      url: `${CONFIG.BASE_URL}/api/super-cards`,
      method: 'GET',
      params: new URLSearchParams(baseRequest),
      user,
      requestId,
      scenario: scenario.cards.join(',')
    }
  }

  generateBatchRequest(user, requestId) {
    const requests = []
    const batchSize = Math.floor(Math.random() * 3) + 2 // 2-4 requests per batch
    
    for (let i = 0; i < batchSize; i++) {
      const cards = this.getRandomCards()
      requests.push({
        id: `${requestId}-item-${i}`,
        cards,
        fields: Math.random() > 0.5 ? this.generateFieldSelection(cards) : undefined,
        timeRange: this.getRandomTimeRange()
      })
    }

    return {
      type: 'batch',
      url: `${CONFIG.BASE_URL}/api/super-cards/batch`,
      method: 'POST',
      body: {
        requests,
        options: {
          parallelExecution: true,
          cacheResults: true
        }
      },
      user,
      requestId,
      scenario: 'batch'
    }
  }

  getRandomCards() {
    const allCards = ['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
    const count = Math.floor(Math.random() * 3) + 1 // 1-3 cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
  }

  getRandomTimeRange() {
    const ranges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD']
    return ranges[Math.floor(Math.random() * ranges.length)]
  }

  generateFieldSelection(cards) {
    const fieldMap = {
      performance: ['portfolio_value', 'total_return_1y', 'spy_comparison', 'dividend_yield'],
      income: ['monthly_dividend_income', 'net_monthly_income', 'available_to_reinvest'],
      lifestyle: ['expense_coverage_percentage', 'fire_progress', 'surplus_deficit'],
      strategy: ['overall_score', 'diversification_score', 'recommendations'],
      quickActions: ['suggested_actions', 'completion_score', 'pending_tasks']
    }

    const fields = {}
    cards.forEach(card => {
      if (fieldMap[card] && Math.random() > 0.5) {
        // Select random subset of fields
        const availableFields = fieldMap[card]
        const selectedCount = Math.floor(Math.random() * availableFields.length) + 1
        fields[card] = availableFields
          .sort(() => Math.random() - 0.5)
          .slice(0, selectedCount)
      }
    })

    return Object.keys(fields).length > 0 ? fields : undefined
  }
}

// HTTP client with connection pooling
class HTTPClient {
  constructor() {
    this.agent = new (require('https').Agent)({
      keepAlive: true,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 10000
    })
  }

  async makeRequest(requestConfig) {
    const startTime = performance.now()
    
    try {
      let url = requestConfig.url
      const options = {
        method: requestConfig.method,
        agent: this.agent,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${requestConfig.user.token}`,
          'X-Test-User': requestConfig.user.id,
          'X-Request-ID': requestConfig.requestId
        }
      }

      // Handle GET parameters
      if (requestConfig.method === 'GET' && requestConfig.params) {
        url += '?' + requestConfig.params.toString()
      }

      // Handle POST body
      if (requestConfig.method === 'POST' && requestConfig.body) {
        options.body = JSON.stringify(requestConfig.body)
      }

      const response = await fetch(url, options)
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      let responseData = null
      try {
        responseData = await response.json()
      } catch (e) {
        // Response might not be JSON
      }

      return {
        requestId: requestConfig.requestId,
        scenario: requestConfig.scenario,
        status: response.status,
        responseTime,
        success: response.ok,
        error: response.ok ? null : `HTTP ${response.status}`,
        cached: response.headers.get('x-cache-status') === 'HIT',
        dataSize: response.headers.get('content-length') || 0,
        responseData
      }

    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)

      return {
        requestId: requestConfig.requestId,
        scenario: requestConfig.scenario,
        status: 0,
        responseTime,
        success: false,
        error: error.message,
        cached: false,
        dataSize: 0
      }
    }
  }
}

// Performance metrics collector
class MetricsCollector {
  constructor() {
    this.results = []
    this.startTime = null
    this.reportInterval = null
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      cacheHits: 0,
      errorsByType: {},
      responseTimesByScenario: {}
    }
  }

  start() {
    this.startTime = performance.now()
    this.startReporting()
  }

  recordResult(result) {
    this.results.push({
      ...result,
      timestamp: Date.now()
    })

    // Update stats
    this.stats.totalRequests++
    this.stats.totalResponseTime += result.responseTime

    if (result.success) {
      this.stats.successfulRequests++
    } else {
      this.stats.failedRequests++
      this.stats.errorsByType[result.error] = (this.stats.errorsByType[result.error] || 0) + 1
    }

    if (result.cached) {
      this.stats.cacheHits++
    }

    // Track response times by scenario
    if (!this.stats.responseTimesByScenario[result.scenario]) {
      this.stats.responseTimesByScenario[result.scenario] = []
    }
    this.stats.responseTimesByScenario[result.scenario].push(result.responseTime)
  }

  startReporting() {
    this.reportInterval = setInterval(() => {
      this.printProgressReport()
    }, CONFIG.REPORT_INTERVAL_SECONDS * 1000)
  }

  printProgressReport() {
    const elapsed = (performance.now() - this.startTime) / 1000
    const rps = Math.round(this.stats.totalRequests / elapsed)
    const avgResponseTime = Math.round(this.stats.totalResponseTime / this.stats.totalRequests) || 0
    const errorRate = ((this.stats.failedRequests / this.stats.totalRequests) * 100).toFixed(2)
    const cacheHitRate = ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(1)

    // console.log(`⏱️  ${elapsed.toFixed(0)}s | RPS: ${rps} | Avg: ${avgResponseTime}ms | Errors: ${errorRate}% | Cache: ${cacheHitRate}%`)
  }

  calculatePercentile(values, percentile) {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((percentile / 100) * sorted.length) - 1
    return sorted[Math.max(0, index)] || 0
  }

  generateReport() {
    clearInterval(this.reportInterval)
    
    const totalTime = (performance.now() - this.startTime) / 1000
    const allResponseTimes = this.results.map(r => r.responseTime)
    
    const report = {
      summary: {
        totalTime: totalTime.toFixed(2) + 's',
        totalRequests: this.stats.totalRequests,
        successfulRequests: this.stats.successfulRequests,
        failedRequests: this.stats.failedRequests,
        errorRate: ((this.stats.failedRequests / this.stats.totalRequests) * 100).toFixed(2) + '%',
        averageRPS: Math.round(this.stats.totalRequests / totalTime),
        cacheHitRate: ((this.stats.cacheHits / this.stats.totalRequests) * 100).toFixed(1) + '%'
      },
      responseTime: {
        average: Math.round(this.stats.totalResponseTime / this.stats.totalRequests) || 0,
        p50: this.calculatePercentile(allResponseTimes, 50),
        p95: this.calculatePercentile(allResponseTimes, 95),
        p99: this.calculatePercentile(allResponseTimes, 99),
        min: Math.min(...allResponseTimes),
        max: Math.max(...allResponseTimes)
      },
      scenarios: {},
      errors: this.stats.errorsByType,
      targets: {
        responseTimeP95: {
          target: CONFIG.TARGETS.RESPONSE_TIME_P95,
          actual: this.calculatePercentile(allResponseTimes, 95),
          passed: this.calculatePercentile(allResponseTimes, 95) <= CONFIG.TARGETS.RESPONSE_TIME_P95
        },
        responseTimeP99: {
          target: CONFIG.TARGETS.RESPONSE_TIME_P99,
          actual: this.calculatePercentile(allResponseTimes, 99),
          passed: this.calculatePercentile(allResponseTimes, 99) <= CONFIG.TARGETS.RESPONSE_TIME_P99
        },
        errorRate: {
          target: CONFIG.TARGETS.ERROR_RATE,
          actual: this.stats.failedRequests / this.stats.totalRequests,
          passed: (this.stats.failedRequests / this.stats.totalRequests) <= CONFIG.TARGETS.ERROR_RATE
        },
        throughput: {
          target: CONFIG.TARGETS.THROUGHPUT_RPS,
          actual: Math.round(this.stats.totalRequests / totalTime),
          passed: Math.round(this.stats.totalRequests / totalTime) >= CONFIG.TARGETS.THROUGHPUT_RPS
        }
      }
    }

    // Calculate scenario-specific metrics
    for (const [scenario, responseTimes] of Object.entries(this.stats.responseTimesByScenario)) {
      if (responseTimes.length > 0) {
        report.scenarios[scenario] = {
          count: responseTimes.length,
          averageTime: Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length),
          p95: this.calculatePercentile(responseTimes, 95),
          p99: this.calculatePercentile(responseTimes, 99)
        }
      }
    }

    return report
  }

  saveResults(filename) {
    const report = this.generateReport()
    const fullReport = {
      config: CONFIG,
      report,
      detailedResults: this.results
    }

    fs.writeFileSync(filename, JSON.stringify(fullReport, null, 2))
    // console.log(`📊 Detailed results saved to ${filename}`)
    return report
  }
}

// Main load test runner
class LoadTestRunner {
  constructor() {
    this.dataGenerator = new TestDataGenerator()
    this.httpClient = new HTTPClient()
    this.metrics = new MetricsCollector()
    this.activeRequests = new Set()
  }

  async run() {
    // console.log('🚀 Starting Super Cards API Load Test')
    // console.log(`📋 Config: ${CONFIG.MAX_CONCURRENT_USERS} users, ${CONFIG.TEST_DURATION_MINUTES}m duration`)
    // console.log(`🎯 Targets: P95 < ${CONFIG.TARGETS.RESPONSE_TIME_P95}ms, Errors < ${(CONFIG.TARGETS.ERROR_RATE * 100).toFixed(1)}%`)
    
    // Setup
    this.dataGenerator.generateTestUsers(CONFIG.MAX_CONCURRENT_USERS)
    this.metrics.start()

    // Calculate ramp-up schedule
    const testDurationMs = CONFIG.TEST_DURATION_MINUTES * 60 * 1000
    const rampUpDurationMs = CONFIG.RAMP_UP_DURATION_SECONDS * 1000
    const steadyStateDurationMs = testDurationMs - rampUpDurationMs

    // console.log(`⏱️  Ramping up over ${CONFIG.RAMP_UP_DURATION_SECONDS}s, then steady state for ${steadyStateDurationMs/1000}s`)
    
    // Start load test
    const startTime = Date.now()
    const endTime = startTime + testDurationMs
    const rampUpEndTime = startTime + rampUpDurationMs

    while (Date.now() < endTime) {
      const now = Date.now()
      let targetConcurrency

      if (now < rampUpEndTime) {
        // Ramp-up phase
        const rampUpProgress = (now - startTime) / rampUpDurationMs
        targetConcurrency = Math.floor(CONFIG.MAX_CONCURRENT_USERS * rampUpProgress)
      } else {
        // Steady state
        targetConcurrency = CONFIG.MAX_CONCURRENT_USERS
      }

      // Adjust active request count
      while (this.activeRequests.size < targetConcurrency) {
        this.startRequest()
      }

      // Small delay to prevent tight loop
      await this.sleep(10)
    }

    // Wait for remaining requests to complete
    // console.log(`⏳ Waiting for ${this.activeRequests.size} remaining requests to complete...`)
    while (this.activeRequests.size > 0) {
      await this.sleep(100)
    }

    // Generate and display report
    const report = this.generateFinalReport()
    return report
  }

  async startRequest() {
    const request = this.dataGenerator.generateRequest()
    const requestPromise = this.executeRequest(request)
    
    this.activeRequests.add(requestPromise)
    
    requestPromise.finally(() => {
      this.activeRequests.delete(requestPromise)
    })
  }

  async executeRequest(requestConfig) {
    try {
      const result = await this.httpClient.makeRequest(requestConfig)
      this.metrics.recordResult(result)
      return result
    } catch (error) {
      // console.error(`Request failed: ${error.message}`)
      this.metrics.recordResult({
        requestId: requestConfig.requestId,
        scenario: requestConfig.scenario,
        status: 0,
        responseTime: 0,
        success: false,
        error: error.message,
        cached: false
      })
    }
  }

  generateFinalReport() {
    // console.log('\n🏁 Load Test Complete!')
    // console.log('=' * 50)

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `load-test-report-${timestamp}.json`
    const report = this.metrics.saveResults(filename)

    // Print summary
    // console.log('\n📊 SUMMARY')
    // console.log(`Total Requests: ${report.summary.totalRequests}`)
    // console.log(`Success Rate: ${(100 - parseFloat(report.summary.errorRate)).toFixed(2)}%`)
    // console.log(`Average RPS: ${report.summary.averageRPS}`)
    // console.log(`Cache Hit Rate: ${report.summary.cacheHitRate}`)

    // console.log('\n⏱️  RESPONSE TIMES')
    // console.log(`Average: ${report.responseTime.average}ms`)
    // console.log(`P95: ${report.responseTime.p95}ms`)
    // console.log(`P99: ${report.responseTime.p99}ms`)
    // console.log(`Max: ${report.responseTime.max}ms`)

    // console.log('\n🎯 TARGET COMPLIANCE')
    for (const [metric, data] of Object.entries(report.targets)) {
      const status = data.passed ? '✅' : '❌'
      // console.log(`${status} ${metric}: ${JSON.stringify(data.actual)} (target: ${data.target})`)
    }

    if (Object.keys(report.errors).length > 0) {
      // console.log('\n❌ ERRORS')
      for (const [error, count] of Object.entries(report.errors)) {
        // console.log(`${error}: ${count}`)
      }
    }

    // console.log('\n📈 BY SCENARIO')
    for (const [scenario, data] of Object.entries(report.scenarios)) {
      // console.log(`${scenario}: ${data.count} requests, avg ${data.averageTime}ms, P95 ${data.p95}ms`)
    }

    // Overall assessment
    const allTargetsMet = Object.values(report.targets).every(t => t.passed)
    // console.log('\n🏆 OVERALL RESULT')
    if (allTargetsMet) {
      // console.log('✅ ALL PERFORMANCE TARGETS MET - System is ready for production load')
    } else {
      // console.log('❌ PERFORMANCE TARGETS NOT MET - Optimization required')
      
      // Specific recommendations
      // console.log('\n💡 RECOMMENDATIONS:')
      if (!report.targets.responseTimeP95.passed) {
        // console.log('- Optimize database queries and add more indexes')
        // console.log('- Increase Redis cache TTL')
        // console.log('- Consider database connection pooling optimization')
      }
      if (!report.targets.throughput.passed) {
        // console.log('- Increase server resources (CPU/Memory)')
        // console.log('- Optimize application-level caching')
        // console.log('- Consider horizontal scaling')
      }
      if (!report.targets.errorRate.passed) {
        // console.log('- Investigate error causes and fix underlying issues')
        // console.log('- Implement better error handling and retries')
        // console.log('- Review rate limiting configuration')
      }
    }

    return report
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
async function main() {
  const runner = new LoadTestRunner()
  
  try {
    const report = await runner.run()
    process.exit(report.targets.every && Object.values(report.targets).every(t => t.passed) ? 0 : 1)
  } catch (error) {
    // console.error('❌ Load test failed:', error)
    process.exit(1)
  }
}

// Export for use as module
module.exports = {
  LoadTestRunner,
  TestDataGenerator,
  MetricsCollector,
  HTTPClient,
  CONFIG
}

// Run if called directly
if (require.main === module) {
  main()
}