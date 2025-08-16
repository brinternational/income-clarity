'use client';

import React from 'react';

interface NotificationCenterProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  if (!isOpen) return null;
  
  return (
    <div className="notification-center">
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export { NotificationCenter };