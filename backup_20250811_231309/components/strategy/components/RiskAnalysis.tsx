'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown,
  Target,
  Activity,
  Zap,
  BarChart3,
  Info
} from 'lucide-react';

interface RiskMetrics {
  valueAtRisk95: number;
  valueAtRisk99: number;
  conditionalValueAtRisk: number;
  downsideDeviation: number;
  sortinoRatio: number;
  informationRatio: number;
  trackingError: number;
}

interface BacktestResult {
  portfolio: {
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
  };
  riskMetrics: RiskMetrics;
}

interface RiskAnalysisProps {
  backtestResult: BacktestResult;
  enablePuertoRico?: boolean;
  className?: string;
}

interface RiskLevel {
  level: 'low' | 'moderate' | 'high' | 'extreme';
  color: string;
  bgColor: string;
  description: string;
}

const getRiskLevel = (metric: string, value: number): RiskLevel => {
  switch (metric) {
    case 'volatility':
      if (value < 10) return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Conservative' };
      if (value < 20) return { level: 'moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Balanced' };
      if (value < 30) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'Aggressive' };
      return { level: 'extreme', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Very High Risk' };
      
    case 'maxDrawdown':
      if (value < 10) return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Low Risk' };
      if (value < 20) return { level: 'moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Moderate Risk' };
      if (value < 35) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'High Risk' };
      return { level: 'extreme', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Extreme Risk' };
      
    case 'var95':
      if (value > -5) return { level: 'low', color: 'text-green-600', bgColor: 'bg-green-50', description: 'Low Risk' };
      if (value > -10) return { level: 'moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Moderate Risk' };
      if (value > -20) return { level: 'high', color: 'text-orange-600', bgColor: 'bg-orange-50', description: 'High Risk' };
      return { level: 'extreme', color: 'text-red-600', bgColor: 'bg-red-50', description: 'Extreme Risk' };
      
    default:
      return { level: 'moderate', color: 'text-gray-600', bgColor: 'bg-gray-50', description: 'Moderate' };
  }
};

const getRiskScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
};

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({
  backtestResult,
  enablePuertoRico = false,
  className = ''
}) => {
  const riskScore = useMemo(() => {
    // Calculate comprehensive risk score (0-100, higher is better/lower risk)
    const volatilityScore = Math.max(0, 100 - (backtestResult.portfolio.volatility * 3));
    const drawdownScore = Math.max(0, 100 - (backtestResult.portfolio.maxDrawdown * 2.5));
    const sharpeScore = Math.min(100, (backtestResult.portfolio.sharpeRatio + 1) * 40);
    const varScore = Math.max(0, 100 + (backtestResult.riskMetrics.valueAtRisk95 * 4));
    
    return Math.round((volatilityScore + drawdownScore + sharpeScore + varScore) / 4);
  }, [backtestResult]);

  const riskMetrics = useMemo(() => [
    {
      label: 'Volatility',
      value: backtestResult.portfolio.volatility,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: Activity,
      description: 'Annual standard deviation of returns',
      risk: getRiskLevel('volatility', backtestResult.portfolio.volatility),
      interpretation: backtestResult.portfolio.volatility < 15 
        ? 'Low volatility suggests stable returns with less price swings'
        : 'Higher volatility indicates more significant price movements and uncertainty'
    },
    {
      label: 'Max Drawdown',
      value: backtestResult.portfolio.maxDrawdown,
      format: (val: number) => `-${val.toFixed(1)}%`,
      icon: TrendingDown,
      description: 'Largest peak-to-trough decline',
      risk: getRiskLevel('maxDrawdown', backtestResult.portfolio.maxDrawdown),
      interpretation: backtestResult.portfolio.maxDrawdown < 20
        ? 'Relatively small maximum loss suggests good downside protection'
        : 'Large maximum drawdown indicates potential for significant losses during market stress'
    },
    {
      label: 'Value at Risk (95%)',
      value: backtestResult.riskMetrics.valueAtRisk95,
      format: (val: number) => `${val.toFixed(1)}%`,
      icon: Shield,
      description: 'Maximum loss expected 95% of the time',
      risk: getRiskLevel('var95', backtestResult.riskMetrics.valueAtRisk95),
      interpretation: backtestResult.riskMetrics.valueAtRisk95 > -10
        ? 'Low VaR suggests limited downside risk in normal market conditions'
        : 'Higher VaR indicates potential for larger losses during market stress'
    },
    {
      label: 'Sharpe Ratio',
      value: backtestResult.portfolio.sharpeRatio,
      format: (val: number) => val.toFixed(2),
      icon: Target,
      description: 'Risk-adjusted return measure',
      risk: backtestResult.portfolio.sharpeRatio > 1 
        ? { level: 'low' as const, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Excellent' }
        : backtestResult.portfolio.sharpeRatio > 0.5
        ? { level: 'moderate' as const, color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Good' }
        : { level: 'high' as const, color: 'text-red-600', bgColor: 'bg-red-50', description: 'Poor' },
      interpretation: backtestResult.portfolio.sharpeRatio > 1
        ? 'Excellent risk-adjusted returns - earning good returns per unit of risk taken'
        : 'Lower Sharpe ratio suggests returns may not adequately compensate for risk taken'
    },
    {
      label: 'Beta',
      value: backtestResult.portfolio.beta,
      format: (val: number) => val.toFixed(2),
      icon: BarChart3,
      description: 'Sensitivity to market movements',
      risk: backtestResult.portfolio.beta < 1.2
        ? { level: 'low' as const, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Defensive' }
        : { level: 'moderate' as const, color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Aggressive' },
      interpretation: backtestResult.portfolio.beta < 1
        ? 'Beta < 1.0 suggests portfolio is less volatile than the overall market'
        : 'Beta > 1.0 indicates portfolio moves more dramatically than the market'
    },
    {
      label: 'Sortino Ratio',
      value: backtestResult.riskMetrics.sortinoRatio,
      format: (val: number) => val.toFixed(2),
      icon: Zap,
      description: 'Risk-adjusted return considering only downside',
      risk: backtestResult.riskMetrics.sortinoRatio > 1 
        ? { level: 'low' as const, color: 'text-green-600', bgColor: 'bg-green-50', description: 'Excellent' }
        : { level: 'moderate' as const, color: 'text-yellow-600', bgColor: 'bg-yellow-50', description: 'Fair' },
      interpretation: backtestResult.riskMetrics.sortinoRatio > backtestResult.portfolio.sharpeRatio
        ? 'Higher Sortino vs Sharpe suggests upside volatility (good for investors)'
        : 'Lower Sortino indicates significant downside volatility concerns'
    }
  ], [backtestResult]);

  const riskRecommendations = useMemo(() => {
    const recommendations = [];
    
    if (backtestResult.portfolio.volatility > 20) {
      recommendations.push({
        type: 'warning',
        title: 'High Volatility',
        message: 'Consider adding bonds or lower-volatility assets to reduce portfolio swings.',
        action: 'Add 10-20% bonds or defensive stocks'
      });
    }
    
    if (backtestResult.portfolio.maxDrawdown > 25) {
      recommendations.push({
        type: 'error',
        title: 'Large Drawdowns',
        message: 'Maximum drawdown suggests significant downside risk during market stress.',
        action: 'Implement stop-loss rules or increase diversification'
      });
    }
    
    if (backtestResult.portfolio.sharpeRatio < 0.5) {
      recommendations.push({
        type: 'warning',
        title: 'Poor Risk-Adjusted Returns',
        message: 'Sharpe ratio indicates returns may not justify the risk taken.',
        action: 'Review asset allocation and consider higher-quality holdings'
      });
    }
    
    if (enablePuertoRico) {
      recommendations.push({
        type: 'success',
        title: 'Puerto Rico Tax Advantage',
        message: 'Your 0% dividend tax rate significantly improves risk-adjusted returns.',
        action: 'Consider increasing dividend-focused allocation'
      });
    }
    
    if (backtestResult.portfolio.beta > 1.3) {
      recommendations.push({
        type: 'info',
        title: 'High Market Sensitivity',
        message: 'Portfolio moves more dramatically than the market during both ups and downs.',
        action: 'Consider defensive positions during volatile periods'
      });
    }
    
    return recommendations;
  }, [backtestResult, enablePuertoRico]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Risk Score Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-indigo-600" />
            Overall Risk Assessment
          </h4>
          <div className="text-right">
            <p className="text-sm text-gray-600">Risk Score</p>
            <p className={`text-3xl font-bold ${getRiskScoreColor(riskScore)}`}>
              {riskScore}/100
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Risk Level</span>
            <span>{riskScore >= 80 ? 'Low' : riskScore >= 60 ? 'Moderate' : riskScore >= 40 ? 'High' : 'Very High'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${riskScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-3 rounded-full ${
                riskScore >= 80 ? 'bg-green-500' :
                riskScore >= 60 ? 'bg-yellow-500' :
                riskScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-700">
          {riskScore >= 80 
            ? 'Your portfolio shows conservative risk characteristics with good downside protection.'
            : riskScore >= 60
            ? 'Moderate risk profile with balanced return potential and downside protection.'
            : riskScore >= 40
            ? 'Higher risk profile - consider risk management strategies for volatile periods.'
            : 'Very high risk - significant potential for large losses during market downturns.'
          }
        </p>
      </motion.div>

      {/* Detailed Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {riskMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${metric.risk.bgColor} ${metric.risk.color.replace('text-', 'border-').replace('-600', '-200')}`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-5 w-5 ${metric.risk.color}`} />
                <span className={`text-xs px-2 py-1 rounded-full ${metric.risk.bgColor} ${metric.risk.color} font-medium`}>
                  {metric.risk.description}
                </span>
              </div>
              
              <h6 className="font-medium text-gray-900 mb-1">{metric.label}</h6>
              <p className={`text-xl font-bold ${metric.risk.color} mb-2`}>
                {metric.format(metric.value)}
              </p>
              
              <p className="text-xs text-gray-600 mb-2">{metric.description}</p>
              <p className="text-xs text-gray-700 leading-relaxed">
                {metric.interpretation}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Advanced Risk Metrics */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
          Advanced Risk Metrics
        </h5>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">VaR 99%</p>
            <p className="text-lg font-bold text-red-600">
              {backtestResult.riskMetrics.valueAtRisk99.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Extreme loss scenario</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">CVaR</p>
            <p className="text-lg font-bold text-red-600">
              {backtestResult.riskMetrics.conditionalValueAtRisk.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Expected tail loss</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Downside Deviation</p>
            <p className="text-lg font-bold text-orange-600">
              {backtestResult.riskMetrics.downsideDeviation.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">Negative return volatility</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Information Ratio</p>
            <p className="text-lg font-bold text-blue-600">
              {backtestResult.riskMetrics.informationRatio.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">Active return per tracking error</p>
          </div>
        </div>
      </div>

      {/* Risk Recommendations */}
      {riskRecommendations.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Risk Management Recommendations
          </h5>
          
          <div className="space-y-4">
            {riskRecommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.type === 'error' ? 'bg-red-50 border-red-500' :
                  rec.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  rec.type === 'success' ? 'bg-green-50 border-green-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex items-start">
                  <div className={`p-1 rounded-full mr-3 ${
                    rec.type === 'error' ? 'bg-red-100' :
                    rec.type === 'warning' ? 'bg-yellow-100' :
                    rec.type === 'success' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    {rec.type === 'error' ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                     rec.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                     rec.type === 'success' ? <Shield className="h-4 w-4 text-green-600" /> :
                     <Info className="h-4 w-4 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <h6 className={`font-medium ${
                      rec.type === 'error' ? 'text-red-800' :
                      rec.type === 'warning' ? 'text-yellow-800' :
                      rec.type === 'success' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {rec.title}
                    </h6>
                    <p className={`text-sm mt-1 ${
                      rec.type === 'error' ? 'text-red-700' :
                      rec.type === 'warning' ? 'text-yellow-700' :
                      rec.type === 'success' ? 'text-green-700' :
                      'text-blue-700'
                    }`}>
                      {rec.message}
                    </p>
                    <p className={`text-sm font-medium mt-2 ${
                      rec.type === 'error' ? 'text-red-900' :
                      rec.type === 'warning' ? 'text-yellow-900' :
                      rec.type === 'success' ? 'text-green-900' :
                      'text-blue-900'
                    }`}>
                      💡 Action: {rec.action}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};