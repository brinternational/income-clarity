#!/usr/bin/env node

/**
 * Development Server Guard
 * Enforces single server instance on port 3000
 * Prevents multiple Next.js servers from running simultaneously
 */

const { exec, spawn } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const PORT = 3000;
const TARGET_PORT = `:${PORT}`;

// console.log('🚨 Development Server Guard - Enforcing Single Instance Rule');
// console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

/**
 * Check if port is in use
 */
async function checkPort() {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr ${TARGET_PORT}`);
    return stdout.trim().split('\n').filter(line => line.includes(TARGET_PORT));
  } catch (error) {
    // No processes found on port (which is good)
    return [];
  }
}

/**
 * Kill processes on port 3000
 */
async function killPortProcesses() {
  const processes = await checkPort();
  
  if (processes.length === 0) {
    // console.log('✅ Port 3000 is clear');
    return true;
  }

  // console.log(`❌ Found ${processes.length} process(es) on port 3000:`);
  processes.forEach((proc, i) => console.log(`   ${i + 1}. ${proc}`));

  // Extract PIDs and kill them
  const killPromises = processes.map(async (processLine) => {
    const parts = processLine.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    
    if (pid && !isNaN(pid)) {
      try {
        // console.log(`🔪 Killing PID ${pid}...`);
        await execAsync(`taskkill /F /PID ${pid}`);
        return true;
      } catch (error) {
        // console.log(`⚠️  Failed to kill PID ${pid}: ${error.message}`);
        return false;
      }
    }
    return false;
  });

  await Promise.all(killPromises);
  
  // Wait for cleanup
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Verify port is clear
  const remainingProcesses = await checkPort();
  if (remainingProcesses.length > 0) {
    // console.log('💥 CRITICAL: Failed to clear port 3000');
    // console.log('Remaining processes:');
    remainingProcesses.forEach(proc => console.log(`   ${proc}`));
    return false;
  }

  // console.log('✅ Successfully cleared port 3000');
  return true;
}

/**
 * Validate environment
 */
function validateEnvironment() {
  const args = process.argv.slice(2);
  
  // Check for forbidden port overrides
  const forbiddenPorts = args.some(arg => 
    arg.includes('-p') || 
    arg.includes('--port') || 
    arg.match(/:\d{4}/)
  );
  
  if (forbiddenPorts) {
    // console.log('❌ VIOLATION: Port override detected in arguments');
    // console.log('   Only port 3000 is allowed');
    // console.log('   Remove port arguments and try again');
    return false;
  }

  return true;
}

/**
 * Start Next.js development server
 */
function startServer() {
  // console.log('🚀 Starting Next.js development server on port 3000...');
  // console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const server = spawn('npx', ['next', 'dev', '--port', PORT.toString()], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Handle server shutdown
  process.on('SIGINT', () => {
    // console.log('\n🛑 Shutting down development server...');
    server.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    // console.log('\n🛑 Terminating development server...');
    server.kill('SIGTERM');
    process.exit(0);
  });

  server.on('exit', (code) => {
    // console.log(`\n📊 Server exited with code ${code}`);
    process.exit(code);
  });

  return server;
}

/**
 * Monitor for violations
 */
async function startMonitoring() {
  setInterval(async () => {
    const processes = await checkPort();
    const nextProcesses = processes.filter(proc => 
      proc.toLowerCase().includes('node') || 
      proc.toLowerCase().includes('next')
    );

    if (nextProcesses.length > 1) {
      // console.log('\n🚨 WARNING: Multiple processes detected on port 3000');
      // console.log('This violates the single server rule');
      nextProcesses.forEach((proc, i) => console.log(`   ${i + 1}. ${proc}`));
    }
  }, 30000); // Check every 30 seconds
}

/**
 * Main execution
 */
async function main() {
  try {
    // Validate environment
    if (!validateEnvironment()) {
      process.exit(1);
    }

    // Kill existing processes
    const portCleared = await killPortProcesses();
    if (!portCleared) {
      // console.log('💥 ABORTING: Could not clear port 3000');
      // console.log('Manual intervention required:');
      // console.log('1. Check Task Manager for Node.js processes');
      // console.log('2. Kill manually or restart your IDE');
      // console.log('3. Try: taskkill /F /IM node.exe');
      process.exit(1);
    }

    // Start monitoring for violations
    startMonitoring();

    // Start the development server
    startServer();
    
  } catch (error) {
    // console.log('💥 FATAL ERROR:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}