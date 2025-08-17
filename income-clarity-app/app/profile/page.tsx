'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, User, MapPin, DollarSign, FileText, Check, AlertCircle, ArrowLeft, CreditCard, Crown } from 'lucide-react';
import { logger } from '@/lib/logger';
import Link from 'next/link';

// Import Design System components
import { Button } from '@/components/design-system/core/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/core/Card';
import { Alert, AlertDescription } from '@/components/design-system/core/Alert';
import { TextField, EmailField, CurrencyField } from '@/components/design-system/forms/TextField';
import { Select } from '@/components/design-system/forms/Select';
import { Badge } from '@/components/design-system/core/Badge';

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
    timezone: 'America/New_York',
    
    // Subscription Info
    isPremium: false,
    plan: 'FREE',
    subscriptionStatus: 'inactive',
    trialEndDate: null,
    nextBillingDate: null
  });

  // Mock subscription data - replace with actual API call
  const [subscriptionData, setSubscriptionData] = useState({
    plan: 'FREE',
    status: 'inactive',
    isTrialPeriod: false,
    trialDaysRemaining: 0,
    nextBillingDate: null,
    pricePerMonth: 0
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
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
              iconOnly
              ariaLabel="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">Profile</h1>
          </div>
        </div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="success" dismissible className="flex items-center">
              <Check className="h-5 w-5 mr-2" />
              Profile saved successfully!
            </Alert>
          </motion.div>
        )}

        {/* Personal Information */}
        <Card variant="default" size="lg" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                label="Full Name"
                name="fullName"
                value={profile.fullName}
                onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                errorMessage={errors.fullName}
                required
              />
              
              <EmailField
                label="Email"
                name="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                errorMessage={errors.email}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Subscription Management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-purple-600" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Current Plan
                  </span>
                  <Badge 
                    variant={profile.isPremium ? 'success' : 'secondary'}
                    size="sm"
                  >
                    {profile.isPremium ? 'Premium' : 'Free'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {profile.isPremium 
                    ? 'Access to all premium features including bank sync and real-time data'
                    : 'Basic features with manual data entry'
                  }
                </p>
              </div>
            </div>
            
            {profile.isPremium && profile.trialEndDate && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Trial ends: {new Date(profile.trialEndDate).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3">
              <Button 
                href="/pricing"
                variant={profile.isPremium ? "outline" : "primary"}
                size="md"
                leftIcon={<Crown className="h-4 w-4" />}
              >
                {profile.isPremium ? 'View Plans' : 'Upgrade to Premium'}
              </Button>
              {profile.isPremium && (
                <Button 
                  href="/settings/billing"
                  variant="outline"
                  size="md"
                  leftIcon={<CreditCard className="h-4 w-4" />}
                >
                  Manage Billing
                </Button>
              )}
            </div>
            
            {!profile.isPremium && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Unlock Premium Features
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
                  <div className="flex items-center gap-1">
                    <span>🏦</span> Bank Sync
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📈</span> Real-time Data
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📊</span> Advanced Analytics
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📧</span> Email Reports
                  </div>
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  14 days free • No credit card required
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card variant="default" size="lg" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              Tax Information
            </CardTitle>
          </CardHeader>
          <CardContent>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="State"
                name="state"
                native
                value={profile.state}
                onChange={(e) => handleStateChange(e.target.value)}
                errorMessage={errors.state}
                required
                options={states.map(state => ({
                  value: state.code,
                  label: `${state.name}${state.tax === 0 && state.code ? ' (No state tax!)' : ''}`
                }))}
                placeholder="Select State"
              />
              
              <Select
                label="Filing Status"
                name="filingStatus"
                native
                value={profile.filingStatus}
                onChange={(e) => setProfile({...profile, filingStatus: e.target.value})}
                options={[
                  { value: 'single', label: 'Single' },
                  { value: 'married_jointly', label: 'Married Filing Jointly' },
                  { value: 'married_separately', label: 'Married Filing Separately' },
                  { value: 'head_of_household', label: 'Head of Household' }
                ]}
              />
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
          </CardContent>
        </Card>

        {/* Financial Goals */}
        <Card variant="default" size="lg" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-400" />
              Financial Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
          
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CurrencyField
                label="Monthly Expenses"
                name="monthlyExpenses"
                value={profile.monthlyExpenses.toString()}
                onChange={(e) => setProfile({...profile, monthlyExpenses: parseFloat(e.target.value) || 0})}
                errorMessage={errors.monthlyExpenses}
              />
              
              <CurrencyField
                label="Target Monthly Income"
                name="targetIncome"
                value={profile.targetIncome.toString()}
                onChange={(e) => setProfile({...profile, targetIncome: parseFloat(e.target.value) || 0})}
                errorMessage={errors.targetIncome}
              />
              
              <TextField
                label="Target Retirement Age"
                name="retirementAge"
                type="number"
                value={profile.retirementAge.toString()}
                onChange={(e) => setProfile({...profile, retirementAge: parseInt(e.target.value) || 65})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={loading}
            loading={loading}
            variant="primary"
            size="lg"
            leftIcon={!loading ? <Save className="h-4 w-4" /> : undefined}
            className="px-6 py-3"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
}