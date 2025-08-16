// State tax rates for dividend income analysis
// Data compiled from various state tax authorities as of 2024
// Rates represent the top marginal tax rates for dividend income

export interface StateTaxInfo {
  name: string;
  abbreviation: string;
  rate: number; // Top marginal rate for dividend income (qualified and ordinary)
  specialNotes?: string;
  isTerritory?: boolean;
  coordinates?: [number, number]; // [longitude, latitude] for map positioning
}

export const STATE_TAX_RATES: Record<string, StateTaxInfo> = {
  // No state tax states
  'AK': {
    name: 'Alaska',
    abbreviation: 'AK', 
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-154.0685, 61.2181]
  },
  'FL': {
    name: 'Florida',
    abbreviation: 'FL',
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-81.5158, 27.6648]
  },
  'NV': {
    name: 'Nevada',
    abbreviation: 'NV',
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-116.4194, 38.8026]
  },
  'NH': {
    name: 'New Hampshire',
    abbreviation: 'NH',
    rate: 0.0, // 0% on dividends as of 2024 (tax was repealed)
    specialNotes: 'Dividend tax was repealed in 2024',
    coordinates: [-71.5376, 43.4525]
  },
  'SD': {
    name: 'South Dakota',
    abbreviation: 'SD',
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-99.9018, 44.2998]
  },
  'TN': {
    name: 'Tennessee',
    abbreviation: 'TN',
    rate: 0.0, // Hall Tax was repealed in 2021
    specialNotes: 'Hall Tax on dividends was repealed in 2021',
    coordinates: [-86.7816, 35.7796]
  },
  'TX': {
    name: 'Texas',
    abbreviation: 'TX',
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-97.5164, 31.0545]
  },
  'WA': {
    name: 'Washington',
    abbreviation: 'WA',
    rate: 0.0, // Capital gains tax exists but has high threshold
    specialNotes: 'No state income tax on dividends',
    coordinates: [-121.1858, 47.7511]
  },
  'WY': {
    name: 'Wyoming',
    abbreviation: 'WY',
    rate: 0.0,
    specialNotes: 'No state income tax',
    coordinates: [-107.3025, 42.7600]
  },

  // Low tax states (1-4%)
  'AZ': {
    name: 'Arizona',
    abbreviation: 'AZ',
    rate: 0.025, // Flat 2.5% as of 2024
    coordinates: [-111.4312, 33.7712]
  },
  'CO': {
    name: 'Colorado',
    abbreviation: 'CO',
    rate: 0.044, // Flat 4.4%
    coordinates: [-105.0178, 39.0598]
  },
  'GA': {
    name: 'Georgia',
    abbreviation: 'GA',
    rate: 0.0575, // 5.75% top rate
    coordinates: [-83.6431, 33.76]
  },
  'ID': {
    name: 'Idaho',
    abbreviation: 'ID',
    rate: 0.058, // 5.8% top rate
    coordinates: [-114.478, 44.2394]
  },
  'IN': {
    name: 'Indiana',
    abbreviation: 'IN',
    rate: 0.032, // 3.23% flat rate
    coordinates: [-86.258, 39.849]
  },
  'IA': {
    name: 'Iowa',
    abbreviation: 'IA',
    rate: 0.084, // 8.4% top rate (being phased down)
    coordinates: [-93.7755, 42.0115]
  },
  'KS': {
    name: 'Kansas',
    abbreviation: 'KS',
    rate: 0.057, // 5.7% top rate
    coordinates: [-96.726, 38.5266]
  },
  'KY': {
    name: 'Kentucky',
    abbreviation: 'KY',
    rate: 0.045, // 4.5% flat rate
    coordinates: [-84.86, 37.66]
  },
  'LA': {
    name: 'Louisiana',
    abbreviation: 'LA',
    rate: 0.043, // 4.25% top rate
    coordinates: [-91.8259, 30.9843]
  },
  'MA': {
    name: 'Massachusetts',
    abbreviation: 'MA',
    rate: 0.05, // 5% flat rate
    coordinates: [-71.5301, 42.2352]
  },
  'MI': {
    name: 'Michigan',
    abbreviation: 'MI',
    rate: 0.0425, // 4.25% flat rate
    coordinates: [-84.5467, 43.3266]
  },
  'MS': {
    name: 'Mississippi',
    abbreviation: 'MS',
    rate: 0.05, // 5% top rate
    coordinates: [-89.6678, 32.7673]
  },
  'MO': {
    name: 'Missouri',
    abbreviation: 'MO',
    rate: 0.054, // 5.4% top rate
    coordinates: [-92.2884, 38.4623]
  },
  'MT': {
    name: 'Montana',
    abbreviation: 'MT',
    rate: 0.0675, // 6.75% top rate
    coordinates: [-110.3626, 46.9219]
  },
  'NE': {
    name: 'Nebraska',
    abbreviation: 'NE',
    rate: 0.0684, // 6.84% top rate
    coordinates: [-99.9018, 41.4925]
  },
  'NM': {
    name: 'New Mexico',
    abbreviation: 'NM',
    rate: 0.059, // 5.9% top rate
    coordinates: [-106.2485, 34.8405]
  },
  'NC': {
    name: 'North Carolina',
    abbreviation: 'NC',
    rate: 0.045, // 4.25% flat rate (recently changed)
    coordinates: [-79.8431, 35.2271]
  },
  'ND': {
    name: 'North Dakota',
    abbreviation: 'ND',
    rate: 0.029, // 2.9% top rate
    coordinates: [-99.784, 47.5289]
  },
  'OH': {
    name: 'Ohio',
    abbreviation: 'OH',
    rate: 0.0399, // 3.99% top rate
    coordinates: [-82.7649, 40.4173]
  },
  'OK': {
    name: 'Oklahoma',
    abbreviation: 'OK',
    rate: 0.05, // 5% top rate
    coordinates: [-96.9247, 35.5889]
  },
  'PA': {
    name: 'Pennsylvania',
    abbreviation: 'PA',
    rate: 0.0307, // 3.07% flat rate
    coordinates: [-77.7996, 40.6892]
  },
  'SC': {
    name: 'South Carolina',
    abbreviation: 'SC',
    rate: 0.07, // 7% top rate
    coordinates: [-80.945, 33.8361]
  },
  'UT': {
    name: 'Utah',
    abbreviation: 'UT',
    rate: 0.0465, // 4.65% flat rate
    coordinates: [-111.8910, 40.1135]
  },
  'VA': {
    name: 'Virginia',
    abbreviation: 'VA',
    rate: 0.0575, // 5.75% top rate
    coordinates: [-78.1927, 37.7693]
  },
  'WV': {
    name: 'West Virginia',
    abbreviation: 'WV',
    rate: 0.065, // 6.5% top rate
    coordinates: [-80.9696, 38.491]
  },
  'WI': {
    name: 'Wisconsin',
    abbreviation: 'WI',
    rate: 0.0765, // 7.65% top rate
    coordinates: [-89.6165, 44.2619]
  },

  // Medium tax states (6-8%)
  'AL': {
    name: 'Alabama',
    abbreviation: 'AL',
    rate: 0.05, // 5% top rate
    coordinates: [-86.79113, 32.377716]
  },
  'AR': {
    name: 'Arkansas',
    abbreviation: 'AR',
    rate: 0.054, // 5.4% top rate (being phased down)
    coordinates: [-92.3731, 34.9513]
  },
  'CT': {
    name: 'Connecticut',
    abbreviation: 'CT',
    rate: 0.069, // 6.99% top rate
    coordinates: [-72.7269, 41.5978]
  },
  'DE': {
    name: 'Delaware',
    abbreviation: 'DE',
    rate: 0.066, // 6.6% top rate
    coordinates: [-75.5277, 39.318]
  },
  'IL': {
    name: 'Illinois',
    abbreviation: 'IL',
    rate: 0.0495, // 4.95% flat rate
    coordinates: [-88.9931, 40.3363]
  },
  'ME': {
    name: 'Maine',
    abbreviation: 'ME',
    rate: 0.0715, // 7.15% top rate
    coordinates: [-69.3977, 44.323]
  },
  'MD': {
    name: 'Maryland',
    abbreviation: 'MD',
    rate: 0.0575, // 5.75% state + local can add more
    coordinates: [-76.7909, 38.9637]
  },
  'MN': {
    name: 'Minnesota',
    abbreviation: 'MN',
    rate: 0.0985, // 9.85% top rate
    coordinates: [-93.9002, 45.6945]
  },
  'NJ': {
    name: 'New Jersey',
    abbreviation: 'NJ',
    rate: 0.1075, // 10.75% top rate
    coordinates: [-74.5089, 40.2989]
  },
  'NY': {
    name: 'New York',
    abbreviation: 'NY',
    rate: 0.109, // 10.9% top rate (state + NYC)
    specialNotes: 'NYC residents face additional local tax',
    coordinates: [-74.948, 42.9538]
  },
  'OR': {
    name: 'Oregon',
    abbreviation: 'OR',
    rate: 0.099, // 9.9% top rate
    coordinates: [-122.070, 44.931]
  },
  'RI': {
    name: 'Rhode Island',
    abbreviation: 'RI',
    rate: 0.0599, // 5.99% top rate
    coordinates: [-71.511, 41.82355]
  },
  'VT': {
    name: 'Vermont',
    abbreviation: 'VT',
    rate: 0.0895, // 8.95% top rate
    coordinates: [-72.710, 44.0459]
  },

  // High tax state
  'CA': {
    name: 'California',
    abbreviation: 'CA',
    rate: 0.133, // 13.3% top rate (highest in nation)
    specialNotes: 'Highest state tax rate in the nation',
    coordinates: [-119.681, 36.1162]
  },

  // DC (treated as state)
  'DC': {
    name: 'District of Columbia',
    abbreviation: 'DC',
    rate: 0.0895, // 8.95% top rate
    coordinates: [-77.0369, 38.9072]
  },

  // US Territories with special tax advantages
  'PR': {
    name: 'Puerto Rico',
    abbreviation: 'PR',
    rate: 0.0, // 0% on qualified dividends under Act 60
    specialNotes: 'Act 60: 0% tax on qualified dividends for bona fide residents',
    isTerritory: true,
    coordinates: [-66.590, 18.220]
  },
  'VI': {
    name: 'US Virgin Islands',
    abbreviation: 'VI',
    rate: 0.105, // Mirror of federal rates typically
    specialNotes: 'Special tax benefits available for residents',
    isTerritory: true,
    coordinates: [-64.8963, 17.7294]
  },
  'GU': {
    name: 'Guam',
    abbreviation: 'GU',
    rate: 0.085, // Estimated based on tax structure
    specialNotes: 'Mirror tax system with US',
    isTerritory: true,
    coordinates: [144.7937, 13.4443]
  },
  'AS': {
    name: 'American Samoa',
    abbreviation: 'AS',
    rate: 0.075, // Estimated
    specialNotes: 'Separate tax system',
    isTerritory: true,
    coordinates: [-170.1322, -14.2710]
  },
  'MP': {
    name: 'Northern Mariana Islands',
    abbreviation: 'MP',
    rate: 0.085, // Estimated
    specialNotes: 'CNMI tax system',
    isTerritory: true,
    coordinates: [145.38, 17.33]
  }
};

