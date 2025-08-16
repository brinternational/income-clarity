'use client';

import React, { useState } from 'react';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger'

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export function OnboardingModal() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'welcome',
      title: 'Welcome to Income Clarity',
      description: 'Learn about our dividend income optimization platform',
      completed: false
    },
    {
      id: 'portfolio',
      title: 'Add Your Portfolio',
      description: 'Enter your holdings to get started with analysis',
      completed: false
    },
    {
      id: 'profile',
      title: 'Set Up Your Profile',
      description: 'Configure your tax situation and preferences',
      completed: false
    }
  ]);

  const handleCompleteOnboarding = async () => {
    if (!user) return;
    
    try {
      setIsCompleting(true);
      
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        // Refresh user data to get updated onboarding status
        await refreshUser();
      } else {
        logger.error('Failed to complete onboarding');
      }
    } catch (error) {
      logger.error('Error completing onboarding:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleStepComplete = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const allStepsCompleted = steps.every(step => step.completed);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - semi-transparent */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Modal */}
      <div className="relative max-w-2xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Complete Your Setup</h2>
              <p className="text-blue-100 mt-1">Get the most out of Income Clarity</p>
            </div>
            {/* Note: We don't include a close button since onboarding is required */}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-start space-x-4 p-4 rounded-xl border-2 transition-all duration-300 ${
                  step.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className={`flex-shrink-0 mt-1 ${
                  step.completed ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`font-semibold ${
                    step.completed ? 'text-green-800' : 'text-gray-800'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    step.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                  
                  {!step.completed && (
                    <button
                      onClick={() => handleStepComplete(step.id)}
                      className="mt-3 inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <span>Complete this step</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {steps.filter(s => s.completed).length} of {steps.length} steps completed
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleCompleteOnboarding}
                disabled={!allStepsCompleted || isCompleting}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  allStepsCompleted && !isCompleting
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isCompleting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Finishing Setup...</span>
                  </div>
                ) : (
                  'Finish Setup & Continue'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${(steps.filter(s => s.completed).length / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}