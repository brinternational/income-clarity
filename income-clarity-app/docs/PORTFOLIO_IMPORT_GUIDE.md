# Portfolio Import System - Complete Guide

## Overview

The Portfolio Import System is a comprehensive tool for importing portfolio holdings from multiple sources into Income Clarity. It supports various formats and provides robust validation, error handling, and user-friendly interfaces.

## Features

### ✅ Import Methods
- **CSV Upload**: Standard CSV files with custom column mapping
- **Manual Paste**: Copy-paste from Excel, Google Sheets, or any text source
- **JSON Import**: Structured JSON data for advanced users or backup restoration
- **Broker Integration**: Specialized parsers for major brokers

### ✅ Supported Brokers
- **Fidelity**: Account positions export
- **Charles Schwab**: Portfolio export CSV
- **Vanguard**: Holdings export with fund information
- **E*TRADE**: Portfolio summary format
- **TD Ameritrade**: Account summary with detailed positions
- **Robinhood**: Account statement format

### ✅ Data Validation
- Real-time symbol validation
- Numeric field validation (shares, prices)
- Date format handling and conversion
- Duplicate detection and warnings
- Missing data identification

### ✅ User Interface
- **5-Step Wizard**: Method → Upload → Map → Preview → Complete
- **Column Mapping**: Smart auto-detection with manual override
- **Data Preview**: Editable table with error highlighting
- **Progress Tracking**: Visual indicators and status updates
- **Import History**: Track and manage previous imports

## File Structure

```
components/portfolio/
├── ImportWizard.tsx              # Main wizard component
├── import/
│   ├── ImportMethodSelector.tsx  # Step 1: Choose import method
│   ├── FileUploader.tsx         # Step 2: Upload data
│   ├── ColumnMapper.tsx         # Step 3: Map columns
│   ├── DataPreview.tsx          # Step 4: Preview & validate
│   ├── ImportSummary.tsx        # Step 5: Results summary
│   └── ImportHistory.tsx        # Import history management

lib/
├── services/
│   └── portfolio-import.service.ts  # Core import logic
├── parsers/
│   └── broker-parsers.ts            # Broker-specific parsers
└── hooks/
    └── usePortfolioImport.ts        # React hook for import operations

app/
├── portfolio/import/page.tsx     # Import page route
└── api/portfolio/import/         # API endpoints
```

## Usage Guide

### 1. Accessing the Import Tool

Navigate to `/portfolio/import` or click "Import Portfolio" from the portfolio page.

### 2. Import Methods

#### CSV Upload
```csv
Symbol,Shares,Cost Basis,Purchase Date
AAPL,100,150.00,2024-01-15
MSFT,50,300.00,2024-01-20
JEPI,200,55.00,2024-02-01
```

#### Manual Paste
Copy data from Excel or Google Sheets and paste directly into the text area. Both tab-separated and comma-separated formats are supported.

#### JSON Import
```json
{
  "portfolio": [
    {
      "symbol": "AAPL",
      "shares": 100,
      "costBasis": 150.00,
      "purchaseDate": "2024-01-15",
      "currentPrice": 175.00,
      "sector": "Technology"
    }
  ]
}
```

#### Broker Import
Upload CSV files downloaded from your broker. The system automatically detects the format and applies the appropriate parser.

### 3. Column Mapping

The system automatically detects column mappings based on header names. You can manually adjust mappings if needed.

**Required Fields:**
- Symbol/Ticker (required)
- Shares/Quantity (required) 
- Cost Basis/Price (required)
- Purchase Date (required)

**Optional Fields:**
- Current Price (auto-fetched if missing)
- Dividend Yield (calculated automatically)
- Sector (populated from market data)
- Notes/Description

### 4. Data Validation

The system validates:
- **Symbols**: 1-5 uppercase letters
- **Shares**: Positive numbers
- **Prices**: Positive currency values
- **Dates**: Valid date formats

### 5. Preview & Edit

Review your data before importing:
- Edit individual cells
- Add/remove rows
- Filter by status (errors/warnings/valid)
- Export preview as CSV

### 6. Import Results

After successful import:
- View import statistics
- Review any errors or warnings
- Access portfolio dashboard
- Set up additional features

## API Endpoints

### POST /api/portfolio/import
Import portfolio data to database.

**Request:**
```json
{
  "method": "csv",
  "data": "Symbol,Shares,Cost Basis,Purchase Date\nAAPL,100,150.00,2024-01-15",
  "portfolioId": "optional-portfolio-id"
}
```

