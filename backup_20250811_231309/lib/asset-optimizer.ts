// MPERF-006: Image and Asset Optimization for Mobile Performance
// Generates WebP images, implements srcset, lazy loading, and critical resource optimization
// Provides smart asset delivery based on device capabilities and network conditions

import { NetworkAdapter, NetworkCondition } from './network-adapter'

export interface ImageOptimizationConfig {
  formats: ('webp' | 'avif' | 'jpg' | 'png')[]
  quality: number // 1-100
  sizes: number[] // Different widths for responsive images
  lazyLoad: boolean
  placeholder: 'blur' | 'empty' | 'lqip' // Low Quality Image Placeholder
  priority: 'high' | 'medium' | 'low'
}

export interface AssetOptimizationStrategy {
  images: ImageOptimizationConfig
  fonts: {
    preload: string[] // Critical fonts to preload
    display: 'swap' | 'block' | 'fallback' | 'optional'
    subsetRanges: string[] // Unicode ranges for font subsetting
  }
  css: {
    inline: boolean // Inline critical CSS
    minify: boolean
    purge: boolean // Remove unused CSS
    prefetch: string[] // CSS files to prefetch
  }
  javascript: {
    defer: boolean
    async: boolean
    modulePreload: string[] // ES modules to preload
    splitChunks: boolean
  }
}

export class AssetOptimizer {
  private static strategies: Record<string, AssetOptimizationStrategy> = {
    'mobile-slow': {
      images: {
        formats: ['webp', 'jpg'],
        quality: 65, // Lower quality for slow connections
        sizes: [320, 640, 800], // Smaller sizes only
        lazyLoad: true,
        placeholder: 'lqip',
        priority: 'low'
      },
      fonts: {
        preload: [], // No font preloading on slow connections
        display: 'swap',
        subsetRanges: ['U+0020-007F'] // ASCII only
      },
      css: {
        inline: true, // Inline critical CSS to reduce requests
        minify: true,
        purge: true,
        prefetch: []
      },
      javascript: {
        defer: true,
        async: false,
        modulePreload: [],
        splitChunks: true
      }
    },

    'mobile-moderate': {
      images: {
        formats: ['webp', 'jpg'],
        quality: 75,
        sizes: [320, 640, 1024],
        lazyLoad: true,
        placeholder: 'blur',
        priority: 'medium'
      },
      fonts: {
        preload: ['Inter-Regular.woff2'], // Only critical font
        display: 'swap',
        subsetRanges: ['U+0020-007F', 'U+00A0-00FF'] // Latin + Latin Extended
      },
      css: {
        inline: true,
        minify: true,
        purge: true,
        prefetch: ['components.css'] // Prefetch secondary CSS
      },
      javascript: {
        defer: true,
        async: false,
        modulePreload: ['vendor.js'],
        splitChunks: true
      }
    },

    'mobile-fast': {
      images: {
        formats: ['avif', 'webp', 'jpg'],
        quality: 85,
        sizes: [320, 640, 1024, 1440],
        lazyLoad: true,
        placeholder: 'blur',
        priority: 'high'
      },
      fonts: {
        preload: ['Inter-Regular.woff2', 'Inter-SemiBold.woff2'],
        display: 'swap',
        subsetRanges: ['U+0020-007F', 'U+00A0-00FF', 'U+0100-017F']
      },
      css: {
        inline: true,
        minify: true,
        purge: true,
        prefetch: ['components.css', 'animations.css']
      },
      javascript: {
        defer: false, // Faster execution
        async: true,
        modulePreload: ['vendor.js', 'components.js'],
        splitChunks: true
      }
    },

    'tablet': {
      images: {
        formats: ['avif', 'webp', 'jpg'],
        quality: 85,
        sizes: [640, 1024, 1440, 1920],
        lazyLoad: true,
        placeholder: 'blur',
        priority: 'high'
      },
      fonts: {
        preload: ['Inter-Regular.woff2', 'Inter-SemiBold.woff2', 'Inter-Bold.woff2'],
        display: 'swap',
        subsetRanges: ['U+0020-007F', 'U+00A0-00FF', 'U+0100-017F']
      },
      css: {
        inline: false, // Separate CSS files for better caching
        minify: true,
        purge: true,
        prefetch: ['components.css', 'animations.css', 'tablet.css']
      },
      javascript: {
        defer: false,
        async: true,
        modulePreload: ['vendor.js', 'components.js', 'charts.js'],
        splitChunks: true
      }
    },

    'desktop': {
      images: {
        formats: ['avif', 'webp', 'jpg'],
        quality: 90,
        sizes: [640, 1024, 1440, 1920, 2560],
        lazyLoad: false, // No lazy loading on desktop
        placeholder: 'empty',
        priority: 'high'
      },
      fonts: {
        preload: ['Inter-Regular.woff2', 'Inter-SemiBold.woff2', 'Inter-Bold.woff2'],
        display: 'block', // Better font rendering on desktop
        subsetRanges: ['U+0020-007F', 'U+00A0-00FF', 'U+0100-017F', 'U+1E00-1EFF']
      },
      css: {
        inline: false,
        minify: true,
        purge: true,
        prefetch: ['components.css', 'animations.css', 'desktop.css', 'charts.css']
      },
      javascript: {
        defer: false,
        async: true,
        modulePreload: ['vendor.js', 'components.js', 'charts.js', 'analytics.js'],
        splitChunks: true
      }
    }
  }

