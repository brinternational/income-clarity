/**
 * 🔄 Real-time Deployment Monitoring SSE Endpoint
 * Server-Sent Events for live deployment status updates
 */

import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface MonitorEvent {
  id: string;
  type: 'status' | 'alert' | 'change' | 'health' | 'deployment';
  data: any;
  timestamp: string;
}

class SSEManager {
  private static instance: SSEManager;
  private clients: Set<ReadableStreamDefaultController> = new Set();
  private eventId = 0;

  static getInstance(): SSEManager {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager();
    }
    return SSEManager.instance;
  }

  addClient(controller: ReadableStreamDefaultController) {
    this.clients.add(controller);
    
    // Send initial connection event
    this.sendToClient(controller, {
      id: this.generateEventId(),
      type: 'status',
      data: { message: 'Connected to deployment monitor', connected: true },
      timestamp: new Date().toISOString()
    });
  }

  removeClient(controller: ReadableStreamDefaultController) {
    this.clients.delete(controller);
  }

  broadcast(event: Omit<MonitorEvent, 'id'>) {
    const fullEvent: MonitorEvent = {
      id: this.generateEventId(),
      ...event
    };

    this.clients.forEach(controller => {
      this.sendToClient(controller, fullEvent);
    });
  }

  private sendToClient(controller: ReadableStreamDefaultController, event: MonitorEvent) {
    try {
      const sseData = `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
      controller.enqueue(new TextEncoder().encode(sseData));
    } catch (error) {
      console.error('Error sending SSE data:', error);
      this.clients.delete(controller);
    }
  }

  private generateEventId(): string {
    return `${Date.now()}_${++this.eventId}`;
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

// File monitoring system
class FileWatcher {
  private static watcherStarted = false;
  private static lastStatusCheck = 0;

  static async startWatching() {
    if (FileWatcher.watcherStarted) return;
    FileWatcher.watcherStarted = true;

    const sseManager = SSEManager.getInstance();

    // Monitor deployment status file changes
    FileWatcher.watchStatusFile();
    
    // Monitor log file changes  
    FileWatcher.watchLogFile();

    // Periodic health checks
    setInterval(() => {
      FileWatcher.checkServerHealth();
    }, 30000); // Every 30 seconds

    console.log('🔄 SSE File Watcher started');
  }

  private static async watchStatusFile() {
    const statusPath = path.join(process.cwd(), '.deployment-status.json');
    const sseManager = SSEManager.getInstance();
    
    // Poll status file for changes (fallback if inotify not available)
    setInterval(async () => {
      try {
        const stats = await fs.stat(statusPath);
        const lastModified = stats.mtime.getTime();
        
        if (lastModified > FileWatcher.lastStatusCheck) {
          FileWatcher.lastStatusCheck = lastModified;
          
          const statusContent = await fs.readFile(statusPath, 'utf8');
          const status = JSON.parse(statusContent);
          
          sseManager.broadcast({
            type: 'status',
            data: status,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        // Status file doesn't exist yet, that's OK
      }
    }, 2000); // Check every 2 seconds
  }

  private static async watchLogFile() {
    const logPath = path.join(process.cwd(), 'monitor.log');
    const sseManager = SSEManager.getInstance();
    let lastLogSize = 0;

    setInterval(async () => {
      try {
        const stats = await fs.stat(logPath);
        const currentSize = stats.size;
        
        if (currentSize > lastLogSize) {
          // Read new content
          const fd = await fs.open(logPath, 'r');
          const buffer = Buffer.alloc(currentSize - lastLogSize);
          await fd.read(buffer, 0, buffer.length, lastLogSize);
          await fd.close();
          
          const newContent = buffer.toString('utf8');
          const newLines = newContent.split('\n').filter(line => line.trim());
          
          // Parse and broadcast new log entries
          newLines.forEach(line => {
            const logEvent = FileWatcher.parseLogLine(line);
            if (logEvent) {
              sseManager.broadcast({
                type: 'alert',
                data: logEvent,
                timestamp: new Date().toISOString()
              });
            }
          });
          
          lastLogSize = currentSize;
        }
      } catch (error) {
        // Log file doesn't exist yet, that's OK
      }
    }, 1000); // Check every second
  }

  private static parseLogLine(line: string): any | null {
    // Parse monitor log line format: "TIMESTAMP LEVEL MESSAGE"
    const match = line.match(/^(.+?) (.+?) (.+)$/);
    if (!match) return null;

    const [, timestamp, levelWithEmoji, message] = match;
    
    // Extract level from emoji prefix
    let level = 'info';
    if (levelWithEmoji.includes('✅')) level = 'success';
    else if (levelWithEmoji.includes('⚠️')) level = 'warning';
    else if (levelWithEmoji.includes('❌')) level = 'error';
    else if (levelWithEmoji.includes('🚀')) level = 'deployment';
    else if (levelWithEmoji.includes('📝')) level = 'change';

    return {
      timestamp,
      level,
      message: message.trim(),
      raw_line: line
    };
  }

  private static async checkServerHealth() {
    const sseManager = SSEManager.getInstance();
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        headers: { 'User-Agent': 'sse-health-monitor' }
      });
      
      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;
      
      sseManager.broadcast({
        type: 'health',
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          response_time: responseTime,
          status_code: response.status
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      sseManager.broadcast({
        type: 'health',
        data: {
          status: 'unhealthy',
          response_time: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export async function GET(request: NextRequest) {
  // CORS headers for SSE
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Cache-Control',
  });

  const stream = new ReadableStream({
    start(controller) {
      const sseManager = SSEManager.getInstance();
      
      // Add client to SSE manager
      sseManager.addClient(controller);
      
      // Start file watching if not already started
      FileWatcher.startWatching();
      
      console.log(`🔗 SSE Client connected (${sseManager.getClientCount()} total clients)`);
    },
    
    cancel(controller) {
      const sseManager = SSEManager.getInstance();
      sseManager.removeClient(controller);
      
      console.log(`❌ SSE Client disconnected (${sseManager.getClientCount()} total clients)`);
    }
  });

  return new Response(stream, { headers });
}

// Also support POST for testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sseManager = SSEManager.getInstance();
    
    // Broadcast custom event
    sseManager.broadcast({
      type: body.type || 'alert',
      data: body.data || body,
      timestamp: new Date().toISOString()
    });
    
    return Response.json({
      success: true,
      message: 'Event broadcasted',
      clients: sseManager.getClientCount()
    });
    
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Failed to broadcast event'
    }, { status: 500 });
  }
}