'use client';

import { useState } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { RequireSimpleAuth } from '@/contexts/SimpleAuthContext';
import { User, Settings, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { AppShell } from '@/components/AppShell';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function ProfileContent() {
  const router = useRouter();
  const { user } = useSimpleAuth();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AppShell 
      title="Income Clarity - Profile"
      showHeader={true}
      showBottomNav={true}
      showPWAInstaller={true}
    >
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
              <User className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {user?.name || 'Demo User'}
              </h2>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Subscription</p>
                  <p className="font-medium text-gray-900">Free</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="font-medium text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center space-x-3 mb-3">
              <Settings className="w-6 h-6 text-blue-600" />
              <h3 className="font-medium text-gray-900">Profile Settings</h3>
            </div>
            <p className="text-sm text-gray-600">
              Update personal information, tax settings, and app preferences
            </p>
          </button>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-6 h-6 text-green-600" />
              <h3 className="font-medium text-gray-900">Account Status</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Your account is active and verified
            </p>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700 mb-4">
              Contact support for assistance with your account or questions about Income Clarity.
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
              Contact Support
            </button>
          </div>
        </div>
      </main>

      {/* Profile Settings Modal */}
      <ProfileSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        initialData={{
          personal: {
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            profilePicture: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            bio: ''
          }
        }}
      />
      </div>
    </AppShell>
  );
}

export default function ProfilePage() {
  return (
    <RequireSimpleAuth>
      <ProfileContent />
    </RequireSimpleAuth>
  );
}