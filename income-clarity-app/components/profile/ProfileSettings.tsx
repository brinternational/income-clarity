'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Percent, 
  Bell, 
  Settings, 
  Lock,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

// Import individual tab components
import { PersonalInfoTab } from './tabs/PersonalInfoTab';
import { AccountSecurityTab } from './tabs/AccountSecurityTab'; 
import { TaxSettingsTab } from './tabs/TaxSettingsTab';
import { NotificationPrefsTab } from './tabs/NotificationPrefsTab';
import { AppPreferencesTab } from './tabs/AppPreferencesTab';
import { PrivacyDataTab } from './tabs/PrivacyDataTab';

// Import types
import { UserSettings } from './types/settings';
import { useUserSettings } from './hooks/useUserSettings';

export interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<UserSettings>;
}

type TabId = 'personal' | 'security' | 'tax' | 'notifications' | 'preferences' | 'privacy';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<{ 
    settings: UserSettings; 
    onUpdate: (updates: Partial<UserSettings>) => void;
    onSave: () => void;
    isSaving: boolean;
  }>;
}

const tabs: Tab[] = [
  {
    id: 'personal',
    label: 'Personal Info',
    icon: User,
    component: PersonalInfoTab
  },
  {
    id: 'security', 
    label: 'Security',
    icon: Shield,
    component: AccountSecurityTab
  },
  {
    id: 'tax',
    label: 'Tax Settings', 
    icon: Percent,
    component: TaxSettingsTab
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    component: NotificationPrefsTab
  },
  {
    id: 'preferences',
    label: 'App Settings',
    icon: Settings,
    component: AppPreferencesTab
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: Lock,
    component: PrivacyDataTab
  }
];

export function ProfileSettings({ isOpen, onClose, initialData }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<TabId | null>(null);
  
  const {
    settings,
    updateSettings,
    saveSettings,
    isSaving,
    saveMessage,
    clearMessage
  } = useUserSettings(initialData);

  const handleUpdate = (updates: Partial<UserSettings>) => {
    updateSettings(updates);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    await saveSettings();
    setHasUnsavedChanges(false);
  };

  const handleTabChange = (tabId: TabId) => {
    if (hasUnsavedChanges) {
      setPendingTabChange(tabId);
      setShowUnsavedWarning(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const confirmTabChange = () => {
    if (pendingTabChange) {
      setActiveTab(pendingTabChange);
      setPendingTabChange(null);
      setHasUnsavedChanges(false);
    }
    setShowUnsavedWarning(false);
  };

  const cancelTabChange = () => {
    setPendingTabChange(null);
    setShowUnsavedWarning(false);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setHasUnsavedChanges(false);
      }
    } else {
      onClose();
    }
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-4 md:inset-8 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your account preferences and app settings
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Unsaved changes</span>
              </div>
            )}
            
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Tab Navigation */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Save Message */}
            {saveMessage && (
              <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center space-x-2 ${
                saveMessage.type === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                <Check className="w-5 h-5" />
                <span>{saveMessage.text}</span>
                <button
                  onClick={clearMessage}
                  className="ml-auto p-1 hover:bg-black hover:bg-opacity-10 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Tab Content */}
            <div className="flex-1 overflow-auto p-6">
              {ActiveTabComponent && (
                <ActiveTabComponent
                  settings={settings}
                  onUpdate={handleUpdate}
                  onSave={handleSave}
                  isSaving={isSaving}
                />
              )}
            </div>
          </div>
        </div>

        {/* Unsaved Changes Warning Modal */}
        {showUnsavedWarning && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-75" onClick={cancelTabChange} />
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-auto relative z-10">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Unsaved Changes</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                You have unsaved changes in the current tab. What would you like to do?
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelTabChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Stay Here
                </button>
                <button
                  onClick={confirmTabChange}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Discard Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}