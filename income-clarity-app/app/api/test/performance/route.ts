// Minimal test endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  const startTime = Date.now();
  
  return NextResponse.json({
    message: 'Performance test endpoint working',
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime
  });
}