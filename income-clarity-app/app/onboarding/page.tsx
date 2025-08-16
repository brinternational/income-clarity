'use client';

import { logger } from '@/lib/logger';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, User, Briefcase, Calculator, Upload, Trophy } from 'lucide-react';

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
    
    // Step 5: Complete
    emailUpdates: true
  });

  const steps = [
    { title: 'Welcome', icon: User, description: 'Let\'s get you started' },
    { title: 'Portfolio Setup', icon: Briefcase, description: 'Create your first portfolio' },
    { title: 'Tax Profile', icon: Calculator, description: 'Optimize for your location' },
    { title: 'Import Holdings', icon: Upload, description: 'Add your investments' },
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
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="John Doe"
              />
            </div>
          </div>
        );
        
      case 1: // Portfolio Setup
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Create Your Portfolio</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Portfolio Name</label>
              <input
                type="text"
                value={formData.portfolioName}
                onChange={(e) => setFormData({...formData, portfolioName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="My Dividend Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Account Type</label>
              <select
                value={formData.portfolioType}
                onChange={(e) => setFormData({...formData, portfolioType: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="taxable">Taxable</option>
                <option value="ira">IRA</option>
                <option value="roth">Roth IRA</option>
                <option value="401k">401(k)</option>
              </select>
            </div>
          </div>
        );
        
      case 2: // Tax Profile
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Tax Optimization</h2>
            <p className="text-gray-600 dark:text-gray-400">
              We'll calculate your after-tax income based on your location.
            </p>
            <div>
              <label className="block text-sm font-medium mb-2">State</label>
              <select
                value={formData.taxState}
                onChange={(e) => setFormData({...formData, taxState: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select State</option>
                <option value="CA">California</option>
                <option value="TX">Texas</option>
                <option value="FL">Florida</option>
                <option value="NY">New York</option>
                <option value="PR">Puerto Rico</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CO">Colorado</option>
                <option value="CT">Connecticut</option>
                <option value="DE">Delaware</option>
                <option value="GA">Georgia</option>
                <option value="HI">Hawaii</option>
                <option value="ID">Idaho</option>
                <option value="IL">Illinois</option>
                <option value="IN">Indiana</option>
                <option value="IA">Iowa</option>
                <option value="KS">Kansas</option>
                <option value="KY">Kentucky</option>
                <option value="LA">Louisiana</option>
                <option value="ME">Maine</option>
                <option value="MD">Maryland</option>
                <option value="MA">Massachusetts</option>
                <option value="MI">Michigan</option>
                <option value="MN">Minnesota</option>
                <option value="MS">Mississippi</option>
                <option value="MO">Missouri</option>
                <option value="MT">Montana</option>
                <option value="NE">Nebraska</option>
                <option value="NV">Nevada</option>
                <option value="NH">New Hampshire</option>
                <option value="NJ">New Jersey</option>
                <option value="NM">New Mexico</option>
                <option value="NC">North Carolina</option>
                <option value="ND">North Dakota</option>
                <option value="OH">Ohio</option>
                <option value="OK">Oklahoma</option>
                <option value="OR">Oregon</option>
                <option value="PA">Pennsylvania</option>
                <option value="RI">Rhode Island</option>
                <option value="SC">South Carolina</option>
                <option value="SD">South Dakota</option>
                <option value="TN">Tennessee</option>
                <option value="UT">Utah</option>
                <option value="VT">Vermont</option>
                <option value="VA">Virginia</option>
                <option value="WA">Washington</option>
                <option value="WV">West Virginia</option>
                <option value="WI">Wisconsin</option>
                <option value="WY">Wyoming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filing Status</label>
              <select
                value={formData.filingStatus}
                onChange={(e) => setFormData({...formData, filingStatus: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="single">Single</option>
                <option value="married_jointly">Married Filing Jointly</option>
                <option value="married_separately">Married Filing Separately</option>
                <option value="head_of_household">Head of Household</option>
              </select>
            </div>
          </div>
        );
        
      case 3: // Import Holdings
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Import Your Holdings</h2>
            <div className="space-y-4">
              <button
                onClick={() => setFormData({...formData, importMethod: 'manual'})}
                className={`w-full p-4 border rounded-lg text-left ${
                  formData.importMethod === 'manual' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="font-semibold">Add Manually</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enter holdings one by one</div>
              </button>
              <button
                onClick={() => setFormData({...formData, importMethod: 'csv'})}
                className={`w-full p-4 border rounded-lg text-left ${
                  formData.importMethod === 'csv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="font-semibold">Import CSV</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Upload from broker export</div>
              </button>
              <button
                onClick={() => setFormData({...formData, importMethod: 'skip'})}
                className={`w-full p-4 border rounded-lg text-left ${
                  formData.importMethod === 'skip' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="font-semibold">Skip for Now</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Add holdings later</div>
              </button>
            </div>
          </div>
        );
        
      case 4: // Complete
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
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.emailUpdates}
                  onChange={(e) => setFormData({...formData, emailUpdates: e.target.checked})}
                  className="rounded"
                />
                <span>Send me weekly income reports</span>
              </label>
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
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index < currentStep ? 'bg-blue-600 border-blue-600 text-white' :
                  index === currentStep ? 'border-blue-600' : 'border-gray-300'
                }`}>
                  {index < currentStep ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8"
        >
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center px-4 py-2 rounded-lg ${
                currentStep === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>
        </motion.div>

        {/* Skip Link */}
        {currentStep < steps.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => router.push('/dashboard/super-cards')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}