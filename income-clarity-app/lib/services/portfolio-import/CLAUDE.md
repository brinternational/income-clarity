# 🚨 CRITICAL PORT PROTECTION RULE - READ FIRST

## ⛔ ABSOLUTE MANDATE - NEVER TOUCH THESE PORTS:
- **PORT 3000**: Income Clarity production server - NEVER KILL
- **PORT 22**: SSH connection to Claude Code CLI - NEVER KILL  
- **PORT 8080**: Any other critical services - NEVER KILL

## 🚫 FORBIDDEN COMMANDS:
- `pkill -f node` (kills Claude Code CLI connection)
- `killall node` (kills everything)
- `npm run dev` with port changes
- Any command that kills ports other than 3000

## ✅ SAFE COMMANDS ONLY:
- `pkill -f custom-server.js` (targets specific server only)
- `lsof -ti:3000 | xargs kill` (port 3000 only)
- Standard npm install/build without server restarts

**VIOLATION = IMMEDIATE TASK FAILURE**

---

# Portfolio Import Service

## 📋 Purpose
Handles CSV, Excel, and broker format parsing and validation for portfolio data import. Supports major brokers including Fidelity, Schwab, Vanguard, E*TRADE, TD Ameritrade, and Robinhood.

## 🔧 Key Methods
- `validateData()` - Parse and validate portfolio import data
- `importData()` - Process validated data and save to database
- `parseCSV()` - Handle standard CSV parsing with column mapping
- `parseBrokerFormat()` - Auto-detect and parse broker-specific formats
- `validateImportItem()` - Validate individual portfolio entries

## 📊 Data Sources Supported
- **CSV Files**: Standard comma-separated values with flexible column mapping
- **Pasted Data**: Tab-separated (Excel) or comma-separated text
- **JSON**: Structured portfolio data in JSON format
- **Broker Exports**: Auto-detection for major broker CSV formats

## 🔗 Dependencies
- `@/components/portfolio/ImportWizard` - Import UI data types
- `@/lib/logger` - Logging service

## ⚡ Current Status
**✅ FULLY IMPLEMENTED**
- Complete broker format detection
- Flexible column mapping system
- Comprehensive validation
- Error handling and warnings
- Import simulation ready

## ⚙️ Configuration Required
- None - works with default settings
- Integrates with existing database schema
- Ready for production use

## 📝 Recent Changes
- Added comprehensive broker parser support
- Implemented intelligent column mapping
- Enhanced validation with warnings system
- Ready for database integration