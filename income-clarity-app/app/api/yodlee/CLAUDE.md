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

# YODLEE API ENDPOINTS - CONTEXT FILE

*Last Updated: 2025-08-17*
*Agent: Reliability Engineer*

## 🚨 CRITICAL AUTHENTICATION ISSUE FOUND & FIXED (2025-08-17)

**PROBLEM:** Yodlee FastLink iframe not appearing - 401 Unauthorized errors
**ROOT CAUSE:** Cookie name mismatch in authentication system
- `/api/auth/me` uses `'session-token'` cookie ✅ WORKS
- `/api/yodlee/*` routes were using `'session'` cookie ❌ FAILED
- Fixed by standardizing on `'session-token'` across all routes

**AUTHENTICATION FIX APPLIED:**
- Updated `lib/auth-check.ts` to use correct cookie name
- Updated all Yodlee routes to use direct auth (same as /api/auth/me)
- Middleware allows API routes but requires session token

**FILES FIXED:**
- `/app/api/yodlee/fastlink-token/route.ts` - Primary route for bank connections
- `/app/api/yodlee/accounts/route.ts` - Account listing route  
- `/lib/auth-check.ts` - Authentication utility fixed

## 🔧 RECENT CHANGES - CRITICAL RELIABILITY FIXES

### ✅ CONFIGURATION VALIDATION IMPLEMENTED (2025-08-16)

**FIXED: APIs failing with 401 errors due to missing configuration**
- Added `yodleeClient.isServiceConfigured()` checks to all endpoints
- Return 503 Service Unavailable when Yodlee not configured
- Added comprehensive error logging and user-friendly messages

**FIXED: Silent failures with no user feedback**
- FastLink Token API returns proper error responses
- Accounts API gracefully degrades (empty array instead of 401)
- Clear error messages for debugging and user experience

## 📁 API STRUCTURE

```
app/api/yodlee/
├── fastlink-token/
│   └── route.ts              # Generate FastLink tokens
├── accounts/
│   └── route.ts              # Get connected accounts
├── callback/
│   └── route.ts              # FastLink callback handler
└── refresh/
    └── route.ts              # Refresh account data
```

## 🎯 FASTLINK TOKEN API

**Endpoint:** `POST /api/yodlee/fastlink-token`

**Purpose:** Generate FastLink token for bank connection UI

**RELIABILITY IMPROVEMENTS:**
```typescript
// NEW: Configuration validation BEFORE processing
if (!yodleeClient.isServiceConfigured()) {
  return NextResponse.json(
    { 
      error: 'Bank connection service not configured',
      message: 'Bank connections are currently unavailable. Please contact support.',
      configured: false,
      missingVars: configStatus.missingVars
    },
    { status: 503 } // Service Unavailable
  );
}
```

**Response Codes:**
- `200` - Success: Token generated successfully
- `401` - Unauthorized: Authentication required
- `503` - Service Unavailable: Yodlee not configured *(NEW)*
- `500` - Internal Server Error: Unexpected error

**Success Response:**
```json
{
  "token": "jwt_token_here",
  "fastlinkUrl": "https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink",
  "yodleeUserId": "user_id"
}
```

**Error Response (503):**
```json
{
  "error": "Bank connection service not configured",
  "message": "Bank connections are currently unavailable. Please contact support.",
  "configured": false,
  "missingVars": ["YODLEE_CLIENT_ID", "YODLEE_CLIENT_SECRET"]
}
```

## 📋 ACCOUNTS API

**Endpoint:** `GET /api/yodlee/accounts`

**Purpose:** Retrieve user's connected bank accounts

**RELIABILITY IMPROVEMENTS:**
```typescript
// NEW: Graceful degradation when not configured
if (!yodleeClient.isServiceConfigured()) {
  logger.info('Yodlee accounts requested but service not configured - returning empty array');
  return NextResponse.json([]); // Empty array instead of 401
}
```

**Response Codes:**
- `200` - Success: Always returns (even if empty array)
- `401` - Unauthorized: Authentication required
- `500` - Internal Server Error: Unexpected error

**Success Response:**
```json
[
  {
    "id": "account_id",
    "accountName": "Chase Checking",
    "accountType": "CHECKING",
    "accountNumber": "****1234",
    "balance": 2500.00,
    "currency": "USD",
    "institution": "Chase Bank",
    "lastRefreshed": "2025-08-16T23:30:00Z",
    "isActive": true
  }
]
```

**Not Configured Response:**
```json
[]
```

## 🔄 REFRESH API

