'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Portfolio, User } from '@/types';
import { calculateMarginIntelligence, MarginIntelligenceResult } from '@/lib/margin-intelligence';
import { assessPortfolioRisk, RiskAssessmentResult } from '@/lib/risk-assessment-engine';
import { runAdvancedAnalytics, AdvancedAnalyticsResult } from '@/lib/advanced-analytics';
import { generateIntelligentRecommendations, IntelligentRecommendationResult } from '@/lib/intelligent-recommendations';
import { logger } from '@/lib/logger'

interface AdvancedIntelligenceProps {
  portfolio: Portfolio;
  user: User;
}

/**
 * ADVANCED INTELLIGENCE DASHBOARD
 * 
 * Revolutionary financial intelligence interface that combines:
 * - Real-time margin intelligence
 * - AI-powered risk assessment
 * - Quantum-inspired analytics
 * - Personalized recommendations
 * - Behavioral insights
 * - Emergency monitoring
 */
export default function AdvancedIntelligence({ portfolio, user }: AdvancedIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<'margin' | 'risk' | 'analytics' | 'recommendations'>('margin');
  const [isLoading, setIsLoading] = useState(true);
  const [marginIntelligence, setMarginIntelligence] = useState<MarginIntelligenceResult | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessmentResult | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedAnalyticsResult | null>(null);
  const [intelligentRecommendations, setIntelligentRecommendations] = useState<IntelligentRecommendationResult | null>(null);

  // Mock market conditions - in production, fetch from real-time data
  const mockMarketConditions = {
    vix: 18.5,
    interestRates: {
      fedFunds: 0.055,
      tenYear: 0.045,
      thirtyYear: 0.048
    },
    marketSentiment: 'neutral' as const,
    creditSpreads: 0.015,
    dividendYieldTrend: 'stable' as const,
    economicIndicators: {
      gdpGrowth: 0.025,
      inflation: 0.032,
      unemployment: 0.038
    }
  };

  const mockHistoricalData = {
    priceHistory: [],
    dividendHistory: [],
    marketEvents: []
  };

  const mockUserFeedback = {
    decisions: [],
    satisfactionScores: [],
    behavioralPatterns: [],
    preferenceChanges: []
  };

  // Calculate all advanced intelligence metrics
  useEffect(() => {
    const calculateIntelligence = async () => {
      setIsLoading(true);
      
      try {
        // Calculate margin intelligence
        const marginResult = calculateMarginIntelligence(portfolio, user, mockMarketConditions);
        setMarginIntelligence(marginResult);
        
        // Assess portfolio risk
        const riskResult = assessPortfolioRisk(portfolio, user, mockMarketConditions);
        setRiskAssessment(riskResult);
        
        // Run advanced analytics
        const analyticsResult = runAdvancedAnalytics(portfolio, user, mockHistoricalData, mockMarketConditions);
        setAdvancedAnalytics(analyticsResult);
        
        // Generate intelligent recommendations
        const recommendationsResult = generateIntelligentRecommendations(
          portfolio,
          user,
          marginResult,
          riskResult,
          analyticsResult,
          mockHistoricalData,
          mockUserFeedback
        );
        setIntelligentRecommendations(recommendationsResult);
        
      } catch (error) {
        // logger.error('Error calculating advanced intelligence:', error);
      // } finally {
        setIsLoading(false);
      }
    };
    
    calculateIntelligence();
  }, [portfolio, user]);

  if (isLoading || !marginIntelligence || !riskAssessment || !advancedAnalytics || !intelligentRecommendations) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Advanced Portfolio Intelligence</h2>
        <p className="text-purple-100">AI-powered insights for dividend income optimization</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'margin', label: 'Margin Intelligence', icon: '⚡' },
            { id: 'risk', label: 'Risk Assessment', icon: '🛡️' },
            { id: 'analytics', label: 'Advanced Analytics', icon: '🧠' },
            { id: 'recommendations', label: 'AI Recommendations', icon: '🎯' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'margin' && (
          <MarginIntelligenceTab marginIntelligence={marginIntelligence} />
        )}
        {activeTab === 'risk' && (
          <RiskAssessmentTab riskAssessment={riskAssessment} />
        )}
        {activeTab === 'analytics' && (
          <AdvancedAnalyticsTab advancedAnalytics={advancedAnalytics} />
        )}
        {activeTab === 'recommendations' && (
          <RecommendationsTab intelligentRecommendations={intelligentRecommendations} />
        )}
      </div>
    </div>
  );
}

