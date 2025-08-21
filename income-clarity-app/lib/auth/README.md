# Authentication Debug System

A comprehensive debugging and monitoring system for authentication state and events in Income Clarity.

## 🎯 Purpose

The Auth Debug System provides real-time visibility into authentication processes, helping developers quickly diagnose authentication issues and understand auth state changes.

## 📁 Components

### Core Service: `auth-debug.service.ts`
- **Event Tracking**: Structured logging of all auth events
- **Performance Monitoring**: Duration tracking for auth operations
- **Error Tracking**: Detailed error logging with context
- **Statistics**: Real-time metrics and analytics
- **Memory Buffer**: In-memory storage of recent events (last 1000 events)

### API Endpoint: `/api/auth/debug`
- **GET**: Retrieve debug data, statistics, and system health
- **POST**: Perform debug actions (clear events, toggle logging)
- **Security**: Only available in development mode or when explicitly enabled

### Debug Panel: `AuthDebugPanel.tsx`
- **Real-time Dashboard**: Live view of auth state and events
- **Event Timeline**: Chronological list of auth events with details
- **Statistics View**: Metrics and performance data
- **Troubleshooting Guide**: Common issues and debug steps
- **Interactive Controls**: Clear events, toggle debug logging

### Enhanced AuthContext
- **Integrated Tracking**: All auth operations now tracked automatically
- **Structured Logging**: Replaces console.log with structured events
- **Performance Metrics**: Timing data for all auth operations
- **Error Context**: Rich error information with debugging hints

## 🚀 Quick Start

### 1. Access the Debug Dashboard
```
http://localhost:3000/debug/auth
```
*Available only in development mode*

### 2. Use Console Debugging
```javascript
// Available in browser console when AuthContext is loaded
window.authDebug.getStats()          // Get current statistics
window.authDebug.getEvents()         // Get recent events
window.authDebug.setEnabled(true)    // Enable debug logging
window.authDebug.clear()             // Clear event history
```

### 3. API Access
```bash
# Get debug data
curl http://localhost:3000/api/auth/debug

# Clear events
curl -X POST http://localhost:3000/api/auth/debug \
  -H "Content-Type: application/json" \
  -d '{"action": "clear_events"}'

# Toggle debug logging
curl -X POST http://localhost:3000/api/auth/debug \
  -H "Content-Type: application/json" \
  -d '{"action": "set_debug_enabled", "enabled": true}'
```

## 📊 Event Types

| Event Type | Description | When Triggered |
|------------|-------------|----------------|
| `session_check` | Session validation started | AuthContext session check |
| `session_validated` | Session successfully validated | Valid session response |
| `session_invalid` | Session validation failed | Invalid/expired session |
| `session_refresh` | Session refresh attempted | Middleware or manual refresh |
| `sign_in_attempt` | Sign in process started | User clicks sign in |
| `sign_in_success` | Sign in completed successfully | Valid credentials |
| `sign_in_failure` | Sign in failed | Invalid credentials/error |
| `sign_out` | User signed out | Logout initiated |
| `user_state_change` | User object changed | setUser() called |
| `loading_state_change` | Loading state changed | setLoading() called |
| `auth_state_calculation` | isAuthenticated calculated | AuthContext render |
| `session_retry` | Session check retry scheduled | Network/server error retry |
| `network_error` | Network request failed | Fetch error |
| `server_error` | Server returned error status | 5xx response |
| `middleware_refresh` | Session auto-refreshed | Middleware refresh header |
| `route_protection` | Protected route redirect | Unauthorized access attempt |

## 🎛️ Configuration

### Environment Variables
```env
# Enable debug in production (not recommended)
AUTH_DEBUG=true

# Enable all debug endpoints
ENABLE_DEBUG_ENDPOINTS=true

# Log level (affects structured logging)
LOG_LEVEL=debug
```

### Debug Service Settings
```typescript
// In auth-debug.service.ts
const maxEvents = 1000;  // Event buffer size
const debugEnabled = process.env.NODE_ENV === 'development' || process.env.AUTH_DEBUG === 'true';
```

## 🔍 Debugging Workflow

### 1. Common Authentication Issues

#### User Not Authenticated After Login
```javascript
// Check recent events
window.authDebug.getEvents().filter(e => e.type.includes('sign_in'))

// Look for:
// - sign_in_attempt without sign_in_success
// - session_check failures after sign_in_success
// - network_error or server_error events
```

