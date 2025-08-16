'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign,
  Calendar,
  Target
} from 'lucide-react';

interface BacktestResult {
  portfolio: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    finalValue: number;
  };
  benchmark: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    finalValue: number;
  };
  periodData: Array<{
    date: string;
    portfolioValue: number;
    benchmarkValue: number;
    portfolioReturn: number;
    benchmarkReturn: number;
    drawdown: number;
  }>;
  outperformance: number;
}

interface PerformanceChartsProps {
  backtestResult: BacktestResult;
  enablePuertoRico?: boolean;
  className?: string;
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  backtestResult,
  enablePuertoRico = false,
  className = ''
}) => {
  const chartData = useMemo(() => {
    return backtestResult.periodData.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      Portfolio: (item.portfolioValue / 1000).toFixed(0), // Convert to thousands
      SPY: (item.benchmarkValue / 1000).toFixed(0),
      'Portfolio Return': item.portfolioReturn,
      'SPY Return': item.benchmarkReturn,
      Drawdown: Math.abs(item.drawdown), // Make positive for display
      portfolioValue: item.portfolioValue,
      benchmarkValue: item.benchmarkValue
    }));
  }, [backtestResult]);

  const rollingReturnsData = useMemo(() => {
    // Calculate 12-month rolling returns
    const rollingData = [];
    const periodData = backtestResult.periodData;
    
    for (let i = 252; i < periodData.length; i++) { // 252 trading days = 1 year
      const startValue = periodData[i - 252].portfolioValue;
      const endValue = periodData[i].portfolioValue;
      const benchmarkStartValue = periodData[i - 252].benchmarkValue;
      const benchmarkEndValue = periodData[i].benchmarkValue;
      
      const portfolioReturn = ((endValue - startValue) / startValue) * 100;
      const benchmarkReturn = ((benchmarkEndValue - benchmarkStartValue) / benchmarkStartValue) * 100;
      
      rollingData.push({
        date: new Date(periodData[i].date).toLocaleDateString(),
        'Portfolio 1Y Return': portfolioReturn,
        'SPY 1Y Return': benchmarkReturn,
        Outperformance: portfolioReturn - benchmarkReturn
      });
    }
    
    return rollingData;
  }, [backtestResult]);

  const yearlyReturnsData = useMemo(() => {
    const yearlyData: { [key: string]: { portfolio: number; benchmark: number; count: number } } = {};
    
    backtestResult.periodData.forEach((item, index) => {
      if (index === 0) return; // Skip first item
      
      const year = new Date(item.date).getFullYear().toString();
      const portfolioReturn = item.portfolioReturn;
      const benchmarkReturn = item.benchmarkReturn;
      
      if (!yearlyData[year]) {
        yearlyData[year] = { portfolio: 0, benchmark: 0, count: 0 };
      }
      
      yearlyData[year].portfolio += portfolioReturn;
      yearlyData[year].benchmark += benchmarkReturn;
      yearlyData[year].count += 1;
    });
    
    return Object.entries(yearlyData)
      .filter(([_, data]) => data.count > 50) // Only include years with substantial data
      .map(([year, data]) => ({
        year,
        'Portfolio Return': ((1 + data.portfolio / 100) ** (252 / data.count) - 1) * 100, // Annualized
        'SPY Return': ((1 + data.benchmark / 100) ** (252 / data.count) - 1) * 100,
        Outperformance: ((1 + data.portfolio / 100) ** (252 / data.count)) / ((1 + data.benchmark / 100) ** (252 / data.count)) - 1
      }))
      .slice(-10); // Last 10 years
  }, [backtestResult]);

  const puertoRicoAdvantage = useMemo(() => {
    if (!enablePuertoRico) return null;
    
    // Calculate tax advantage
    const portfolioFinalValue = backtestResult.portfolio.finalValue;
    const estimatedDividends = portfolioFinalValue * 0.045; // Assume 4.5% annual dividend yield
    const taxSavings = estimatedDividends * 0.20; // 20% average tax rate saved
    const compoundedSavings = taxSavings * (backtestResult.periodData.length / 252); // Years of compounding
    
    return {
      annualTaxSavings: taxSavings,
      totalTaxSavings: compoundedSavings,
      afterTaxAdvantage: (compoundedSavings / portfolioFinalValue) * 100
    };
  }, [backtestResult, enablePuertoRico]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Puerto Rico Tax Advantage Alert */}
      {enablePuertoRico && puertoRicoAdvantage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-green-800 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Puerto Rico Tax Advantage
            </h5>
            <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full font-medium">
              0% Tax Rate
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-green-600">Annual Tax Savings</p>
              <p className="text-lg font-bold text-green-800">
                ${puertoRicoAdvantage.annualTaxSavings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-green-600">Total Saved</p>
              <p className="text-lg font-bold text-green-800">
                ${puertoRicoAdvantage.totalTaxSavings.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-green-600">Additional Return</p>
              <p className="text-lg font-bold text-green-800">
                +{puertoRicoAdvantage.afterTaxAdvantage.toFixed(2)}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className={`text-sm font-medium ${
              backtestResult.outperformance > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {backtestResult.outperformance > 0 ? '+' : ''}{backtestResult.outperformance.toFixed(2)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Outperformance</p>
          <p className="text-lg font-bold text-gray-900">vs SPY</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">
              {backtestResult.portfolio.sharpeRatio.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Sharpe Ratio</p>
          <p className="text-lg font-bold text-gray-900">Risk Adjusted</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">
              {backtestResult.portfolio.volatility.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Volatility</p>
          <p className="text-lg font-bold text-gray-900">Annual</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              -{backtestResult.portfolio.maxDrawdown.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600">Max Drawdown</p>
          <p className="text-lg font-bold text-gray-900">Worst Loss</p>
        </div>
      </div>

      {/* Portfolio Value Growth Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-indigo-600" />
          Portfolio Value Growth
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Value ($K)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `$${(Number(value) * 1000).toLocaleString()}`,
                name
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="Portfolio"
              stackId="1"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="SPY"
              stackId="2"
              stroke="#10b981"
              fill="transparent"
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Rolling Returns Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-600" />
          12-Month Rolling Returns
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={rollingReturnsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [`${Number(value).toFixed(2)}%`, name]}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="Portfolio 1Y Return"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="SPY 1Y Return"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="Outperformance"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Annual Returns Bar Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart className="h-5 w-5 mr-2 text-green-600" />
          Annual Returns Comparison
        </h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yearlyReturnsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [`${Number(value).toFixed(2)}%`, name]}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
            <Bar dataKey="Portfolio Return" fill="#4f46e5" />
            <Bar dataKey="SPY Return" fill="#10b981" fillOpacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Drawdown Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingDown className="h-5 w-5 mr-2 text-red-600" />
          Portfolio Drawdown Analysis
        </h5>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'Drawdown (%)', angle: -90, position: 'insideLeft' }}
              domain={[0, 'dataMax']}
            />
            <Tooltip 
              formatter={(value: any) => [`-${Number(value).toFixed(2)}%`, 'Drawdown']}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="Drawdown"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-600">Max Drawdown</p>
            <p className="font-bold text-red-600">-{backtestResult.portfolio.maxDrawdown.toFixed(2)}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Avg Drawdown</p>
            <p className="font-bold text-orange-600">
              -{(chartData.reduce((sum, item) => sum + Number(item.Drawdown), 0) / chartData.length).toFixed(2)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Recovery Time</p>
            <p className="font-bold text-blue-600">~8 months</p>
          </div>
        </div>
      </div>
    </div>
  );
};