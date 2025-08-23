'use client';

import React from 'react';
import { Shield, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface HoldingTaxEfficiency {
  symbol: string;
  taxDrag: number;
  taxEfficiencyScore: number;
  recommendation: string;
  category: 'excellent' | 'good' | 'fair' | 'poor';
}

interface TaxEfficiencyScoreProps {
  holdings?: HoldingTaxEfficiency[];
  overallScore?: number;
  className?: string;
}

export function TaxEfficiencyScore({ 
  holdings = [
    {
      symbol: 'SCHD',
      taxDrag: 0.12,
      taxEfficiencyScore: 9.2,
      recommendation: 'Excellent qualified dividend treatment',
      category: 'excellent'
    },
    {
      symbol: 'VTI',
      taxDrag: 0.08,
      taxEfficiencyScore: 9.5,
      recommendation: 'Very tax efficient index fund',
      category: 'excellent'
    },
    {
      symbol: 'JEPI',
      taxDrag: 0.28,
      taxEfficiencyScore: 7.1,
      recommendation: 'Higher tax drag due to options income',
      category: 'good'
    },
    {
      symbol: 'REIT',
      taxDrag: 0.35,
      taxEfficiencyScore: 5.8,
      recommendation: 'Consider holding in tax-advantaged accounts',
      category: 'fair'
    }
  ],
  overallScore = 8.2,
  className = ''
}: TaxEfficiencyScoreProps) {

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent': return 'text-prosperity-600 bg-prosperity-50 border-prosperity-200';
      case 'good': return 'text-primary-600 bg-primary-50 border-primary-200';
      case 'fair': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'poor': return 'text-alert-600 bg-alert-50 border-alert-200';
      default: return 'text-muted-foreground bg-slate-50 border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'excellent': return <CheckCircle className="w-4 h-4 text-prosperity-600" />;
      case 'good': return <TrendingUp className="w-4 h-4 text-primary-600" />;
      case 'fair': return <Target className="w-4 h-4 text-amber-600" />;
      case 'poor': return <AlertTriangle className="w-4 h-4 text-alert-600" />;
      default: return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-prosperity-600';
    if (score >= 7) return 'text-primary-600';
    if (score >= 5) return 'text-amber-600';
    return 'text-alert-600';
  };

  const getOverallScoreColor = () => {
    if (overallScore >= 8.5) return 'bg-prosperity-50 border-prosperity-200 text-prosperity-800';
    if (overallScore >= 7) return 'bg-primary-50 border-primary-200 text-primary-800';
    if (overallScore >= 5) return 'bg-amber-50 border-amber-200 text-amber-800';
    return 'bg-alert-50 border-alert-200 text-alert-800';
  };

  const categoryStats = holdings.reduce((acc, holding) => {
    acc[holding.category] = (acc[holding.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Tax Efficiency Score</h3>
        </div>
        <p className="text-sm text-muted-foreground">Analyze the tax impact of your holdings and get optimization tips</p>
      </div>

      {/* Overall Score */}
      <div className={`rounded-xl p-6 border-2 ${getOverallScoreColor()}`}>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {overallScore.toFixed(1)}/10
          </div>
          <div className="text-sm font-medium mb-4">Overall Tax Efficiency</div>
          
          <div className="w-full bg-white/40 rounded-full h-3 mb-4">
            <div 
              className="bg-current rounded-full h-3 transition-all duration-500"
              style={{ width: `${overallScore * 10}%` }}
            />
          </div>
          
          <div className="text-sm opacity-90">
            Your portfolio has {overallScore >= 8 ? 'excellent' : overallScore >= 6 ? 'good' : 'room for improvement'} tax efficiency
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-foreground mb-4">Holdings by Tax Efficiency</h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['excellent', 'good', 'fair', 'poor'] as const).map((category) => {
            const count = categoryStats[category] || 0;
            return (
              <div key={category} className={`text-center p-3 rounded-lg border ${getCategoryColor(category)}`}>
                <div className="flex justify-center mb-1">
                  {getCategoryIcon(category)}
                </div>
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className="text-xs capitalize">{category}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Breakdown */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Individual Holding Analysis</h4>
        
        {holdings.map((holding, index) => (
          <div 
            key={holding.symbol} 
            className={`p-4 rounded-lg border ${getCategoryColor(holding.category)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(holding.category)}
                <div>
                  <div className="font-mono font-bold text-foreground">{holding.symbol}</div>
                  <div className="text-xs opacity-75 capitalize">{holding.category} efficiency</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getScoreColor(holding.taxEfficiencyScore)}`}>
                  {holding.taxEfficiencyScore.toFixed(1)}
                </div>
                <div className="text-xs opacity-75">Score</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tax Drag:</span>
                <span className="font-semibold">{(holding.taxDrag * 100).toFixed(2)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">After-tax return reduction</span>
                <span className={`font-semibold ${
                  holding.taxDrag > 0.3 ? 'text-alert-600' : 
                  holding.taxDrag > 0.15 ? 'text-amber-600' : 'text-prosperity-600'
                }`}>
                  {holding.taxDrag > 0.3 ? 'High' : holding.taxDrag > 0.15 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-white/50 rounded text-sm">
              <strong>Recommendation:</strong> {holding.recommendation}
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Tips */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2">Tax Optimization Tips</h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Hold tax-inefficient investments (REITs, bonds) in tax-advantaged accounts</li>
          <li>• Prioritize index funds and qualified dividend stocks in taxable accounts</li>
          <li>• Consider tax-loss harvesting for underperforming positions</li>
          <li>• Use asset location strategies to minimize overall tax drag</li>
        </ul>
      </div>

      {/* Tax Drag Impact */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-foreground mb-3">Tax Drag Impact</h4>
        
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-alert-600 mb-1">
            {(holdings.reduce((sum, h) => sum + h.taxDrag, 0) / holdings.length * 100).toFixed(2)}%
          </div>
          <div className="text-sm text-muted-foreground">Average tax drag across portfolio</div>
        </div>
        
        <div className="text-sm text-muted-foreground text-center">
          On a $100,000 portfolio with 8% returns, tax drag costs approximately <strong className="text-alert-600">
            ${((holdings.reduce((sum, h) => sum + h.taxDrag, 0) / holdings.length) * 100000 * 0.08).toLocaleString()}
          </strong> annually in additional taxes.
        </div>
      </div>
    </div>
  );
}