# Income Clarity Demo Login Debug Automation Script
param(
    [switch]$RunApp = $false,
    [switch]$KillApp = $false,
    [string]$Port = "3003"
)

Write-Host "🚀 Income Clarity Demo Login Debug Automation" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"
$AppDir = "C:\Development\MasterV2\income-clarity\income-clarity-app"
$ScriptDir = "C:\Development\MasterV2\income-clarity"

# Function to check if app is running
function Test-AppRunning {
    param([string]$Port)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Function to kill processes on port
function Stop-ProcessOnPort {
    param([string]$Port)
    Write-Host "🔍 Checking for processes on port $Port..." -ForegroundColor Yellow
    
    try {
        $processes = netstat -ano | findstr ":$Port"
        if ($processes) {
            Write-Host "Found processes on port ${Port}:" -ForegroundColor Yellow
            Write-Host $processes -ForegroundColor Gray
            
            # Extract PIDs and kill them
            $pids = $processes | ForEach-Object {
                if ($_ -match '\s+(\d+)$') {
                    $matches[1]
                }
            } | Sort-Object -Unique
            
            foreach ($pid in $pids) {
                try {
                    Write-Host "Killing process $pid..." -ForegroundColor Red
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                } catch {
                    Write-Host "Could not kill process $pid" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "No processes found on port ${Port}" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error checking port: $_" -ForegroundColor Red
    }
}

# Kill app if requested
if ($KillApp) {
    Write-Host "🛑 Killing Income Clarity app..." -ForegroundColor Red
    Stop-ProcessOnPort $Port
    exit 0
}

# Check if app is already running
$isRunning = Test-AppRunning $Port
Write-Host "App running status: $isRunning" -ForegroundColor $(if($isRunning) {"Green"} else {"Red"})

# Start app if requested or not running
if ($RunApp -or -not $isRunning) {
    if ($isRunning) {
        Write-Host "⚠️  App already running, stopping first..." -ForegroundColor Yellow
        Stop-ProcessOnPort $Port
        Start-Sleep -Seconds 3
    }
    
    Write-Host "🚀 Starting Income Clarity app..." -ForegroundColor Green
    
    # Change to app directory
    if (-not (Test-Path $AppDir)) {
        Write-Host "❌ App directory not found: $AppDir" -ForegroundColor Red
        exit 1
    }
    
    Set-Location $AppDir
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
        npm install
    }
    
    # Start the app in background
    Write-Host "Starting Next.js dev server on port ${Port}..." -ForegroundColor Blue
    $job = Start-Job -ScriptBlock {
        param($dir, $port)
        Set-Location $dir
        $env:PORT = $port
        npm run dev
    } -ArgumentList $AppDir, $Port
    
    # Wait for app to start
    Write-Host "⏱️  Waiting for app to start..." -ForegroundColor Yellow
    $attempts = 0
    $maxAttempts = 30
    
    do {
        Start-Sleep -Seconds 2
        $attempts++
        $isRunning = Test-AppRunning $Port
        Write-Host "." -NoNewline
        
        if ($attempts -gt $maxAttempts) {
            Write-Host ""
            Write-Host "❌ App failed to start within timeout" -ForegroundColor Red
            Stop-Job $job -ErrorAction SilentlyContinue
            Remove-Job $job -ErrorAction SilentlyContinue
            exit 1
        }
    } while (-not $isRunning)
    
    Write-Host ""
    Write-Host "✅ App started successfully on http://localhost:${Port}" -ForegroundColor Green
    
    # Give app extra time to fully initialize
    Start-Sleep -Seconds 5
}

# Verify app is accessible
if (-not (Test-AppRunning $Port)) {
    Write-Host "❌ App is not accessible on port ${Port}" -ForegroundColor Red
    Write-Host "Please make sure the Income Clarity app is running:" -ForegroundColor Yellow
    Write-Host "  cd $AppDir" -ForegroundColor Gray
    Write-Host "  npm run dev" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ App is running and accessible" -ForegroundColor Green

# Run the demo login debug test
Write-Host ""
Write-Host "🧪 Running demo login debug test..." -ForegroundColor Cyan

# Change to script directory
Set-Location $ScriptDir

# Check if we have the standalone debug script
$debugScript = "debug-login-standalone.js"
if (-not (Test-Path $debugScript)) {
    Write-Host "❌ Debug script not found: $debugScript" -ForegroundColor Red
    exit 1
}

# Check if playwright is available
try {
    $playwrightVersion = npx playwright --version 2>$null
    Write-Host "Playwright version: $playwrightVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Playwright not found. Installing..." -ForegroundColor Red
    npx playwright install
}

# Run the debug script
Write-Host "🎭 Running Playwright debug script..." -ForegroundColor Blue
Write-Host "This will open a browser window to debug the demo login..." -ForegroundColor Yellow

try {
    node $debugScript
    Write-Host "✅ Debug script completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Debug script failed: $_" -ForegroundColor Red
}

# Run the comprehensive Playwright test
Write-Host ""
Write-Host "🧪 Running comprehensive Playwright test suite..." -ForegroundColor Cyan

Set-Location $AppDir

try {
    Write-Host "Running demo login debug test suite..." -ForegroundColor Blue
    npx playwright test e2e/debug-demo-login.spec.ts --reporter=line --headed
    Write-Host "✅ Playwright test suite completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Playwright test failed: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "🏁 Demo login debug automation completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary of what was tested:" -ForegroundColor White
Write-Host "  ✓ App accessibility on localhost:${Port}" -ForegroundColor Green
Write-Host "  ✓ Demo login button visibility and state" -ForegroundColor Green
Write-Host "  ✓ Button click behavior and loading states" -ForegroundColor Green
Write-Host "  ✓ localStorage demo mode activation" -ForegroundColor Green
Write-Host "  ✓ Authentication context state changes" -ForegroundColor Green
Write-Host "  ✓ Navigation and redirect behavior" -ForegroundColor Green
Write-Host "  ✓ JavaScript console errors and logs" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Check the test output above for detailed results" -ForegroundColor Cyan

# Option to keep app running
Write-Host ""
$keepRunning = Read-Host "Keep the app running for manual testing? (y/n) [default: n]"
if ($keepRunning -eq "y" -or $keepRunning -eq "Y") {
    Write-Host "🎯 App will continue running at http://localhost:${Port}" -ForegroundColor Green
    Write-Host "Use Ctrl+C or run this script with -KillApp to stop it" -ForegroundColor Yellow
} else {
    Write-Host "🛑 Stopping the app..." -ForegroundColor Red
    Stop-ProcessOnPort $Port
    Write-Host "✅ App stopped" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Demo login debugging session complete!" -ForegroundColor Cyan