  /**
   * Get optimization strategy based on device and network conditions
   */
  static getOptimizationStrategy(
    deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop',
    networkCondition?: NetworkCondition
  ): AssetOptimizationStrategy {
    let strategyKey = deviceType

    // Refine strategy based on network quality for mobile
    if (deviceType === 'mobile' && networkCondition) {
      switch (networkCondition.quality) {
        case 'fast':
          strategyKey = 'mobile-fast'
          break
        case 'moderate':
          strategyKey = 'mobile-moderate'
          break
        case 'slow':
        case 'offline':
          strategyKey = 'mobile-slow'
          break
      }
    }

    return this.strategies[strategyKey] || this.strategies['desktop']
  }

  /**
   * Generate responsive image srcset
   */
  static generateImageSrcSet(
    basePath: string,
    strategy: AssetOptimizationStrategy,
    originalWidth?: number
  ): {
    srcSet: string
    sizes: string
    defaultSrc: string
    placeholder?: string
  } {
    const { images } = strategy
    const { formats, sizes, quality } = images

    // Generate srcSet for different sizes and formats
    const srcSetEntries: string[] = []
    const preferredFormat = formats[0] // First format is preferred

    sizes.forEach(width => {
      if (!originalWidth || width <= originalWidth) {
        srcSetEntries.push(`${basePath}?w=${width}&f=${preferredFormat}&q=${quality} ${width}w`)
      }
    })

    const srcSet = srcSetEntries.join(', ')
    
    // Generate sizes attribute for responsive behavior
    const sizesAttr = this.generateSizesAttribute(sizes)
    
    // Default src for fallback
    const defaultWidth = sizes[Math.floor(sizes.length / 2)] // Middle size as default
    const defaultSrc = `${basePath}?w=${defaultWidth}&f=${formats[formats.length - 1]}&q=${quality}`
    
    const result: any = {
      srcSet,
      sizes: sizesAttr,
      defaultSrc
    }

    // Add placeholder if configured
    if (images.placeholder === 'lqip') {
      result.placeholder = `${basePath}?w=40&f=jpg&q=20&blur=10`
    } else if (images.placeholder === 'blur') {
      result.placeholder = `${basePath}?w=20&f=jpg&q=10&blur=20`
    }

    return result
  }

