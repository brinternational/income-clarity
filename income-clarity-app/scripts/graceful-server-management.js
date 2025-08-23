#!/usr/bin/env node

/**
 * Graceful Server Management System
 * 
 * Provides safe server management operations that protect critical services
 * while allowing controlled management of the Income Clarity application server.
 * 
 * CRITICAL PROTECTION RULES:
 * - PORT 22: SSH connection to Claude Code CLI - NEVER KILL
 * - PORT 8080: Critical services - NEVER KILL  
 * - Claude Code CLI processes - NEVER KILL
 * - Income Clarity server - GRACEFUL MANAGEMENT ONLY
 */

const { execSync, exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  PROTECTED_PORTS: [22, 8080], // Never kill these ports
  INCOME_CLARITY_PORT: 3000,   // Graceful management only
  PROTECTED_PROCESSES: [
    'claude',                    // Claude Code CLI main process
    'mcp-server',               // MCP servers
    'sshd',                     // SSH daemon
    'code-server'               // VSCode server
  ],
  INCOME_CLARITY_PROCESS: 'custom-server.js',
  GRACE_PERIOD_MS: 10000,     // 10 seconds for graceful shutdown
  HEALTH_CHECK_TIMEOUT_MS: 30000, // 30 seconds for health validation
  LOG_FILE: path.join(__dirname, '..', 'logs', 'server-management.log')
};

