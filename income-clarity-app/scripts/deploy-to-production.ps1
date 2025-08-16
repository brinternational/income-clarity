# ============================================
# Income Clarity Lite Production Deployment Script (Windows)
# Target Server: 137.184.142.42
# ============================================

$ErrorActionPreference = "Stop"

# Configuration
$SERVER_IP = "137.184.142.42"
$APP_DIR = "C:\public\MasterV2\income-clarity\income-clarity-app"
$BACKUP_DIR = "C:\backups\income-clarity"
$LOG_FILE = "C:\logs\deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Colors
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Error { Write-Host $args[0] -ForegroundColor Red; exit 1 }
function Write-Warning { Write-Host $args[0] -ForegroundColor Yellow }

# Logging function
function Write-Log {
    $message = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $($args[0])"
    Write-Success $message
    Add-Content -Path $LOG_FILE -Value $message
}

# ============================================
# Pre-Deployment Checks
# ============================================

Write-Log "Starting Income Clarity Lite Production Deployment..."

# Check Node.js version
$nodeVersion = node -v
if ($nodeVersion -notmatch "v1[89]|v2\d") {
    Write-Error "Node.js 18+ required. Current version: $nodeVersion"
}

# Check if app directory exists
if (!(Test-Path $APP_DIR)) {
    Write-Error "Application directory not found: $APP_DIR"
}

Set-Location $APP_DIR

# ============================================
# Step 1: Backup Current System
# ============================================

Write-Log "Step 1: Creating backup..."

# Create backup directory
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

# Backup database
if (Test-Path "prisma\dev.db") {
    $backupFile = "$BACKUP_DIR\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss').db"
    Copy-Item "prisma\dev.db" $backupFile
    Write-Log "Database backed up to: $backupFile"
} else {
    Write-Warning "No existing database found to backup"
}

# Backup environment file
if (Test-Path ".env.local") {
    Copy-Item ".env.local" "$BACKUP_DIR\.env.local.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Log "Environment file backed up"
}

# ============================================
# Step 2: Check and Kill Existing Process
# ============================================

Write-Log "Step 2: Checking for existing processes on port 3000..."

# CRITICAL: Only kill process on port 3000, NEVER use Stop-Process -Name node
$portProcess = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | 
    Select-Object -ExpandProperty OwningProcess -Unique

if ($portProcess) {
    Write-Warning "Found process on port 3000 (PID: $portProcess)"
    Stop-Process -Id $portProcess -Force
    Write-Log "Killed process on port 3000"
    Start-Sleep -Seconds 2
} else {
    Write-Log "No process found on port 3000"
}

# ============================================
# Step 3: Install Dependencies
# ============================================

Write-Log "Step 3: Installing dependencies..."

# Clean install
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    npm install
}

# ============================================
# Step 4: Database Setup
# ============================================

Write-Log "Step 4: Setting up database..."

# Initialize Prisma
npx prisma generate

# Push schema to database
npx prisma db push --skip-generate

# Run database optimization if script exists
if (Test-Path "lib\database-optimization.sql") {
    Write-Log "Running database optimization..."
    # Note: Requires SQLite CLI to be installed
    # sqlite3 prisma\dev.db < lib\database-optimization.sql
    Write-Warning "Manual database optimization may be required"
}

# ============================================
# Step 5: Environment Configuration
# ============================================

Write-Log "Step 5: Configuring environment..."

# Check if .env.local exists
if (!(Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Warning "Created .env.local from template. Please configure it!"
        Write-Host "Edit .env.local and add your secrets before continuing"
        Read-Host "Press Enter when .env.local is configured..."
    } else {
        Write-Error "No .env.local or .env.example found!"
    }
}

# Check for security keys
$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "ENCRYPTION_KEY=" -or $envContent -notmatch "SESSION_SECRET=") {
    Write-Warning "Security keys not configured in .env.local"
    Write-Log "Generating secure keys..."
    
    # Generate secure keys
    if ($envContent -notmatch "ENCRYPTION_KEY=") {
        $encKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
        Add-Content ".env.local" "ENCRYPTION_KEY=$encKey"
    }
    
    if ($envContent -notmatch "SESSION_SECRET=") {
        $sessionKey = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
        Add-Content ".env.local" "SESSION_SECRET=$sessionKey"
    }
    
    Write-Log "Security keys generated and saved"
}

# ============================================
# Step 6: Build Production Version
# ============================================

Write-Log "Step 6: Building production version..."

# Clean previous build
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Build Next.js application
$env:NODE_ENV = "production"
npm run build

if (!(Test-Path ".next")) {
    Write-Error "Build failed - .next directory not created"
}

# ============================================
# Step 7: Run Tests
# ============================================

Write-Log "Step 7: Running validation tests..."

# Run critical tests
npm run test:week4:quick
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Some tests failed - review before continuing"
}

# ============================================
# Step 8: Create Windows Service (Using NSSM)
# ============================================

Write-Log "Step 8: Setting up Windows service..."