  /**
   * Generate picture element with multiple format support
   */
  static generatePictureElement(
    basePath: string,
    alt: string,
    strategy: AssetOptimizationStrategy,
    originalWidth?: number,
    className?: string
  ): string {
    const { images } = strategy
    const { formats, sizes, quality, lazyLoad, priority } = images

    let pictureHTML = '<picture>'

    // Generate source elements for each format (except the fallback)
    formats.slice(0, -1).forEach(format => {
      const srcSetEntries = sizes
        .filter(width => !originalWidth || width <= originalWidth)
        .map(width => `${basePath}?w=${width}&f=${format}&q=${quality} ${width}w`)
      
      if (srcSetEntries.length > 0) {
        const srcSet = srcSetEntries.join(', ')
        const sizesAttr = this.generateSizesAttribute(sizes)
        
        pictureHTML += `<source srcset="${srcSet}" sizes="${sizesAttr}" type="${this.getImageMimeType(format)}">`
      }
    })

    // Fallback img element
    const fallbackFormat = formats[formats.length - 1]
    const imgSrcSet = this.generateImageSrcSet(basePath, strategy, originalWidth)
    
    const loadingAttr = lazyLoad ? 'loading="lazy"' : ''
    const priorityAttr = priority === 'high' ? 'fetchpriority="high"' : ''
    const classAttr = className ? `class="${className}"` : ''
    
    pictureHTML += `<img src="${imgSrcSet.defaultSrc}" srcset="${imgSrcSet.srcSet}" sizes="${imgSrcSet.sizes}" alt="${alt}" ${loadingAttr} ${priorityAttr} ${classAttr}>`
    
    pictureHTML += '</picture>'

    return pictureHTML
  }

  /**
   * Generate critical CSS for above-the-fold content
   */
  static generateCriticalCSS(
    deviceType: 'mobile' | 'tablet' | 'desktop',
    networkCondition?: NetworkCondition
  ): string {
    const strategy = this.getOptimizationStrategy(deviceType, networkCondition)
    
    if (!strategy.css.inline) {
      return ''
    }

    // Critical CSS for mobile-first approach
    const criticalCSS = `
/* Critical CSS for ${deviceType} */
body { 
  font-family: Inter, system-ui, -apple-system, sans-serif; 
  margin: 0; 
  padding: 0;
  font-display: ${strategy.fonts.display};
}

/* Above-the-fold layout */
.header { 
  position: sticky; 
  top: 0; 
  z-index: 100; 
  background: white; 
  border-bottom: 1px solid #e5e7eb; 
}

.main-content { 
  min-height: 100vh; 
  padding: 1rem; 
}

/* Loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Mobile-specific critical styles */
${deviceType === 'mobile' ? `
@media (max-width: 768px) {
  .main-content { padding: 0.5rem; }
  .card { margin-bottom: 1rem; }
  .text-sm { font-size: 14px; }
}
` : ''}

/* Hide non-critical elements initially */
.non-critical { display: none; }
`

    return strategy.css.minify ? this.minifyCSS(criticalCSS) : criticalCSS
  }

  /**
   * Generate font preload links
   */
  static generateFontPreloads(
    strategy: AssetOptimizationStrategy,
    fontBasePath = '/fonts/'
  ): string[] {
    return strategy.fonts.preload.map(fontFile => 
      `<link rel="preload" href="${fontBasePath}${fontFile}" as="font" type="font/woff2" crossorigin>`
    )
  }

  /**
   * Generate resource hints for optimal loading
   */
  static generateResourceHints(
    strategy: AssetOptimizationStrategy,
    baseURL = ''
  ): string[] {
    const hints: string[] = []

    // DNS prefetch for external resources
    hints.push('<link rel="dns-prefetch" href="//fonts.googleapis.com">')
    hints.push('<link rel="dns-prefetch" href="//cdn.example.com">')

    // Preconnect to critical origins
    hints.push('<link rel="preconnect" href="https://api.example.com">')

    // Prefetch CSS files
    strategy.css.prefetch.forEach(cssFile => {
      hints.push(`<link rel="prefetch" href="${baseURL}/css/${cssFile}">`)
    })

    // Module preload for JavaScript
    strategy.javascript.modulePreload.forEach(jsFile => {
      hints.push(`<link rel="modulepreload" href="${baseURL}/js/${jsFile}">`)
    })

    return hints
  }