#### Session Expires Too Quickly
```javascript
// Check session statistics
window.authDebug.getStats().sessionStats

// Look for:
// - High failedChecks count
// - Low averageCheckDuration (network issues)
// - Recent session_invalid events
```

#### Authentication State Flickering
```javascript
// Check state changes
window.authDebug.getEvents().filter(e => 
  e.type === 'auth_state_calculation' || 
  e.type === 'loading_state_change'
)

// Look for:
// - Rapid state changes
// - Multiple concurrent session_check events
// - Loading state not being cleared
```

### 2. Performance Analysis

```javascript
// Get timing statistics
const stats = window.authDebug.getStats();
console.log('Average session check time:', stats.sessionStats.averageCheckDuration, 'ms');

// Find slow operations
window.authDebug.getEvents()
  .filter(e => e.duration && e.duration > 1000)
  .forEach(e => console.log(`Slow ${e.type}: ${e.duration}ms`));
```

### 3. Error Analysis

```javascript
// Get recent errors
const errors = window.authDebug.getStats().recentErrors;
errors.forEach(error => {
  console.log(`${error.type}: ${error.message}`);
  console.log('Context:', error.context);
  console.log('Error details:', error.error);
});
```

## 🛡️ Security Considerations

- **Development Only**: Debug features are disabled in production by default
- **No Sensitive Data**: Passwords and tokens are automatically sanitized
- **Memory Management**: Event buffer is limited to prevent memory leaks
- **Access Control**: Debug endpoints require explicit enablement
- **Structured Logging**: Integrates with production logging for security audits

## 🧪 Testing

### Manual Testing
```bash
# Run the test script
node scripts/test-auth-debug.js
```

### Integration Testing
```javascript
// In tests, access the debug service
import { authDebug, AuthEventType } from '@/lib/auth/auth-debug.service';

beforeEach(() => {
  authDebug.clear();
  authDebug.setEnabled(true);
});

test('tracks sign in events', async () => {
  const completeSignIn = authDebug.signIn('test@example.com');
  // ... perform sign in
  completeSignIn(true, mockUser);
  
  const events = authDebug.getEvents();
  expect(events.some(e => e.type === AuthEventType.SIGN_IN_SUCCESS)).toBe(true);
});
```

## 📈 Monitoring & Metrics

The debug system provides comprehensive metrics:

- **Event Counts**: Number of each event type
- **Performance Metrics**: Average durations, memory usage
- **Error Rates**: Failed vs successful operations
- **User Statistics**: Current user state, session age
- **System Health**: Uptime, memory usage, Node.js version

## 🔧 Extending the System

### Adding New Event Types
```typescript
// 1. Add to AuthEventType enum
export enum AuthEventType {
  // ... existing types
  CUSTOM_EVENT = 'custom_event'
}

// 2. Track the event
authDebug.event(AuthEventType.CUSTOM_EVENT, 'Custom event occurred', {
  customData: 'value'
});
```

### Custom Debug Components
```tsx
import { useEffect, useState } from 'react';
import { authDebug } from '@/lib/auth/auth-debug.service';

function CustomDebugComponent() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setEvents(authDebug.getEvents(10));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.message}</div>
      ))}
    </div>
  );
}
```

## 🎯 Best Practices

1. **Enable in Development**: Always enable debug logging during development
2. **Monitor Performance**: Use timing data to identify bottlenecks
3. **Check Error Patterns**: Look for recurring error types
4. **Clear Periodically**: Clear event history to prevent memory buildup
5. **Test Edge Cases**: Use debug data to verify error handling
6. **Document Issues**: Use event data when reporting bugs

## 📞 Troubleshooting Commands

```javascript
// Quick health check
window.authDebug.getStats()

// Recent authentication activity
window.authDebug.getEvents().slice(0, 5)

// Find errors in last 10 events
window.authDebug.getEvents(10).filter(e => e.error)

// Check current auth state calculation
window.authDebug.getEvents().find(e => e.type === 'auth_state_calculation')

// Performance analysis
window.authDebug.getEvents()
  .filter(e => e.duration)
  .sort((a, b) => b.duration - a.duration)
  .slice(0, 5)
```

---

**🔐 The Auth Debug System makes authentication issues instantly diagnosable!**