# Yodlee Integration Workflow for Income Clarity

## 🎯 Executive Summary
Integrate Yodlee's financial data aggregation service to replace mock data with real bank account information, transforming Income Clarity into a production-ready personal finance dashboard.

## 📋 Integration Overview

### Credentials & Endpoints
```yaml
Environment: Sandbox
API Endpoint: https://sandbox.api.yodlee.com/ysl
FastLink URL: https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink
Admin Login: 64258b9a-24a6-4eb8-b2b3-931ee52d16b1_ADMIN
Client ID: hIMLADvwd0f6Hmu4nuIE4WXdZRdGlrVnfhoGsVfNA19jnMVj
```

### Documentation Resources
- FastLink 4 Overview: https://developer.yodlee.com/resources/yodlee/fastlink-4/docs/overview
- Client Credentials: https://developer.yodlee.com/resources/yodlee/client-credentials-authorization/docs/environments

## 🏗️ Architecture Design

### System Architecture
```
┌─────────────────────────────────────────┐
│         Income Clarity Frontend          │
├─────────────────────────────────────────┤
│     FastLink 4 Embedded Component        │
├─────────────────────────────────────────┤
│         Yodlee Service Layer             │
│  ├── Authentication Service              │
│  ├── Data Sync Service                   │
│  └── Data Mapper Service                 │
├─────────────────────────────────────────┤
│           Yodlee API Gateway             │
│      (Client Credentials OAuth)          │
├─────────────────────────────────────────┤
│         Database (Prisma/SQLite)         │
│    ├── yodlee_connections table          │
│    ├── synced_accounts table             │
│    └── encrypted_tokens table            │
└─────────────────────────────────────────┘
```

## 📅 Implementation Phases

### Phase 1: Foundation & Authentication (Week 1)

#### Day 1-2: Service Layer Setup
```typescript
// /lib/services/yodlee/yodlee-client.service.ts
export class YodleeClient {
  private baseUrl = process.env.YODLEE_API_URL;
  private clientId = process.env.YODLEE_CLIENT_ID;
  private adminLogin = process.env.YODLEE_ADMIN_LOGIN;
  
  async getAccessToken(): Promise<string> {
    // Implement client credentials flow
  }
  
  async createUser(email: string): Promise<YodleeUser> {
    // Create Yodlee user for Income Clarity user
  }
}
```

#### Day 3-4: Database Schema
```prisma
model YodleeConnection {
  id              String   @id @default(uuid())
  userId          String   @unique
  yodleeUserId    String
  accessToken     String   // Encrypted
  refreshToken    String?  // Encrypted
  lastSyncedAt    DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user            User     @relation(fields: [userId], references: [id])
}

model SyncedAccount {
  id              String   @id @default(uuid())
  connectionId    String
  yodleeAccountId String   @unique
  accountName     String
  accountType     String   // CHECKING, SAVINGS, INVESTMENT, etc.
  balance         Float
  currency        String
  lastRefreshed   DateTime
  
  connection      YodleeConnection @relation(fields: [connectionId], references: [id])
}
```

#### Day 5: Environment Configuration
```env
# .env.local
YODLEE_API_URL=https://sandbox.api.yodlee.com/ysl
YODLEE_FASTLINK_URL=https://fl4.sandbox.yodlee.com/authenticate/restserver/fastlink
YODLEE_CLIENT_ID=hIMLADvwd0f6Hmu4nuIE4WXdZRdGlrVnfhoGsVfNA19jnMVj
YODLEE_ADMIN_LOGIN=64258b9a-24a6-4eb8-b2b3-931ee52d16b1_ADMIN
YODLEE_API_VERSION=1.1
ENCRYPTION_KEY=<generate-secure-key>
```

### Phase 2: FastLink Integration (Week 2)

