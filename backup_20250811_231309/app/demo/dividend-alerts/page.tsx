'use client';

import React from 'react';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import { DividendAlertDemo } from '@/components/notifications/DividendAlertDemo';

/**
 * Dividend Alerts Demo Page
 * 
 * Standalone page for testing and demonstrating the dividend alerts system.
 * This page provides access to all dividend alert functionality including:
 * - Testing different alert types
 * - Configuring alert settings
 * - Viewing generated alerts in the notification center
 * 
 * Access this page at: /demo/dividend-alerts
 */
export default function DividendAlertsDemoPage() {
  return (
    <NotificationProvider>
      <PortfolioProvider>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-primary)' }}>
          <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 
            className="text-3xl font-bold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dividend Alerts System Demo
          </h1>
          <p 
            className="text-lg"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Test and configure dividend announcement alerts for your Income Clarity portfolio
          </p>
        </div>

        {/* Instructions */}
        <div 
          className="p-6 rounded-lg border mb-8"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            How to Use This Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Testing Alerts
              </h3>
              <ul 
                className="text-sm space-y-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>• Use "Process Sample Alerts" to generate multiple alerts</li>
                <li>• Test specific alert types with individual buttons</li>
                <li>• Alerts will appear in the notification center (top right)</li>
                <li>• Each alert shows detailed dividend change information</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Configuring Settings
              </h3>
              <ul 
                className="text-sm space-y-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>• Click "Settings" to configure alert preferences</li>
                <li>• Enable/disable different alert types</li>
                <li>• Set minimum change percentage thresholds</li>
                <li>• Choose between all stocks or holdings-only alerts</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 rounded" style={{ backgroundColor: 'var(--color-tertiary)' }}>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <strong>Note:</strong> This demo uses mock dividend announcement data and sample portfolio holdings. 
              In the production app, this would integrate with real dividend data feeds and your actual portfolio holdings.
            </p>
          </div>
        </div>

        {/* Demo Component */}
        <DividendAlertDemo className="max-w-4xl mx-auto" />

        {/* Development Info */}
        <div 
          className="mt-12 p-6 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-border)'
          }}
        >
          <h2 
            className="text-xl font-semibold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Development Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Components Created
              </h3>
              <ul 
                className="text-sm space-y-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>• DividendAlertService</li>
                <li>• DividendAlertCard</li>
                <li>• DividendAlertSettings</li>
                <li>• DividendAlertDemo</li>
                <li>• DividendAlertWrapper</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Features Implemented
              </h3>
              <ul 
                className="text-sm space-y-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>• Four alert types (increase, cut, special, suspension)</li>
                <li>• User preference management</li>
                <li>• Income impact calculations</li>
                <li>• Integration with notification center</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>
            
            <div>
              <h3 
                className="text-lg font-medium mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Test Coverage
              </h3>
              <ul 
                className="text-sm space-y-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <li>• Service logic unit tests</li>
                <li>• Component rendering tests</li>
                <li>• User interaction tests</li>
                <li>• Settings persistence tests</li>
                <li>• Edge case handling</li>
              </ul>
            </div>
          </div>
        </div>
          </div>
        </div>
      </PortfolioProvider>
    </NotificationProvider>
  );
}