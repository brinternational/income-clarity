'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, User, Briefcase, Calculator, Upload, Trophy, TrendingUp } from 'lucide-react';

// Import Design System components
import { Button } from '@/components/design-system/core/Button';
import { Card, CardContent } from '@/components/design-system/core/Card';
import { TextField } from '@/components/design-system/forms/TextField';
import { Select } from '@/components/design-system/forms/Select';
import { StepProgress, Progress } from '@/components/design-system/feedback/Progress';
import { Checkbox } from '@/components/design-system/forms/Checkbox';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Step 1: Welcome
    fullName: '',
    
    // Step 2: Portfolio Setup
    portfolioName: '',
    portfolioType: 'taxable',
    
    // Step 3: Tax Profile
    taxState: '',
    filingStatus: 'single',
    
    // Step 4: Holdings Import
    importMethod: 'manual',
    
    // Step 5: Premium Trial
    startPremiumTrial: false,
    
    // Step 6: Complete
    emailUpdates: true
  });

  const steps = [
    { title: 'Welcome', icon: User, description: 'Let\'s get you started' },
    { title: 'Portfolio Setup', icon: Briefcase, description: 'Create your first portfolio' },
    { title: 'Tax Profile', icon: Calculator, description: 'Optimize for your location' },
    { title: 'Import Holdings', icon: Upload, description: 'Add your investments' },
    { title: 'Premium Features', icon: TrendingUp, description: 'Unlock advanced features' },
    { title: 'Complete', icon: Trophy, description: 'You\'re all set!' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTrial = async () => {
    setFormData({...formData, startPremiumTrial: true});
    try {
      const response = await fetch('/api/subscription/start-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Move to next step
        setCurrentStep(currentStep + 1);
      }
    } catch (error) {
      logger.error('Failed to start trial:', error);
      // Continue anyway
      setCurrentStep(currentStep + 1);
    }
  };

  const skipTrial = () => {
    setFormData({...formData, startPremiumTrial: false});
    setCurrentStep(currentStep + 1);
  };

  const completeOnboarding = async () => {
    try {
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        router.push('/dashboard/super-cards');
      }
    } catch (error) {
      logger.error('Failed to complete onboarding:', error);
    }
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Welcome to Income Clarity!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Let's set up your account to start tracking your dividend income journey.
            </p>
            <TextField
              label="Your Name"
              name="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="John Doe"
              required
            />
          </div>
        );
        
      case 1: // Portfolio Setup
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Create Your Portfolio</h2>
            <TextField
              label="Portfolio Name"
              name="portfolioName"
              value={formData.portfolioName}
              onChange={(e) => setFormData({...formData, portfolioName: e.target.value})}
              placeholder="My Dividend Portfolio"
              required
            />
            <Select
              label="Account Type"
              name="portfolioType"
              native
              value={formData.portfolioType}
              onChange={(e) => setFormData({...formData, portfolioType: e.target.value})}
              options={[
                { value: 'taxable', label: 'Taxable' },
                { value: 'ira', label: 'IRA' },
                { value: 'roth', label: 'Roth IRA' },
                { value: '401k', label: '401(k)' }
              ]}
            />
          </div>
        );
        
      case 2: // Tax Profile
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Tax Optimization</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We'll calculate your after-tax income based on your location.
            </p>
            <Select
              label="State"
              name="taxState"
              native
              value={formData.taxState}
              onChange={(e) => setFormData({...formData, taxState: e.target.value})}
              placeholder="Select State"
              required
              options={[
                { value: '', label: 'Select State' },
                { value: 'CA', label: 'California' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
                { value: 'NY', label: 'New York' },
                { value: 'PR', label: 'Puerto Rico' },
                { value: 'AL', label: 'Alabama' },
                { value: 'AK', label: 'Alaska' },
                { value: 'AZ', label: 'Arizona' },
                { value: 'AR', label: 'Arkansas' },
                { value: 'CO', label: 'Colorado' },
                { value: 'CT', label: 'Connecticut' },
                { value: 'DE', label: 'Delaware' },
                { value: 'GA', label: 'Georgia' },
                { value: 'HI', label: 'Hawaii' },
                { value: 'ID', label: 'Idaho' },
                { value: 'IL', label: 'Illinois' },
                { value: 'IN', label: 'Indiana' },
                { value: 'IA', label: 'Iowa' },
                { value: 'KS', label: 'Kansas' },
                { value: 'KY', label: 'Kentucky' },
                { value: 'LA', label: 'Louisiana' },
                { value: 'ME', label: 'Maine' },
                { value: 'MD', label: 'Maryland' },
                { value: 'MA', label: 'Massachusetts' },
                { value: 'MI', label: 'Michigan' },
                { value: 'MN', label: 'Minnesota' },
                { value: 'MS', label: 'Mississippi' },
                { value: 'MO', label: 'Missouri' },
                { value: 'MT', label: 'Montana' },
                { value: 'NE', label: 'Nebraska' },
                { value: 'NV', label: 'Nevada' },
                { value: 'NH', label: 'New Hampshire' },
                { value: 'NJ', label: 'New Jersey' },
                { value: 'NM', label: 'New Mexico' },
                { value: 'NC', label: 'North Carolina' },
                { value: 'ND', label: 'North Dakota' },
                { value: 'OH', label: 'Ohio' },
                { value: 'OK', label: 'Oklahoma' },
                { value: 'OR', label: 'Oregon' },
                { value: 'PA', label: 'Pennsylvania' },
                { value: 'RI', label: 'Rhode Island' },
                { value: 'SC', label: 'South Carolina' },
                { value: 'SD', label: 'South Dakota' },
                { value: 'TN', label: 'Tennessee' },
                { value: 'UT', label: 'Utah' },
                { value: 'VT', label: 'Vermont' },
                { value: 'VA', label: 'Virginia' },
                { value: 'WA', label: 'Washington' },
                { value: 'WV', label: 'West Virginia' },
                { value: 'WI', label: 'Wisconsin' },
                { value: 'WY', label: 'Wyoming' }
              ]}
            />
            <Select
              label="Filing Status"
              name="filingStatus"
              native
              value={formData.filingStatus}
              onChange={(e) => setFormData({...formData, filingStatus: e.target.value})}
              options={[
                { value: 'single', label: 'Single' },
                { value: 'married_jointly', label: 'Married Filing Jointly' },
                { value: 'married_separately', label: 'Married Filing Separately' },
                { value: 'head_of_household', label: 'Head of Household' }
              ]}
            />
          </div>
        );
        
      case 3: // Import Holdings
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Import Your Holdings</h2>
            <div className="space-y-4">
              <Card
                variant={formData.importMethod === 'manual' ? 'interactive' : 'outlined'}
                size="md"
                clickable
                onClick={() => setFormData({...formData, importMethod: 'manual'})}
                className={`text-left ${
                  formData.importMethod === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <CardContent>
                  <div className="font-semibold">Add Manually</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Enter holdings one by one</div>
                </CardContent>
              </Card>
              <Card
                variant={formData.importMethod === 'csv' ? 'interactive' : 'outlined'}
                size="md"
                clickable
                onClick={() => setFormData({...formData, importMethod: 'csv'})}
                className={`text-left ${
                  formData.importMethod === 'csv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <CardContent>
                  <div className="font-semibold">Import CSV</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Upload from broker export</div>
                </CardContent>
              </Card>
              <Card
                variant={formData.importMethod === 'skip' ? 'interactive' : 'outlined'}
                size="md"
                clickable
                onClick={() => setFormData({...formData, importMethod: 'skip'})}
                className={`text-left ${
                  formData.importMethod === 'skip' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <CardContent>
                  <div className="font-semibold">Skip for Now</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Add holdings later</div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 4: // Premium Features
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Unlock Premium Features</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Try Premium FREE for 14 days and supercharge your financial journey
              </p>
            </div>
            
            {/* Feature Benefits */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: '🏦', title: 'Bank Sync', desc: 'Automatic transaction import' },
                { icon: '📈', title: 'Real-time Data', desc: 'Live market prices & updates' },
                { icon: '📊', title: 'Advanced Analytics', desc: 'Deep performance insights' },
                { icon: '📧', title: 'Email Reports', desc: 'Weekly income summaries' }
              ].map((feature, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{feature.title}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{feature.desc}</div>
                </div>
              ))}
            </div>
            
            {/* Trial Offer */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center">
              <div className="text-lg font-bold mb-2">14-Day Free Trial</div>
              <div className="text-sm opacity-90 mb-4">No credit card required • Cancel anytime</div>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={startTrial}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100"
                >
                  Start Free Trial
                </Button>
                <Button
                  onClick={skipTrial}
                  variant="ghost"
                  size="lg"
                  className="px-6 py-3 border border-white/30 text-white hover:bg-white/10"
                >
                  Maybe Later
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 5: // Complete
        return (
          <div className="space-y-6 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">You're All Set!</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your account is ready. Let's start tracking your dividend income journey!
            </p>
            <div className="flex items-center justify-center">
              <Checkbox
                label="Send me weekly income reports"
                checked={formData.emailUpdates}
                onChange={(e) => setFormData({...formData, emailUpdates: e.target.checked})}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="mb-8">
          <StepProgress
            steps={steps.map((step, index) => ({
              label: step.title,
              description: step.description,
              completed: index < currentStep
            }))}
            currentStep={currentStep}
            variant="primary"
            className="mb-4"
          />
          <Progress
            value={((currentStep + 1) / steps.length) * 100}
            variant="primary"
            size="sm"
            className="w-full"
            showValue={false}
          />
        </div>

        {/* Content Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card variant="elevated" size="lg" className="shadow-lg">
            <CardContent>
              {renderStepContent()}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  variant={currentStep === 0 ? 'ghost' : 'outline'}
                  size="md"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="px-6"
                >
                  {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <div className="text-center mt-4">
            <Button
              onClick={() => router.push('/dashboard/super-cards')}
              variant="link"
              size="sm"
            >
              Skip for now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}