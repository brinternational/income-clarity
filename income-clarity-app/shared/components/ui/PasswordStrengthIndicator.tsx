'use client';

import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { checkPasswordStrength } from '@/components/profile/utils/helpers';

interface PasswordStrengthIndicatorProps {
  password: string;
  showSuggestions?: boolean;
}

export function PasswordStrengthIndicator({ password, showSuggestions = true }: PasswordStrengthIndicatorProps) {
  const strength = checkPasswordStrength(password);
  
  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    if (score <= 5) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthTextColor = (score: number) => {
    if (score <= 2) return 'text-red-700';
    if (score <= 4) return 'text-yellow-700';
    if (score <= 5) return 'text-blue-700';
    return 'text-green-700';
  };

  const getStrengthBgColor = (score: number) => {
    if (score <= 2) return 'bg-red-50';
    if (score <= 4) return 'bg-yellow-50';
    if (score <= 5) return 'bg-blue-50';
    return 'bg-green-50';
  };

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Strength Bar and Label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Password Strength</span>
          <span className={`text-sm font-medium ${getStrengthTextColor(strength.score)}`}>
            {strength.label}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
            style={{ width: `${Math.max(10, (strength.score / 6) * 100)}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showSuggestions && (
        <div className={`rounded-lg p-3 ${getStrengthBgColor(strength.score)}`}>
          <h4 className={`text-sm font-medium mb-2 ${getStrengthTextColor(strength.score)}`}>
            Password Requirements
          </h4>
          
          <div className="space-y-1">
            {[
              { check: password.length >= 8, text: 'At least 8 characters' },
              { check: password.length >= 12, text: 'At least 12 characters (recommended)' },
              { check: /[a-z]/.test(password), text: 'Lowercase letters (a-z)' },
              { check: /[A-Z]/.test(password), text: 'Uppercase letters (A-Z)' },
              { check: /[0-9]/.test(password), text: 'Numbers (0-9)' },
              { check: /[^A-Za-z0-9]/.test(password), text: 'Special characters (!@#$...)' }
            ].map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                {requirement.check ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-sm ${
                  requirement.check ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>

          {strength.suggestions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <h5 className={`text-xs font-medium mb-1 ${getStrengthTextColor(strength.score)}`}>
                Suggestions to improve:
              </h5>
              <ul className="space-y-1">
                {strength.suggestions.map((suggestion, index) => (
                  <li key={index} className={`text-xs ${getStrengthTextColor(strength.score)}`}>
                    • {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}