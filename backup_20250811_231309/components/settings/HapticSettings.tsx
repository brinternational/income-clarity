'use client';

import React from 'react';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { haptic, HapticSettings as HapticSettingsType } from '@/utils/hapticFeedback';
import { HapticButton, HapticToggleButton } from '@/components/ui/HapticButton';
import { Vibrate, VolumeX } from 'lucide-react';

interface HapticSettingsProps {
  className?: string;
}

/**
 * Haptic Feedback Settings Component
 * Allows users to configure haptic feedback preferences
 */
export default function HapticSettings({ className = '' }: HapticSettingsProps) {
  const { hapticSettings, updateHapticSettings } = useUserProfile();

  const handleToggleHaptic = () => {
    const newEnabled = !hapticSettings.enabled;
    updateHapticSettings({ enabled: newEnabled });
    
    // Provide haptic feedback when enabling (but not when disabling)
    if (newEnabled) {
      haptic.success();
    }
  };

  const handleIntensityChange = (intensity: HapticSettingsType['intensity']) => {
    updateHapticSettings({ intensity });
    
    // Demonstrate the new intensity level
    setTimeout(() => {
      haptic.medium();
    }, 100);
  };

  const testHapticPattern = (pattern: keyof typeof haptic) => {
    if (typeof haptic[pattern] === 'function') {
      (haptic[pattern] as () => void)();
    }
  };

  const isSupported = haptic.isSupported();

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-lg bg-gray-50 border-l-4 border-gray-400 ${className}`}>
        <div className="flex items-start">
          <VolumeX className="w-5 h-5 text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-gray-800 mb-1">
              Haptic Feedback Not Available
            </h3>
            <p className="text-xs text-gray-600">
              Your device or browser doesn't support haptic feedback (vibration). 
              This feature requires a mobile device with vibration capability.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-lg bg-blue-100">
          <Vibrate className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Haptic Feedback
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Configure touch feedback for buttons and interactions
          </p>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg" 
           style={{ backgroundColor: 'var(--color-card)' }}>
        <div>
          <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Enable Haptic Feedback
          </h4>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Feel vibrations when tapping buttons and navigating
          </p>
        </div>
        
        <HapticToggleButton
          pressed={hapticSettings.enabled}
          onToggle={handleToggleHaptic}
          variant={hapticSettings.enabled ? 'primary' : 'outline'}
          size="md"
          className="ml-4"
        >
          {hapticSettings.enabled ? 'Enabled' : 'Disabled'}
        </HapticToggleButton>
      </div>

      {/* Intensity Settings */}
      {hapticSettings.enabled && (
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Feedback Intensity
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {(['light', 'medium', 'strong'] as const).map((intensity) => (
                <HapticButton
                  key={intensity}
                  variant={hapticSettings.intensity === intensity ? 'primary' : 'outline'}
                  onClick={() => handleIntensityChange(intensity)}
                  className="capitalize"
                >
                  {intensity}
                </HapticButton>
              ))}
            </div>
          </div>

          {/* Test Patterns */}
          <div>
            <h4 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              Test Different Patterns
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('light')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Light Tap</div>
                  <div className="text-xs opacity-70">Quick navigation</div>
                </div>
              </HapticButton>
              
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('medium')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Medium Tap</div>
                  <div className="text-xs opacity-70">Button press</div>
                </div>
              </HapticButton>
              
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('strong')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Strong Tap</div>
                  <div className="text-xs opacity-70">Important action</div>
                </div>
              </HapticButton>
              
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('success')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Success</div>
                  <div className="text-xs opacity-70">Task complete</div>
                </div>
              </HapticButton>
              
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('error')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Error</div>
                  <div className="text-xs opacity-70">Something wrong</div>
                </div>
              </HapticButton>
              
              <HapticButton
                variant="outline"
                onClick={() => testHapticPattern('warning')}
                className="text-left"
              >
                <div>
                  <div className="font-medium">Warning</div>
                  <div className="text-xs opacity-70">Confirmation needed</div>
                </div>
              </HapticButton>
            </div>
          </div>
        </div>
      )}

      {/* Usage Info */}
      <div className="text-xs p-3 rounded-lg" 
           style={{ 
             backgroundColor: 'var(--color-muted)', 
             color: 'var(--color-text-secondary)' 
           }}>
        <strong>Note:</strong> Haptic feedback works best on mobile devices. 
        The intensity of vibrations may vary depending on your device settings and battery level.
      </div>
    </div>
  );
}