**Endpoint:** `POST /api/yodlee/refresh`

**Purpose:** Trigger account data refresh

**Response Codes:**
- `200` - Success: Refresh initiated
- `401` - Unauthorized: Authentication required  
- `503` - Service Unavailable: Yodlee not configured
- `500` - Internal Server Error: Unexpected error

## 🔗 CALLBACK API

**Endpoint:** `POST /api/yodlee/callback`

**Purpose:** Handle FastLink success/error callbacks

**Response Codes:**
- `200` - Success: Callback processed
- `400` - Bad Request: Invalid callback data
- `503` - Service Unavailable: Yodlee not configured

## 🛡️ ERROR HANDLING STRATEGY

### Configuration Validation
```typescript
// Applied to all endpoints
if (!yodleeClient.isServiceConfigured()) {
  const configStatus = yodleeClient.getConfigurationStatus();
  logger.warn('Yodlee API called but service not configured', configStatus);
  
  // Strategy depends on endpoint:
  // - Critical endpoints (fastlink-token): 503 Service Unavailable
  // - Optional endpoints (accounts): Empty array (graceful degradation)
}
```

### Authentication Check
```typescript
const authUser = await getAuthenticatedUser();
if (!authUser) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}
```

### Yodlee API Error Handling
```typescript
try {
  const result = await yodleeClient.someOperation();
  return NextResponse.json(result);
} catch (error: any) {
  logger.error('Yodlee operation failed', error);
  
  // Return user-friendly error
  return NextResponse.json(
    { 
      error: error.message || 'Bank connection service error',
      code: 'YODLEE_ERROR'
    },
    { status: 500 }
  );
}
```

## 🔧 CONFIGURATION DEPENDENCIES

**Required Environment Variables:**
- `YODLEE_CLIENT_ID` - Yodlee application client ID
- `YODLEE_CLIENT_SECRET` - Yodlee application secret
- `YODLEE_ADMIN_LOGIN` - Admin login for sandbox
- `YODLEE_API_URL` - Yodlee API base URL
- `YODLEE_FASTLINK_URL` - FastLink URL for UI

**Service Health Check:**
```typescript
const isConfigured = yodleeClient.isServiceConfigured();
const status = yodleeClient.getConfigurationStatus();
// Returns: { configured: boolean, missingVars: string[], message: string }
```

## 🧪 TESTING COMPLETED

**API Testing:**
- ✅ Configuration validation (503 responses)
- ✅ Authentication requirements (401 responses)
- ✅ Graceful degradation (empty arrays)
- ✅ Error message clarity
- ✅ Proper HTTP status codes

**Test Scripts:**
- `scripts/test-yodlee-service-direct.js` - Configuration validation
- `scripts/test-yodlee-integration-final.js` - End-to-end API testing

## 📊 MONITORING POINTS

**Success Metrics:**
- Response time < 2000ms for token generation
- 0% 401 errors due to missing configuration
- Clear error messages in logs
- Proper HTTP status codes

**Alert Conditions:**
- Multiple 503 responses (configuration issue)
- High 500 error rate (Yodlee API issues)
- Slow response times (> 5 seconds)

## 🚨 RELIABILITY STATUS

- **Configuration:** ✅ Complete (5/5 variables set)
- **Error Handling:** ✅ Robust (503, 401, 500 responses)
- **Graceful Degradation:** ✅ Implemented
- **User Experience:** ✅ Clear error messages
- **Testing:** ✅ Comprehensive

## 📝 USAGE EXAMPLES

### Frontend API Calls
```typescript
// Check service availability
const response = await fetch('/api/yodlee/fastlink-token', {
  method: 'POST'
});

if (response.status === 503) {
  // Service not configured - show appropriate UI
  setError('Bank connections currently unavailable');
} else if (response.status === 401) {
  // Redirect to login
  router.push('/auth/login');
} else if (response.ok) {
  // Success - proceed with FastLink
  const { token, fastlinkUrl } = await response.json();
}
```

### Backend Service Check
```typescript
import { yodleeClient } from '@/lib/services/yodlee/yodlee-client.service';

if (yodleeClient.isServiceConfigured()) {
  // Safe to make Yodlee API calls
} else {
  // Handle gracefully
  const status = yodleeClient.getConfigurationStatus();
  logger.warn('Yodlee not configured', status);
}
```

---

**API RELIABILITY: ✅ PRODUCTION READY**
- All endpoints validate configuration
- Proper error handling and status codes
- Graceful degradation implemented
- Clear error messages for debugging