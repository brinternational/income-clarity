/**
 * UI Versioning System
 * Tracks UI version information for deployment verification
 */

export interface UIVersion {
  version: string;
  timestamp: string;
  commit: string;
  buildId: string;
  environment: string;
  deploymentTime: string;
}

export interface DeploymentManifest {
  version: string;
  commit: string;
  branch: string;
  timestamp: string;
  buildId: string;
  environment: string;
  files: {
    count: number;
    lastModified: string;
    checksum?: string;
  };
  features: string[];
  endpoints: string[];
}

/**
 * Get current UI version information
 */
export function getCurrentUIVersion(): UIVersion {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 
                 process.env.BUILD_ID || 
                 `build-${Date.now()}`;
  
  const version = process.env.NEXT_PUBLIC_VERSION || 
                 process.env.npm_package_version || 
                 '1.0.0';
  
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT || 
                process.env.GIT_COMMIT || 
                'unknown';
  
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 
                     process.env.NODE_ENV || 
                     'development';
  
  return {
    version,
    timestamp: new Date().toISOString(),
    commit: commit.substring(0, 8), // Short commit hash
    buildId,
    environment,
    deploymentTime: process.env.DEPLOYMENT_TIME || new Date().toISOString()
  };
}

/**
 * Generate deployment manifest for tracking changes
 */
export function generateDeploymentManifest(): DeploymentManifest {
  const uiVersion = getCurrentUIVersion();
  
  return {
    version: uiVersion.version,
    commit: uiVersion.commit,
    branch: process.env.GIT_BRANCH || 'unknown',
    timestamp: uiVersion.timestamp,
    buildId: uiVersion.buildId,
    environment: uiVersion.environment,
    files: {
      count: 0, // Will be populated by deployment script
      lastModified: new Date().toISOString()
    },
    features: [
      'authentication',
      'dashboard',
      'super-cards',
      'progressive-disclosure',
      'yodlee-integration',
      'dark-mode',
      'responsive-design'
    ],
    endpoints: [
      '/api/auth/me',
      '/api/super-cards/income-hub',
      '/api/super-cards/performance-hub',
      '/api/super-cards/financial-planning-hub',
      '/api/super-cards/portfolio-strategy-hub',
      '/api/super-cards/tax-strategy-hub',
      '/api/health',
      '/api/ui-version',
      '/api/deployment/status'
    ]
  };
}

/**
 * Create UI version component props for embedding in pages
 */
export function getUIVersionProps() {
  const version = getCurrentUIVersion();
  
  return {
    'data-ui-version': version.version,
    'data-build-id': version.buildId,
    'data-commit': version.commit,
    'data-environment': version.environment,
    'data-deployment-time': version.deploymentTime
  };
}

/**
 * Generate cache-busting version string
 */
export function getCacheBustVersion(): string {
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID || 
                 process.env.BUILD_ID || 
                 Date.now().toString();
  
  const commit = process.env.NEXT_PUBLIC_GIT_COMMIT || 
                process.env.GIT_COMMIT || 
                'dev';
  
  return `${buildId}-${commit.substring(0, 8)}`;
}

/**
 * Check if UI version has changed (client-side)
 */
export function hasUIVersionChanged(previousVersion: UIVersion, currentVersion: UIVersion): boolean {
  return (
    previousVersion.buildId !== currentVersion.buildId ||
    previousVersion.commit !== currentVersion.commit ||
    previousVersion.timestamp !== currentVersion.timestamp
  );
}

/**
 * Format UI version for display
 */
export function formatUIVersionForDisplay(version: UIVersion): string {
  return `v${version.version} (${version.commit}) - ${version.environment}`;
}

/**
 * Validate deployment manifest
 */
export function validateDeploymentManifest(manifest: DeploymentManifest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!manifest.version) errors.push('Missing version');
  if (!manifest.commit) errors.push('Missing commit');
  if (!manifest.buildId) errors.push('Missing buildId');
  if (!manifest.environment) errors.push('Missing environment');
  if (!manifest.features?.length) errors.push('Missing features');
  if (!manifest.endpoints?.length) errors.push('Missing endpoints');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Server-side UI version detection
 */
export function getServerUIVersion(): UIVersion {
  // This runs on the server
  return getCurrentUIVersion();
}

/**
 * Client-safe UI version (no server-specific env vars)
 */
export function getClientUIVersion(): Partial<UIVersion> {
  if (typeof window === 'undefined') {
    return {}; // Server-side, return empty
  }
  
  // Client-side, get from DOM or local storage
  const htmlElement = document.documentElement;
  
  return {
    version: htmlElement.dataset.uiVersion,
    buildId: htmlElement.dataset.buildId,
    commit: htmlElement.dataset.commit,
    environment: htmlElement.dataset.environment,
    deploymentTime: htmlElement.dataset.deploymentTime,
    timestamp: new Date().toISOString()
  };
}

/**
 * Embed UI version in HTML document
 */
export function embedUIVersionInDocument(): string {
  const version = getCurrentUIVersion();
  
  return `
    <script>
      window.__UI_VERSION__ = ${JSON.stringify(version)};
      console.log('🎯 UI Version:', window.__UI_VERSION__);
    </script>
  `;
}

/**
 * Get build timestamp for cache busting
 */
export function getBuildTimestamp(): string {
  return process.env.BUILD_TIMESTAMP || Date.now().toString();
}

/**
 * Generate version-aware asset URL
 */
export function getVersionedAssetURL(assetPath: string): string {
  const version = getCacheBustVersion();
  const separator = assetPath.includes('?') ? '&' : '?';
  return `${assetPath}${separator}v=${version}`;
}

/**
 * Check if this is a fresh deployment
 */
export function isFreshDeployment(): boolean {
  const buildTime = getBuildTimestamp();
  const now = Date.now();
  const timeDiff = now - parseInt(buildTime, 10);
  
  // Consider fresh if deployed within last 5 minutes
  return timeDiff < (5 * 60 * 1000);
}