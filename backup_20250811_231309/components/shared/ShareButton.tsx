'use client';

import { useState } from 'react';
import { Share, ExternalLink, Copy, Check } from 'lucide-react';

export type ShareType = 'portfolio' | 'income-status' | 'milestone' | 'spy-performance';

interface ShareData {
  title: string;
  text: string;
  url?: string;
}

interface ShareButtonProps {
  shareType: ShareType;
  shareData: ShareData;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ShareButton = ({ 
  shareType, 
  shareData, 
  className = '', 
  variant = 'secondary',
  size = 'md',
  showLabel = true
}: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // Check if Web Share API is supported
  const canNativeShare = typeof navigator !== 'undefined' && 
    'share' in navigator && 
    navigator.canShare && 
    navigator.canShare(shareData);

  const handleShare = async () => {
    if (isSharing) return;
    
    setIsSharing(true);

    try {
      if (canNativeShare) {
        // Use native Web Share API
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url || window.location.href
        });
      } else {
        // Fallback to clipboard copy
        const textToCopy = `${shareData.text}${shareData.url ? `\n\n${shareData.url}` : ''}`;
        await navigator.clipboard.writeText(textToCopy);
        
        // Show copy success feedback
        setShowCopySuccess(true);
        setTimeout(() => setShowCopySuccess(false), 2000);
      }
    } catch (error) {
      // Handle user cancellation or other errors silently
      // console.log('Share cancelled or failed:', error);
    // } finally {
      setIsSharing(false);
    }
  };

  // Get button styling based on variant
  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    };

    const variantStyles = {
      primary: 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800'
    };

    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`;
  };

  // Get icon based on state and availability
  const getIcon = () => {
    if (showCopySuccess) return Check;
    if (canNativeShare) return Share;
    return Copy;
  };

  const Icon = getIcon();
  const buttonText = showCopySuccess ? 'Copied!' : 
                     canNativeShare ? 'Share' : 'Copy';

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={`${getButtonStyles()} ${className}`}
      aria-label={`Share ${shareType.replace('-', ' ')}`}
      title={canNativeShare ? 'Share via native sharing' : 'Copy to clipboard'}
    >
      <Icon 
        className={`${size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} ${
          isSharing ? 'animate-pulse' : showCopySuccess ? 'text-green-600' : ''
        }`} 
      />
      {showLabel && (
        <span className={showCopySuccess ? 'text-green-600' : ''}>
          {buttonText}
        </span>
      )}
    </button>
  );
};

export default ShareButton;