**Response:**
```json
{
  "success": true,
  "imported": 25,
  "errors": 2,
  "warnings": 3,
  "details": ["Successfully imported 25 holdings", "2 records had errors"]
}
```

### POST /api/portfolio/import/validate
Validate import data without saving.

**Request:**
```json
{
  "method": "csv",
  "data": "raw csv data..."
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "totalRecords": 27,
    "validRecords": 25,
    "recordsWithErrors": 2,
    "recordsWithWarnings": 3
  },
  "data": [...], // Parsed and validated data
  "suggestions": ["Fix 2 records with errors"]
}
```

### GET /api/portfolio/import
Get import history.

**Response:**
```json
[
  {
    "id": "import-123",
    "timestamp": "2024-08-13T10:30:00Z",
    "method": "csv",
    "recordsImported": 25,
    "recordsWithErrors": 2,
    "status": "partial"
  }
]
```

## Error Handling

### Common Errors
- **Invalid Symbol**: Symbol should be 1-5 uppercase letters
- **Invalid Shares**: Shares must be greater than 0
- **Invalid Price**: Cost basis must be greater than 0
- **Invalid Date**: Purchase date format not recognized

### Warnings
- **Missing Current Price**: Will be fetched automatically
- **Missing Sector**: Will be populated from market data
- **Duplicate Symbol**: Consider consolidating positions

### Recovery
- Edit data directly in preview table
- Delete problematic rows
- Re-upload corrected file
- Contact support for complex issues

## Broker-Specific Notes

### Fidelity
- Symbol column: "Symbol"
- Shares column: "Quantity" 
- Price column: "Cost Per Share"
- Purchase dates not typically included

### Charles Schwab
- Symbol column: "Symbol"
- Shares column: "Quantity"
- Price column: "Price"
- Clean format, usually imports smoothly

### Vanguard
- Symbol column: "Fund Name" or "Symbol"
- Shares column: "Share Balance"
- Price column: "Share Price"
- Fund names converted to symbols automatically

### E*TRADE
- Symbol column: "Symbol"
- Shares column: "Qty"
- Price column: "Price Paid"
- Market price in separate column

### TD Ameritrade
- ALL CAPS headers
- Symbol column: "SYMBOL"
- Shares column: "QUANTITY"
- Price column: "AVERAGE PRICE"

### Robinhood
- Symbol column: "Instrument"
- Shares column: "Quantity"
- Price column: "Average Cost"
- Mobile-friendly format

## Security & Privacy

- All data processed locally before upload
- No sensitive data stored in browser localStorage
- Import history encrypted and user-specific
- File validation prevents malicious uploads
- Rate limiting on API endpoints

## Performance

- **File Size Limit**: 10MB maximum
- **Records Limit**: 10,000 holdings per import
- **Processing Time**: ~2 seconds per 1000 records
- **Memory Usage**: Optimized for large files
- **Browser Support**: Modern browsers (Chrome, Firefox, Safari, Edge)

## Troubleshooting

### Import Fails
1. Check file format matches selected method
2. Verify required columns are present
3. Remove special characters from data
4. Try smaller batch if file is very large

### Column Mapping Issues
1. Use manual column mapping
2. Check for extra spaces in headers
3. Verify data is in expected format
4. Try standard CSV template

### Validation Errors
1. Fix errors in preview table
2. Remove invalid rows
3. Check symbol formatting
4. Verify numeric fields

### Performance Issues
1. Import in smaller batches
2. Close other browser tabs
3. Check internet connection
4. Try different browser

## Advanced Features

### Batch Operations
- Import multiple files sequentially
- Bulk edit operations in preview
- Mass duplicate detection
- Portfolio consolidation

### Data Enhancement
- Automatic price fetching
- Sector classification
- Dividend yield calculation
- Performance metrics

### Integration
- Portfolio sync with brokers (future)
- Automatic transaction imports (future)
- Real-time price updates
- Tax lot tracking

## Best Practices

### Data Preparation
1. Clean your data before import
2. Use consistent date formats
3. Remove unnecessary columns
4. Verify symbol accuracy

### Import Strategy
1. Start with small test import
2. Review validation results carefully
3. Fix errors before proceeding
4. Keep backup of original data

### Maintenance
1. Regular import history cleanup
2. Update broker parsers as needed
3. Monitor import success rates
4. User feedback integration

## Support

For additional help:
- Check FAQ in application
- Review error messages carefully
- Use preview mode to identify issues
- Contact support with specific error details

---

*This guide covers the complete portfolio import system. For developer information, see the technical documentation in the codebase.*