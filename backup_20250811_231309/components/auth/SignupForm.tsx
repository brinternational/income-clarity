'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';
import { enableDemoMode } from '@/lib/demo-auth';
import { Eye, EyeOff, Mail, Lock, User, Github, Chrome, Apple } from 'lucide-react';
import type { AuthError } from '@supabase/supabase-js';

// Hoisted constants & helpers
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IS_MOCK_ENV = () => (
  process.env.NEXT_PUBLIC_APP_MODE === 'mock' ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://mock.supabase.co'
);
const normalizeEmail = (e: string) => e.trim().toLowerCase();
const trimName = (n: string) => n.trim();

interface SignupFormProps {
  redirectTo?: string;
}

export function SignupForm({ redirectTo = '/onboarding' }: SignupFormProps) {
  const router = useRouter();
  const { signUp, signInWithProvider, loading, error } = useAuthContext();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  const compositeLoading = isSubmitting || loading || !!providerLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const email = normalizeEmail(formData.email);
    const fullName = trimName(formData.fullName);

    // Validation
    if (!fullName) {
      setErrorMessage('Full name is required');
      setIsSubmitting(false); return;
    }
    if (!email) {
      setErrorMessage('Email address is required');
      setIsSubmitting(false); return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setErrorMessage('Please enter a valid email address');
      setIsSubmitting(false); return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long');
      setIsSubmitting(false); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      setIsSubmitting(false); return;
    }

    try {
      if (IS_MOCK_ENV()) {
        enableDemoMode();
        setSuccessMessage('Demo account created successfully! Redirecting to onboarding...');
        const id = window.setTimeout(() => { router.push(redirectTo); }, 1500);
        timeoutsRef.current.push(id);
        return;
      }

      const result = await signUp(email, formData.password, { full_name: fullName });
      if (result.success) {
        setSuccessMessage('Account created successfully! Please check your email to verify your account.');
        const id = window.setTimeout(() => { router.push(redirectTo); }, 2000);
        timeoutsRef.current.push(id);
      } else {
        setErrorMessage((result.error as AuthError)?.message || 'Failed to create account');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      // console.error('Signup error:', err);
    // } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderSignup = async (provider: 'google' | 'github' | 'apple') => {
    setErrorMessage('');
    setProviderLoading(provider);
    try {
      if (IS_MOCK_ENV()) {
        enableDemoMode();
        setSuccessMessage(`Demo account created with ${provider}! Redirecting to onboarding...`);
        const id = window.setTimeout(() => { router.push(redirectTo); }, 1500);
        timeoutsRef.current.push(id);
        return;
      }
      const result = await signInWithProvider(provider);
      if (!result.success && result.error) {
        setErrorMessage((result.error as AuthError).message || `Failed to sign up with ${provider}`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : `An error occurred during ${provider} sign up`);
      // console.error(`${provider} signup error:`, err);
    // } finally {
      setProviderLoading(null);
    }
  };

  const isFormValid = (() => {
    const email = normalizeEmail(formData.email);
    return (
      !!trimName(formData.fullName) &&
      !!email && EMAIL_REGEX.test(email) &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword
    );
  })();

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join Income Clarity and take control of your financial future
          </p>
        </div>

        {/* Error message */}
        {(errorMessage || error) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {errorMessage || (error as AuthError)?.message || 'An error occurred'}
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">
              {successMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Full name field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Create a password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Must be at least 8 characters long
            </p>
          </div>

          {/* Confirm password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formData.confirmPassword && formData.password !== formData.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Terms and conditions */}
          <div className="text-xs text-gray-600">
            By creating an account, you agree to our {' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Service
            </a>
            {' '} and {' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </a>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!isFormValid || compositeLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
        </div>

        {/* OAuth providers */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleProviderSignup('google')}
            disabled={compositeLoading}
            aria-label="Continue with Google"
            className="flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Chrome className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => handleProviderSignup('github')}
            disabled={compositeLoading}
            aria-label="Continue with GitHub"
            className="flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Github className="w-5 h-5 text-gray-600" />
          </button>
          <button
            type="button"
            onClick={() => handleProviderSignup('apple')}
            disabled={compositeLoading}
            aria-label="Continue with Apple"
            className="flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Apple className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Sign in link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/auth/simple-login"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}