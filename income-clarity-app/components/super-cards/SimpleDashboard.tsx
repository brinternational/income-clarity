'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Target,
  Activity,
  LogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardProps {
  className?: string;
}

interface PortfolioData {
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  monthlyDividends: number;
  holdings: Array<{
    symbol: string;
    shares: number;
    currentValue: number;
    totalReturn: number;
  }>;
}

export function SimpleDashboard({ className = '' }: DashboardProps) {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 125000,
    totalReturn: 15750,
    totalReturnPercent: 14.4,
    monthlyDividends: 425,
    holdings: [
      { symbol: 'AAPL', shares: 100, currentValue: 17500, totalReturn: 2500 },
      { symbol: 'MSFT', shares: 50, currentValue: 18750, totalReturn: 3750 },
      { symbol: 'GOOGL', shares: 25, currentValue: 37500, totalReturn: 12500 },
      { symbol: 'TSLA', shares: 30, currentValue: 24000, totalReturn: -6000 },
      { symbol: 'NVDA', shares: 40, currentValue: 27250, totalReturn: 11250 }
    ]
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const cards = [
    {
      title: 'Portfolio Value',
      value: `$${portfolioData.totalValue.toLocaleString()}`,
      subtitle: `+$${portfolioData.totalReturn.toLocaleString()} (${portfolioData.totalReturnPercent}%)`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Monthly Dividends',
      value: `$${portfolioData.monthlyDividends}`,
      subtitle: 'Projected monthly income',
      icon: DollarSign,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Holdings',
      value: portfolioData.holdings.length.toString(),
      subtitle: 'Different positions',
      icon: PieChart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Performance',
      value: `${portfolioData.totalReturnPercent}%`,
      subtitle: 'Total return',
      icon: Target,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className={`p-6 ${className}`}>
      {/* Header with Logout */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Income Clarity Dashboard
          </h1>
          <p className="text-gray-600">
            Your simplified portfolio overview
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: index * 0.1 }}
            className={`${card.bgColor} rounded-lg p-6 shadow-sm border border-gray-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} text-white p-2 rounded-lg`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Current Holdings
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Return
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolioData.holdings.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {holding.symbol}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{holding.shares}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${holding.currentValue.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      holding.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {holding.totalReturn >= 0 ? '+' : ''}${holding.totalReturn.toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Simple Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Portfolio Performance
        </h2>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Chart placeholder</p>
            <p className="text-sm text-gray-400">Performance visualization will go here</p>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Income Clarity - Simplified Portfolio Tracking</p>
        <p>Demo data shown - Connect real portfolio for live updates</p>
      </div>
    </div>
  );
}