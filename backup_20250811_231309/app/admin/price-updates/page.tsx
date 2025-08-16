/**
 * LITE-036: Admin Price Updates Page
 * Manual stock price update interface for administrators
 * LITE-040: Enhanced with comprehensive loading states
 */

'use client';

import React, { useState, useEffect } from 'react';
import { ManualPriceUpdateForm } from '../../../components/admin/ManualPriceUpdateForm';
import { BatchPriceUploadForm } from '../../../components/admin/BatchPriceUploadForm';
import { HistoricalPriceEntry } from '../../../components/admin/HistoricalPriceEntry';
import { ReportGenerator } from '../../../components/reports/ReportGenerator';
import { useLoading, LOADING_KEYS } from '../../../contexts/LoadingContext';
import { CardSkeleton, TableSkeleton } from '../../../components/ui/LoadingSkeleton';
import { LoadingButton, InlineLoading } from '../../../components/ui/GlobalLoadingIndicator';

interface SystemStatus {
  database: 'online' | 'offline' | 'loading';
  lastBackup: string;
  activeHoldings: number;
}

export default function AdminPriceUpdatesPage() {
  const [activeTab, setActiveTab] = useState('manual');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: 'loading',
    lastBackup: 'Loading...',
    activeHoldings: 0
  });
  
  const { setLoading, isLoading } = useLoading();

  // Load system status
  useEffect(() => {
    const loadSystemStatus = async () => {
      setLoading(LOADING_KEYS.DASHBOARD, true, 'Loading system status...');
      
      try {
        // Simulate API call for system status
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setSystemStatus({
          database: 'online',
          lastBackup: '1h ago',
          activeHoldings: 12
        });
      } catch (error) {
        // Error handled by emergency recovery script finally {
        setLoading(LOADING_KEYS.DASHBOARD, false);
      }
    };

    loadSystemStatus();
  }, [setLoading]);

  const handleExportData = async () => {
    setLoading(LOADING_KEYS.DATA_EXPORT, true, 'Exporting price data...');
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Export completed successfully!');
    } catch (error) {
      alert('Export failed. Please try again.');
    } finally {
      setLoading(LOADING_KEYS.DATA_EXPORT, false);
    }
  };

  const handleSyncHoldings = async () => {
    setLoading(LOADING_KEYS.PORTFOLIO, true, 'Synchronizing holdings...');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('Holdings synchronized successfully!');
    } catch (error) {
      alert('Sync failed. Please try again.');
    } finally {
      setLoading(LOADING_KEYS.PORTFOLIO, false);
    }
  };

  const tabs = [
    { id: 'manual', label: 'Manual Updates', icon: '✏️' },
    { id: 'batch', label: 'Batch Updates', icon: '📊' },
    { id: 'historical', label: 'Historical Data', icon: '📈' },
    { id: 'reports', label: 'Reports', icon: '📄' }
  ];

  const isStatusLoading = isLoading(LOADING_KEYS.DASHBOARD);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Panel
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manual stock price updates and data management
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <InlineLoading 
                isLoading={isStatusLoading}
                message="Loading status..."
                size="sm"
              >
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Income Clarity Lite v1.0
                </div>
              </InlineLoading>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Admin Warning */}
        <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Administrator Access Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
                <ul className="list-disc list-inside">
                  <li>Manual price updates will overwrite existing data for the same ticker and date</li>
                  <li>Updates will automatically affect portfolio calculations and performance metrics</li>
                  <li>All changes are logged for audit purposes</li>
                  <li>Validate price data carefully before submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {activeTab === 'manual' && <ManualPriceUpdateForm />}
          {activeTab === 'batch' && <BatchPriceUploadForm />}
          {activeTab === 'historical' && <HistoricalPriceEntry />}
          {activeTab === 'reports' && <ReportGenerator />}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('historical')}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-white">📊 View Price History</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Browse historical price data</div>
            </button>
            
            <LoadingButton
              isLoading={isLoading(LOADING_KEYS.DATA_EXPORT)}
              loadingText="Exporting..."
              onClick={handleExportData}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <div className="text-sm font-medium">📁 Export Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Export price data to CSV</div>
              </div>
            </LoadingButton>
            
            <LoadingButton
              isLoading={isLoading(LOADING_KEYS.PORTFOLIO)}
              loadingText="Syncing..."
              onClick={handleSyncHoldings}
              className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors bg-transparent text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <div className="text-sm font-medium">🔄 Sync Holdings</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update portfolio current prices</div>
              </div>
            </LoadingButton>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {isStatusLoading ? (
            <>
              <CardSkeleton className="h-24" />
              <CardSkeleton className="h-24" />
              <CardSkeleton className="h-24" />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Database Status</div>
                <div className={`text-2xl font-bold mt-1 ${
                  systemStatus.database === 'online' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.database === 'online' ? '🟢 Online' : '🔴 Offline'}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Backup</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{systemStatus.lastBackup}</div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Holdings</div>
                <div className="text-2xl font-bold text-purple-600 mt-1">{systemStatus.activeHoldings}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}