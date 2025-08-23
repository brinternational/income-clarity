import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUIVersion, generateDeploymentManifest } from '@/lib/utils/ui-versioning';
import fs from 'fs';
import path from 'path';

/**
 * UI Version API Endpoint
 * Provides current UI version information for deployment verification
 */

export async function GET(request: NextRequest) {
  try {
    const uiVersion = getCurrentUIVersion();
    
    // Add additional deployment information
    const deploymentInfo = {
      ...uiVersion,
      serverTime: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      pid: process.pid
    };
    
    // Try to read deployment manifest if it exists
    let deploymentManifest = null;
    try {
      const manifestPath = path.join(process.cwd(), 'DEPLOYMENT-MANIFEST.json');
      if (fs.existsSync(manifestPath)) {
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        deploymentManifest = JSON.parse(manifestContent);
      }
    } catch (error) {
      // Manifest doesn't exist or is invalid, which is fine
    }
    
    // Try to read cache bust manifest
    let cacheBustInfo = null;
    try {
      const cacheBustPath = path.join(process.cwd(), '.cache-bust-manifest.json');
      if (fs.existsSync(cacheBustPath)) {
        const cacheBustContent = fs.readFileSync(cacheBustPath, 'utf-8');
        cacheBustInfo = JSON.parse(cacheBustContent);
      }
    } catch (error) {
      // Cache bust manifest doesn't exist, which is fine
    }
    
    // Build file information
    let buildInfo = null;
    try {
      const nextDir = path.join(process.cwd(), '.next');
      if (fs.existsSync(nextDir)) {
        const buildIdPath = path.join(nextDir, 'BUILD_ID');
        let buildId = 'unknown';
        
        if (fs.existsSync(buildIdPath)) {
          buildId = fs.readFileSync(buildIdPath, 'utf-8').trim();
        }
        
        const buildStats = fs.statSync(nextDir);
        buildInfo = {
          buildId,
          buildTime: buildStats.mtime.toISOString(),
          buildExists: true
        };
      } else {
        buildInfo = {
          buildExists: false,
          message: 'No .next directory found - may be development mode'
        };
      }
    } catch (error) {
      buildInfo = {
        buildExists: false,
        error: 'Could not read build information'
      };
    }
    
    const response = {
      success: true,
      data: {
        ui: deploymentInfo,
        deployment: deploymentManifest,
        cacheBust: cacheBustInfo,
        build: buildInfo,
        timestamp: new Date().toISOString()
      }
    };
    
    // Set cache control headers to ensure fresh data
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    return new NextResponse(JSON.stringify(response, null, 2), {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('UI Version API Error:', error);
    
    const errorResponse = {
      success: false,
      error: 'Failed to get UI version information',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    return new NextResponse(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'generate-manifest') {
      const manifest = generateDeploymentManifest();
      
      // Save manifest to file
      const manifestPath = path.join(process.cwd(), 'DEPLOYMENT-MANIFEST.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Deployment manifest generated',
        manifest,
        savedTo: manifestPath
      });
    }
    
    if (body.action === 'cache-bust') {
      const cacheBustInfo = {
        timestamp: new Date().toISOString(),
        buildId: `build-${Date.now()}`,
        cacheBustVersion: Date.now().toString(),
        requestedBy: 'api'
      };
      
      // Save cache bust info
      const cacheBustPath = path.join(process.cwd(), '.cache-bust-manifest.json');
      fs.writeFileSync(cacheBustPath, JSON.stringify(cacheBustInfo, null, 2));
      
      return NextResponse.json({
        success: true,
        message: 'Cache bust initiated',
        cacheBustInfo
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Invalid action',
      validActions: ['generate-manifest', 'cache-bust']
    }, { status: 400 });
    
  } catch (error) {
    console.error('UI Version POST API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process UI version request',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}