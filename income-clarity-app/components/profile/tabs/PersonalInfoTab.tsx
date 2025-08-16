'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Save, Camera, Clock, FileText } from 'lucide-react';
import { UserSettings } from '../types/settings';
import { ImageCropper } from '../../ui/ImageCropper';
import { formatPhoneNumber, isValidEmail, isValidPhone, getTimezoneOptions } from '../utils/helpers';

interface PersonalInfoTabProps {
  settings: UserSettings;
  onUpdate: (updates: Partial<UserSettings>) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function PersonalInfoTab({ settings, onUpdate, onSave, isSaving }: PersonalInfoTabProps) {
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { personal } = settings;
  const timezoneOptions = getTimezoneOptions();

  const handleInputChange = (field: keyof typeof personal, value: string) => {
    const newPersonal = { ...personal, [field]: value };
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    onUpdate({
      personal: newPersonal
    });
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields
    if (!personal.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!personal.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(personal.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate phone if provided
    if (personal.phone && !isValidPhone(personal.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onSave();
    }
  };

  const handleImageChange = (dataUrl: string) => {
    handleInputChange('profilePicture', dataUrl);
    setShowImageCropper(false);
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">
          Update your personal details and profile picture.
        </p>
      </div>

      {showImageCropper ? (
        <div className="mb-8">
          <ImageCropper
            currentImage={personal.profilePicture}
            onImageChange={handleImageChange}
            onCancel={() => setShowImageCropper(false)}
            aspectRatio={1}
            maxSize={5}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Profile Picture */}
          <div className="flex items-start space-x-6">
            <div className="relative">
              {personal.profilePicture ? (
                <img
                  src={personal.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              
              <button
                onClick={() => setShowImageCropper(true)}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Picture</h3>
              <p className="text-sm text-gray-600 mb-3">
                Choose a photo that represents you well. This will be visible to support and in exported data.
              </p>
              <button
                onClick={() => setShowImageCropper(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {personal.profilePicture ? 'Change picture' : 'Upload picture'}
              </button>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={personal.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={personal.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="phone"
                type="tel"
                value={personal.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
            {personal.phone && !errors.phone && (
              <p className="mt-1 text-sm text-gray-500">
                Formatted: {formatPhoneNumber(personal.phone)}
              </p>
            )}
          </div>

          {/* Timezone */}
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
              Time Zone
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                id="timezone"
                value={personal.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                {timezoneOptions.map((tz, index, arr) => {
                  const showGroup = index === 0 || arr[index - 1].group !== tz.group;
                  return (
                    <React.Fragment key={tz.value}>
                      {showGroup && (
                        <optgroup label={tz.group}>
                          <option value={tz.value}>{tz.label}</option>
                        </optgroup>
                      )}
                      {!showGroup && <option value={tz.value}>{tz.label}</option>}
                    </React.Fragment>
                  );
                })}
              </select>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Used for dividend payment dates and calendar features
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                id="bio"
                rows={4}
                value={personal.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us a little about yourself and your investment goals..."
                maxLength={500}
              />
            </div>
            <div className="mt-1 flex justify-between text-sm text-gray-500">
              <span>Brief description for support context</span>
              <span>{personal.bio.length}/500</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={validateAndSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Personal Info</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}