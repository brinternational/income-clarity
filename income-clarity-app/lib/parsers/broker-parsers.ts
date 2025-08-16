/**
 * Broker-Specific CSV Parsers
 * Handles different CSV formats from major brokers
 */

import { ImportData } from '@/components/portfolio/ImportWizard';

export interface BrokerFormat {
  id: string;
  name: string;
  description: string;
  sampleHeaders: string[];
  expectedColumns: {
    symbol: string[];
    shares: string[];
    costBasis: string[];
    currentPrice?: string[];
    date?: string[];
  };
}

export const BROKER_FORMATS: BrokerFormat[] = [
  {
    id: 'fidelity',
    name: 'Fidelity',
    description: 'Fidelity Account Positions Export',
    sampleHeaders: ['Account Name/Number', 'Symbol', 'Description', 'Quantity', 'Last Price', 'Last Price Change', 'Current Value', 'Today\'s Gain/Loss Dollar', 'Today\'s Gain/Loss Percent', 'Total Gain/Loss Dollar', 'Total Gain/Loss Percent', 'Percent Of Account', 'Cost Per Share', 'Cost Basis Total'],
    expectedColumns: {
      symbol: ['Symbol'],
      shares: ['Quantity'],
      costBasis: ['Cost Per Share'],
      currentPrice: ['Last Price'],
      date: ['Date', 'Trade Date']
    }
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    description: 'Schwab Portfolio Positions',
    sampleHeaders: ['Symbol', 'Description', 'Quantity', 'Price', 'Position Value', 'Day Change', 'Day Change %', 'Gain/Loss $', 'Gain/Loss %', 'Reinvest Dividends?', 'Capital Gains?', 'Account-Registration'],
    expectedColumns: {
      symbol: ['Symbol'],
      shares: ['Quantity'],
      costBasis: ['Price'],
      currentPrice: ['Price'],
      date: ['Date']
    }
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    description: 'Vanguard Account Holdings',
    sampleHeaders: ['Fund Account Number', 'Fund Name', 'Share Balance', 'Share Price', 'Total Value'],
    expectedColumns: {
      symbol: ['Fund Name', 'Symbol'],
      shares: ['Share Balance', 'Shares'],
      costBasis: ['Share Price'],
      currentPrice: ['Share Price'],
      date: ['Date']
    }
  },
  {
    id: 'etrade',
    name: 'E*TRADE',
    description: 'E*TRADE Portfolio Summary',
    sampleHeaders: ['Symbol', 'Qty', 'Price Paid', 'Total Cost', 'Market Price', 'Market Value', 'Gain/Loss $', 'Gain/Loss %', 'Account'],
    expectedColumns: {
      symbol: ['Symbol'],
      shares: ['Qty', 'Quantity'],
      costBasis: ['Price Paid'],
      currentPrice: ['Market Price'],
      date: ['Date', 'Purchase Date']
    }
  },
  {
    id: 'td_ameritrade',
    name: 'TD Ameritrade',
    description: 'TD Ameritrade Account Summary',
    sampleHeaders: ['SYMBOL', 'DESCRIPTION', 'QUANTITY', 'AVERAGE PRICE', 'MARKET VALUE', 'DAY CHANGE', 'DAY CHANGE %', 'GAIN/LOSS $', 'GAIN/LOSS %'],
    expectedColumns: {
      symbol: ['SYMBOL'],
      shares: ['QUANTITY'],
      costBasis: ['AVERAGE PRICE'],
      currentPrice: ['MARKET PRICE', 'CURRENT PRICE'],
      date: ['DATE', 'TRADE DATE']
    }
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    description: 'Robinhood Account Statement',
    sampleHeaders: ['Instrument', 'Quantity', 'Average Cost', 'Total Return', 'Equity', 'Percentage'],
    expectedColumns: {
      symbol: ['Instrument'],
      shares: ['Quantity'],
      costBasis: ['Average Cost'],
      currentPrice: ['Price', 'Current Price'],
      date: ['Date']
    }
  }
];

export function detectBrokerFormat(headers: string[]): BrokerFormat | null {
  const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
  
  for (const format of BROKER_FORMATS) {
    const sampleHeadersNormalized = format.sampleHeaders.map(h => h.toLowerCase());
    
    // Check if at least 60% of the expected headers match
    const matchCount = sampleHeadersNormalized.filter(expectedHeader => 
      normalizedHeaders.some(actualHeader => 
        actualHeader.includes(expectedHeader) || expectedHeader.includes(actualHeader)
      )
    ).length;
    
    const matchPercent = matchCount / sampleHeadersNormalized.length;
    
    if (matchPercent >= 0.4) { // At least 40% match
      return format;
    }
  }
  
  return null;
}