  /**
   * Generate service worker cache strategy
   */
  static generateCacheStrategy(
    strategy: AssetOptimizationStrategy
  ): {
    images: { maxAge: number; maxEntries: number }
    fonts: { maxAge: number; maxEntries: number }
    css: { maxAge: number; maxEntries: number }
    javascript: { maxAge: number; maxEntries: number }
  } {
    // Longer cache times for mobile to reduce requests
    const isMobileOptimized = strategy.images.quality < 80

    return {
      images: {
        maxAge: isMobileOptimized ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days mobile, 1 day desktop
        maxEntries: isMobileOptimized ? 50 : 100
      },
      fonts: {
        maxAge: 30 * 24 * 60 * 60, // 30 days
        maxEntries: 10
      },
      css: {
        maxAge: isMobileOptimized ? 7 * 24 * 60 * 60 : 24 * 60 * 60,
        maxEntries: 20
      },
      javascript: {
        maxAge: isMobileOptimized ? 3 * 24 * 60 * 60 : 24 * 60 * 60, // 3 days mobile, 1 day desktop
        maxEntries: 30
      }
    }
  }

  /**
   * Optimize image for specific conditions
   */
  static optimizeImage(
    imageURL: string,
    deviceType: 'mobile' | 'tablet' | 'desktop',
    networkCondition?: NetworkCondition,
    targetWidth?: number
  ): string {
    const strategy = this.getOptimizationStrategy(deviceType, networkCondition)
    const { images } = strategy
    const { formats, quality } = images

    // Choose optimal width
    const width = targetWidth || this.getOptimalImageWidth(deviceType, networkCondition)
    
    // Choose format based on browser support (would be determined by client)
    const format = formats[0] // Use preferred format

    // Add optimization parameters
    const params = new URLSearchParams({
      w: width.toString(),
      f: format,
      q: quality.toString()
    })

    // Add format-specific optimizations
    if (format === 'webp') {
      params.set('progressive', 'true')
    } else if (format === 'jpg') {
      params.set('progressive', 'true')
      params.set('strip', 'true') // Remove metadata
    }

    return `${imageURL}?${params.toString()}`
  }

  /**
   * Get performance budget recommendations
   */
  static getPerformanceBudgets(
    deviceType: 'mobile' | 'tablet' | 'desktop',
    networkCondition?: NetworkCondition
  ): {
    maxImageSize: number // bytes
    maxTotalAssets: number // bytes
    maxRequests: number
    maxLoadTime: number // ms
  } {
    const strategy = this.getOptimizationStrategy(deviceType, networkCondition)
    
    if (deviceType === 'mobile') {
      if (networkCondition?.quality === 'slow') {
        return {
          maxImageSize: 50 * 1024, // 50KB
          maxTotalAssets: 500 * 1024, // 500KB
          maxRequests: 20,
          maxLoadTime: 5000 // 5 seconds
        }
      } else if (networkCondition?.quality === 'moderate') {
        return {
          maxImageSize: 100 * 1024, // 100KB
          maxTotalAssets: 1 * 1024 * 1024, // 1MB
          maxRequests: 30,
          maxLoadTime: 3000 // 3 seconds
        }
      } else {
        return {
          maxImageSize: 200 * 1024, // 200KB
          maxTotalAssets: 2 * 1024 * 1024, // 2MB
          maxRequests: 50,
          maxLoadTime: 2000 // 2 seconds
        }
      }
    } else if (deviceType === 'tablet') {
      return {
        maxImageSize: 300 * 1024, // 300KB
        maxTotalAssets: 3 * 1024 * 1024, // 3MB
        maxRequests: 60,
        maxLoadTime: 2000 // 2 seconds
      }
    } else {
      return {
        maxImageSize: 500 * 1024, // 500KB
        maxTotalAssets: 5 * 1024 * 1024, // 5MB
        maxRequests: 100,
        maxLoadTime: 1500 // 1.5 seconds
      }
    }
  }

