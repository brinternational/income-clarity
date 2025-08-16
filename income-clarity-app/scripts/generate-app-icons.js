// Generate PNG icons for Next.js 14 /app directory
const fs = require('fs');
const path = require('path');

// For PNG generation, we'll create a simple SVG first then note conversion needed
const appDir = path.join(__dirname, '../app');

// Create the PNG icon data URLs (base64 encoded PNGs)
// Since we can't generate actual PNGs in Node.js without external libraries,
// we'll create placeholder files that need to be replaced with actual PNGs

const createSVGForConversion = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0066cc" rx="${size * 0.1}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">IC</text>
</svg>`;
};

// console.log('Next.js 14 App Directory Icon Generator');
// console.log('======================================');

// Create the SVG content for conversion reference
const iconSVG = createSVGForConversion(192);
const appleIconSVG = createSVGForConversion(180);

// Save SVG templates for manual conversion
fs.writeFileSync(path.join(__dirname, 'icon-template.svg'), iconSVG);
fs.writeFileSync(path.join(__dirname, 'apple-icon-template.svg'), appleIconSVG);

// console.log('Generated SVG templates:');
// console.log('- icon-template.svg (192x192)');
// console.log('- apple-icon-template.svg (180x180)');
// console.log('');
// console.log('NEXT STEPS:');
// console.log('1. Convert these SVG files to PNG:');
// console.log('   - icon-template.svg → app/icon.png');
// console.log('   - apple-icon-template.svg → app/apple-icon.png');
// console.log('2. Use online converter like: https://convertio.co/svg-png/');
// console.log('3. Or use ImageMagick: convert icon-template.svg app/icon.png');
// console.log('');
// console.log('Design specs:');
// console.log('- Background: #0066cc (Income Clarity blue)');
// console.log('- Text: "IC" in white, bold Arial');
// console.log('- Rounded corners: 10% of size');
// console.log('- icon.png: 192x192 pixels');
// console.log('- apple-icon.png: 180x180 pixels');