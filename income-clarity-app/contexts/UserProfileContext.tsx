'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';

interface UserProfileContextType {
  profile: any;
  profileData: any;
  updateProfile: (data: any) => Promise<void>;
  incomeClarityData: any;
  loading: boolean;
  error: any;
  hapticSettings?: any;
  updateHapticSettings?: (settings: any) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<any>(null);
  const [incomeClarityData, setIncomeClarityData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hapticSettings, setHapticSettings] = useState<any>({
    enabled: true,
    intensity: 'medium'
  });
  
  const updateProfile = async (data: any) => {
    setProfileData(data);
  };
  
  const updateHapticSettings = (settings: any) => {
    setHapticSettings(settings);
  };
  
  return (
    <UserProfileContext.Provider value={{ 
      profile: profileData,
      profileData,
      updateProfile,
      incomeClarityData,
      loading,
      error,
      hapticSettings,
      updateHapticSettings
    }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
}