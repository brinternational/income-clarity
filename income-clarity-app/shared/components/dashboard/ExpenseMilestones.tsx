'use client';

import React from 'react';
import { Target, CheckCircle, Zap, DollarSign } from 'lucide-react';

interface Milestone {
  id: string;
  name: string;
  amount: number;
  covered: boolean;
  percentage: number;
}

interface ExpenseMilestonesProps {
  milestones: Milestone[];
  totalCoverage: number;
}

export function ExpenseMilestones({ milestones = [], totalCoverage = 0 }: ExpenseMilestonesProps) {
  // Safe percentage calculation helper
  const safePercentage = (value: number): number => {
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, value));
  };

  // Safely calculate total coverage percentage
  const safeTotalCoverage = safePercentage(totalCoverage * 100);

  if (!milestones || milestones.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No expense milestones configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-25 rounded-xl p-4 border border-primary-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Total Coverage</span>
          <span className="text-2xl font-bold text-primary-600">{safeTotalCoverage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-white/60 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-full h-2 transition-all duration-500"
            style={{ width: `${safeTotalCoverage}%` }}
          />
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.map((milestone) => (
          <div 
            key={milestone.id} 
            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
              milestone.covered 
                ? 'bg-prosperity-50 border-prosperity-200' 
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              {milestone.covered ? (
                <CheckCircle className="w-5 h-5 text-prosperity-600" />
              ) : (
                <Target className="w-5 h-5 text-slate-400" />
              )}
              <div>
                <div className="font-semibold text-slate-800">{milestone.name}</div>
                <div className="text-xs text-slate-500">
                  ${milestone.amount.toLocaleString()}/month
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`font-bold text-sm ${
                milestone.covered ? 'text-prosperity-600' : 'text-slate-600'
              }`}>
                {safePercentage(milestone.percentage * 100).toFixed(0)}%
              </div>
              {milestone.covered && (
                <div className="text-xs text-prosperity-500">Covered</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-prosperity-600">
            {milestones.filter(m => m.covered).length}
          </div>
          <div className="text-xs text-slate-600">Covered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-700">
            {milestones.length}
          </div>
          <div className="text-xs text-slate-600">Total</div>
        </div>
      </div>
    </div>
  );
}