'use client';

import React from 'react';
import { Shield, CheckCircle, AlertCircle, TrendingUp, Activity } from 'lucide-react';

interface StrategyHealthData {
  overall: number;
  factors: Array<{
    name: string;
    score: number;
    status: 'good' | 'warning' | 'poor';
  }>;
}

interface StrategyHealthCardProps {
  data?: StrategyHealthData;
  className?: string;
}

export function StrategyHealthCard({ 
  data = {
    overall: 8.2,
    factors: [
      { name: 'Diversification', score: 8.5, status: 'good' },
      { name: 'Risk Management', score: 7.8, status: 'good' },
      { name: 'Cost Efficiency', score: 8.9, status: 'good' },
      { name: 'Tax Efficiency', score: 7.5, status: 'warning' }
    ]
  },
  className = ''
}: StrategyHealthCardProps) {
  
  const getHealthColor = (score: number) => {
    if (score >= 8) return 'text-prosperity-600';
    if (score >= 6) return 'text-primary-600';
    return 'text-alert-600';
  };

  const getHealthBg = (score: number) => {
    if (score >= 8) return 'bg-prosperity-50 border-prosperity-200';
    if (score >= 6) return 'bg-primary-50 border-primary-200';
    return 'bg-alert-50 border-alert-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-prosperity-600" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-primary-600" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4 text-alert-600" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Health Score */}
      <div className={`rounded-xl p-6 border-2 ${getHealthBg(data.overall)}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Shield className={`w-8 h-8 ${getHealthColor(data.overall)}`} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Strategy Health</h3>
              <p className="text-sm text-muted-foreground">Overall portfolio assessment</p>
            </div>
          </div>
          <div className={`text-3xl font-bold ${getHealthColor(data.overall)}`}>
            {data.overall.toFixed(1)}/10
          </div>
        </div>
        
        <div className="w-full bg-white/60 rounded-full h-2">
          <div 
            className={`rounded-full h-2 transition-all duration-500 ${
              data.overall >= 8 ? 'bg-prosperity-500' : 
              data.overall >= 6 ? 'bg-primary-500' : 'bg-alert-500'
            }`}
            style={{ width: `${data.overall * 10}%` }}
          />
        </div>
      </div>

      {/* Health Factors */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
          Health Factors
        </h4>
        
        {data.factors.map((factor, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center space-x-3">
              {getStatusIcon(factor.status)}
              <span className="font-medium text-foreground/90">{factor.name}</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-24 bg-slate-200 rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all duration-300 ${
                    factor.status === 'good' ? 'bg-prosperity-500' : 
                    factor.status === 'warning' ? 'bg-primary-500' : 'bg-alert-500'
                  }`}
                  style={{ width: `${factor.score * 10}%` }}
                />
              </div>
              <span className={`font-semibold ${getHealthColor(factor.score)}`}>
                {factor.score.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2">Quick Recommendations</h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• Consider tax-loss harvesting to improve tax efficiency</li>
          <li>• Review expense ratios for cost optimization</li>
          <li>• Monitor correlation between holdings</li>
        </ul>
      </div>
    </div>
  );
}