'use client';

import React, { useState } from 'react';
import { Users, TrendingUp, Award, Target, BarChart3 } from 'lucide-react';

interface PeerGroup {
  id: string;
  name: string;
  description: string;
  avgReturn: number;
  medianReturn: number;
  topQuartile: number;
  yourRank: number;
  totalParticipants: number;
}

interface PeerBenchmarkingViewProps {
  yourReturn?: number;
  peerGroups?: PeerGroup[];
  className?: string;
  portfolioValue?: any;
  location?: string;
  strategy?: string;
}

export function PeerBenchmarkingView({ 
  yourReturn = 8.2,
  peerGroups = [
    {
      id: 'dividend-focus',
      name: 'Dividend-Focused Investors',
      description: 'Portfolios with 60%+ dividend-paying stocks',
      avgReturn: 7.5,
      medianReturn: 7.8,
      topQuartile: 10.2,
      yourRank: 15,
      totalParticipants: 1247
    },
    {
      id: 'similar-age',
      name: 'Similar Age Group (35-45)',
      description: 'Investors in your age demographic',
      avgReturn: 8.8,
      medianReturn: 8.1,
      topQuartile: 12.5,
      yourRank: 42,
      totalParticipants: 3891
    },
    {
      id: 'similar-portfolio-size',
      name: 'Similar Portfolio Size',
      description: '$100K - $500K portfolio range',
      avgReturn: 6.9,
      medianReturn: 7.2,
      topQuartile: 11.8,
      yourRank: 8,
      totalParticipants: 2156
    },
    {
      id: 'risk-tolerance',
      name: 'Moderate Risk Tolerance',
      description: 'Similar risk profile investors',
      avgReturn: 8.1,
      medianReturn: 8.0,
      topQuartile: 11.9,
      yourRank: 28,
      totalParticipants: 5432
    }
  ],
  className = '',
  portfolioValue,
  location,
  strategy
}: PeerBenchmarkingViewProps) {

  const [selectedGroup, setSelectedGroup] = useState<string>(peerGroups[0]?.id || '');

  const selectedPeerGroup = peerGroups.find(group => group.id === selectedGroup) || peerGroups[0];

  const getPerformanceColor = (yourReturn: number, benchmark: number) => {
    if (yourReturn > benchmark * 1.1) return 'text-prosperity-600';
    if (yourReturn > benchmark * 0.9) return 'text-primary-600';
    return 'text-alert-600';
  };

  const getPerformanceBg = (yourReturn: number, benchmark: number) => {
    if (yourReturn > benchmark * 1.1) return 'bg-prosperity-50 border-prosperity-200';
    if (yourReturn > benchmark * 0.9) return 'bg-primary-50 border-primary-200';
    return 'bg-alert-50 border-alert-200';
  };

  const getRankSuffix = (rank: number) => {
    const lastDigit = rank % 10;
    const lastTwoDigits = rank % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return 'th';
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  const getPercentile = (rank: number, total: number) => {
    return Math.round((1 - rank / total) * 100);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Users className="w-6 h-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Peer Benchmarking</h3>
        </div>
        <p className="text-sm text-muted-foreground">See how your portfolio performs against similar investors</p>
      </div>

      {/* Your Performance Overview */}
      <div className={`rounded-xl p-6 border-2 ${getPerformanceBg(yourReturn, selectedPeerGroup.avgReturn)}`}>
        <div className="text-center">
          <div className={`text-4xl font-bold mb-2 ${getPerformanceColor(yourReturn, selectedPeerGroup.avgReturn)}`}>
            {yourReturn.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground mb-4">Your Annual Return</div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {selectedPeerGroup.yourRank}{getRankSuffix(selectedPeerGroup.yourRank)}
              </div>
              <div className="text-xs text-muted-foreground">Rank</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-primary-600">
                {getPercentile(selectedPeerGroup.yourRank, selectedPeerGroup.totalParticipants)}%
              </div>
              <div className="text-xs text-muted-foreground">Percentile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Peer Group Selector */}
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Compare Against:</h4>
        <div className="space-y-2">
          {peerGroups.map((group) => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedGroup === group.id
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h5 className={`font-semibold ${
                  selectedGroup === group.id ? 'text-primary-800' : 'text-foreground'
                }`}>
                  {group.name}
                </h5>
                <span className="text-xs bg-slate-100 text-muted-foreground px-2 py-1 rounded-full">
                  {group.totalParticipants.toLocaleString()} investors
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{group.description}</p>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="font-semibold text-foreground/90">{group.avgReturn.toFixed(1)}%</div>
                  <div className="text-muted-foreground">Average</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground/90">{group.medianReturn.toFixed(1)}%</div>
                  <div className="text-muted-foreground">Median</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-foreground/90">{group.topQuartile.toFixed(1)}%</div>
                  <div className="text-muted-foreground">Top 25%</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Performance Comparison Chart */}
      <div className="bg-white rounded-lg p-4 border border-slate-200">
        <h4 className="font-semibold text-foreground mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Performance Distribution
        </h4>
        
        <div className="space-y-3">
          {/* Your Position */}
          <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-primary-800">Your Portfolio</span>
            </div>
            <span className="font-bold text-primary-600">{yourReturn.toFixed(1)}%</span>
          </div>

          {/* Benchmarks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm text-muted-foreground">Top 25% Threshold</span>
              <span className="font-semibold text-prosperity-600">{selectedPeerGroup.topQuartile.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm text-muted-foreground">Average</span>
              <span className="font-semibold text-foreground/90">{selectedPeerGroup.avgReturn.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded">
              <span className="text-sm text-muted-foreground">Median</span>
              <span className="font-semibold text-foreground/90">{selectedPeerGroup.medianReturn.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
        <h4 className="font-semibold text-primary-800 mb-2 flex items-center">
          <Target className="w-4 h-4 mr-1" />
          Key Insights
        </h4>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>• You rank in the top {getPercentile(selectedPeerGroup.yourRank, selectedPeerGroup.totalParticipants)}% of {selectedPeerGroup.name.toLowerCase()}</li>
          <li>• Your return is {(yourReturn - selectedPeerGroup.avgReturn).toFixed(1)}% {yourReturn > selectedPeerGroup.avgReturn ? 'above' : 'below'} the group average</li>
          <li>• {yourReturn > selectedPeerGroup.topQuartile ? 'You\'re in the top quartile!' : `Need ${(selectedPeerGroup.topQuartile - yourReturn).toFixed(1)}% more to reach top 25%`}</li>
        </ul>
      </div>
    </div>
  );
}