'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, Target, Zap, Star } from 'lucide-react';
import { SPYProjectionData, ProjectionPeriod, TimeHorizonProjection } from '@/hooks/useSPYProjections';

interface SPYProjectionGraphProps {
  projections: TimeHorizonProjection[];
  selectedPeriod: ProjectionPeriod;
  onPeriodSelect: (period: ProjectionPeriod) => void;
  isLoading?: boolean;
  getScenarioColor: (scenario: string) => string;
}

const periodLabels: Record<ProjectionPeriod, string> = {
  '3M': '3 Months',
  '1Y': '1 Year',
  '3Y': '3 Years',
  '5Y': '5 Years',
  '10Y': '10 Years'
};

const SPYProjectionGraphComponent = ({
  projections,
  selectedPeriod,
  onPeriodSelect,
  isLoading = false,
  getScenarioColor
}: SPYProjectionGraphProps) => {
  const selectedProjection = useMemo(() => {
    // Map selectedPeriod to timeframe strings
    const timeframeMap: Record<ProjectionPeriod, string> = {
      '3M': '3 Months',
      '1Y': '1 Year',
      '3Y': '3 Years',
      '5Y': '5 Years',
      '10Y': '10 Years'
    };
    return projections.find(p => p.timeframe === timeframeMap[selectedPeriod]) || projections[0];
  }, [projections, selectedPeriod]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-slate-200 rounded-xl mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={`projection-skeleton-${i}`} className="h-20 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedProjection) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground text-sm">No projection data available</div>
      </div>
    );
  }

  // Generate visual projection chart data
  const chartData = useMemo(() => {
    const scenarios = selectedProjection.scenarios;
    const maxValue = Math.max(...scenarios.map(s => Math.max(s.annualReturn, s.spyReturn || 0))) * 100;
    const minValue = Math.min(...scenarios.map(s => Math.min(s.annualReturn, s.spyReturn || 0))) * 100;
    const range = Math.max(Math.abs(maxValue), Math.abs(minValue));
    
    return scenarios.map(scenario => ({
      ...scenario,
      portfolioHeight: Math.max(10, (Math.abs(scenario.annualReturn * 100) / range) * 100),
      spyHeight: Math.max(10, (Math.abs((scenario.spyReturn || 0) * 100) / range) * 100),
      outperformanceHeight: Math.max(5, (Math.abs((scenario.outperformance || 0) * 100) / (range * 0.5)) * 50)
    }));
  }, [selectedProjection]);

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <h4 className="font-semibold text-foreground">Forward Projections</h4>
        </div>
        
        <div className="flex bg-slate-50 rounded-lg p-1 gap-1 overflow-x-auto">
          {projections.map((projection) => {
            // Convert timeframe back to period
            const period = Object.entries({
              '3M': '3 Months',
              '1Y': '1 Year',
              '3Y': '3 Years', 
              '5Y': '5 Years',
              '10Y': '10 Years'
            }).find(([, timeframe]) => timeframe === projection.timeframe)?.[0] as ProjectionPeriod || '1Y';
            
            return (
              <button
                key={projection.timeframe}
                onClick={() => onPeriodSelect(period)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 touch-friendly ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white'
                }`}
              >
                {periodLabels[period]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Projection Overview */}
      <motion.div
        key={selectedPeriod}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-primary-50 to-primary-25 rounded-xl p-6 border border-primary-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="font-semibold text-foreground flex items-center">
              <Target className="w-5 h-5 text-primary-600 mr-2" />
              {selectedProjection.timeframe} Outlook
            </h5>
            <p className="text-xs text-muted-foreground mt-1">
              Expected performance with confidence intervals
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary-600">
              {selectedProjection.expectedReturn >= 0 ? (
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{(selectedProjection.expectedReturn * 100).toFixed(1)}%</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>{(selectedProjection.expectedReturn * 100).toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div className="text-xs text-muted-foreground">Success Probability</div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white/50 rounded-lg border border-white/60">
            <div className="text-xs text-muted-foreground mb-1">Expected Return</div>
            <div className={`text-lg font-bold ${
              selectedProjection.expectedReturn >= 0 ? 'text-prosperity-600' : 'text-alert-600'
            }`}>
              {selectedProjection.expectedReturn >= 0 ? '+' : ''}{(selectedProjection.expectedReturn * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg border border-white/60">
            <div className="text-xs text-muted-foreground mb-1">Confidence Low</div>
            <div className="text-lg font-bold text-primary-600">
              {(selectedProjection.confidenceInterval.low * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg border border-white/60">
            <div className="text-xs text-muted-foreground mb-1">Confidence High</div>
            <div className="text-lg font-bold text-wealth-600">
              {(selectedProjection.confidenceInterval.high * 100).toFixed(1)}%
            </div>
          </div>
          
          <div className="text-center p-3 bg-white/50 rounded-lg border border-white/60">
            <div className="text-xs text-muted-foreground mb-1">Milestones</div>
            <div className="text-lg font-bold text-secondary-600">
              {selectedProjection.scenarios.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scenario Analysis Chart */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h6 className="font-semibold text-foreground flex items-center">
            <Zap className="w-4 h-4 text-primary-600 mr-2" />
            Scenario Analysis
          </h6>
          <p className="text-xs text-muted-foreground mt-1">
            Portfolio vs SPY projections across different market conditions
          </p>
        </div>
        
        <div className="p-6">
          {/* Visual Chart */}
          <div className="relative h-48 bg-gradient-to-b from-slate-50 to-slate-25 rounded-xl border border-slate-100 mb-6 overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 opacity-20">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={`grid-horizontal-${i}`} 
                  className="absolute w-full border-t border-slate-200" 
                  style={{ top: `${i * 25}%` }}
                />
              ))}
              {[...Array(4)].map((_, i) => (
                <div 
                  key={`grid-vertical-${i}`} 
                  className="absolute h-full border-l border-slate-200" 
                  style={{ left: `${(i + 1) * 25}%` }}
                />
              ))}
            </div>
            
            {/* Scenario Bars */}
            <div className="relative h-full flex items-end justify-center space-x-8 p-4">
              {chartData.map((scenario, index) => (
                <div key={scenario.name} className="flex flex-col items-center space-y-2">
                  <div className="text-xs font-medium text-muted-foreground text-center leading-tight">
                    {scenario.name}
                  </div>
                  
                  <div className="flex space-x-3 items-end">
                    {/* Portfolio Bar */}
                    <div className="flex flex-col items-center space-y-1">
                      <div 
                        className="w-8 bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all duration-1000 ease-out shadow-sm relative"
                        style={{ height: `${scenario.portfolioHeight}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent shimmer rounded-t-lg" />
                      </div>
                      <div className="text-xs font-bold text-primary-600">
                        {scenario.annualReturn >= 0 ? '+' : ''}{(scenario.annualReturn * 100).toFixed(0)}%
                      </div>
                    </div>
                    
                    {/* SPY Bar */}
                    <div className="flex flex-col items-center space-y-1">
                      <div 
                        className="w-8 bg-gradient-to-t from-wealth-500 to-wealth-400 rounded-t-lg transition-all duration-1000 ease-out shadow-sm relative"
                        style={{ height: `${scenario.spyHeight}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent shimmer rounded-t-lg" />
                      </div>
                      <div className="text-xs font-bold text-wealth-600">
                        {(scenario.spyReturn || 0) >= 0 ? '+' : ''}{((scenario.spyReturn || 0) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className={`text-xs font-bold px-2 py-1 rounded ${
                    scenario.outperformance >= 0 
                      ? 'bg-prosperity-100 text-prosperity-600' 
                      : 'bg-alert-100 text-alert-600'
                  }`}>
                    {scenario.outperformance >= 0 ? '+' : ''}{(scenario.outperformance * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="absolute top-4 left-4 flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">Portfolio</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-wealth-500 rounded-full"></div>
                <span className="text-xs text-muted-foreground">SPY</span>
              </div>
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {selectedProjection.scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-2 ${getScenarioColor(scenario.name as any)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h6 className="font-semibold text-sm">{scenario.name}</h6>
                  <div className="text-xs font-medium px-2 py-1 bg-white/50 rounded">
                    {(scenario.probability * 100).toFixed(0)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Outperformance:</span>
                    <span className={`font-bold ${
                      scenario.outperformance >= 0 ? 'text-prosperity-600' : 'text-alert-600'
                    }`}>
                      {scenario.outperformance >= 0 ? '+' : ''}{(scenario.outperformance * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>Confidence:</span>
                    <span className="font-medium">
                      {scenario.confidenceInterval ? 
                        `${(scenario.confidenceInterval.lower * 100).toFixed(0)}% to ${(scenario.confidenceInterval.upper * 100).toFixed(0)}%` :
                        `${(scenario.probability * 0.8).toFixed(0)}% to ${(scenario.probability * 1.2).toFixed(0)}%`
                      }
                    </span>
                  </div>
                </div>

                {scenario.name === 'Optimistic' && scenario.outperformance > 0.1 && (
                  <div className="mt-3 flex items-center space-x-1 text-xs text-prosperity-600 font-medium">
                    <Star className="w-3 h-3" />
                    <span>Strong Alpha Potential</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h6 className="font-semibold text-foreground flex items-center">
            <Calendar className="w-4 h-4 text-secondary-600 mr-2" />
            Performance Milestones
          </h6>
          <p className="text-xs text-muted-foreground mt-1">
            Expected checkpoints along the projection timeline
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {selectedProjection.scenarios.slice(0, 3).map((milestone, index) => (
              <motion.div
                key={milestone.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-secondary-600">{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {milestone.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Probability: {(milestone.probability).toFixed(0)}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary-600">
                        {(milestone.annualReturn * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-wealth-600">
                        Annual Return
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    (milestone.portfolioValue || 0) > (milestone.spyValue || 0)
                      ? 'bg-prosperity-100 text-prosperity-600'
                      : 'bg-wealth-100 text-wealth-600'
                  }`}>
                    {milestone.portfolioValue && milestone.spyValue && milestone.spyValue > 0 ? (
                      milestone.portfolioValue > milestone.spyValue ? (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{((milestone.portfolioValue - milestone.spyValue) / milestone.spyValue * 100).toFixed(1)}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          <TrendingDown className="w-3 h-3" />
                          <span>{((milestone.portfolioValue - milestone.spyValue) / milestone.spyValue * 100).toFixed(1)}%</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center space-x-1">
                        <span className="text-muted-foreground">N/A</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const SPYProjectionGraph = memo(SPYProjectionGraphComponent);