/**
 * Margin Intelligence Tab Component
 */
function MarginIntelligenceTab({ marginIntelligence }: { marginIntelligence: MarginIntelligenceResult }) {
  const { currentUsage, riskAssessment, recommendations, stressTests, taxOptimization } = marginIntelligence;

  return (
    <div className="space-y-6">
      {/* Current Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Margin Utilization</h3>
          <div className="text-2xl font-bold text-blue-600">
            {(currentUsage.utilizationRatio * 100).toFixed(1)}%
          </div>
          <p className="text-sm text-blue-700">
            ${currentUsage.marginUsed.toLocaleString()} used of available
          </p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Velocity Score</h3>
          <div className="text-2xl font-bold text-green-600">
            {currentUsage.velocityScore.toFixed(1)}
          </div>
          <p className="text-sm text-green-700">
            Income per $1k margin deployed
          </p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <h3 className="font-semibold text-orange-900 mb-2">Monthly Cost</h3>
          <div className="text-2xl font-bold text-orange-600">
            ${currentUsage.interestCost.toFixed(0)}
          </div>
          <p className="text-sm text-orange-700">
            {(currentUsage.effectiveRate * 100).toFixed(2)}% effective rate
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Risk Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Liquidation Price</p>
            <p className="font-semibold">${riskAssessment.liquidationPrice.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time to Liquidation</p>
            <p className="font-semibold">{riskAssessment.timeToLiquidation} days</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Dividend Coverage</p>
            <p className="font-semibold">{riskAssessment.dividendCoverageRatio.toFixed(1)}x</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Volatility Score</p>
            <p className="font-semibold">{(riskAssessment.volatilityScore * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Strategic Recommendations</h3>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.description}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expected return: {(rec.expectedReturn * 100).toFixed(1)}% | 
                    Risk score: {rec.riskScore.toFixed(1)} | 
                    Confidence: {(rec.confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.type === 'increase' ? 'bg-green-100 text-green-800' :
                  rec.type === 'decrease' ? 'bg-red-100 text-red-800' :
                  rec.type === 'optimize' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stress Tests */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Stress Test Results</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scenario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Drop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin Call
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Required
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stressTests.map((test, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {test.scenario}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -{(test.marketDrop * 100).toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      test.marginCallTrigger 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {test.marginCallTrigger ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.actionRequired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * Risk Assessment Tab Component
 */
function RiskAssessmentTab({ riskAssessment }: { riskAssessment: RiskAssessmentResult }) {
  const { overallRiskScore, riskBreakdown, monteCarloProjections, concentrationRisk, recommendations } = riskAssessment;

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Risk Score</h3>
        <div className="text-4xl font-bold text-indigo-600 mb-2">
          {overallRiskScore.toFixed(0)}/100
        </div>
        <p className="text-gray-600">
          {overallRiskScore < 30 ? 'Low Risk' : 
           overallRiskScore < 70 ? 'Moderate Risk' : 'High Risk'}
        </p>
      </div>

      {/* Risk Breakdown */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Risk Component Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(riskBreakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <div className="flex items-center">
                <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                  <div 
                    className={`h-2 rounded-full ${
                      value < 30 ? 'bg-green-500' :
                      value < 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">
                  {typeof value === 'number' ? value.toFixed(0) : value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monte Carlo Projections */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Monte Carlo Projections (10 Years)</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-xs text-gray-600">5th Percentile</p>
            <p className="font-semibold">${monteCarloProjections.projections.percentile5.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">25th Percentile</p>
            <p className="font-semibold">${monteCarloProjections.projections.percentile25.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">Expected</p>
            <p className="font-semibold text-blue-600">${monteCarloProjections.projections.percentile50.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">75th Percentile</p>
            <p className="font-semibold">${monteCarloProjections.projections.percentile75.toFixed(0)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600">95th Percentile</p>
            <p className="font-semibold">${monteCarloProjections.projections.percentile95.toFixed(0)}</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Probability of Success: <span className="font-semibold text-green-600">
              {(monteCarloProjections.probabilityOfSuccess * 100).toFixed(0)}%
            </span>
          </p>
        </div>
      </div>

      {/* Concentration Risk */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Concentration Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Herfindahl Index</h4>
            <div className="text-2xl font-bold text-blue-600">
              {concentrationRisk.herfindahlIndex.toFixed(3)}
            </div>
            <p className="text-sm text-blue-700">
              {concentrationRisk.herfindahlIndex < 0.15 ? 'Well diversified' :
               concentrationRisk.herfindahlIndex < 0.25 ? 'Moderately concentrated' : 'Highly concentrated'}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-2">Largest Position</h4>
            <div className="text-2xl font-bold text-orange-600">
              {concentrationRisk.largestPositionRisk.toFixed(1)}%
            </div>
            <p className="text-sm text-orange-700">
              Of total portfolio value
            </p>
          </div>
        </div>
      </div>

      {/* Risk Mitigation Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Risk Mitigation Recommendations</h3>
        <div className="space-y-3">
          {recommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.description}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Expected risk reduction: {rec.expectedRiskReduction}% | 
                    Cost-benefit ratio: {rec.costBenefit.toFixed(1)} | 
                    Timeframe: {rec.timeframe}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {rec.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Advanced Analytics Tab Component
 */
function AdvancedAnalyticsTab({ advancedAnalytics }: { advancedAnalytics: AdvancedAnalyticsResult }) {
  const { quantumOptimization, behavioralInsights, taxOptimization, portfolioEvolution } = advancedAnalytics;

  return (
    <div className="space-y-6">
      {/* Quantum Optimization Results */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Quantum-Inspired Optimization</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(quantumOptimization.expectedReturn * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Expected Return</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {(quantumOptimization.expectedVolatility * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Expected Volatility</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {quantumOptimization.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-sm text-gray-600">Sharpe Ratio</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(quantumOptimization.quantumAdvantage * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">Quantum Advantage</p>
          </div>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Behavioral Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-900 mb-2">Decision Quality Score</h4>
            <div className="text-2xl font-bold text-yellow-600">
              {(behavioralInsights.decisionQuality.overallScore * 100).toFixed(0)}/100
            </div>
            <p className="text-sm text-yellow-700">
              Consistency: {(behavioralInsights.decisionQuality.consistency * 100).toFixed(0)}% | 
              Timeliness: {(behavioralInsights.decisionQuality.timeliness * 100).toFixed(0)}%
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Emotional State</h4>
            <div className="text-lg font-bold text-green-600 capitalize">
              {behavioralInsights.emotionalState.currentState}
            </div>
            <p className="text-sm text-green-700">
              Confidence: {(behavioralInsights.emotionalState.confidence * 100).toFixed(0)}% | 
              Stress: {(behavioralInsights.emotionalState.stressLevel * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        
        {/* Detected Biases */}
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Detected Cognitive Biases</h4>
          <div className="space-y-2">
            {behavioralInsights.biasDetection.map((bias, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">{bias.type}</span>
                  <p className="text-sm text-gray-600">Impact: {(bias.impact * 100).toFixed(1)}%</p>
                </div>
                <div className="flex items-center">
                  <div className="w-20 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-2 bg-orange-500 rounded-full"
                      style={{ width: `${bias.severity * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">
                    {(bias.severity * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tax Optimization */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">Tax Optimization Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              ${taxOptimization.estimatedTaxSavings.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700">Estimated Annual Savings</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              ${taxOptimization.assetLocation.estimatedBenefit.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700">Asset Location Benefit</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              ${taxOptimization.estimatedTaxSavings.toLocaleString()}
            </div>
            <p className="text-sm text-blue-700">Estimated Tax Savings</p>
          </div>
        </div>
      </div>

      {/* Portfolio Evolution */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Portfolio Evolution Projections</h3>
        <div className="space-y-4">
          {portfolioEvolution.growthTrajectory.map((projection, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{projection.timeHorizon} Year Projection</h4>
                <span className="text-sm text-gray-600">
                  Success Probability: {(projection.probabilityOfSuccess * 100).toFixed(0)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Conservative</p>
                  <p className="font-semibold text-red-600">
                    {(projection.conservativeGrowth * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Expected</p>
                  <p className="font-semibold text-blue-600">
                    {(projection.expectedGrowth * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Optimistic</p>
                  <p className="font-semibold text-green-600">
                    {(projection.optimisticGrowth * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * AI Recommendations Tab Component
 */
function RecommendationsTab({ intelligentRecommendations }: { intelligentRecommendations: IntelligentRecommendationResult }) {
  const { personalizedRecommendations, behavioralNudges, emergencyAlerts, opportunityDetection } = intelligentRecommendations;

  return (
    <div className="space-y-6">
      {/* Emergency Alerts */}
      {emergencyAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-3">🚨 Emergency Alerts</h3>
          <div className="space-y-3">
            {emergencyAlerts.map((alert, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-red-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">{alert.alertMessage}</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Severity: {alert.severity} | Timeframe: {alert.timeframe}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-900">Immediate Actions:</p>
                  <ul className="text-sm text-red-700 list-disc list-inside mt-1">
                    {alert.immediateActions.slice(0, 3).map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Alerts */}
      {opportunityDetection.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-3">💡 Opportunities Detected</h3>
          <div className="space-y-3">
            {opportunityDetection.map((opportunity, index) => (
              <div key={index} className="bg-white rounded-lg p-3 border-l-4 border-green-400">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-green-900 capitalize">
                      {opportunity.opportunityType.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-green-700">
                      Potential benefit: ${opportunity.potentialBenefit.toLocaleString()} | 
                      Time window: {opportunity.timeWindow} days | 
                      Confidence: {(opportunity.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalized Recommendations */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">🎯 AI-Powered Recommendations</h3>
        <div className="space-y-4">
          {personalizedRecommendations.map((rec, index) => (
            <div key={rec.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-xs text-gray-500">
                    {(rec.aiConfidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
              
              {/* Expected Impact */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <h5 className="font-medium text-gray-900 mb-2">Expected Impact</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {rec.expectedImpact.incomeIncrease > 0 && (
                    <div>
                      <p className="text-gray-600">Income Increase</p>
                      <p className="font-semibold text-green-600">
                        +{(rec.expectedImpact.incomeIncrease * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {rec.expectedImpact.riskReduction > 0 && (
                    <div>
                      <p className="text-gray-600">Risk Reduction</p>
                      <p className="font-semibold text-blue-600">
                        -{(rec.expectedImpact.riskReduction * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {rec.expectedImpact.taxSavings > 0 && (
                    <div>
                      <p className="text-gray-600">Tax Savings</p>
                      <p className="font-semibold text-purple-600">
                        ${rec.expectedImpact.taxSavings.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600">Time to Realize</p>
                    <p className="font-semibold text-gray-700">
                      {rec.expectedImpact.timeToRealize} days
                    </p>
                  </div>
                </div>
              </div>

              {/* Personalized Reasoning */}
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Personalized insight: </span>
                  {rec.personalizedReasoning}
                </p>
              </div>

              {/* Implementation Preview */}
              <div className="text-sm">
                <p className="font-medium text-gray-900 mb-1">Implementation:</p>
                <p className="text-gray-600">
                  {rec.implementation.phases.length} phases over {rec.implementation.phases.reduce((sum, phase) => sum + phase.duration, 0)} days
                  {rec.implementation.adaptiveTimeline && ' (adaptive timeline)'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Nudges */}
      {behavioralNudges.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">🧠 Behavioral Insights</h3>
          <div className="space-y-3">
            {behavioralNudges.map((nudge, index) => (
              <div key={index} className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 capitalize">
                  {nudge.type.replace('_', ' ')} Guidance
                </h4>
                <p className="text-blue-800 mb-2">{nudge.nudgeMessage}</p>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Action: </span>
                  {nudge.actionableStep}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}