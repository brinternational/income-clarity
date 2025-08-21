#!/usr/bin/env node

/**
 * Strategy Comparison Engine Test Script
 * 
 * Comprehensive testing of the killer "$X,XXX/year" Strategy Comparison Engine
 * that reveals optimization opportunities across 5 investment strategies.
 * 
 * This validates the core value proposition of Income Clarity.
 */

const fs = require('fs');
const path = require('path');

// Test scenarios with different portfolio types
const TEST_SCENARIOS = [
  {
    name: 'High-Income Covered Call Heavy (California)',
    portfolioValue: 500000,
    state: 'CA',
    filingStatus: 'single',
    estimatedIncome: 250000,
    description: 'High earner in California with covered call ETF heavy portfolio'
  },
  {
    name: 'Middle-Income Mixed Portfolio (Texas)',
    portfolioValue: 150000,
    state: 'TX',
    filingStatus: 'married_jointly',
    estimatedIncome: 100000,
    description: 'Middle-income couple in tax-free Texas with mixed portfolio'
  },
  {
    name: 'Retiree Income-Focused (Florida)',
    portfolioValue: 800000,
    state: 'FL',
    filingStatus: 'married_jointly',
    estimatedIncome: 80000,
    description: 'Retirees in Florida focused on dividend income'
  },
  {
    name: 'Young Professional Growth-Focused (New York)',
    portfolioValue: 75000,
    state: 'NY',
    filingStatus: 'single',
    estimatedIncome: 120000,
    description: 'Young professional in NYC building wealth'
  },
  {
    name: 'High Net Worth Tax Optimization (Puerto Rico)',
    portfolioValue: 2000000,
    state: 'PR',
    filingStatus: 'single',
    estimatedIncome: 500000,
    description: 'High net worth individual with Puerto Rico tax benefits'
  }
];

