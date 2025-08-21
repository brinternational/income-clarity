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

# Portfolio Feature - Context Documentation

## Overview
This folder contains all portfolio-related functionality for the Income Clarity application, including portfolio management, holdings tracking, import capabilities, and portfolio analysis.

## Folder Structure
```
features/portfolio/
├── api/                    # Portfolio API endpoints
│   ├── [id]/              # Individual portfolio operations
│   └── holdings/          # Holdings management endpoints
├── components/            # Portfolio UI components
│   ├── import/           # Import wizard components
│   └── [various].tsx     # Portfolio management components
├── hooks/                # Portfolio-specific hooks
├── services/             # Portfolio business logic
│   └── portfolio-import.service.ts
└── types/               # Portfolio type definitions
```

## Key Components
- **PortfolioList.tsx**: Main portfolio listing component
- **HoldingsList.tsx**: Holdings table and management
- **ImportWizard.tsx**: CSV/Excel import functionality
- **PortfolioForm.tsx**: Create/edit portfolio forms

## API Endpoints
- `GET/POST /api/portfolios` - Portfolio CRUD operations
- `GET/PUT/DELETE /api/portfolios/[id]` - Individual portfolio management
- `GET/PUT/DELETE /api/holdings/[id]` - Holdings management
- `POST /api/portfolio/import` - Import functionality

## Key Features
1. **Portfolio Management**: Create, edit, delete portfolios
2. **Holdings Tracking**: Add, edit, remove individual holdings
3. **Import System**: CSV/Excel import with column mapping
4. **Real-time Updates**: Live price updates via Polygon API
5. **Performance Analytics**: Returns, dividends, allocation analysis

## Integration Points
- **Stock Price Service**: Real-time price updates
- **Super Cards**: Portfolio data for performance hub
- **Tax Strategy**: Holdings data for tax optimization
- **Income Intelligence**: Dividend tracking and projections

## Development Notes
- All portfolio data flows through `portfolio-import.service.ts`
- Components use optimistic updates for better UX
- Import system supports multiple broker formats
- Real-time price updates use WebSocket connections where available