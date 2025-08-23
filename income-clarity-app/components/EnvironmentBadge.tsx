/**
 * ============================================================================
 * ENVIRONMENT BADGE COMPONENT
 * Visual environment identification system
 * Prevents deployment confusion with clear environment indicators
 * ============================================================================
 */

'use client';

import React, { useEffect, useState } from 'react';
import { getEnvironmentInfo, getEnvironmentConfig, type EnvironmentInfo } from '@/lib/utils/environment';

interface EnvironmentBadgeProps {
  /** Position of the badge */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'inline';
  
  /** Size of the badge */
  size?: 'small' | 'medium' | 'large';
  
  /** Whether to show detailed information on hover */
  showDetails?: boolean;
  
  /** Whether to show warnings/errors */
  showStatus?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Whether to hide in production */
  hideInProduction?: boolean;
}

export function EnvironmentBadge({
  position = 'top-right',
  size = 'medium',
  showDetails = true,
  showStatus = true,
  className = '',
  hideInProduction = false,
}: EnvironmentBadgeProps) {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Client-side environment detection
    const detectEnvironment = () => {
      try {
        const info = getEnvironmentInfo();
        setEnvInfo(info);
        
        // Hide in production if requested
        if (hideInProduction && (info.isProduction || info.runtime === 'production')) {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('Environment detection error:', error);
        
        // Fallback browser detection
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const fallbackInfo: EnvironmentInfo = {
            runtime: hostname === 'localhost' ? 'development' : 'production',
            config: 'unknown',
            public: 'browser-detected',
            appUrl: window.location.origin,
            isLiteProduction: hostname.includes('incomeclarity.ddns.net'),
            isDevelopment: hostname === 'localhost',
            isProduction: !hostname.includes('localhost'),
            isTest: false,
            isConsistent: true,
            hasWarnings: false,
            warnings: [],
            errors: [],
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            hostname,
          };
          setEnvInfo(fallbackInfo);
        }
      }
    };

    detectEnvironment();

    // Update environment info periodically
    const interval = setInterval(detectEnvironment, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [hideInProduction]);

  if (!isVisible || !envInfo) {
    return null;
  }

  const config = getEnvironmentConfig(
    envInfo.isLiteProduction ? 'lite_production' : envInfo.runtime
  );

  // Size configurations
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1.5',
    large: 'text-base px-4 py-2',
  };

  // Position configurations
  const positionClasses = {
    'top-left': 'fixed top-4 left-4 z-50',
    'top-right': 'fixed top-4 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'bottom-right': 'fixed bottom-4 right-4 z-50',
    'inline': 'inline-flex',
  };

  // Status indicator
  const getStatusIcon = () => {
    if (envInfo.errors.length > 0) {
      return <span className="text-red-500 mr-1">⚠️</span>;
    }
    if (envInfo.hasWarnings) {
      return <span className="text-yellow-500 mr-1">⚠️</span>;
    }
    if (envInfo.isConsistent) {
      return <span className="text-green-500 mr-1">✅</span>;
    }
    return null;
  };

  // Pulse animation for critical environments
  const shouldPulse = config.riskLevel === 'critical' || envInfo.errors.length > 0;

  return (
    <div
      className={`
        ${positionClasses[position]}
        ${sizeClasses[size]}
        ${className}
        relative
        inline-flex
        items-center
        font-mono
        font-bold
        rounded-lg
        border-2
        shadow-lg
        transition-all
        duration-200
        hover:shadow-xl
        cursor-pointer
        ${shouldPulse ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
        color: config.color,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => setShowTooltip(!showTooltip)}
    >
      {/* Badge content */}
      <span className="flex items-center">
        <span className="mr-1">{config.icon}</span>
        {showStatus && getStatusIcon()}
        {config.displayName}
      </span>

      {/* Tooltip/Details */}
      {showDetails && showTooltip && (
        <div
          className={`
            absolute
            ${position.includes('top') ? 'top-full mt-2' : 'bottom-full mb-2'}
            ${position.includes('right') ? 'right-0' : 'left-0'}
            min-w-80
            max-w-96
            p-4
            bg-white
            dark:bg-gray-800
            border
            border-gray-200
            dark:border-gray-700
            rounded-lg
            shadow-xl
            z-60
            text-sm
            font-normal
          `}
          style={{ color: 'inherit' }}
        >
          <div className="space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-2">
              <span className="font-bold text-gray-900 dark:text-white">Environment Details</span>
              <span style={{ color: config.color }}>{config.icon}</span>
            </div>

            {/* Environment info */}
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <div className="flex justify-between">
                <span className="font-medium">Runtime:</span>
                <span className="font-mono">{envInfo.runtime}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Config:</span>
                <span className="font-mono">{envInfo.config}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">URL:</span>
                <span className="font-mono text-xs break-all">
                  {envInfo.appUrl}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Risk Level:</span>
                <span 
                  className={`
                    font-bold
                    ${config.riskLevel === 'critical' ? 'text-red-600' : ''}
                    ${config.riskLevel === 'high' ? 'text-orange-600' : ''}
                    ${config.riskLevel === 'medium' ? 'text-yellow-600' : ''}
                    ${config.riskLevel === 'low' ? 'text-green-600' : ''}
                  `}
                >
                  {config.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                <span className={`font-bold ${envInfo.isConsistent ? 'text-green-600' : 'text-red-600'}`}>
                  {envInfo.isConsistent ? '✅ Consistent' : '❌ Issues'}
                </span>
              </div>
            </div>

            {/* Warnings */}
            {envInfo.warnings.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium text-yellow-600">⚠️ Warnings:</span>
                {envInfo.warnings.map((warning, index) => (
                  <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300 pl-4">
                    • {warning}
                  </div>
                ))}
              </div>
            )}

            {/* Errors */}
            {envInfo.errors.length > 0 && (
              <div className="space-y-1">
                <span className="font-medium text-red-600">❌ Errors:</span>
                {envInfo.errors.map((error, index) => (
                  <div key={index} className="text-xs text-red-700 dark:text-red-300 pl-4">
                    • {error}
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {config.description}
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-500">
              Updated: {new Date(envInfo.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact inline environment indicator
 */
export function EnvironmentIndicator({ className = '' }: { className?: string }) {
  return (
    <EnvironmentBadge
      position="inline"
      size="small"
      showDetails={false}
      showStatus={true}
      className={className}
    />
  );
}

/**
 * Full environment status panel
 */
export function EnvironmentStatusPanel({ className = '' }: { className?: string }) {
  const [envInfo, setEnvInfo] = useState<EnvironmentInfo | null>(null);

  useEffect(() => {
    const info = getEnvironmentInfo();
    setEnvInfo(info);
  }, []);

  if (!envInfo) {
    return null;
  }

  const config = getEnvironmentConfig(
    envInfo.isLiteProduction ? 'lite_production' : envInfo.runtime
  );

  return (
    <div className={`p-4 rounded-lg border-2 ${className}`}
         style={{ backgroundColor: config.backgroundColor, borderColor: config.borderColor }}>
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Environment Status
        </h3>
        <span className="text-2xl">{config.icon}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Environment:</span>
          <p className="font-mono font-bold" style={{ color: config.color }}>
            {config.displayName}
          </p>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
          <p className={`font-bold ${envInfo.isConsistent ? 'text-green-600' : 'text-red-600'}`}>
            {envInfo.isConsistent ? '✅ Healthy' : '❌ Issues'}
          </p>
        </div>
      </div>

      {/* Issues */}
      {(envInfo.errors.length > 0 || envInfo.warnings.length > 0) && (
        <div className="space-y-2">
          {envInfo.errors.map((error, index) => (
            <div key={index} className="text-sm text-red-600 dark:text-red-400">
              ❌ {error}
            </div>
          ))}
          {envInfo.warnings.map((warning, index) => (
            <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}