export function parseBrokerCSV(data: string, brokerFormat: BrokerFormat): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  const headers = parseCSVLine(lines[0]);
  const dataRows = lines.slice(1).map(line => parseCSVLine(line));

  // Create column mapping based on broker format
  const columnMapping = createBrokerColumnMapping(headers, brokerFormat);

  return dataRows.map((row, index) => {
    const symbol = getColumnValue(row, columnMapping.symbol);
    const shares = parseFloat(getColumnValue(row, columnMapping.shares) || '0');
    const costBasis = parseFloat(getColumnValue(row, columnMapping.costBasis)?.replace(/[$,]/g, '') || '0');
    const currentPrice = columnMapping.currentPrice ? 
      parseFloat(getColumnValue(row, columnMapping.currentPrice)?.replace(/[$,]/g, '') || '0') : undefined;

    return {
      id: `${brokerFormat.id}-${index}`,
      symbol: cleanSymbol(symbol),
      shares,
      costBasis,
      purchaseDate: new Date().toISOString().split('T')[0], // Most broker exports don't include purchase dates
      currentPrice,
      dividendYield: undefined,
      sector: undefined,
      notes: `Imported from ${brokerFormat.name}`,
      errors: validateBrokerImportItem({ symbol, shares, costBasis }),
      warnings: generateBrokerWarnings({ symbol, shares, costBasis, currentPrice })
    };
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, ''));
}

function createBrokerColumnMapping(headers: string[], brokerFormat: BrokerFormat) {
  const mapping: Record<string, number> = {};
  
  // Find column indices for each required field
  for (const [field, possibleNames] of Object.entries(brokerFormat.expectedColumns)) {
    const headerIndex = headers.findIndex(header => 
      possibleNames.some(name => 
        header.toLowerCase().includes(name.toLowerCase())
      )
    );
    
    if (headerIndex !== -1) {
      mapping[field] = headerIndex;
    }
  }
  
  return mapping;
}

function getColumnValue(row: string[], columnIndex: number | undefined): string {
  return columnIndex !== undefined && row[columnIndex] !== undefined 
    ? row[columnIndex].trim() 
    : '';
}

function cleanSymbol(symbol: string): string {
  // Remove common prefixes/suffixes and clean up
  let cleaned = symbol.toUpperCase().trim();
  
  // Remove common broker-specific annotations
  cleaned = cleaned.replace(/\s*\(.*\)$/, ''); // Remove anything in parentheses
  cleaned = cleaned.replace(/\s+.*$/, ''); // Remove everything after first space
  cleaned = cleaned.replace(/[^A-Z]/g, ''); // Keep only letters
  
  return cleaned;
}

function validateBrokerImportItem(item: { symbol: string; shares: number; costBasis: number }): string[] {
  const errors: string[] = [];
  
  if (!item.symbol || item.symbol.trim() === '') {
    errors.push('Symbol is required');
  } else if (!/^[A-Z]{1,5}$/.test(item.symbol)) {
    errors.push('Invalid symbol format');
  }
  
  if (!item.shares || item.shares <= 0) {
    errors.push('Shares must be greater than 0');
  }
  
  if (!item.costBasis || item.costBasis <= 0) {
    errors.push('Cost basis must be greater than 0');
  }
  
  return errors;
}

function generateBrokerWarnings(item: { symbol: string; shares: number; costBasis: number; currentPrice?: number }): string[] {
  const warnings: string[] = [];
  
  warnings.push('Purchase date not available in broker export - using current date');
  
  if (!item.currentPrice) {
    warnings.push('Current price will be fetched from market data');
  }
  
  warnings.push('Sector and dividend information will be populated automatically');
  
  return warnings;
}

export function getBrokerTemplateCSV(brokerId: string): string {
  const format = BROKER_FORMATS.find(f => f.id === brokerId);
  if (!format) {
    throw new Error(`Unknown broker format: ${brokerId}`);
  }
  
  // Generate sample CSV data based on the broker format
  const headers = format.sampleHeaders.slice(0, 5); // Use first 5 headers for simplicity
  const sampleData = [
    headers.join(','),
    generateSampleRow(format, 'AAPL', 100, 150.00),
    generateSampleRow(format, 'MSFT', 50, 300.00),
    generateSampleRow(format, 'JEPI', 200, 55.00)
  ];
  
  return sampleData.join('\n');
}

function generateSampleRow(format: BrokerFormat, symbol: string, shares: number, price: number): string {
  // Create a sample row based on the broker's expected format
  const row = new Array(format.sampleHeaders.length).fill('');
  
  // Fill in the key fields
  const symbolIndex = format.sampleHeaders.findIndex(h => 
    format.expectedColumns.symbol.some(s => h.toLowerCase().includes(s.toLowerCase()))
  );
  if (symbolIndex !== -1) row[symbolIndex] = symbol;
  
  const sharesIndex = format.sampleHeaders.findIndex(h => 
    format.expectedColumns.shares.some(s => h.toLowerCase().includes(s.toLowerCase()))
  );
  if (sharesIndex !== -1) row[sharesIndex] = shares.toString();
  
  const priceIndex = format.sampleHeaders.findIndex(h => 
    format.expectedColumns.costBasis.some(s => h.toLowerCase().includes(s.toLowerCase()))
  );
  if (priceIndex !== -1) row[priceIndex] = `$${price.toFixed(2)}`;
  
  return row.join(',');
}