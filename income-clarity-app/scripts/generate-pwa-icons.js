#!/usr/bin/env node

/**
 * Generate PWA icons from a base icon
 * This creates all the necessary icon sizes for PWA
 */

const fs = require('fs');
const path = require('path');

// Icon sizes needed for comprehensive PWA support
const iconSizes = [
  // PWA manifest icons
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  
  // Apple touch icons
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  
  // Favicon
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
];

// Create a simple canvas-based icon generator
function generateIcon(size) {
  // For now, we'll create placeholder instructions
  return `
    <!-- Income Clarity Icon ${size}x${size} -->
    <!-- Create this icon with your preferred design tool -->
    <!-- 
      Design guidelines:
      - Use primary color: #0066cc
      - Include a dollar sign or chart symbol
      - Keep it simple and recognizable at small sizes
      - Ensure good contrast for accessibility
    -->
  `;
}

// Ensure icons directory exists
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate placeholder files
iconSizes.forEach(({ size, name }) => {
  const content = generateIcon(size);
  const filePath = path.join(iconsDir, name);
  
  // Create placeholder HTML file (to be replaced with actual PNGs)
  fs.writeFileSync(filePath.replace('.png', '.placeholder.html'), content);
});

// console.log('✅ Icon placeholders created in public/icons/');
// console.log('📝 Next steps:');
// console.log('   1. Create a base icon design (512x512px recommended)');
// console.log('   2. Use a tool like https://realfavicongenerator.net/');
// console.log('   3. Or use Canvas/Sharp to programmatically generate icons');
// console.log('   4. Replace the placeholder files with actual PNG images');

// Create an example SVG icon that can be converted
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="102.4" fill="#0066CC"/>
  <path d="M256 128C256 128 192 192 192 256C192 320 224 384 256 384C288 384 320 320 320 256C320 192 256 128 256 128Z" fill="white" opacity="0.9"/>
  <path d="M256 192L224 256H288L256 320" stroke="white" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="8" fill="white"/>
  <text x="256" y="420" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">IC</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon-base.svg'), svgIcon);
// console.log('✅ Created base SVG icon at public/icons/icon-base.svg');