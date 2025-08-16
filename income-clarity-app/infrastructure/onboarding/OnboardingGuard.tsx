'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingModal } from './OnboardingModal';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, let the auth system handle it
  if (!user) {
    return <>{children}</>;
  }

  // If user hasn't completed onboarding, show onboarding modal
  if (!user.onboarding_completed) {
    return (
      <div className="relative">
        {children}
        <OnboardingModal />
      </div>
    );
  }

  // User has completed onboarding, show normal content
  return <>{children}</>;
}