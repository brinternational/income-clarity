'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger'

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: 'test@example.com', // Pre-fill for testing
    password: 'password123'    // Pre-fill for testing
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const result = await signIn(formData.email, formData.password);
      
      if (result.success) {
        // Successful login - redirect to intended destination
        router.push(redirectTo);
        router.refresh(); // Refresh to update auth state
      } else {
        setErrors({ general: result.error || 'Login failed' });
      }
    } catch (error) {
      logger.error('Login error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Sign in to your Income Clarity account
            </p>
          </div>

          {/* Login Form */}
          <div className="mt-8 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-8 shadow-xl">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* General Error */}
              {errors.general && (
                <div 
                  className="rounded-lg bg-red-500/10 border border-red-500/20 p-4"
                  role="alert"
                  aria-live="polite"
                >
                  <p className="text-sm text-red-400">{errors.general}</p>
                </div>
              )}

              {/* Email Field */}
              <div>
                <Input
                  id="email"
                  type="email"
                  label="Email address"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  errorMessage={errors.email}
                  leftIcon={<Mail className="h-5 w-5" />}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div>
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  errorMessage={errors.password}
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle
                  showPassword={showPassword}
                  onPasswordToggle={() => setShowPassword(!showPassword)}
                  required
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              {/* Submit Button */}
              <div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                  leftIcon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>

              {/* Sign up link */}
              {/* Demo Login Button */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-900 px-2 text-slate-400">or</span>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    setErrors({});
                    
                    try {
                      // Reset demo data first
                      const resetResponse = await fetch('/api/demo/reset', {
                        method: 'POST',
                      });
                      
                      if (resetResponse.ok) {
                        // Login with demo credentials
                        const result = await signIn('test@example.com', 'password123');
                        
                        if (result.success) {
                          router.push('/dashboard');
                          router.refresh();
                        } else {
                          setErrors({ general: 'Demo login failed. Please try manual login.' });
                        }
                      } else {
                        setErrors({ general: 'Demo reset failed. Using existing demo data.' });
                        // Try login anyway
                        const result = await signIn('test@example.com', 'password123');
                        if (result.success) {
                          router.push('/dashboard');
                          router.refresh();
                        }
                      }
                    } catch (error) {
                      logger.error('Demo login error:', error);
                      setErrors({ general: 'Demo login failed. Please try manual login.' });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  🚀 Try Demo Mode
                </Button>
              </div>

              {/* Demo credentials info */}
              <div className="text-center bg-slate-800/50 rounded-lg p-4">
                <p className="text-xs text-slate-400 mb-2">
                  <strong className="text-emerald-400">Demo Credentials</strong>
                </p>
                <p className="text-xs text-slate-300">
                  Email: test@example.com<br />
                  Password: password123
                </p>
                <p className="text-xs text-yellow-400 mt-2">
                  Pre-filled for testing with realistic portfolio data
                </p>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
              </div>

              {/* Forgot password link */}
              <div className="text-center">
                <Link 
                  href="#" 
                  className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Forgot password functionality coming soon!');
                  }}
                >
                  Forgot your password?
                </Link>
              </div>
            </form>
          </div>

          {/* Back to home */}
          <div className="text-center">
            <Link 
              href="/" 
              className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}