#### Day 6-7: FastLink Component
```typescript
// /components/yodlee/FastLinkConnect.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function FastLinkConnect() {
  const [fastlinkUrl, setFastlinkUrl] = useState<string>('')
  const { data: session } = useSession()
  
  useEffect(() => {
    if (session?.user) {
      initializeFastLink()
    }
  }, [session])
  
  const initializeFastLink = async () => {
    const response = await fetch('/api/yodlee/fastlink-token')
    const { token, fastlinkUrl } = await response.json()
    
    // Embed FastLink in iframe
    setFastlinkUrl(`${fastlinkUrl}?token=${token}`)
  }
  
  return (
    <div className="fastlink-container">
      <iframe 
        src={fastlinkUrl}
        width="100%"
        height="600px"
        frameBorder="0"
      />
    </div>
  )
}
```

#### Day 8-9: API Endpoints
```typescript
// /app/api/yodlee/callback/route.ts
export async function POST(request: Request) {
  const { userId, accounts } = await request.json()
  
  // Store linked accounts
  await prisma.syncedAccount.createMany({
    data: accounts.map(account => ({
      connectionId: userId,
      yodleeAccountId: account.id,
      accountName: account.accountName,
      accountType: account.accountType,
      balance: account.balance.amount,
      currency: account.balance.currency
    }))
  })
  
  return NextResponse.json({ success: true })
}
```

#### Day 10: Integration UI
```typescript
// Add to /app/dashboard/settings/page.tsx
<Card>
  <CardHeader>
    <CardTitle>Bank Connections</CardTitle>
    <CardDescription>
      Connect your bank accounts for automatic data import
    </CardDescription>
  </CardHeader>
  <CardContent>
    <FastLinkConnect onSuccess={handleAccountLinked} />
    <ConnectedAccountsList />
  </CardContent>
</Card>
```

### Phase 3: Data Synchronization (Week 3)

#### Day 11-12: Data Mapper Service
```typescript
// /lib/services/yodlee/yodlee-data-mapper.service.ts
export class YodleeDataMapper {
  // Map Yodlee transactions to Income Clarity format
  mapTransactions(yodleeTransactions: YodleeTransaction[]): Transaction[] {
    return yodleeTransactions.map(tx => ({
      id: tx.id,
      amount: tx.amount.amount,
      date: new Date(tx.transactionDate),
      description: tx.description.original,
      category: this.mapCategory(tx.category),
      type: tx.baseType === 'CREDIT' ? 'income' : 'expense'
    }))
  }
  
  // Map investment holdings
  mapHoldings(yodleeHoldings: YodleeHolding[]): Holding[] {
    return yodleeHoldings.map(holding => ({
      ticker: holding.symbol,
      shares: holding.quantity,
      costBasis: holding.costBasis,
      currentPrice: holding.price,
      accountId: holding.accountId
    }))
  }
  
  // Map account balances
  mapAccounts(yodleeAccounts: YodleeAccount[]): Portfolio[] {
    return yodleeAccounts.map(account => ({
      name: account.accountName,
      type: this.mapAccountType(account.accountType),
      balance: account.balance.amount,
      lastUpdated: new Date(account.lastUpdated)
    }))
  }
}
```

#### Day 13-14: Sync Service
```typescript
// /lib/services/yodlee/yodlee-sync.service.ts
export class YodleeSyncService {
  async syncUserData(userId: string) {
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId }
    })
    
    if (!connection) throw new Error('No Yodlee connection found')
    
    // Fetch latest data from Yodlee
    const accounts = await this.yodleeClient.getAccounts(connection.accessToken)
    const transactions = await this.yodleeClient.getTransactions(connection.accessToken)
    const holdings = await this.yodleeClient.getHoldings(connection.accessToken)
    
    // Map and store data
    await this.updatePortfolios(userId, accounts)
    await this.updateTransactions(userId, transactions)
    await this.updateHoldings(userId, holdings)
    
    // Update Super Cards data
    await this.updateSuperCardsData(userId)
    
    // Update last synced timestamp
    await prisma.yodleeConnection.update({
      where: { userId },
      data: { lastSyncedAt: new Date() }
    })
  }
}
```

