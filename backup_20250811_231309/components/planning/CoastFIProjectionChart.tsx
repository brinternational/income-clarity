'use client';

import { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

interface CoastProjectionPoint {
  age: number;
  year: number;
  netWorth: number;
  annualContributions: number;
  isCoastPhase: boolean;
  realValue: number;
}

interface CoastFIProjectionChartProps {
  data: CoastProjectionPoint[];
  chartType: 'networth' | 'contributions' | 'real-value';
  coastAge: number;
  currentAge: number;
  targetRetirementAge: number;
  requiredCoastAmount: number;
  className?: string;
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
};

const formatTooltip = (value: number, name: string): [string, string] => {
  return [formatCurrency(value), name];
};

const formatXAxisTick = (tickItem: number): string => {
  return `Age ${tickItem}`;
};

export const CoastFIProjectionChart = ({
  data,
  chartType,
  coastAge,
  currentAge,
  targetRetirementAge,
  requiredCoastAmount,
  className = ''
}: CoastFIProjectionChartProps) => {
  // Prepare chart data based on selected view
  const chartData = useMemo(() => {
    return data.map((point, index) => ({
      age: point.age,
      year: point.year,
      value: chartType === 'networth' 
        ? point.netWorth 
        : chartType === 'contributions' 
          ? point.annualContributions
          : point.realValue,
      isCoastPhase: point.isCoastPhase,
      netWorth: point.netWorth,
      contributions: point.annualContributions,
      realValue: point.realValue
    }));
  }, [data, chartType]);

  // Split data into contributing and coast phases for different styling
  const contributingData = chartData.filter(point => !point.isCoastPhase);
  const coastingData = chartData.filter(point => point.isCoastPhase);

  // Get the data point at coast age for reference line
  const coastPoint = chartData.find(point => point.age === Math.floor(coastAge));

  const getChartTitle = () => {
    switch (chartType) {
      case 'networth':
        return 'Net Worth Growth Over Time';
      case 'contributions':
        return 'Annual Contributions Timeline';
      case 'real-value':
        return 'Inflation-Adjusted Value';
      default:
        return 'Financial Projection';
    }
  };

  const getValueLabel = () => {
    switch (chartType) {
      case 'networth':
        return 'Net Worth';
      case 'contributions':
        return 'Annual Contributions';
      case 'real-value':
        return 'Real Value';
      default:
        return 'Value';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isCoastPhase = data.isCoastPhase;
      
      return (
        <motion.div 
          className="bg-white/95 backdrop-blur border border-slate-200 rounded-lg p-4 shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="font-semibold text-slate-800 mb-2">
            Age {label} ({data.year})
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Net Worth:</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(data.netWorth)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Annual Contributions:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(data.contributions)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Real Value:</span>
              <span className="font-medium text-purple-600">
                {formatCurrency(data.realValue)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 mt-2">
              <div className={`text-xs font-medium px-2 py-1 rounded ${
                isCoastPhase ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {isCoastPhase ? '🏖️ Coast Phase' : '💪 Contributing Phase'}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <div className={className}>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-800 mb-2">{getChartTitle()}</h3>
          <div className="flex items-center space-x-6 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
              <span>Contributing Phase</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
              <span>Coast Phase</span>
            </div>
            {coastAge < targetRetirementAge && (
              <div className="flex items-center space-x-2">
                <div className="w-0.5 h-4 bg-amber-500"></div>
                <span>Coast FI Point</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="age" 
                tickFormatter={formatXAxisTick}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Coast FI Point Reference Line */}
              {coastAge < targetRetirementAge && coastAge > currentAge && (
                <ReferenceLine 
                  x={Math.floor(coastAge)} 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: "Coast FI", position: "top", fill: "#f59e0b", fontSize: 12 }}
                />
              )}

              {/* Net Worth Requirement Line (if showing net worth) */}
              {chartType === 'networth' && (
                <ReferenceLine 
                  y={requiredCoastAmount} 
                  stroke="#10b981" 
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  label={{ value: "Coast Requirement", position: "insideTopLeft", fill: "#10b981", fontSize: 12 }}
                />
              )}

              {/* Area chart for better visualization */}
              <Area 
                type="monotone" 
                dataKey="value"
                stroke="none"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              
              {/* Line for the main trend */}
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Chart Insights */}
        <div className="mt-4 bg-slate-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-blue-600">Contributing Phase</div>
              <div className="text-slate-600">
                Ages {currentAge} - {Math.floor(coastAge)}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {Math.max(0, Math.floor(coastAge) - currentAge)} years of active saving
              </div>
            </div>
            
            <div className="text-center">
              <div className="font-semibold text-green-600">Coast Phase</div>
              <div className="text-slate-600">
                Ages {Math.floor(coastAge)} - {targetRetirementAge}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {Math.max(0, targetRetirementAge - Math.floor(coastAge))} years of coasting
              </div>
            </div>

            <div className="text-center">
              <div className="font-semibold text-purple-600">Total Journey</div>
              <div className="text-slate-600">
                {targetRetirementAge - currentAge} years to retirement
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Coast FI at {((Math.floor(coastAge) - currentAge) / (targetRetirementAge - currentAge) * 100).toFixed(0)}% mark
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};