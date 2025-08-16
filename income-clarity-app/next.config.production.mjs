/** @type {import('next').NextConfig} */
const productionConfig = {
  // Production-ready configuration
  typescript: {
    ignoreBuildErrors: false, // Enable TypeScript checking in production
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable ESLint in production
  },
  
  // Performance optimizations for production
  compress: true,
  productionBrowserSourceMaps: true, // Enable for debugging in production
  poweredByHeader: false, // Remove X-Powered-By header for security
  
  // Image optimization
  images: {
    domains: ['incomeclarity.ddns.net'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ]
  },

  // Redirects for production
  async redirects() {
    return [
      {
        source: '/test',
        destination: '/',
        permanent: false,
      },
      {
        source: '/debug',
        destination: '/',
        permanent: false,
      },
    ]
  },

  // Output configuration
  output: 'standalone',
  
  // Build optimization
  swcMinify: true,
  
  // Experimental features for production
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Bundle analyzer (disable in production)
  // webpack: (config, { dev, isServer }) => {
  //   if (!dev && !isServer) {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         openAnalyzer: false,
  //       })
  //     )
  //   }
  //   return config
  // },
};

export default productionConfig;