#### Day 15: Super Cards Integration
```typescript
// Modify /lib/services/super-cards-database.service.ts
async getPerformanceHubData(): Promise<PerformanceHubData | null> {
  const user = await this.getCurrentUser()
  
  // Check for Yodlee connection
  const yodleeConnection = await prisma.yodleeConnection.findUnique({
    where: { userId: user.id }
  })
  
  if (yodleeConnection) {
    // Use real synced data
    const syncedAccounts = await prisma.syncedAccount.findMany({
      where: { connectionId: yodleeConnection.id }
    })
    
    const portfolioValue = syncedAccounts.reduce(
      (sum, account) => sum + account.balance, 
      0
    )
    
    // Return real data
    return {
      portfolioValue,
      // ... other real metrics
    }
  }
  
  // Fallback to existing logic
  return this.getDefaultPerformanceHubData()
}
```

### Phase 4: Production Features (Week 4)

#### Day 16-17: Automatic Refresh
```typescript
// /app/api/yodlee/refresh/route.ts
export async function POST(request: Request) {
  const { userId } = await request.json()
  
  // Trigger manual refresh
  await yodleeSyncService.syncUserData(userId)
  
  return NextResponse.json({ 
    success: true, 
    message: 'Data refreshed successfully' 
  })
}

// Add cron job for daily refresh
// /lib/services/yodlee/yodlee-scheduler.service.ts
export class YodleeScheduler {
  async runDailySync() {
    const connections = await prisma.yodleeConnection.findMany({
      where: { isActive: true }
    })
    
    for (const connection of connections) {
      await this.syncService.syncUserData(connection.userId)
      await this.notifyUser(connection.userId, 'sync_complete')
    }
  }
}
```

#### Day 18-19: Error Handling
```typescript
// /lib/services/yodlee/yodlee-error-handler.ts
export class YodleeErrorHandler {
  handleError(error: YodleeError) {
    switch (error.errorCode) {
      case 'INVALID_CREDENTIALS':
        return this.handleInvalidCredentials(error)
      case 'ACCOUNT_LOCKED':
        return this.handleAccountLocked(error)
      case 'MFA_REQUIRED':
        return this.handleMFARequired(error)
      default:
        return this.handleGenericError(error)
    }
  }
}
```

#### Day 20: Testing & Documentation
- Test with Yodlee sandbox accounts
- Document API integration
- Create user guide for bank linking
- Performance testing with real data

## 📊 Data Flow Diagram

```
User Action → FastLink UI → Yodlee API → OAuth Flow
                ↓
        Account Selection
                ↓
        Consent & MFA
                ↓
        Token Generation
                ↓
    Income Clarity Callback
                ↓
        Store Connection
                ↓
        Initial Data Sync
                ↓
    Update Super Cards Data
                ↓
    Display Real Financials
```

## 🔒 Security Considerations

1. **Token Encryption**: All access/refresh tokens encrypted at rest
2. **Secure Storage**: Use environment variables for credentials
3. **HTTPS Only**: All API calls over HTTPS
4. **Rate Limiting**: Implement rate limiting for API calls
5. **Audit Logging**: Log all data access for compliance
6. **User Consent**: Clear consent flow for data access
7. **Data Retention**: Define data retention policies

## 📈 Success Metrics

- **Integration Success Rate**: >95% successful account linking
- **Data Freshness**: <24 hours for all synced data
- **Sync Performance**: <5 seconds for full account refresh
- **Error Rate**: <2% failed sync attempts
- **User Adoption**: >80% users link at least one account

## 🚀 Immediate Next Steps

1. **Create Yodlee service directory structure**
2. **Set up environment variables**
3. **Implement authentication service**
4. **Create FastLink component**
5. **Test with sandbox credentials**

## 📝 Testing Checklist

- [ ] Authentication flow works
- [ ] FastLink loads correctly
- [ ] Account linking successful
- [ ] Data syncs to database
- [ ] Super Cards show real data
- [ ] Error handling works
- [ ] Refresh mechanism functions
- [ ] Security measures in place

---

**Estimated Timeline**: 4 weeks from start to production-ready
**Complexity**: High
**Impact**: Transforms Income Clarity from demo to real financial dashboard