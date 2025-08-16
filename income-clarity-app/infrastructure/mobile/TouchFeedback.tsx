'use client';

import React from 'react';

interface TouchFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  accessibilityLabel?: string;
  [key: string]: any;
}

export default function TouchFeedback({ children, onPress }: TouchFeedbackProps) {
  return (
    <div onClick={onPress} className="touch-feedback">
      {children}
    </div>
  );
}

export { TouchFeedback };