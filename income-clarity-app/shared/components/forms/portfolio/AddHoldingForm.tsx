'use client';

import React from 'react';

export interface HoldingFormData {
  symbol?: string;
  ticker?: string;
  shares: number;
  purchasePrice?: number;
  avgCost?: number;
  currentPrice?: number;
  taxTreatment?: string;
  strategy?: string;
  sector?: string;
  [key: string]: any; // Allow additional properties
}

export function AddHoldingForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Symbol</label>
        <input type="text" className="mt-1 block w-full rounded-md border-gray-300" />
      </div>
      <div>
        <label className="block text-sm font-medium">Shares</label>
        <input type="number" className="mt-1 block w-full rounded-md border-gray-300" />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md">
        Add Holding
      </button>
    </form>
  );
}