// Federal tax rates for qualified dividends (2024)
export const FEDERAL_TAX_RATES = {
  qualified: {
    single: [
      { min: 0, max: 44625, rate: 0.0 },       // 0% bracket
      { min: 44625, max: 492300, rate: 0.15 },  // 15% bracket
      { min: 492300, max: Infinity, rate: 0.20 } // 20% bracket
    ],
    marriedJoint: [
      { min: 0, max: 89250, rate: 0.0 },       // 0% bracket
      { min: 89250, max: 553850, rate: 0.15 }, // 15% bracket
      { min: 553850, max: Infinity, rate: 0.20 } // 20% bracket
    ]
  },
  ordinary: {
    // These are simplified - actual brackets are more complex
    single: [
      { min: 0, max: 11600, rate: 0.10 },
      { min: 11600, max: 47150, rate: 0.12 },
      { min: 47150, max: 100525, rate: 0.22 },
      { min: 100525, max: 191050, rate: 0.24 },
      { min: 191050, max: 243725, rate: 0.32 },
      { min: 243725, max: 609350, rate: 0.35 },
      { min: 609350, max: Infinity, rate: 0.37 }
    ],
    marriedJoint: [
      { min: 0, max: 23200, rate: 0.10 },
      { min: 23200, max: 94300, rate: 0.12 },
      { min: 94300, max: 201050, rate: 0.22 },
      { min: 201050, max: 383900, rate: 0.24 },
      { min: 383900, max: 487450, rate: 0.32 },
      { min: 487450, max: 731200, rate: 0.35 },
      { min: 731200, max: Infinity, rate: 0.37 }
    ]
  }
};