async function testStrategyComparisonAPI() {
  console.log('🚀 STRATEGY COMPARISON ENGINE TEST SUITE');
  console.log('========================================\n');
  
  const results = [];
  
  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📊 Testing Scenario: ${scenario.name}`);
    console.log(`   Portfolio: $${scenario.portfolioValue.toLocaleString()}`);
    console.log(`   Location: ${scenario.state} (${scenario.filingStatus})`);
    console.log(`   Income: $${scenario.estimatedIncome.toLocaleString()}`);
    console.log(`   ${scenario.description}\n`);
    
    try {
      // Test the API endpoint
      const queryParams = new URLSearchParams({
        portfolioValue: scenario.portfolioValue.toString(),
        state: scenario.state,
        filingStatus: scenario.filingStatus,
        estimatedIncome: scenario.estimatedIncome.toString()
      });
      
      const response = await fetch(`http://localhost:3000/api/strategy-comparison?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // In production, would include auth headers
          'Authorization': 'Bearer test-token'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      validateResponseStructure(data);
      
      // Extract key metrics
      const gapAnalysis = data.gapAnalysis;
      const strategies = data.strategies;
      const recommendedStrategy = data.recommendedStrategy;
      
      console.log('✅ API Response Validated');
      console.log(`   Calculation Time: ${data.calculationTime}`);
      console.log(`   Strategies Analyzed: ${strategies.length}`);
      
      console.log('\n💰 STRATEGY COMPARISON RESULTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Show current vs recommended
      const currentStrategy = strategies.find(s => s.id === 'current');
      const recommended = strategies.find(s => s.name === recommendedStrategy.name);
      
      console.log(`\n🔵 CURRENT STRATEGY: ${currentStrategy.name}`);
      console.log(`   Net Annual Income: $${currentStrategy.netAnnualIncome.toLocaleString()}`);
      console.log(`   Effective Tax Rate: ${currentStrategy.effectiveTaxRate}%`);
      console.log(`   Total Tax: $${currentStrategy.totalTax.toLocaleString()}`);
      
      console.log(`\n🟢 RECOMMENDED STRATEGY: ${recommended.name}`);
      console.log(`   Net Annual Income: $${recommended.netAnnualIncome.toLocaleString()}`);
      console.log(`   Effective Tax Rate: ${recommended.effectiveTaxRate}%`);
      console.log(`   Total Tax: $${recommended.totalTax.toLocaleString()}`);
      
      console.log('\n🎯 GAP ANALYSIS - THE KILLER INSIGHT:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n💸 ANNUAL INCOME IMPROVEMENT: ${gapAnalysis.annualIncomeImprovementFormatted}`);
      console.log(`   Tax Rate Improvement: ${gapAnalysis.effectiveTaxImprovement}%`);
      console.log(`   20-Year Projection: $${gapAnalysis.projectedImprovementOver20Years.toLocaleString()}`);
      console.log(`   Confidence Level: ${gapAnalysis.confidenceLevel}%`);
      console.log(`   Break-even Time: ${gapAnalysis.timeToBreakeven}`);
      console.log(`   Implementation: ${gapAnalysis.implementationComplexity}`);
      
      if (gapAnalysis.keyOptimizations.length > 0) {
        console.log('\n🔧 KEY OPTIMIZATIONS:');
        gapAnalysis.keyOptimizations.forEach((optimization, index) => {
          console.log(`   ${index + 1}. ${optimization}`);
        });
      }
      
      // Show all strategies comparison
      console.log('\n📈 ALL STRATEGIES PERFORMANCE:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Sort by net annual income descending
      const sortedStrategies = [...strategies].sort((a, b) => b.netAnnualIncome - a.netAnnualIncome);
      
      sortedStrategies.forEach((strategy, index) => {
        const improvement = strategy.netAnnualIncome - currentStrategy.netAnnualIncome;
        const improvementText = improvement > 0 ? `+$${improvement.toLocaleString()}` : `$${improvement.toLocaleString()}`;
        const rank = index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        
        console.log(`\n${rank} ${strategy.name}`);
        console.log(`   Income: $${strategy.netAnnualIncome.toLocaleString()} (${improvementText})`);
        console.log(`   Tax: ${strategy.effectiveTaxRate}% | Risk: ${strategy.riskLevel} | Complexity: ${strategy.complexityScore}`);
      });
      
      // Validation tests
      console.log('\n🧪 VALIDATION TESTS:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      const validationResults = runValidationTests(data, scenario);
      validationResults.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        console.log(`   ${status} ${result.test}: ${result.message}`);
      });
      
      // Store results for summary
      results.push({
        scenario: scenario.name,
        success: true,
        annualImprovement: gapAnalysis.annualIncomeImprovement,
        recommendedStrategy: recommended.name,
        confidenceLevel: gapAnalysis.confidenceLevel,
        validationsPassed: validationResults.filter(r => r.passed).length,
        totalValidations: validationResults.length
      });
      
    } catch (error) {
      console.error(`❌ Test Failed: ${error.message}`);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
  
  // Print final summary
  console.log('\n🏁 FINAL SUMMARY');
  console.log('=================\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful Tests: ${successful.length}/${results.length}`);
  console.log(`❌ Failed Tests: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n💰 OPTIMIZATION OPPORTUNITIES FOUND:');
    successful.forEach(result => {
      console.log(`   ${result.scenario}: $${result.annualImprovement.toLocaleString()}/year improvement`);
      console.log(`      → ${result.recommendedStrategy} (${result.confidenceLevel}% confidence)`);
    });
    
    const totalAnnualImprovement = successful.reduce((sum, r) => sum + r.annualImprovement, 0);
    const avgImprovement = totalAnnualImprovement / successful.length;
    
    console.log(`\n📊 AVERAGE ANNUAL IMPROVEMENT: $${avgImprovement.toFixed(0).toLocaleString()}`);
    console.log(`📊 TOTAL COMBINED IMPROVEMENT: $${totalAnnualImprovement.toLocaleString()}`);
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED SCENARIOS:');
    failed.forEach(result => {
      console.log(`   ${result.scenario}: ${result.error}`);
    });
  }
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const resultFile = path.join(__dirname, `../test-results/strategy-comparison-${timestamp}.json`);
  
  try {
    fs.mkdirSync(path.dirname(resultFile), { recursive: true });
    fs.writeFileSync(resultFile, JSON.stringify({ 
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: results.length,
        successful: successful.length,
        failed: failed.length,
        averageImprovement: successful.length > 0 ? successful.reduce((sum, r) => sum + r.annualImprovement, 0) / successful.length : 0
      },
      results 
    }, null, 2));
    
    console.log(`\n📁 Detailed results saved to: ${resultFile}`);
  } catch (error) {
    console.log(`⚠️  Could not save results file: ${error.message}`);
  }
  
  console.log('\n🎯 STRATEGY COMPARISON ENGINE TEST COMPLETE!');
  console.log('The killer feature is ready to reveal "$X,XXX/year" opportunities! 🚀');
}

function validateResponseStructure(data) {
  const required = [
    'success',
    'strategies',
    'gapAnalysis', 
    'recommendedStrategy',
    'optimizationOpportunities'
  ];
  
  for (const field of required) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  
  if (!Array.isArray(data.strategies) || data.strategies.length < 5) {
    throw new Error('Should have at least 5 strategies');
  }
  
  if (!data.gapAnalysis.annualIncomeImprovement && data.gapAnalysis.annualIncomeImprovement !== 0) {
    throw new Error('Gap analysis missing annual improvement calculation');
  }
}

function runValidationTests(data, scenario) {
  const tests = [];
  
  // Test 1: Reasonable improvement amounts
  const improvement = data.gapAnalysis.annualIncomeImprovement;
  tests.push({
    test: 'Reasonable Improvement Amount',
    passed: improvement >= 0 && improvement < scenario.portfolioValue * 0.5,
    message: `$${improvement.toLocaleString()} improvement (0-50% of portfolio value)`
  });
  
  // Test 2: Tax calculations make sense
  const currentStrategy = data.strategies.find(s => s.id === 'current');
  const taxRate = parseFloat(currentStrategy.effectiveTaxRate);
  tests.push({
    test: 'Realistic Tax Rates',
    passed: taxRate >= 0 && taxRate <= 60,
    message: `${taxRate}% effective tax rate (0-60% range)`
  });
  
  // Test 3: Strategy diversity
  const uniqueStrategies = new Set(data.strategies.map(s => s.name));
  tests.push({
    test: 'Strategy Diversity',
    passed: uniqueStrategies.size === data.strategies.length,
    message: `${uniqueStrategies.size} unique strategies`
  });
  
  // Test 4: Confidence level reasonable
  const confidence = parseInt(data.gapAnalysis.confidenceLevel);
  tests.push({
    test: 'Confidence Level',
    passed: confidence >= 70 && confidence <= 95,
    message: `${confidence}% confidence (70-95% expected range)`
  });
  
  // Test 5: State-specific tax optimization
  const stateOptimization = data.optimizationOpportunities.some(opp => 
    opp.toLowerCase().includes(scenario.state.toLowerCase()) || 
    opp.toLowerCase().includes('state')
  );
  tests.push({
    test: 'State Tax Optimization',
    passed: stateOptimization,
    message: stateOptimization ? 'State-specific optimizations found' : 'No state optimizations detected'
  });
  
  // Test 6: Performance ordering makes sense
  const recommended = data.strategies.find(s => s.name === data.recommendedStrategy.name);
  const current = data.strategies.find(s => s.id === 'current');
  tests.push({
    test: 'Recommended Strategy Performance',
    passed: recommended.netAnnualIncome > current.netAnnualIncome,
    message: `Recommended strategy outperforms current by $${(recommended.netAnnualIncome - current.netAnnualIncome).toLocaleString()}`
  });
  
  return tests;
}

// Run the test if called directly
if (require.main === module) {
  testStrategyComparisonAPI().catch(console.error);
}

module.exports = { testStrategyComparisonAPI };