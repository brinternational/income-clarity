'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback,
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      const currentPath = window.location.pathname;
      const loginUrl = redirectTo + (currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : '');
      router.push(loginUrl);
    }
  }, [user, loading, requireAuth, router, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Render children if auth check passes
  return <>{children}</>;
}

// Convenience component for pages that require authentication
export function RequireAuth({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  );
}

// Convenience component for pages that should redirect authenticated users
export function RequireGuest({ children, redirectTo = '/dashboard', ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return props.fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return props.fallback || (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}