// Calculate federal tax based on income and filing status
export function calculateFederalTax(
  income: number, 
  dividendType: 'qualified' | 'ordinary',
  filingStatus: 'single' | 'marriedJoint' = 'single'
): number {
  const brackets = FEDERAL_TAX_RATES[dividendType][filingStatus];
  let tax = 0;
  
  for (const bracket of brackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income - bracket.min, bracket.max - bracket.min);
      tax += taxableInBracket * bracket.rate;
    }
  }
  
  return tax;
}

// Calculate total tax (federal + state) for a given state
export function calculateTotalTax(
  income: number,
  stateCode: string,
  dividendType: 'qualified' | 'ordinary' = 'qualified',
  filingStatus: 'single' | 'marriedJoint' = 'single'
): {
  federal: number;
  state: number;
  total: number;
  effectiveRate: number;
} {
  const federalTax = calculateFederalTax(income, dividendType, filingStatus);
  const stateInfo = STATE_TAX_RATES[stateCode.toUpperCase()];
  const stateTax = stateInfo ? income * stateInfo.rate : 0;
  const total = federalTax + stateTax;
  
  return {
    federal: federalTax,
    state: stateTax,
    total,
    effectiveRate: income > 0 ? total / income : 0
  };
}

// Calculate savings by moving to a different state
export function calculateStateSavings(
  income: number,
  currentStateCode: string,
  targetStateCode: string,
  dividendType: 'qualified' | 'ordinary' = 'qualified',
  filingStatus: 'single' | 'marriedJoint' = 'single'
): {
  currentTax: ReturnType<typeof calculateTotalTax>;
  targetTax: ReturnType<typeof calculateTotalTax>;
  annualSavings: number;
  monthlySavings: number;
  percentageSavings: number;
} {
  const currentTax = calculateTotalTax(income, currentStateCode, dividendType, filingStatus);
  const targetTax = calculateTotalTax(income, targetStateCode, dividendType, filingStatus);
  const annualSavings = currentTax.total - targetTax.total;
  
  return {
    currentTax,
    targetTax,
    annualSavings,
    monthlySavings: annualSavings / 12,
    percentageSavings: currentTax.total > 0 ? (annualSavings / currentTax.total) * 100 : 0
  };
}