  // Private helper methods

  private static generateSizesAttribute(sizes: number[]): string {
    // Generate responsive sizes attribute
    const breakpoints = [
      { width: 640, size: '100vw' },
      { width: 1024, size: '50vw' },
      { width: 1440, size: '33vw' },
      { width: 1920, size: '25vw' }
    ]

    const sizesEntries = breakpoints
      .filter(bp => sizes.includes(bp.width))
      .map(bp => `(max-width: ${bp.width}px) ${bp.size}`)

    sizesEntries.push('25vw') // Default size
    
    return sizesEntries.join(', ')
  }

  private static getImageMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      'webp': 'image/webp',
      'avif': 'image/avif',
      'jpg': 'image/jpeg',
      'png': 'image/png'
    }
    
    return mimeTypes[format] || 'image/jpeg'
  }

  private static getOptimalImageWidth(
    deviceType: 'mobile' | 'tablet' | 'desktop',
    networkCondition?: NetworkCondition
  ): number {
    const strategy = this.getOptimizationStrategy(deviceType, networkCondition)
    const sizes = strategy.images.sizes
    
    // Return middle size as optimal
    return sizes[Math.floor(sizes.length / 2)]
  }

  private static minifyCSS(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Collapse whitespace
      .replace(/;\s*}/g, '}') // Remove last semicolon in blocks
      .replace(/\s*{\s*/g, '{') // Remove spaces around braces
      .replace(/;\s*/g, ';') // Remove spaces after semicolons
      .trim()
  }
}

/**
 * Lazy loading observer for images
 */
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  private images = new Set<HTMLImageElement>()

  constructor(
    options: IntersectionObserverInit = {
      rootMargin: '50px 0px', // Start loading 50px before image enters viewport
      threshold: 0.01
    }
  ) {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), options)
    }
  }

  /**
   * Start observing an image for lazy loading
   */
  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(img)
      this.images.add(img)
    } else {
      // Fallback: load immediately if IntersectionObserver not supported
      this.loadImage(img)
    }
  }

  /**
   * Stop observing an image
   */
  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.observer.unobserve(img)
      this.images.delete(img)
    }
  }

  /**
   * Disconnect observer and clean up
   */
  disconnect() {
    if (this.observer) {
      this.observer.disconnect()
      this.images.clear()
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        this.loadImage(img)
        this.unobserve(img)
      }
    })
  }

  private loadImage(img: HTMLImageElement) {
    // Get data attributes for lazy loading
    const src = img.dataset.src
    const srcset = img.dataset.srcset

    if (src) {
      img.src = src
    }
    
    if (srcset) {
      img.srcset = srcset
    }

    // Remove lazy loading data attributes
    delete img.dataset.src
    delete img.dataset.srcset

    // Add loaded class for CSS transitions
    img.classList.add('lazy-loaded')

    // Remove loading placeholder
    img.classList.remove('lazy-loading')
  }
}

// Auto-initialize lazy loading for existing images
if (typeof window !== 'undefined') {
  const lazyLoader = new LazyImageLoader()
  
  // Find all lazy images and start observing them
  document.addEventListener('DOMContentLoaded', () => {
    const lazyImages = document.querySelectorAll('img[data-src]')
    lazyImages.forEach(img => lazyLoader.observe(img as HTMLImageElement))
  })

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    lazyLoader.disconnect()
  })
}

export default AssetOptimizer