class GracefulServerManager {
  constructor() {
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    const logDir = path.dirname(CONFIG.LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Log with timestamp
   */
  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    console.log(logMessage);
    
    try {
      fs.appendFileSync(CONFIG.LOG_FILE, logMessage + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err.message);
    }
  }

  /**
   * Execute command safely with error handling
   */
  execSafe(command, options = {}) {
    try {
      return execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        ...options 
      }).trim();
    } catch (error) {
      this.log(`Command failed: ${command} - ${error.message}`, 'ERROR');
      return null;
    }
  }

  /**
   * Service Discovery: Identify all running processes safely
   */
  discoverServices() {
    this.log('Starting service discovery...');
    
    const services = {
      protected: [],
      incomeClarity: null,
      other: []
    };

    try {
      // Get all node processes with details
      const psOutput = this.execSafe('ps aux | grep -E "(node|ssh|claude)" | grep -v grep');
      if (!psOutput) {
        this.log('No processes found in service discovery', 'WARN');
        return services;
      }

      const processes = psOutput.split('\n').filter(line => line.trim());
      
      for (const processLine of processes) {
        const parts = processLine.trim().split(/\s+/);
        if (parts.length < 11) continue;

        const pid = parseInt(parts[1]);
        const command = parts.slice(10).join(' ');
        
        // Categorize processes
        if (this.isProtectedProcess(command)) {
          services.protected.push({ pid, command });
          this.log(`Protected process: PID ${pid} - ${command}`);
        } else if (command.includes(CONFIG.INCOME_CLARITY_PROCESS)) {
          services.incomeClarity = { pid, command };
          this.log(`Income Clarity server: PID ${pid} - ${command}`);
        } else {
          services.other.push({ pid, command });
        }
      }

      // Check port usage
      const portOutput = this.execSafe('ss -tulpn');
      if (portOutput) {
        this.analyzePortUsage(portOutput, services);
      }

    } catch (error) {
      this.log(`Service discovery failed: ${error.message}`, 'ERROR');
    }

    return services;
  }

  /**
   * Check if a process is protected (should never be killed)
   */
  isProtectedProcess(command) {
    return CONFIG.PROTECTED_PROCESSES.some(pattern => 
      command.toLowerCase().includes(pattern.toLowerCase())
    );
  }

  /**
   * Analyze port usage for additional safety checks
   */
  analyzePortUsage(portOutput, services) {
    const lines = portOutput.split('\n');
    
    for (const line of lines) {
      for (const port of CONFIG.PROTECTED_PORTS) {
        if (line.includes(`:${port} `)) {
          this.log(`Protected port ${port} in use: ${line.trim()}`);
        }
      }
      
      if (line.includes(`:${CONFIG.INCOME_CLARITY_PORT} `)) {
        const pidMatch = line.match(/pid=(\d+)/);
        if (pidMatch) {
          const pid = parseInt(pidMatch[1]);
          this.log(`Income Clarity server on port ${CONFIG.INCOME_CLARITY_PORT}: PID ${pid}`);
          
          // Verify this matches our discovered process
          if (services.incomeClarity && services.incomeClarity.pid !== pid) {
            this.log(`WARNING: Port analysis PID ${pid} doesn't match process discovery PID ${services.incomeClarity.pid}`, 'WARN');
          }
        }
      }
    }
  }

  /**
   * Graceful shutdown of Income Clarity server
   */
  async gracefulShutdown(pid) {
    this.log(`Starting graceful shutdown of Income Clarity server (PID: ${pid})`);

    try {
      // Step 1: Send SIGTERM for graceful shutdown
      this.log(`Sending SIGTERM to PID ${pid}`);
      process.kill(pid, 'SIGTERM');

      // Step 2: Wait for graceful shutdown
      this.log(`Waiting ${CONFIG.GRACE_PERIOD_MS}ms for graceful shutdown...`);
      await this.waitForProcessExit(pid, CONFIG.GRACE_PERIOD_MS);

      // Step 3: Check if process still exists
      if (this.isProcessRunning(pid)) {
        this.log(`Process ${pid} still running after SIGTERM, sending SIGKILL`, 'WARN');
        process.kill(pid, 'SIGKILL');
        await this.waitForProcessExit(pid, 5000);
      }

      if (!this.isProcessRunning(pid)) {
        this.log(`Income Clarity server (PID: ${pid}) successfully terminated`);
        return true;
      } else {
        this.log(`Failed to terminate process ${pid}`, 'ERROR');
        return false;
      }

    } catch (error) {
      if (error.code === 'ESRCH') {
        this.log(`Process ${pid} was already terminated`);
        return true;
      } else {
        this.log(`Error during shutdown: ${error.message}`, 'ERROR');
        return false;
      }
    }
  }

  /**
   * Check if a process is still running
   */
  isProcessRunning(pid) {
    try {
      process.kill(pid, 0); // Signal 0 just checks if process exists
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for process to exit
   */
  async waitForProcessExit(pid, timeoutMs) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (!this.isProcessRunning(pid)) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    return false; // Timeout reached
  }

  /**
   * Start Income Clarity server
   */
  async startServer() {
    this.log('Starting Income Clarity server...');

    const cwd = path.join(__dirname, '..');
    
    try {
      // Ensure we're in the correct directory
      if (!fs.existsSync(path.join(cwd, 'custom-server.js'))) {
        throw new Error('custom-server.js not found in application directory');
      }

      // Set production environment
      const env = { 
        ...process.env, 
        NODE_ENV: 'production',
        PORT: CONFIG.INCOME_CLARITY_PORT.toString()
      };

      // Start server as background process
      this.log(`Starting server in directory: ${cwd}`);
      const serverProcess = spawn('node', ['custom-server.js'], {
        cwd,
        env,
        detached: false,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      // Handle server output
      if (serverProcess.stdout) {
        serverProcess.stdout.on('data', (data) => {
          this.log(`Server stdout: ${data.toString().trim()}`);
        });
      }

      if (serverProcess.stderr) {
        serverProcess.stderr.on('data', (data) => {
          this.log(`Server stderr: ${data.toString().trim()}`, 'WARN');
        });
      }

      serverProcess.on('error', (error) => {
        this.log(`Server process error: ${error.message}`, 'ERROR');
      });

      // Wait a moment for startup
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Validate server started successfully
      const isHealthy = await this.validateServerHealth();
      
      if (isHealthy) {
        this.log(`Income Clarity server started successfully (PID: ${serverProcess.pid})`);
        return { success: true, pid: serverProcess.pid, process: serverProcess };
      } else {
        this.log('Server failed health check after startup', 'ERROR');
        serverProcess.kill('SIGTERM');
        return { success: false, error: 'Health check failed' };
      }

    } catch (error) {
      this.log(`Failed to start server: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  /**
   * Validate server health after startup
   */
  async validateServerHealth() {
    this.log('Validating server health...');
    
    const maxAttempts = 10;
    const delayMs = 3000;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Check if port is listening
        const portCheck = this.execSafe(`ss -tulpn | grep :${CONFIG.INCOME_CLARITY_PORT}`);
        if (!portCheck) {
          this.log(`Attempt ${attempt}/${maxAttempts}: Port ${CONFIG.INCOME_CLARITY_PORT} not listening yet`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }

        // Try HTTP health check
        const healthCheck = this.execSafe(`curl -f -s http://localhost:${CONFIG.INCOME_CLARITY_PORT}/api/health || echo "FAILED"`);
        
        if (healthCheck && !healthCheck.includes('FAILED')) {
          this.log(`Server health check passed on attempt ${attempt}`);
          return true;
        } else {
          this.log(`Attempt ${attempt}/${maxAttempts}: Health check failed`);
        }

      } catch (error) {
        this.log(`Health check attempt ${attempt} error: ${error.message}`, 'WARN');
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    this.log('Server health validation failed after all attempts', 'ERROR');
    return false;
  }

  /**
   * Restart Income Clarity server gracefully
   */
  async restartServer() {
    this.log('=== GRACEFUL SERVER RESTART INITIATED ===');

    // Step 1: Service Discovery
    const services = this.discoverServices();
    
    if (!services.incomeClarity) {
      this.log('No Income Clarity server found running', 'WARN');
      this.log('Attempting to start new server instance...');
      return await this.startServer();
    }

    // Step 2: Graceful Shutdown
    const shutdownSuccess = await this.gracefulShutdown(services.incomeClarity.pid);
    if (!shutdownSuccess) {
      this.log('Failed to shutdown existing server, aborting restart', 'ERROR');
      return { success: false, error: 'Shutdown failed' };
    }

    // Step 3: Clear port if necessary
    await new Promise(resolve => setTimeout(resolve, 2000)); // Brief pause
    await this.clearPortIfStuck(CONFIG.INCOME_CLARITY_PORT);

    // Step 4: Start new server
    const startResult = await this.startServer();
    
    if (startResult.success) {
      this.log('=== GRACEFUL SERVER RESTART COMPLETED ===');
    } else {
      this.log('=== GRACEFUL SERVER RESTART FAILED ===', 'ERROR');
    }

    return startResult;
  }

  /**
   * Clear port if it's stuck (but only port 3000)
   */
  async clearPortIfStuck(port) {
    if (port !== CONFIG.INCOME_CLARITY_PORT) {
      this.log(`Refusing to clear port ${port} - only port ${CONFIG.INCOME_CLARITY_PORT} allowed`, 'ERROR');
      return false;
    }

    const portCheck = this.execSafe(`ss -tulpn | grep :${port}`);
    if (!portCheck) {
      this.log(`Port ${port} is clear`);
      return true;
    }

    this.log(`Port ${port} still in use, attempting to clear...`);
    
    // Use lsof to find and kill processes on this specific port
    const lsofOutput = this.execSafe(`lsof -ti:${port}`);
    if (lsofOutput) {
      const pids = lsofOutput.split('\n').filter(pid => pid.trim());
      
      for (const pid of pids) {
        this.log(`Clearing stuck process on port ${port}: PID ${pid}`);
        try {
          process.kill(parseInt(pid), 'SIGKILL');
        } catch (error) {
          this.log(`Failed to clear PID ${pid}: ${error.message}`, 'WARN');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    return false;
  }

  /**
   * Emergency recovery procedure
   */
  async emergencyRecovery() {
    this.log('=== EMERGENCY RECOVERY INITIATED ===');
    
    try {
      // Step 1: Service discovery to understand current state
      const services = this.discoverServices();
      
      // Step 2: Clear port 3000 only if needed
      await this.clearPortIfStuck(CONFIG.INCOME_CLARITY_PORT);
      
      // Step 3: Start fresh server
      const result = await this.startServer();
      
      if (result.success) {
        this.log('=== EMERGENCY RECOVERY COMPLETED ===');
      } else {
        this.log('=== EMERGENCY RECOVERY FAILED ===', 'ERROR');
      }
      
      return result;
      
    } catch (error) {
      this.log(`Emergency recovery failed: ${error.message}`, 'ERROR');
      return { success: false, error: error.message };
    }
  }

  /**
   * Status check - show current system state
   */
  getSystemStatus() {
    this.log('=== SYSTEM STATUS CHECK ===');
    
    const services = this.discoverServices();
    
    const status = {
      timestamp: new Date().toISOString(),
      protectedServices: services.protected.length,
      incomeClarity: services.incomeClarity ? 'running' : 'stopped',
      port3000InUse: false,
      criticalPortsProtected: true
    };

    // Check port status
    const portOutput = this.execSafe('ss -tulpn');
    if (portOutput) {
      status.port3000InUse = portOutput.includes(':3000 ');
      
      for (const port of CONFIG.PROTECTED_PORTS) {
        if (!portOutput.includes(`:${port} `)) {
          this.log(`WARNING: Protected port ${port} not in use`, 'WARN');
          status.criticalPortsProtected = false;
        }
      }
    }

    this.log(`Protected services: ${status.protectedServices}`);
    this.log(`Income Clarity server: ${status.incomeClarity}`);
    this.log(`Port 3000 in use: ${status.port3000InUse}`);
    this.log(`Critical ports protected: ${status.criticalPortsProtected}`);
    
    return status;
  }
}

// CLI Interface
async function main() {
  const manager = new GracefulServerManager();
  const command = process.argv[2];

  switch (command) {
    case 'restart':
      await manager.restartServer();
      break;
      
    case 'start':
      await manager.startServer();
      break;
      
    case 'stop':
      const services = manager.discoverServices();
      if (services.incomeClarity) {
        await manager.gracefulShutdown(services.incomeClarity.pid);
      } else {
        manager.log('No Income Clarity server running');
      }
      break;
      
    case 'status':
      manager.getSystemStatus();
      break;
      
    case 'emergency':
      await manager.emergencyRecovery();
      break;
      
    case 'discover':
      manager.discoverServices();
      break;
      
    default:
      console.log(`
Graceful Server Management System

Usage:
  node graceful-server-management.js <command>

Commands:
  start     - Start Income Clarity server
  stop      - Stop Income Clarity server gracefully  
  restart   - Graceful restart of Income Clarity server
  status    - Show system status
  emergency - Emergency recovery (clear port + start)
  discover  - Discover and categorize all services

Examples:
  node graceful-server-management.js restart
  node graceful-server-management.js status
  node graceful-server-management.js emergency

Critical Protection:
  - Claude Code CLI processes are NEVER touched
  - Ports 22 and 8080 are NEVER killed
  - Only Income Clarity server on port 3000 is managed
      `);
      process.exit(1);
  }
}

// Export for use as module
module.exports = { GracefulServerManager, CONFIG };

// Run CLI if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error.message);
    process.exit(1);
  });
}