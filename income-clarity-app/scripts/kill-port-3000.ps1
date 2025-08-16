# kill-port-3000.ps1 - ENFORCE SINGLE SERVER RULE
# Kills all processes on port 3000 before starting development server

Write-Host ""
Write-Host "🚨 ENFORCING SINGLE SERVER RULE - PORT 3000 ONLY" -ForegroundColor Red -BackgroundColor Black
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red

# Check if port 3000 is in use
$processes = netstat -ano | findstr ":3000"

if ($processes) {
    Write-Host ""
    Write-Host "❌ FOUND EXISTING PROCESSES ON PORT 3000:" -ForegroundColor Yellow
    Write-Host $processes
    Write-Host ""
    Write-Host "🔪 KILLING ALL PROCESSES..." -ForegroundColor Red
    
    # Extract PIDs and kill them
    $killedPids = @()
    $processes | ForEach-Object {
        $line = $_.Trim()
        if ($line -match '\s+(\d+)\s*$') {
            $processId = $matches[1]
            try {
                $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "  🎯 Killing PID $processId ($($process.ProcessName))" -ForegroundColor Yellow
                    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                    $killedPids += $processId
                }
            }
            catch {
                # Process might already be gone
            }
        }
    }
    
    if ($killedPids.Count -gt 0) {
        Write-Host ""
        Write-Host "⏳ Waiting for cleanup..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
        
        # Verify processes are gone
        $remaining = @()
        $killedPids | ForEach-Object {
            try {
                $process = Get-Process -Id $_ -ErrorAction SilentlyContinue
                if ($process) {
                    $remaining += $_
                }
            }
            catch {
                # Process is gone, good
            }
        }
        
        if ($remaining.Count -gt 0) {
            Write-Host "⚠️  Some processes are still running, forcing kill..." -ForegroundColor Yellow
            $remaining | ForEach-Object {
                try {
                    Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
                }
                catch {
                    # Ignore errors
                }
            }
            Start-Sleep -Seconds 2
        }
    }
}

# Final verification
$finalCheck = netstat -ano | findstr ":3000"
if ($finalCheck) {
    Write-Host ""
    Write-Host "💥 CRITICAL: FAILED TO CLEAR PORT 3000!" -ForegroundColor White -BackgroundColor Red
    Write-Host "Remaining processes:" -ForegroundColor Red
    Write-Host $finalCheck
    Write-Host ""
    Write-Host "🚨 ABORTING - Cannot start with port conflict" -ForegroundColor Red
    Write-Host "Manual intervention required:"
    Write-Host "1. Check Task Manager for remaining Node.js processes" -ForegroundColor Yellow
    Write-Host "2. Kill manually or restart your IDE" -ForegroundColor Yellow
    Write-Host "3. As last resort: taskkill /F /IM node.exe" -ForegroundColor Yellow
    Write-Host ""
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ SUCCESS: PORT 3000 IS CLEAR AND READY" -ForegroundColor Green -BackgroundColor Black
    Write-Host "🚀 Safe to start development server" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
}

# Show current Node.js processes (should be minimal)
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "📋 Current Node.js processes:" -ForegroundColor Cyan
    $nodeProcesses | ForEach-Object {
        Write-Host "  🔹 PID $($_.Id): $($_.ProcessName) (Started: $($_.StartTime.ToString('HH:mm:ss')))" -ForegroundColor Gray
    }
    Write-Host ""
}