// Get states sorted by tax burden (ascending)
export function getStatesByTaxBurden(
  income: number = 100000,
  dividendType: 'qualified' | 'ordinary' = 'qualified',
  filingStatus: 'single' | 'marriedJoint' = 'single'
): Array<{
  stateCode: string;
  stateInfo: StateTaxInfo;
  taxInfo: ReturnType<typeof calculateTotalTax>;
  ranking: number;
}> {
  const stateRankings = Object.entries(STATE_TAX_RATES).map(([code, info]) => ({
    stateCode: code,
    stateInfo: info,
    taxInfo: calculateTotalTax(income, code, dividendType, filingStatus)
  }));
  
  // Sort by total tax (ascending - lowest tax first)
  stateRankings.sort((a, b) => a.taxInfo.total - b.taxInfo.total);
  
  // Add ranking
  return stateRankings.map((state, index) => ({
    ...state,
    ranking: index + 1
  }));
}

// Get color for visualization based on savings amount
export function getColorForSavings(savings: number): {
  bg: string;
  text: string;
  border: string;
  intensity: number;
} {
  const absSavings = Math.abs(savings);
  
  if (savings > 10000) {
    return { bg: 'bg-green-600', text: 'text-white', border: 'border-green-700', intensity: 1.0 };
  } else if (savings > 5000) {
    return { bg: 'bg-green-500', text: 'text-white', border: 'border-green-600', intensity: 0.8 };
  } else if (savings > 2000) {
    return { bg: 'bg-green-400', text: 'text-green-900', border: 'border-green-500', intensity: 0.6 };
  } else if (savings > 500) {
    return { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-300', intensity: 0.4 };
  } else if (savings > -500) {
    return { bg: 'bg-gray-200', text: 'text-gray-700', border: 'border-gray-300', intensity: 0.2 };
  } else if (savings > -2000) {
    return { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-300', intensity: 0.4 };
  } else if (savings > -5000) {
    return { bg: 'bg-red-400', text: 'text-red-900', border: 'border-red-500', intensity: 0.6 };
  } else {
    return { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', intensity: 0.8 };
  }
}

// Special highlight for Puerto Rico
export function isPuertoRico(stateCode: string): boolean {
  return stateCode.toUpperCase() === 'PR';
}

// Get the best tax states (top 10 lowest tax burden)
export function getBestTaxStates(
  income: number = 100000,
  dividendType: 'qualified' | 'ordinary' = 'qualified',
  filingStatus: 'single' | 'marriedJoint' = 'single',
  limit: number = 10
): Array<{
  stateCode: string;
  stateInfo: StateTaxInfo;
  taxInfo: ReturnType<typeof calculateTotalTax>;
  ranking: number;
}> {
  return getStatesByTaxBurden(income, dividendType, filingStatus).slice(0, limit);
}