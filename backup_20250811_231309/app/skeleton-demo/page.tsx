'use client';

import React, { useState } from 'react';
import { 
  SkeletonCard, 
  SkeletonText, 
  SkeletonChart, 
  SkeletonTable, 
  SkeletonForm,
  SkeletonIncomeClarityCard,
  SkeletonSPYComparison,
  SkeletonHoldingsPerformance,
  SkeletonWrapper 
} from '@/components/ui/skeletons';

export default function SkeletonDemoPage() {
  const [showSkeletons, setShowSkeletons] = useState(true);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--color-secondary)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Skeleton Loading States Demo
          </h1>
          <button
            onClick={() => setShowSkeletons(!showSkeletons)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white',
            }}
          >
            {showSkeletons ? 'Hide Skeletons' : 'Show Skeletons'}
          </button>
        </div>

        {/* Dashboard Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Dashboard Components
            </h2>
          </div>
          
          {/* SPY Comparison */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              SPY Comparison
            </h3>
            <SkeletonWrapper 
              isLoading={showSkeletons}
              skeleton={<SkeletonSPYComparison />}
            >
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <p style={{ color: 'var(--color-text-primary)' }}>
                  Actual SPY Comparison content would go here...
                </p>
              </div>
            </SkeletonWrapper>
          </div>

          {/* Income Clarity Card */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Income Clarity Card
            </h3>
            <SkeletonWrapper
              isLoading={showSkeletons}
              skeleton={<SkeletonIncomeClarityCard />}
            >
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <p style={{ color: 'var(--color-text-primary)' }}>
                  Actual Income Clarity content would go here...
                </p>
              </div>
            </SkeletonWrapper>
          </div>

          {/* Holdings Performance */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Holdings Performance
            </h3>
            <SkeletonWrapper
              isLoading={showSkeletons}
              skeleton={<SkeletonHoldingsPerformance />}
            >
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <p style={{ color: 'var(--color-text-primary)' }}>
                  Actual Holdings Performance content would go here...
                </p>
              </div>
            </SkeletonWrapper>
          </div>
        </div>

        {/* Basic Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Basic Skeleton Components
            </h2>
          </div>

          {/* Generic Card */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Generic Card
            </h3>
            <SkeletonWrapper
              isLoading={showSkeletons}
              skeleton={<SkeletonCard />}
            >
              <div 
                className="p-6 rounded-xl border"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <h4 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Real Card Title
                </h4>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  This is the actual content that would be shown when loading is complete.
                </p>
              </div>
            </SkeletonWrapper>
          </div>

          {/* Chart */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Chart
            </h3>
            <div 
              className="p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <SkeletonWrapper
                isLoading={showSkeletons}
                skeleton={<SkeletonChart />}
              >
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: 'var(--color-text-primary)' }}>
                    Actual chart would be rendered here
                  </p>
                </div>
              </SkeletonWrapper>
            </div>
          </div>

          {/* Table */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Data Table
            </h3>
            <SkeletonWrapper
              isLoading={showSkeletons}
              skeleton={<SkeletonTable rows={4} columns={3} />}
            >
              <div 
                className="rounded-xl border overflow-hidden"
                style={{ 
                  backgroundColor: 'var(--color-primary)',
                  borderColor: 'var(--color-border)'
                }}
              >
                <div 
                  className="p-4 border-b"
                  style={{ 
                    backgroundColor: 'var(--color-secondary)',
                    borderColor: 'var(--color-border)'
                  }}
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Header 1</div>
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Header 2</div>
                    <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Header 3</div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div style={{ color: 'var(--color-text-primary)' }}>Data 1</div>
                    <div style={{ color: 'var(--color-text-primary)' }}>Data 2</div>
                    <div style={{ color: 'var(--color-text-primary)' }}>Data 3</div>
                  </div>
                </div>
              </div>
            </SkeletonWrapper>
          </div>

          {/* Form */}
          <div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              Form
            </h3>
            <div 
              className="p-6 rounded-xl border"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                borderColor: 'var(--color-border)'
              }}
            >
              <SkeletonWrapper
                isLoading={showSkeletons}
                skeleton={<SkeletonForm fields={4} />}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      Field 1
                    </label>
                    <input 
                      className="w-full p-2 rounded border" 
                      style={{ 
                        backgroundColor: 'var(--color-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter value..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      Field 2
                    </label>
                    <input 
                      className="w-full p-2 rounded border" 
                      style={{ 
                        backgroundColor: 'var(--color-secondary)',
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-primary)'
                      }}
                      placeholder="Enter value..."
                    />
                  </div>
                </div>
              </SkeletonWrapper>
            </div>
          </div>
        </div>

        {/* Text Skeletons */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Text Skeletons
          </h2>
          <div 
            className="p-6 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderColor: 'var(--color-border)'
            }}
          >
            <SkeletonWrapper
              isLoading={showSkeletons}
              skeleton={<SkeletonText lines={5} />}
            >
              <div style={{ color: 'var(--color-text-primary)' }}>
                <p className="mb-2">
                  This is actual paragraph text that would be displayed when content has loaded.
                </p>
                <p className="mb-2">
                  The skeleton text component can simulate multiple lines of varying lengths.
                </p>
                <p className="mb-2">
                  This helps users understand that content is coming and maintains visual consistency.
                </p>
                <p className="mb-2">
                  It's particularly useful for blog posts, descriptions, and other text content.
                </p>
                <p>
                  The skeleton shimmer effect provides a smooth loading experience.
                </p>
              </div>
            </SkeletonWrapper>
          </div>
        </div>

        {/* Performance Notes */}
        <div 
          className="p-6 rounded-xl border"
          style={{ 
            backgroundColor: 'var(--color-info)',
            borderColor: 'var(--color-border)',
            opacity: 0.1
          }}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Performance Benefits
          </h3>
          <ul className="space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <li>• Immediate visual feedback during loading states</li>
            <li>• Prevents layout shift when content loads</li>
            <li>• Maintains visual hierarchy and component structure</li>
            <li>• Theme-aware colors that adapt to all 10 themes</li>
            <li>• Smooth transitions from skeleton to actual content</li>
            <li>• Improved perceived performance and user experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}