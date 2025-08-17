/**
 * Portfolio Import Service
 * Handles CSV, JSON, broker format parsing and validation
 */

import { ImportData, ImportResult } from '@/components/portfolio/ImportWizard';
import { logger } from '@/lib/logger';

export interface BrokerParser {
  id: string;
  name: string;
  detect: (headers: string[], firstRow: string[]) => boolean;
  parse: (data: string) => ImportData[];
}

// Broker-specific parsers
const BROKER_PARSERS: BrokerParser[] = [
  {
    id: 'fidelity',
    name: 'Fidelity',
    detect: (headers) => 
      headers.some(h => h.toLowerCase().includes('account')) &&
      headers.some(h => h.toLowerCase().includes('symbol')) &&
      headers.some(h => h.toLowerCase().includes('quantity')),
    parse: parseFidelityCSV
  },
  {
    id: 'schwab',
    name: 'Charles Schwab',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('positions')) ||
      headers.some(h => h.toLowerCase().includes('schwab')),
    parse: parseSchwabCSV
  },
  {
    id: 'vanguard',
    name: 'Vanguard',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('fund')) ||
      headers.some(h => h.toLowerCase().includes('vanguard')),
    parse: parseVanguardCSV
  },
  {
    id: 'etrade',
    name: 'E*TRADE',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('etrade')) ||
      headers.some(h => h.toLowerCase().includes('e*trade')),
    parse: parseEtradeCSV
  },
  {
    id: 'td_ameritrade',
    name: 'TD Ameritrade',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('ameritrade')) ||
      headers.some(h => h.toLowerCase().includes('thinkorswim')),
    parse: parseTdAmeritradeCSV
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    detect: (headers) =>
      headers.some(h => h.toLowerCase().includes('robinhood')) ||
      (headers.includes('Instrument') && headers.includes('Quantity')),
    parse: parseRobinhoodCSV
  }
];

