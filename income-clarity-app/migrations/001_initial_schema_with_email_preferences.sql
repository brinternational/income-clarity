-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "settings" TEXT,
    "taxProfile" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "portfolios" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "institution" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "portfolios_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "holdings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "portfolioId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "costBasis" REAL NOT NULL,
    "purchaseDate" DATETIME NOT NULL,
    "currentPrice" REAL,
    "dividendYield" REAL,
    "sector" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "holdings_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "portfolioId" TEXT,
    "ticker" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "shares" REAL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "incomes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "incomes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "essential" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_prices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "open" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "close" REAL NOT NULL,
    "volume" INTEGER NOT NULL,
    "adjustedClose" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "dividend_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "exDate" DATETIME NOT NULL,
    "payDate" DATETIME NOT NULL,
    "recordDate" DATETIME,
    "amount" REAL NOT NULL,
    "frequency" TEXT NOT NULL,
    "paymentType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "calculation_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cacheKey" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "locale" TEXT NOT NULL DEFAULT 'en-US',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "notifications" TEXT,
    "privacy" TEXT,
    "features" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tax_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "state" TEXT,
    "filingStatus" TEXT NOT NULL DEFAULT 'single',
    "federalBracket" REAL NOT NULL DEFAULT 0.22,
    "stateBracket" REAL NOT NULL DEFAULT 0.0,
    "qualifiedDividendRate" REAL NOT NULL DEFAULT 0.15,
    "capitalGainsRate" REAL NOT NULL DEFAULT 0.15,
    "effectiveRate" REAL NOT NULL DEFAULT 0.22,
    "marginalRate" REAL NOT NULL DEFAULT 0.22,
    "taxYear" INTEGER NOT NULL DEFAULT 2024,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "financial_goals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetAmount" REAL NOT NULL,
    "currentAmount" REAL NOT NULL DEFAULT 0.0,
    "targetDate" DATETIME,
    "category" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "performance_snapshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "totalValue" REAL NOT NULL,
    "totalCostBasis" REAL NOT NULL,
    "totalGainLoss" REAL NOT NULL,
    "totalReturn" REAL NOT NULL,
    "dividendIncome" REAL NOT NULL,
    "spyPrice" REAL,
    "spyReturn" REAL,
    "monthlyIncome" REAL NOT NULL,
    "monthlyExpenses" REAL NOT NULL,
    "netIncome" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "email_preferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "frequency" TEXT NOT NULL DEFAULT 'immediate',
    "categories" TEXT NOT NULL DEFAULT '{}',
    "lastEmailSent" DATETIME,
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_sessionToken_idx" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "holdings_portfolioId_ticker_key" ON "holdings"("portfolioId", "ticker");

-- CreateIndex
CREATE INDEX "transactions_userId_date_idx" ON "transactions"("userId", "date");

-- CreateIndex
CREATE INDEX "transactions_ticker_type_idx" ON "transactions"("ticker", "type");

-- CreateIndex
CREATE INDEX "incomes_userId_date_idx" ON "incomes"("userId", "date");

-- CreateIndex
CREATE INDEX "incomes_category_date_idx" ON "incomes"("category", "date");

-- CreateIndex
CREATE INDEX "expenses_userId_date_idx" ON "expenses"("userId", "date");

-- CreateIndex
CREATE INDEX "expenses_category_date_idx" ON "expenses"("category", "date");

-- CreateIndex
CREATE INDEX "stock_prices_ticker_date_idx" ON "stock_prices"("ticker", "date");

-- CreateIndex
CREATE UNIQUE INDEX "stock_prices_ticker_date_key" ON "stock_prices"("ticker", "date");

-- CreateIndex
CREATE INDEX "dividend_schedules_ticker_exDate_idx" ON "dividend_schedules"("ticker", "exDate");

-- CreateIndex
CREATE INDEX "dividend_schedules_payDate_idx" ON "dividend_schedules"("payDate");

-- CreateIndex
CREATE UNIQUE INDEX "dividend_schedules_ticker_exDate_key" ON "dividend_schedules"("ticker", "exDate");

-- CreateIndex
CREATE UNIQUE INDEX "calculation_cache_cacheKey_key" ON "calculation_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "calculation_cache_expiresAt_idx" ON "calculation_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "tax_profiles_userId_key" ON "tax_profiles"("userId");

-- CreateIndex
CREATE INDEX "financial_goals_userId_isActive_idx" ON "financial_goals"("userId", "isActive");

-- CreateIndex
CREATE INDEX "performance_snapshots_userId_date_idx" ON "performance_snapshots"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_userId_key" ON "email_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_preferences_emailVerificationToken_key" ON "email_preferences"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "email_preferences_userId_idx" ON "email_preferences"("userId");

-- CreateIndex
CREATE INDEX "email_preferences_email_idx" ON "email_preferences"("email");

