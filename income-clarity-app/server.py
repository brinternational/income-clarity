#!/usr/bin/env python3
"""
Income Clarity Server Runner
Handles Next.js terminal issues by properly managing PTY
"""

import os
import sys
import pty
import select
import subprocess
import signal
import time

def kill_port_3000():
    """Kill any existing process on port 3000"""
    try:
        result = subprocess.run(['lsof', '-t', '-i:3000'], capture_output=True, text=True)
        if result.stdout.strip():
            pid = result.stdout.strip()
            subprocess.run(['kill', '-9', pid], capture_output=True)
            time.sleep(1)
    except:
        pass

def run_server():
    """Run Next.js server with proper PTY handling"""
    print("======================================")
    print("  Income Clarity - Python Server")
    print("======================================")
    print("")
    
    # Kill existing process
    print("Checking port 3000...")
    kill_port_3000()
    print("✓ Port 3000 is free")
    print("")
    
    # Change to app directory
    os.chdir('/public/MasterV2/income-clarity/income-clarity-app')
    
    print("Starting server...")
    print("  Local: http://localhost:3000")
    print("  Network: http://137.184.142.42:3000")
    print("")
    print("Press Ctrl+C to stop")
    print("======================================")
    print("")
    
    # Create a pseudo-terminal
    master, slave = pty.openpty()
    
    # Start the Next.js server
    process = subprocess.Popen(
        ['npx', 'next', 'dev', '--hostname', '0.0.0.0', '--port', '3000'],
        stdin=slave,
        stdout=slave,
        stderr=slave,
        preexec_fn=os.setsid
    )
    
    # Close slave end in parent
    os.close(slave)
    
    # Handle Ctrl+C
    def signal_handler(sig, frame):
        print("\n\nStopping server...")
        process.terminate()
        time.sleep(1)
        if process.poll() is None:
            process.kill()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    
    # Read and display output
    try:
        while True:
            # Check if process is still running
            if process.poll() is not None:
                print("\nServer stopped unexpectedly")
                break
            
            # Read output from master
            r, w, e = select.select([master], [], [], 0.1)
            if master in r:
                try:
                    output = os.read(master, 1024)
                    if output:
                        # Filter out cursor control sequences
                        output_str = output.decode('utf-8', errors='ignore')
                        # Remove problematic ANSI sequences
                        output_str = output_str.replace('\x1b[?25h', '')
                        output_str = output_str.replace('\x1b[?25l', '')
                        sys.stdout.write(output_str)
                        sys.stdout.flush()
                except OSError:
                    break
    except KeyboardInterrupt:
        signal_handler(None, None)
    finally:
        os.close(master)
        if process.poll() is None:
            process.terminate()

if __name__ == '__main__':
    run_server()