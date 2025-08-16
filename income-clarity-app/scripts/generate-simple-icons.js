// Simple icon generator for PWA
const fs = require('fs');
const path = require('path');

const iconSizes = [16, 32, 144, 192, 512];
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create simple SVG icons
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0066cc" rx="${size * 0.1}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold">IC</text>
</svg>`;
};

// Generate icons
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const fileName = `icon-${size}x${size}.svg`;
  const filePath = path.join(iconsDir, fileName);
  
  fs.writeFileSync(filePath, svgContent);
  // console.log(`Generated ${fileName}`);
});

// Create apple-touch-icon
const appleTouchIcon = createSVGIcon(180);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.svg'), appleTouchIcon);
// console.log('Generated apple-touch-icon.svg');

// console.log('All PWA icons generated successfully!');
// console.log('Note: These are SVG placeholders. For production, convert to PNG using a tool like Inkscape or online converter.');