// Haptic feedback utility stub

export enum HapticPattern {
  Light = 'light',
  Medium = 'medium', 
  Heavy = 'heavy',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  strong = 'strong',
  light = 'light',
  medium = 'medium'
}

export interface HapticSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  patterns: {
    [key: string]: boolean;
  };
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'strong' | 'success' = 'light') {
  // Haptic feedback would be implemented here
  // This is typically only available on mobile devices with vibration support
  if ('vibrate' in navigator) {
    const duration = type === 'light' ? 10 : type === 'medium' ? 20 : 30;
    navigator.vibrate(duration);
  }
}

export const haptic: any = (pattern: HapticPattern | string = HapticPattern.Light, options?: any) => {
  const type = pattern === 'success' || pattern === 'light' ? 'light' :
                pattern === 'warning' || pattern === 'medium' ? 'medium' : 'heavy';
  triggerHapticFeedback(type as any);
};

// Add properties for direct access
haptic.light = () => haptic(HapticPattern.Light);
haptic.medium = () => haptic(HapticPattern.Medium);
haptic.strong = () => haptic(HapticPattern.Heavy);
haptic.selection = () => haptic(HapticPattern.Light);
haptic.success = () => haptic(HapticPattern.Success);
haptic.warning = () => haptic(HapticPattern.Warning);
haptic.error = () => haptic(HapticPattern.Error);
haptic.impact = () => haptic(HapticPattern.Heavy);
haptic[HapticPattern.Light] = () => haptic(HapticPattern.Light);
haptic[HapticPattern.Medium] = () => haptic(HapticPattern.Medium);
haptic[HapticPattern.Heavy] = () => haptic(HapticPattern.Heavy);
haptic[HapticPattern.Success] = () => haptic(HapticPattern.Success);
haptic[HapticPattern.Warning] = () => haptic(HapticPattern.Warning);
haptic[HapticPattern.Error] = () => haptic(HapticPattern.Error);