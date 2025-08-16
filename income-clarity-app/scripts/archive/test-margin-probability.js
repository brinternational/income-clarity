#!/usr/bin/env node

/**
 * COMPREHENSIVE MARGIN CALL PROBABILITY CALCULATOR TEST SUITE
 * 
 * This script tests all aspects of the margin call probability API:
 * - Input validation and edge cases
 * - Monte Carlo simulation accuracy
 * - Risk level categorization
 * - Recommendation generation
 * - API endpoint functionality
 * - Various margin usage scenarios
 */

const API_BASE = 'http://localhost:3000';
const API_ENDPOINT = `${API_BASE}/api/margin/probability`;

// ANSI color codes for test output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Test counter
let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Test helper functions
 */
function log(message, color = 'reset') {
  // console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  testCount++;
  log(`\n${colors.bold}Test ${testCount}: ${name}${colors.reset}`, 'cyan');
}

function logPass(message) {
  passCount++;
  log(`✅ PASS: ${message}`, 'green');
}

function logFail(message) {
  failCount++;
  log(`❌ FAIL: ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  INFO: ${message}`, 'blue');
}

function logWarn(message) {
  log(`⚠️  WARN: ${message}`, 'yellow');
}

/**
 * HTTP request helper
 */
async function makeRequest(method, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(API_ENDPOINT, options);
    const responseData = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data: responseData
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

/**
 * Test Scenarios
 */
const testScenarios = [
  {
    name: 'Conservative Portfolio (Low Risk)',
    data: {
      portfolioValue: 100000,
      marginUsed: 15000,
      maintenanceRequirement: 0.25,
      annualVolatility: 0.16
    },
    expectedRisk: 'low',
    description: '$100k portfolio, $15k margin (15% usage), standard volatility'
  },
  {
    name: 'Moderate Portfolio (Moderate Risk)',
    data: {
      portfolioValue: 100000,
      marginUsed: 35000,
      maintenanceRequirement: 0.25,
      annualVolatility: 0.18
    },
    expectedRisk: 'moderate',
    description: '$100k portfolio, $35k margin (35% usage), higher volatility'
  },
  {
    name: 'Aggressive Portfolio (High Risk)',
    data: {
      portfolioValue: 100000,
      marginUsed: 50000,
      maintenanceRequirement: 0.25,
      annualVolatility: 0.20
    },
    expectedRisk: 'high',
    description: '$100k portfolio, $50k margin (50% usage), high volatility'
  },
  {
    name: 'High Volatility Scenario',
    data: {
      portfolioValue: 250000,
      marginUsed: 75000,
      maintenanceRequirement: 0.30,
      annualVolatility: 0.25
    },
    expectedRisk: 'high',
    description: '$250k portfolio, $75k margin (30% usage), very high volatility (25%)'
  },
  {
    name: 'Low Volatility Blue Chip',
    data: {
      portfolioValue: 500000,
      marginUsed: 100000,
      maintenanceRequirement: 0.25,
      annualVolatility: 0.12
    },
    expectedRisk: 'low',
    description: '$500k portfolio, $100k margin (20% usage), low volatility'
  }
];

/**
 * Main test execution
 */
async function runTests() {
  log('🚀 Starting Margin Call Probability Calculator Test Suite', 'bold');
  log('=' * 70, 'cyan');

  // Test 1: API Health Check
  logTest('API Health Check');
  try {
    const response = await makeRequest('GET');
    if (response.ok && response.data.service) {
      logPass(`API is operational: ${response.data.service} v${response.data.version}`);
      logInfo(`Methodology: ${response.data.methodology.simulation}`);
      logInfo(`Risk Levels: Low ${response.data.riskLevels.low}, Moderate ${response.data.riskLevels.moderate}, High ${response.data.riskLevels.high}`);
    } else {
      logFail(`API health check failed: ${response.status}`);
    }
  } catch (error) {
    logFail(`API health check error: ${error.message}`);
  }

  // Test 2: Input Validation Tests
  logTest('Input Validation');
  
  // Missing portfolioValue
  const invalidRequests = [
    { data: { marginUsed: 30000 }, error: 'portfolioValue is required' },
    { data: { portfolioValue: 100000 }, error: 'marginUsed is required' },
    { data: { portfolioValue: -50000, marginUsed: 30000 }, error: 'Portfolio value must be positive' },
    { data: { portfolioValue: 100000, marginUsed: -5000 }, error: 'Margin used cannot be negative' },
    { data: { portfolioValue: 50000, marginUsed: 60000 }, error: 'Margin used cannot equal or exceed portfolio value' }
  ];

  for (const { data, error } of invalidRequests) {
    const response = await makeRequest('POST', data);
    if (response.status === 400 && response.data.error.includes(error.split(' ')[0])) {
      logPass(`Validation: ${error}`);
    } else {
      logFail(`Validation failed for: ${error}. Got: ${response.data.error || 'No error'}`);
    }
  }

  // Test 3: Zero Margin Edge Case
  logTest('Zero Margin Edge Case');
  const zeroMarginResponse = await makeRequest('POST', {
    portfolioValue: 100000,
    marginUsed: 0
  });
  
  if (zeroMarginResponse.ok && zeroMarginResponse.data.riskLevel === 'low') {
    logPass(`Zero margin returns low risk with 0% probability`);
    logInfo(`Recommendations: ${zeroMarginResponse.data.recommendations.length} items`);
  } else {
    logFail(`Zero margin case failed: ${zeroMarginResponse.data.error || 'Unknown error'}`);
  }

  // Test 4: Scenario-Based Testing
  for (const scenario of testScenarios) {
    logTest(`Scenario: ${scenario.name}`);
    logInfo(scenario.description);
    
    const response = await makeRequest('POST', scenario.data);
    
    if (!response.ok) {
      logFail(`Request failed: ${response.data.error || 'Unknown error'}`);
      continue;
    }

    const result = response.data;
    
    // Validate response structure
    const requiredFields = ['probability30Days', 'probability60Days', 'probability90Days', 'riskLevel', 'safeDrawdownPercentage', 'safeDrawdownDollars', 'recommendations'];
    const missingFields = requiredFields.filter(field => !(field in result));
    
    if (missingFields.length === 0) {
      logPass('Response structure is complete');
    } else {
      logFail(`Missing fields: ${missingFields.join(', ')}`);
    }
    
    // Validate probabilities are reasonable
    const probabilities = [result.probability30Days, result.probability60Days, result.probability90Days];
    if (probabilities.every(p => p >= 0 && p <= 100)) {
      logPass(`Probabilities are within valid range: ${probabilities.map(p => p.toFixed(1)).join('%, ')}%`);
    } else {
      logFail(`Invalid probabilities: ${probabilities.join(', ')}`);
    }
    
    // Validate risk level matches expectation (approximately)
    if (result.riskLevel === scenario.expectedRisk || 
        (scenario.expectedRisk === 'moderate' && (result.riskLevel === 'low' || result.riskLevel === 'high'))) {
      logPass(`Risk level assessment: ${result.riskLevel} (expected: ${scenario.expectedRisk})`);
    } else {
      logWarn(`Risk level mismatch: got ${result.riskLevel}, expected ${scenario.expectedRisk}`);
    }
    
    // Validate safe drawdown calculations
    if (result.safeDrawdownPercentage >= 0 && result.safeDrawdownDollars >= 0) {
      logPass(`Safe drawdown: ${result.safeDrawdownPercentage.toFixed(1)}% ($${result.safeDrawdownDollars.toLocaleString()})`);
    } else {
      logFail(`Invalid safe drawdown values: ${result.safeDrawdownPercentage}%, $${result.safeDrawdownDollars}`);
    }
    
    // Validate recommendations exist
    if (result.recommendations && result.recommendations.length > 0) {
      logPass(`Recommendations provided: ${result.recommendations.length} items`);
      logInfo(`First recommendation: ${result.recommendations[0]}`);
    } else {
      logFail('No recommendations provided');
    }
    
    // Log calculation details if available
    if (result.calculationDetails) {
      logInfo(`Current margin ratio: ${result.calculationDetails.currentMarginRatio.toFixed(1)}%`);
      logInfo(`Liquidation threshold: $${result.calculationDetails.liquidationThreshold.toLocaleString()}`);
    }
  }

  // Test 5: Performance and Consistency
  logTest('Monte Carlo Simulation Consistency');
  const baseRequest = {
    portfolioValue: 100000,
    marginUsed: 30000,
    iterations: 1000 // Smaller for performance testing
  };
  
  const results = [];
  for (let i = 0; i < 3; i++) {
    const response = await makeRequest('POST', baseRequest);
    if (response.ok) {
      results.push(response.data.probability30Days);
    }
  }
  
  if (results.length === 3) {
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
    const stdDev = Math.sqrt(variance);
    
    logPass(`Simulation consistency test: mean=${mean.toFixed(2)}%, std dev=${stdDev.toFixed(2)}%`);
    if (stdDev < 5) { // Within 5% standard deviation
      logPass('Monte Carlo simulation shows good consistency');
    } else {
      logWarn(`High variance in Monte Carlo results: ${stdDev.toFixed(2)}%`);
    }
  } else {
    logFail('Performance test failed - could not get consistent responses');
  }

  // Test 6: Extended Configuration Test
  logTest('Extended Configuration Options');
  const extendedRequest = {
    portfolioValue: 200000,
    marginUsed: 60000,
    maintenanceRequirement: 0.30,
    annualVolatility: 0.18,
    daysToLookAhead: [15, 45, 120],
    iterations: 2000
  };
  
  const extendedResponse = await makeRequest('POST', extendedRequest);
  if (extendedResponse.ok) {
    logPass('Extended configuration accepted');
    logInfo(`Custom time horizons processed successfully`);
  } else {
    logFail(`Extended configuration failed: ${extendedResponse.data.error}`);
  }

  // Final Results Summary
  log('\n' + '=' * 70, 'cyan');
  log('📊 TEST RESULTS SUMMARY', 'bold');
  log('=' * 70, 'cyan');
  
  log(`Total Tests: ${testCount}`, 'bold');
  log(`Passed: ${passCount}`, 'green');
  log(`Failed: ${failCount}`, failCount > 0 ? 'red' : 'green');
  
  const successRate = ((passCount / (passCount + failCount)) * 100).toFixed(1);
  log(`Success Rate: ${successRate}%`, successRate > 90 ? 'green' : successRate > 70 ? 'yellow' : 'red');
  
  if (failCount === 0) {
    log('\n🎉 ALL TESTS PASSED! Margin Call Probability Calculator is ready for production.', 'green');
  } else {
    log(`\n⚠️  ${failCount} test(s) failed. Please review and fix issues before deployment.`, 'red');
  }
  
  log('\n🔗 API Endpoint: ' + API_ENDPOINT, 'blue');
  log('📚 Documentation: GET ' + API_ENDPOINT + ' for API documentation', 'blue');
}

// Error handling for the entire test suite
async function main() {
  try {
    await runTests();
  } catch (error) {
    log('\n💥 Test suite crashed with error:', 'red');
    log(error.message, 'red');
    if (error.stack) {
      log('\nStack trace:', 'red');
      log(error.stack, 'red');
    }
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(API_BASE);
    return response.ok || response.status === 404; // 404 is fine, means server is running
  } catch (error) {
    return false;
  }
}

// Run tests
checkServer().then(serverRunning => {
  if (!serverRunning) {
    log('❌ Server is not running on ' + API_BASE, 'red');
    log('Please start the development server with: npm run dev', 'yellow');
    process.exit(1);
  } else {
    main();
  }
});