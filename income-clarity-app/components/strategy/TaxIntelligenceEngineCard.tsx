'use client';

import React from 'react';
import { Calculator, TrendingDown, MapPin, Zap, DollarSign } from 'lucide-react';

interface TaxBurden {
  federal: number;
  state: number;
  total: number;
  effectiveRate: number;
}

interface TaxIntelligenceEngineCardProps {
  taxBurden?: TaxBurden;
  location?: string;
  annualIncome?: number;
  className?: string;
}

export function TaxIntelligenceEngineCard({ 
  taxBurden = {
    federal: 8420,
    state: 3280,
    total: 11700,
    effectiveRate: 23.4
  },
  location = 'California',
  annualIncome = 50000,
  className = ''
}: TaxIntelligenceEngineCardProps) {

  const recommendations = [
    {
      action: 'Maximize 401k contributions',
      savings: 2800,
      difficulty: 'Easy'
    },
    {
      action: 'Consider Roth IRA conversion',
      savings: 1200,
      difficulty: 'Medium'  
    },
    {
      action: 'Tax-loss harvesting',
      savings: 800,
      difficulty: 'Advanced'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-prosperity-600 bg-prosperity-50';
      case 'Medium': return 'text-primary-600 bg-primary-50';
      case 'Advanced': return 'text-alert-600 bg-alert-50';
      default: return 'text-muted-foreground bg-slate-50';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Calculator className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Tax Intelligence Engine</h3>
        </div>
        <p className="text-sm text-muted-foreground">Smart analysis of your current tax burden and optimization opportunities</p>
      </div>

      {/* Current Tax Burden */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            <span className="font-semibold text-foreground">{location}</span>
          </div>
          <div className="text-2xl font-bold text-foreground/90">
            {taxBurden.effectiveRate.toFixed(1)}%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-bold text-alert-600">
              ${taxBurden.federal.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Federal Tax</div>
          </div>
          
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-lg font-bold text-primary-600">
              ${taxBurden.state.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">State Tax</div>
          </div>
          
          <div className="text-center p-3 bg-slate-100 rounded-lg border-2 border-slate-300">
            <div className="text-lg font-bold text-foreground">
              ${taxBurden.total.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Tax</div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Total tax burden on ${annualIncome.toLocaleString()} annual income
        </div>
      </div>

      {/* Optimization Opportunities */}
      <div className="space-y-4">
        <h4 className="font-semibold text-foreground flex items-center">
          <Zap className="w-5 h-5 text-primary-600 mr-2" />
          Optimization Opportunities
        </h4>
        
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 hover:border-primary-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-semibold text-foreground">{rec.action}</h5>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(rec.difficulty)}`}>
                {rec.difficulty}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Potential annual savings</span>
              <div className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4 text-prosperity-600" />
                <span className="font-bold text-prosperity-600">
                  {rec.savings.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Potential Savings */}
      <div className="bg-prosperity-50 rounded-lg p-4 border border-prosperity-200 text-center">
        <div className="text-2xl font-bold text-prosperity-600 mb-1">
          ${recommendations.reduce((sum, rec) => sum + rec.savings, 0).toLocaleString()}
        </div>
        <div className="text-sm text-prosperity-700">Total Potential Annual Savings</div>
        <div className="text-xs text-prosperity-600 mt-1">
          {((recommendations.reduce((sum, rec) => sum + rec.savings, 0) / taxBurden.total) * 100).toFixed(1)}% tax burden reduction
        </div>
      </div>

      {/* Tax Efficiency Score */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-foreground">Tax Efficiency Score</h4>
          <div className="text-xl font-bold text-primary-600">7.2/10</div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
          <div className="bg-primary-500 rounded-full h-2" style={{ width: '72%' }} />
        </div>
        
        <p className="text-sm text-muted-foreground">
          Good efficiency with room for improvement. Focus on retirement account maximization and tax-loss harvesting.
        </p>
      </div>
    </div>
  );
}