'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, User, MapPin, DollarSign, FileText, Check, AlertCircle, ArrowLeft } from 'lucide-react';
import { logger } from '@/lib/logger'

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profile, setProfile] = useState({
    // Personal Info
    fullName: '',
    email: '',
    
    // Tax Profile
    state: '',
    filingStatus: 'single',
    federalBracket: 0.22,
    stateBracket: 0,
    
    // Financial Info
    monthlyExpenses: 0,
    targetIncome: 0,
    retirementAge: 65,
    
    // Preferences
    currency: 'USD',
    timezone: 'America/New_York'
  });

  // US States for dropdown
  const states = [
    { code: '', name: 'Select State', tax: 0 },
    { code: 'AL', name: 'Alabama', tax: 0.05 },
    { code: 'AK', name: 'Alaska', tax: 0 },
    { code: 'AZ', name: 'Arizona', tax: 0.045 },
    { code: 'AR', name: 'Arkansas', tax: 0.059 },
    { code: 'CA', name: 'California', tax: 0.133 },
    { code: 'CO', name: 'Colorado', tax: 0.044 },
    { code: 'CT', name: 'Connecticut', tax: 0.069 },
    { code: 'DE', name: 'Delaware', tax: 0.066 },
    { code: 'FL', name: 'Florida', tax: 0 },
    { code: 'GA', name: 'Georgia', tax: 0.057 },
    { code: 'HI', name: 'Hawaii', tax: 0.11 },
    { code: 'ID', name: 'Idaho', tax: 0.06 },
    { code: 'IL', name: 'Illinois', tax: 0.0495 },
    { code: 'IN', name: 'Indiana', tax: 0.032 },
    { code: 'IA', name: 'Iowa', tax: 0.06 },
    { code: 'KS', name: 'Kansas', tax: 0.057 },
    { code: 'KY', name: 'Kentucky', tax: 0.045 },
    { code: 'LA', name: 'Louisiana', tax: 0.045 },
    { code: 'ME', name: 'Maine', tax: 0.075 },
    { code: 'MD', name: 'Maryland', tax: 0.0575 },
    { code: 'MA', name: 'Massachusetts', tax: 0.05 },
    { code: 'MI', name: 'Michigan', tax: 0.0425 },
    { code: 'MN', name: 'Minnesota', tax: 0.0985 },
    { code: 'MS', name: 'Mississippi', tax: 0.05 },
    { code: 'MO', name: 'Missouri', tax: 0.054 },
    { code: 'MT', name: 'Montana', tax: 0.0675 },
    { code: 'NE', name: 'Nebraska', tax: 0.0684 },
    { code: 'NV', name: 'Nevada', tax: 0 },
    { code: 'NH', name: 'New Hampshire', tax: 0 },
    { code: 'NJ', name: 'New Jersey', tax: 0.108 },
    { code: 'NM', name: 'New Mexico', tax: 0.059 },
    { code: 'NY', name: 'New York', tax: 0.109 },
    { code: 'NC', name: 'North Carolina', tax: 0.045 },
    { code: 'ND', name: 'North Dakota', tax: 0.019 },
    { code: 'OH', name: 'Ohio', tax: 0.035 },
    { code: 'OK', name: 'Oklahoma', tax: 0.0475 },
    { code: 'OR', name: 'Oregon', tax: 0.099 },
    { code: 'PA', name: 'Pennsylvania', tax: 0.0307 },
    { code: 'PR', name: 'Puerto Rico', tax: 0 }, // Special case
    { code: 'RI', name: 'Rhode Island', tax: 0.0599 },
    { code: 'SC', name: 'South Carolina', tax: 0.064 },
    { code: 'SD', name: 'South Dakota', tax: 0 },
    { code: 'TN', name: 'Tennessee', tax: 0 },
    { code: 'TX', name: 'Texas', tax: 0 },
    { code: 'UT', name: 'Utah', tax: 0.0465 },
    { code: 'VT', name: 'Vermont', tax: 0.076 },
    { code: 'VA', name: 'Virginia', tax: 0.0575 },
    { code: 'WA', name: 'Washington', tax: 0 },
    { code: 'WV', name: 'West Virginia', tax: 0.065 },
    { code: 'WI', name: 'Wisconsin', tax: 0.0765 },
    { code: 'WY', name: 'Wyoming', tax: 0 }
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      logger.error('Failed to fetch profile:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!profile.fullName) newErrors.fullName = 'Name is required';
    if (!profile.email) newErrors.email = 'Email is required';
    if (!profile.state) newErrors.state = 'State is required';
    if (profile.monthlyExpenses < 0) newErrors.monthlyExpenses = 'Must be positive';
    if (profile.targetIncome < 0) newErrors.targetIncome = 'Must be positive';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      logger.error('Failed to save profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (stateCode: string) => {
    const state = states.find(s => s.code === stateCode);
    setProfile({
      ...profile,
      state: stateCode,
      stateBracket: state?.tax || 0
    });
  };

  const calculateTaxRate = () => {
    const effective = profile.federalBracket + profile.stateBracket;
    return (effective * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-500 rounded-lg flex items-center"
          >
            <Check className="h-5 w-5 text-green-600 mr-2" />
            Profile saved successfully!
          </motion.div>
        )}

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${
                  errors.fullName ? 'border-red-500' : ''
                }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${
                  errors.email ? 'border-red-500' : ''
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Tax Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select
                value={profile.state}
                onChange={(e) => handleStateChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${
                  errors.state ? 'border-red-500' : ''
                }`}
              >
                {states.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name} {state.tax === 0 && state.code ? '(No state tax!)' : ''}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">{errors.state}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Filing Status</label>
              <select
                value={profile.filingStatus}
                onChange={(e) => setProfile({...profile, filingStatus: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="single">Single</option>
                <option value="married_jointly">Married Filing Jointly</option>
                <option value="married_separately">Married Filing Separately</option>
                <option value="head_of_household">Head of Household</option>
              </select>
            </div>
          </div>
          
          {/* Tax Rate Display */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Effective Tax Rate</span>
              <span className="text-2xl font-bold text-blue-600">{calculateTaxRate()}%</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Federal: {(profile.federalBracket * 100).toFixed(1)}% + 
              State: {(profile.stateBracket * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Financial Goals */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">Financial Goals</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Monthly Expenses</label>
              <input
                type="number"
                value={profile.monthlyExpenses}
                onChange={(e) => setProfile({...profile, monthlyExpenses: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${
                  errors.monthlyExpenses ? 'border-red-500' : ''
                }`}
              />
              {errors.monthlyExpenses && (
                <p className="text-red-500 text-xs mt-1">{errors.monthlyExpenses}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Target Monthly Income</label>
              <input
                type="number"
                value={profile.targetIncome}
                onChange={(e) => setProfile({...profile, targetIncome: parseFloat(e.target.value) || 0})}
                className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 ${
                  errors.targetIncome ? 'border-red-500' : ''
                }`}
              />
              {errors.targetIncome && (
                <p className="text-red-500 text-xs mt-1">{errors.targetIncome}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Target Retirement Age</label>
              <input
                type="number"
                value={profile.retirementAge}
                onChange={(e) => setProfile({...profile, retirementAge: parseInt(e.target.value) || 65})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}