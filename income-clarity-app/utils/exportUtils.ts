// Export utilities for Income Clarity data export functionality

/**
 * Export data as CSV file download
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    // Generate CSV content
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log(`CSV exported: ${filename} (${data.length} rows)`);
  } catch (error) {
    console.error('Failed to export CSV:', error);
    throw new Error('CSV export failed');
  }
}

/**
 * Alias for exportToCSV for backward compatibility
 */
export function exportDataAsCSV(data: any[], filename: string) {
  exportToCSV(data, filename);
}

/**
 * Export data as JSON file download
 */
export function exportToJSON(data: any, filename: string) {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    
    // Create and trigger download
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log(`JSON exported: ${filename}`);
  } catch (error) {
    console.error('Failed to export JSON:', error);
    throw new Error('JSON export failed');
  }
}

/**
 * Trigger download from API endpoint response
 */
export async function downloadFromAPI(endpoint: string, filename: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    // Get the blob from response
    const blob = await response.blob();
    
    // Create and trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Try to get filename from response headers, fallback to provided filename
    const contentDisposition = response.headers.get('content-disposition');
    let downloadFilename = filename;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {
        downloadFilename = filenameMatch[1].replace(/['"]/g, '');
      }
    }
    
    link.setAttribute('href', url);
    link.setAttribute('download', downloadFilename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log(`File downloaded: ${downloadFilename} from ${endpoint}`);
  } catch (error) {
    console.error('Failed to download from API:', error);
    throw error;
  }
}

/**
 * Export portfolio data via API
 */
export async function exportPortfolioData() {
  return downloadFromAPI('/api/user/export/portfolio', 'portfolio_export.csv');
}

/**
 * Export transaction data via API
 */
export async function exportTransactionData(options: {
  startDate?: string;
  endDate?: string;
  type?: string;
} = {}) {
  const params = new URLSearchParams();
  if (options.startDate) params.append('startDate', options.startDate);
  if (options.endDate) params.append('endDate', options.endDate);
  if (options.type) params.append('type', options.type);
  
  const endpoint = `/api/user/export/transactions${params.toString() ? '?' + params.toString() : ''}`;
  return downloadFromAPI(endpoint, 'transactions_export.csv');
}

/**
 * Export tax data via API
 */
export async function exportTaxData(taxYear?: string) {
  const params = taxYear ? `?year=${taxYear}` : '';
  const endpoint = `/api/user/export/tax${params}`;
  return downloadFromAPI(endpoint, `tax_report_${taxYear || new Date().getFullYear()}.csv`);
}

/**
 * PDF export placeholder - would require a PDF generation library
 */
export function exportToPDF(data: any, filename: string) {
  console.log('PDF export requires additional PDF library implementation');
  throw new Error('PDF export not yet implemented - use CSV export for tax reports');
}

/**
 * Image export placeholder - would require html2canvas or similar
 */
export function exportElementAsImage(element: HTMLElement, options: any) {
  console.log('Image export requires html2canvas implementation');
  throw new Error('Image export not yet implemented');
}