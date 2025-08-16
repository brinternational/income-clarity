'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { ImportResult } from '../ImportWizard';

export interface ImportSummaryProps {
  result: ImportResult;
  onStartOver: () => void;
  onViewPortfolio: () => void;
}

export function ImportSummary({ result, onStartOver, onViewPortfolio }: ImportSummaryProps) {
  const isSuccess = result.success && result.imported > 0;
  
  // Mock portfolio statistics - in real implementation, these would come from the import result
  const portfolioStats = {
    totalValue: '$125,430.50',
    totalShares: '1,247',
    avgCostBasis: '$98.45',
    diversification: '15 holdings across 8 sectors'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Import Complete</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your portfolio import has finished processing. Here's a summary of the results.
        </p>
      </div>

      {/* Status Card */}
      <Card className={`p-6 ${isSuccess ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
        <div className="flex items-center space-x-4">
          {isSuccess ? (
            <CheckCircle className="w-12 h-12 text-green-600" />
          ) : (
            <AlertCircle className="w-12 h-12 text-red-600" />
          )}
          
          <div>
            <h3 className={`text-xl font-semibold ${isSuccess ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
              {isSuccess ? 'Import Successful!' : 'Import Completed with Issues'}
            </h3>
            <p className={`${isSuccess ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isSuccess 
                ? `Successfully imported ${result.imported} holdings into your portfolio.`
                : `Imported ${result.imported} holdings, but ${result.errors} failed to import.`
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Results Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{result.imported}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Successfully Imported</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{result.errors}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Failed</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{result.warnings}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Warnings</div>
        </Card>
        
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {Math.round((result.imported / (result.imported + result.errors)) * 100)}%
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
        </Card>
      </div>

      {/* Portfolio Overview */}
      {isSuccess && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Portfolio Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-semibold">{portfolioStats.totalValue}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Value</div>
            </div>
            
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold">{portfolioStats.totalShares}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Shares</div>
            </div>
            
            <div className="text-center">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold">{portfolioStats.avgCostBasis}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Cost Basis</div>
            </div>
            
            <div className="text-center">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="font-semibold text-sm">{portfolioStats.diversification}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Diversification</div>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Results */}
      {result.details && result.details.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Import Details</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {result.details.map((detail, index) => {
              const isError = detail.toLowerCase().includes('error') || detail.toLowerCase().includes('failed');
              const isWarning = detail.toLowerCase().includes('warning');
              
              return (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  {isError ? (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  )}
                  <span className={
                    isError ? 'text-red-700 dark:text-red-300' :
                    isWarning ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-green-700 dark:text-green-300'
                  }>
                    {detail}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">1</div>
            <span className="text-sm">View your imported holdings in the portfolio dashboard</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">2</div>
            <span className="text-sm">Set up dividend tracking and income projections</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">3</div>
            <span className="text-sm">Configure tax settings for accurate income calculations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 text-sm font-semibold">4</div>
            <span className="text-sm">Explore the 5 Super Cards for comprehensive portfolio analysis</span>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      {isSuccess && (
        <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">
            Recommendations
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div>• Consider enabling automatic price updates for real-time portfolio tracking</div>
            <div>• Set up dividend calendar alerts to never miss a payment date</div>
            <div>• Review your sector allocation for proper diversification</div>
            <div>• Configure your tax profile to see accurate after-tax income projections</div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={onViewPortfolio}
          className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
        >
          View Portfolio
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        
        <Button
          variant="outline"
          onClick={onStartOver}
          className="flex items-center justify-center"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Import Another Portfolio
        </Button>
        
        <Button variant="outline" className="flex items-center justify-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Explore Super Cards
        </Button>
      </div>

      {/* Tips */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
        <h4 className="font-medium mb-2">💡 Pro Tips</h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <div>• Your portfolio is automatically backed up - you can restore anytime from Import History</div>
          <div>• Price data updates every 5 minutes during market hours</div>
          <div>• Use the SPY comparison feature to track your performance vs. the market</div>
          <div>• Set up milestone tracking to gamify your journey to financial independence</div>
        </div>
      </Card>
    </div>
  );
}