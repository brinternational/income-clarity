'use client';

import React from 'react';

export interface ProfileSetupData {
  name: string;
  email: string;
  taxLocation: string;
}

export interface ProfileSetupFormProps {
  onSubmit?: (data: ProfileSetupData) => void;
}

export function ProfileSetupForm({ onSubmit }: ProfileSetupFormProps = {}) {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input type="text" className="mt-1 block w-full rounded-md border-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input type="email" className="mt-1 block w-full rounded-md border-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium">Tax Location</label>
        <select className="mt-1 block w-full rounded-md border-gray-300">
          <option>California</option>
          <option>Texas</option>
          <option>Puerto Rico</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
        Save Profile
      </button>
    </form>
  );
}