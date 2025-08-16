// Generate PWA icons from a base icon
// Run with: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// PWA icon sizes needed
const iconSizes = [
  16, 32, 48, 72, 96, 128, 144, 152, 192, 256, 384, 512,
  // Apple specific sizes
  180, // apple-touch-icon
  // Windows tile sizes
  70, 150, 310,
  // Shortcut icon sizes
  96
];

// Apple splash screen sizes (common iOS devices)
const splashSizes = [
  { width: 640, height: 1136, name: 'iphone5' },
  { width: 750, height: 1334, name: 'iphone6' },
  { width: 1125, height: 2436, name: 'iphonex' },
  { width: 1242, height: 2688, name: 'iphonemax' },
  { width: 1536, height: 2048, name: 'ipad' },
  { width: 1668, height: 2224, name: 'ipadpro10' },
  { width: 2048, height: 2732, name: 'ipadpro12' }
];

function generateIconHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Income Clarity - Icon Generator</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      margin: 0;
      padding: 40px 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .icon-container {
      text-align: center;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.2);
      max-width: 400px;
    }
    
    .icon {
      width: 200px;
      height: 200px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
      border-radius: 25%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .icon::before {
      content: '';
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15%;
      backdrop-filter: blur(10px);
    }
    
    .icon-text {
      color: white;
      font-size: 64px;
      font-weight: bold;
      z-index: 1;
      position: relative;
      text-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    
    .app-name {
      font-size: 28px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .app-tagline {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 30px;
    }
    
    .generate-info {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      text-align: left;
      border: 1px solid #e2e8f0;
    }
    
    .generate-info h3 {
      margin: 0 0 15px 0;
      color: #334155;
      font-size: 18px;
    }
    
    .size-list {
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
      margin: 0;
    }
    
    .instruction {
      background: #dbeafe;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
      color: #1e40af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="icon-container">
    <div class="icon">
      <div class="icon-text">IC</div>
    </div>
    
    <h1 class="app-name">Income Clarity</h1>
    <p class="app-tagline">Live off your portfolio with confidence</p>
    
    <div class="generate-info">
      <h3>PWA Icon Sizes Needed:</h3>
      <div class="size-list">
${iconSizes.map(size => `        ${size}x${size}px (icon-${size}x${size}.png)`).join('\n')}
      </div>
      
      <div class="instruction">
        <strong>Instructions:</strong><br>
        1. Take a screenshot of this icon<br>
        2. Use an online icon generator (like realfavicongenerator.net)<br>
        3. Generate all required sizes<br>
        4. Place icons in the /public/icons/ directory
      </div>
    </div>
  </div>

  <script>
    // Make the icon downloadable
    function downloadIcon() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 512;
      canvas.height = 512;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, '#0ea5e9');
      gradient.addColorStop(1, '#0284c7');
      
      // Draw background with rounded corners
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, 512, 512, 128);
      ctx.fill();
      
      // Draw text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 200px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 5;
      ctx.fillText('IC', 256, 256);
      
      // Download
      const link = document.createElement('a');
      link.download = 'income-clarity-icon-512x512.png';
      link.href = canvas.toDataURL();
      link.click();
    }
    
    // Add click handler to icon
    document.querySelector('.icon').addEventListener('click', downloadIcon);
    document.querySelector('.icon').style.cursor = 'pointer';
    document.querySelector('.icon').title = 'Click to download base icon';
  </script>
</body>
</html>`;
}

// Create the icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate the icon generator HTML
const iconGeneratorPath = path.join(iconsDir, 'generate-icons.html');
fs.writeFileSync(iconGeneratorPath, generateIconHTML());

// console.log('✅ Icon generator created at:', iconGeneratorPath);
// console.log('📱 Open generate-icons.html in your browser to create PWA icons');
// console.log('🎨 Icon sizes needed:', iconSizes.join(', '));
// console.log('');
// console.log('Next steps:');
// console.log('1. Open public/icons/generate-icons.html in your browser');
// console.log('2. Click the icon to download a base 512x512 version');
// console.log('3. Use https://realfavicongenerator.net to generate all sizes');
// console.log('4. Place all generated icons in the public/icons/ directory');

// Generate a simple manifest validation script
const validateManifest = `
// Validate PWA manifest and icons
const requiredIcons = ${JSON.stringify(iconSizes)};
const iconsDir = './public/icons/';

requiredIcons.forEach(size => {
  const iconPath = iconsDir + \`icon-\${size}x\${size}.png\`;
  try {
    require('fs').accessSync(iconPath);
    // console.log('✅', \`icon-\${size}x\${size}.png\`);
  } catch (e) {
    // console.log('❌', \`icon-\${size}x\${size}.png\`, '- MISSING');
  }
});
`;

fs.writeFileSync(path.join(__dirname, 'validate-icons.js'), validateManifest);
// console.log('📋 Icon validator created at: scripts/validate-icons.js');
// console.log('🔍 Run with: node scripts/validate-icons.js');