export class PortfolioImportService {
  async validateData(rawData: string, method: 'csv' | 'paste' | 'json' | 'broker'): Promise<ImportData[]> {
    try {
      switch (method) {
        case 'csv':
        case 'broker':
          return this.parseCSV(rawData, method === 'broker');
        case 'paste':
          return this.parsePastedData(rawData);
        case 'json':
          return this.parseJSON(rawData);
        default:
          throw new Error(`Unsupported import method: ${method}`);
      }
    } catch (error) {
      logger.error('Data validation failed:', error);
      throw new Error(`Failed to parse ${method} data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private parseCSV(data: string, detectBroker = false): ImportData[] {
    const lines = data.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row');
    }

    const headers = this.parseCSVRow(lines[0]);
    const dataRows = lines.slice(1).map(line => this.parseCSVRow(line));

    // Try to detect broker format if requested
    if (detectBroker && dataRows.length > 0) {
      const broker = this.detectBrokerFormat(headers, dataRows[0]);
      if (broker) {
        logger.log(`Detected broker format: ${broker.name}`);
        return broker.parse(data);
      }
    }

    // Parse as standard CSV
    return this.parseStandardCSV(headers, dataRows);
  }

  private parsePastedData(data: string): ImportData[] {
    // Try to detect if it's tab-separated or comma-separated
    const firstLine = data.split('\n')[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;

    if (tabCount > commaCount) {
      // Tab-separated (from Excel/Google Sheets)
      return this.parseTSV(data);
    } else {
      // Comma-separated
      return this.parseCSV(data);
    }
  }

  private parseJSON(data: string): ImportData[] {
    const parsed = JSON.parse(data);
    
    let portfolioData: any[];
    if (parsed.portfolio && Array.isArray(parsed.portfolio)) {
      portfolioData = parsed.portfolio;
    } else if (Array.isArray(parsed)) {
      portfolioData = parsed;
    } else {
      throw new Error('JSON must contain a portfolio array or be an array itself');
    }

    return portfolioData.map((item, index) => ({
      id: item.id || `json-${index}`,
      symbol: this.validateSymbol(item.symbol || item.ticker || ''),
      shares: this.parseNumber(item.shares || item.quantity || 0),
      costBasis: this.parseNumber(item.costBasis || item.avgCost || item.price || 0),
      purchaseDate: this.validateDate(item.purchaseDate || item.date || new Date().toISOString()),
      currentPrice: item.currentPrice ? this.parseNumber(item.currentPrice) : undefined,
      dividendYield: item.dividendYield ? this.parseNumber(item.dividendYield) : undefined,
      sector: item.sector || undefined,
      notes: item.notes || item.description || undefined,
      errors: this.validateImportItem({
        symbol: item.symbol || item.ticker || '',
        shares: item.shares || item.quantity || 0,
        costBasis: item.costBasis || item.avgCost || item.price || 0,
        purchaseDate: item.purchaseDate || item.date || new Date().toISOString()
      }),
      warnings: []
    }));
  }

  private parseTSV(data: string): ImportData[] {
    const lines = data.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('Data must contain at least a header row and one data row');
    }

    const headers = lines[0].split('\t').map(h => h.trim());
    const dataRows = lines.slice(1).map(line => line.split('\t').map(cell => cell.trim()));

    return this.parseStandardCSV(headers, dataRows);
  }

  private parseCSVRow(row: string): string[] {
    // Simple CSV parser - handles quoted fields
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
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

  private detectBrokerFormat(headers: string[], firstRow: string[]): BrokerParser | null {
    return BROKER_PARSERS.find(parser => parser.detect(headers, firstRow)) || null;
  }

  private parseStandardCSV(headers: string[], dataRows: string[][]): ImportData[] {
    const columnMap = this.createColumnMap(headers);
    
    return dataRows.map((row, index) => {
      const item = {
        id: `csv-${index}`,
        symbol: this.getColumnValue(row, columnMap, 'symbol', ''),
        shares: this.parseNumber(this.getColumnValue(row, columnMap, 'shares', '0')),
        costBasis: this.parseNumber(this.getColumnValue(row, columnMap, 'costBasis', '0')),
        purchaseDate: this.validateDate(this.getColumnValue(row, columnMap, 'purchaseDate', new Date().toISOString())),
        currentPrice: this.parseOptionalNumber(this.getColumnValue(row, columnMap, 'currentPrice')),
        dividendYield: this.parseOptionalNumber(this.getColumnValue(row, columnMap, 'dividendYield')),
        sector: this.getColumnValue(row, columnMap, 'sector') || undefined,
        notes: this.getColumnValue(row, columnMap, 'notes') || undefined,
        errors: [],
        warnings: []
      };

      item.errors = this.validateImportItem(item);
      item.warnings = this.generateWarnings(item);

      return item;
    });
  }

  private createColumnMap(headers: string[]): Record<string, number> {
    const map: Record<string, number> = {};
    
    const mappings = {
      symbol: ['symbol', 'ticker', 'stock', 'security', 'instrument'],
      shares: ['shares', 'quantity', 'qty', 'amount', 'units'],
      costBasis: ['cost', 'basis', 'price', 'avgcost', 'average_cost', 'avg_cost'],
      purchaseDate: ['date', 'purchase_date', 'buy_date', 'acquired', 'purchase'],
      currentPrice: ['current', 'current_price', 'market_price', 'latest_price'],
      dividendYield: ['yield', 'dividend_yield', 'div_yield'],
      sector: ['sector', 'industry', 'category'],
      notes: ['notes', 'description', 'memo', 'comment']
    };

    for (const [targetField, possibleNames] of Object.entries(mappings)) {
      const headerIndex = headers.findIndex(header => 
        possibleNames.some(name => 
          header.toLowerCase().includes(name.toLowerCase())
        )
      );
      if (headerIndex !== -1) {
        map[targetField] = headerIndex;
      }
    }

    return map;
  }

  private getColumnValue(row: string[], columnMap: Record<string, number>, field: string, defaultValue = ''): string {
    const columnIndex = columnMap[field];
    return columnIndex !== undefined && row[columnIndex] !== undefined 
      ? row[columnIndex].trim() 
      : defaultValue;
  }

  private parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    const cleaned = value.replace(/[$,%]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseOptionalNumber(value: string): number | undefined {
    if (!value || value.trim() === '') return undefined;
    return this.parseNumber(value);
  }

  private validateSymbol(symbol: string): string {
    return symbol.toUpperCase().replace(/[^A-Z]/g, '');
  }

  private validateDate(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }

  private validateImportItem(item: Partial<ImportData>): string[] {
    const errors: string[] = [];
    
    if (!item.symbol || item.symbol.trim() === '') {
      errors.push('Symbol is required');
    } else if (!/^[A-Z]{1,5}$/.test(item.symbol.toUpperCase())) {
      errors.push('Symbol should be 1-5 uppercase letters');
    }
    
    if (!item.shares || item.shares <= 0) {
      errors.push('Shares must be greater than 0');
    }
    
    if (!item.costBasis || item.costBasis <= 0) {
      errors.push('Cost basis must be greater than 0');
    }
    
    if (!item.purchaseDate) {
      errors.push('Purchase date is required');
    } else if (isNaN(Date.parse(item.purchaseDate))) {
      errors.push('Invalid purchase date format');
    }
    
    return errors;
  }

  private generateWarnings(item: ImportData): string[] {
    const warnings: string[] = [];
    
    if (!item.currentPrice) {
      warnings.push('Current price will be fetched automatically');
    }
    
    if (!item.sector) {
      warnings.push('Sector information will be populated from market data');
    }
    
    if (!item.dividendYield) {
      warnings.push('Dividend yield will be calculated from market data');
    }
    
    return warnings;
  }

  async importData(data: ImportData[]): Promise<ImportResult> {
    // Filter out items with errors
    const validData = data.filter(item => !item.errors || item.errors.length === 0);
    
    try {
      // In real implementation, save to database
      logger.log('Importing', validData.length, 'valid records');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const imported = validData.length;
      const errors = data.length - imported;
      const warnings = data.filter(item => item.warnings && item.warnings.length > 0).length;
      
      const details = [
        `Successfully imported ${imported} holdings`,
        ...(errors > 0 ? [`Skipped ${errors} records with errors`] : []),
        ...(warnings > 0 ? [`${warnings} records had warnings but were imported`] : [])
      ];

      return {
        success: imported > 0,
        imported,
        errors,
        warnings,
        details
      };
    } catch (error) {
      logger.error('Import failed:', error);
      return {
        success: false,
        imported: 0,
        errors: data.length,
        warnings: 0,
        details: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }
}

// Broker-specific parsers
function parseFidelityCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `fidelity-${index}`,
      symbol: cells[headers.indexOf('Symbol')] || '',
      shares: parseFloat(cells[headers.indexOf('Quantity')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('Cost Per Share')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0], // Fidelity doesn't always include dates
      currentPrice: parseFloat(cells[headers.indexOf('Last Price')] || '0') || undefined,
      errors: [],
      warnings: ['Purchase date not available in Fidelity export']
    };
  });
}

function parseSchwabCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `schwab-${index}`,
      symbol: cells[headers.indexOf('Symbol')] || '',
      shares: parseFloat(cells[headers.indexOf('Quantity')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('Price')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: [],
      warnings: []
    };
  });
}

function parseVanguardCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `vanguard-${index}`,
      symbol: cells[headers.indexOf('Fund')] || cells[headers.indexOf('Symbol')] || '',
      shares: parseFloat(cells[headers.indexOf('Shares')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('Share Price')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: [],
      warnings: []
    };
  });
}

function parseEtradeCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `etrade-${index}`,
      symbol: cells[headers.indexOf('Symbol')] || '',
      shares: parseFloat(cells[headers.indexOf('Qty')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('Price Paid')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: [],
      warnings: []
    };
  });
}

function parseTdAmeritradeCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `tdameritrade-${index}`,
      symbol: cells[headers.indexOf('SYMBOL')] || '',
      shares: parseFloat(cells[headers.indexOf('QUANTITY')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('AVERAGE PRICE')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: [],
      warnings: []
    };
  });
}

function parseRobinhoodCSV(data: string): ImportData[] {
  const lines = data.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  
  return lines.slice(1).map((line, index) => {
    const cells = line.split(',').map(cell => cell.trim().replace(/"/g, ''));
    
    return {
      id: `robinhood-${index}`,
      symbol: cells[headers.indexOf('Instrument')] || '',
      shares: parseFloat(cells[headers.indexOf('Quantity')] || '0'),
      costBasis: parseFloat(cells[headers.indexOf('Average Cost')] || '0'),
      purchaseDate: new Date().toISOString().split('T')[0],
      errors: [],
      warnings: []
    };
  });
}

export const portfolioImportService = new PortfolioImportService();