# Check if NSSM is installed
$nssmPath = "C:\tools\nssm\nssm.exe"
if (!(Test-Path $nssmPath)) {
    Write-Warning "NSSM not found. Download from: https://nssm.cc/download"
    Write-Warning "Service setup skipped. Application will need to be started manually."
} else {
    # Remove existing service if present
    & $nssmPath remove "IncomeClarity" confirm 2>$null
    
    # Install new service
    & $nssmPath install "IncomeClarity" "node.exe"
    & $nssmPath set "IncomeClarity" AppDirectory $APP_DIR
    & $nssmPath set "IncomeClarity" AppParameters "node_modules\next\dist\bin\next start"
    & $nssmPath set "IncomeClarity" AppEnvironmentExtra "NODE_ENV=production" "PORT=3000"
    & $nssmPath set "IncomeClarity" Start SERVICE_AUTO_START
    & $nssmPath set "IncomeClarity" AppStdout "$APP_DIR\logs\app.log"
    & $nssmPath set "IncomeClarity" AppStderr "$APP_DIR\logs\error.log"
    
    Write-Log "Windows service configured"
}

# ============================================
# Step 9: Setup Daily Backup Task
# ============================================

Write-Log "Step 9: Setting up automated backups..."

# Create backup script
$backupScript = @'
# Daily Backup Script
$BACKUP_DIR = "C:\backups\income-clarity"
$DB_FILE = "C:\public\MasterV2\income-clarity\income-clarity-app\prisma\dev.db"
$BACKUP_FILE = "$BACKUP_DIR\backup-$(Get-Date -Format 'yyyyMMdd').db"

if (Test-Path $DB_FILE) {
    New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null
    Copy-Item $DB_FILE $BACKUP_FILE
    
    # Remove backups older than 30 days
    Get-ChildItem $BACKUP_DIR -Filter "*.db" | 
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
        Remove-Item
    
    Write-Host "Backup completed: $BACKUP_FILE"
} else {
    Write-Error "Database file not found!"
}
'@

$backupScript | Out-File -FilePath "scripts\daily-backup.ps1" -Encoding UTF8

# Create scheduled task for daily backup at 2 AM
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File `"$APP_DIR\scripts\daily-backup.ps1`""
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount
Register-ScheduledTask -TaskName "IncomeClarity-Backup" -Action $action -Trigger $trigger -Principal $principal -Force

Write-Log "Daily backup scheduled task configured"

# ============================================
# Step 10: Start Application
# ============================================

Write-Log "Step 10: Starting application..."

if (Test-Path $nssmPath) {
    # Start using service
    Start-Service "IncomeClarity"
    Start-Sleep -Seconds 5
    
    $service = Get-Service "IncomeClarity" -ErrorAction SilentlyContinue
    if ($service.Status -eq "Running") {
        Write-Log "Application started successfully as Windows service!"
    } else {
        Write-Error "Failed to start service. Check Event Viewer for details."
    }
} else {
    # Start manually
    Start-Process npm -ArgumentList "run start" -WindowStyle Hidden
    Write-Log "Application started manually. Consider installing NSSM for service management."
}

# ============================================
# Step 11: Verify Deployment
# ============================================

Write-Log "Step 11: Verifying deployment..."

Start-Sleep -Seconds 3

# Check if application is responding
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Log "✅ Application is running and healthy!"
    }
} catch {
    Write-Warning "Application may not be fully started. Please check manually."
}

# ============================================
# Post-Deployment Summary
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Success "DEPLOYMENT COMPLETE!"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application URL: http://${SERVER_IP}:3000"
Write-Host "Health Check: http://${SERVER_IP}:3000/api/health"
Write-Host "Security Status: http://${SERVER_IP}:3000/api/security/status"
Write-Host ""
Write-Host "Useful Commands:"
Write-Host "  View logs:        Get-Content logs\app.log -Tail 50 -Wait"
Write-Host "  Restart app:      Restart-Service IncomeClarity"
Write-Host "  Stop app:         Stop-Service IncomeClarity"
Write-Host "  Check status:     Get-Service IncomeClarity"
Write-Host "  Manual backup:    .\scripts\daily-backup.ps1"
Write-Host ""
Write-Host "⚠️  IMPORTANT REMINDERS:" -ForegroundColor Yellow
Write-Host "  1. NEVER use Stop-Process -Name node"
Write-Host "  2. Always backup before updates"
Write-Host "  3. Monitor logs for first 24 hours"
Write-Host "  4. Test all critical features"
Write-Host ""
Write-Host "Deployment log saved to: $LOG_FILE"
Write-Host "============================================" -ForegroundColor Cyan

# Create quick status check script
@'
# Income Clarity Status Check
Write-Host "Income Clarity Status Check" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan

# Service Status
$service = Get-Service "IncomeClarity" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Service Status: $($service.Status)" -ForegroundColor Green
} else {
    Write-Host "Service not found (running manually?)" -ForegroundColor Yellow
}

# Port Status
$port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port) {
    Write-Host "Port 3000: Active (PID: $($port.OwningProcess[0]))" -ForegroundColor Green
} else {
    Write-Host "Port 3000: Not listening" -ForegroundColor Red
}

# Health Check
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -TimeoutSec 5
    Write-Host "Health Check: OK" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "Health Check: Failed" -ForegroundColor Red
}

# Recent Logs
Write-Host "`nRecent Logs:" -ForegroundColor Cyan
if (Test-Path "logs\app.log") {
    Get-Content "logs\app.log" -Tail 10
}
'@ | Out-File -FilePath "check-status.ps1" -Encoding UTF8

Write-Log "Created check-status.ps1 for quick health checks"