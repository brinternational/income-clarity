'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/forms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, Lock, UserPlus, Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger'

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupFormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function SignupPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<SignupFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  const getPasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'text-red-400' };
    if (score <= 4) return { score, label: 'Fair', color: 'text-orange-400' };
    if (score <= 5) return { score, label: 'Good', color: 'text-yellow-400' };
    return { score, label: 'Strong', color: 'text-green-400' };
  };

  const validateForm = (): boolean => {
    const newErrors: SignupFormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Signup failed' });
        return;
      }

      // Successful signup - redirect to intended destination or onboarding
      if (data.user.onboarding_completed) {
        router.push(redirectTo);
      } else {
        router.push('/onboarding');
      }
      router.refresh(); // Refresh to update auth state
    } catch (error) {
      logger.error('Signup error:', error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof SignupFormData) => (
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

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Start tracking your dividend income today
            </p>
          </div>

          {/* Signup Form */}
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

              {/* Name Field */}
              <div>
                <Input
                  id="name"
                  type="text"
                  label="Full name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={!!errors.name}
                  errorMessage={errors.name}
                  leftIcon={<User className="h-5 w-5" />}
                  required
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>

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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  errorMessage={errors.password}
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle
                  showPassword={showPassword}
                  onPasswordToggle={() => setShowPassword(!showPassword)}
                  required
                  autoComplete="new-password"
                  disabled={isLoading}
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Password strength:</span>
                      <span className={passwordStrength.color}>{passwordStrength.label}</span>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full rounded-full ${
                            i < passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? 'bg-red-500'
                                : passwordStrength.score <= 4
                                ? 'bg-orange-500'
                                : passwordStrength.score <= 5
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  error={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword}
                  leftIcon={<Lock className="h-5 w-5" />}
                  showPasswordToggle
                  showPassword={showConfirmPassword}
                  onPasswordToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                  required
                  autoComplete="new-password"
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
                  leftIcon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
                >
                  {isLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </div>

              {/* Terms and Privacy */}
              <div className="text-center">
                <p className="text-xs text-slate-400">
                  By creating an account, you agree to our{' '}
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="#" className="text-emerald-400 hover:text-emerald-300">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Sign in link */}
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/login" 
                    className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
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

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <SignupPageContent />
    </Suspense>
  );
}