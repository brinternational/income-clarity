// Generate minimal PNG icons for Next.js app directory
const fs = require('fs');
const path = require('path');

// Create a minimal PNG file programmatically
// This creates a simple colored square PNG using PNG format specification

function createMinimalPNG(width, height, r, g, b) {
  // PNG file structure:
  // PNG signature + IHDR chunk + IDAT chunk + IEND chunk
  
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR chunk (Image Header)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);    // Width
  ihdrData.writeUInt32BE(height, 4);   // Height
  ihdrData.writeUInt8(8, 8);           // Bit depth
  ihdrData.writeUInt8(2, 9);           // Color type (RGB)
  ihdrData.writeUInt8(0, 10);          // Compression method
  ihdrData.writeUInt8(0, 11);          // Filter method
  ihdrData.writeUInt8(0, 12);          // Interlace method
  
  const ihdrCRC = crc32(Buffer.concat([Buffer.from('IHDR'), ihdrData]));
  const ihdrChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // Length
    Buffer.from('IHDR'),
    ihdrData,
    Buffer.from([(ihdrCRC >> 24) & 0xFF, (ihdrCRC >> 16) & 0xFF, (ihdrCRC >> 8) & 0xFF, ihdrCRC & 0xFF])
  ]);
  
  // Create image data (simple solid color)
  const pixelData = Buffer.alloc(height * (width * 3 + 1)); // 3 bytes per pixel + 1 filter byte per row
  let offset = 0;
  
  for (let y = 0; y < height; y++) {
    pixelData[offset++] = 0; // Filter type (None)
    for (let x = 0; x < width; x++) {
      pixelData[offset++] = r; // Red
      pixelData[offset++] = g; // Green  
      pixelData[offset++] = b; // Blue
    }
  }
  
  // Compress with zlib (simplified - just store uncompressed)
  const zlib = require('zlib');
  const compressedData = zlib.deflateSync(pixelData);
  
  const idatCRC = crc32(Buffer.concat([Buffer.from('IDAT'), compressedData]));
  const idatChunk = Buffer.concat([
    Buffer.from([(compressedData.length >> 24) & 0xFF, (compressedData.length >> 16) & 0xFF, (compressedData.length >> 8) & 0xFF, compressedData.length & 0xFF]),
    Buffer.from('IDAT'),
    compressedData,
    Buffer.from([(idatCRC >> 24) & 0xFF, (idatCRC >> 16) & 0xFF, (idatCRC >> 8) & 0xFF, idatCRC & 0xFF])
  ]);
  
  // IEND chunk
  const iendCRC = crc32(Buffer.from('IEND'));
  const iendChunk = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // Length
    Buffer.from('IEND'),
    Buffer.from([(iendCRC >> 24) & 0xFF, (iendCRC >> 16) & 0xFF, (iendCRC >> 8) & 0xFF, iendCRC & 0xFF])
  ]);
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 calculation for PNG chunks
function crc32(data) {
  const crcTable = [];
  for (let i = 0; i < 256; i++) {
    let crc = i;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
    }
    crcTable[i] = crc;
  }
  
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Create icons with Income Clarity blue (#0066cc = RGB 0, 102, 204)
const appDir = path.join(__dirname, '../app');

// console.log('Creating minimal PNG icons...');

try {
  const iconPNG = createMinimalPNG(192, 192, 0, 102, 204);
  const appleIconPNG = createMinimalPNG(180, 180, 0, 102, 204);
  
  fs.writeFileSync(path.join(appDir, 'icon.png'), iconPNG);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleIconPNG);
  
  // console.log('✓ Created app/icon.png (192x192) - Income Clarity blue');
  // console.log('✓ Created app/apple-icon.png (180x180) - Income Clarity blue');
  // console.log('');
  // console.log('Simple blue square PNG icons created successfully!');
  // console.log('These will serve as basic favicon/PWA icons to fix the 404 errors.');
  // console.log('');
  // console.log('Next steps:');
  // console.log('1. Restart the development server to pick up new static files');
  // console.log('2. Check browser console - 404 errors should be gone');
  // console.log('3. Verify favicon appears in browser tab');
  // console.log('4. Test PWA functionality');
  
} catch (error) {
  // console.error('Error creating PNG files:', error);
  // console.log('');
  // console.log('Fallback: Creating placeholder files...');
  
  // Create placeholder files that will at least stop the 404 errors
  const placeholder = Buffer.alloc(1024, 0);
  fs.writeFileSync(path.join(appDir, 'icon.png'), placeholder);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), placeholder);
  
  // console.log('✓ Created placeholder icon files');
  // console.log('Note: These are placeholder files. Replace with proper PNG icons later.');
}