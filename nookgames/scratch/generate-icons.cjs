const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function createPng(width, height, getPixel) {
  const rowBytes = 1 + width * 4;
  const rawData = Buffer.alloc(rowBytes * height);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);

  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Rounded box SDF
function inRoundBox(x, y, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(x - cx) - halfW + r;
  const qy = Math.abs(y - cy) - halfH + r;
  const outsideDist = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const insideDist = Math.min(Math.max(qx, qy), 0);
  return (outsideDist + insideDist - r) <= 0;
}

// Sample at canonical 512x512 space
function sampleColor(x512, y512) {
  // Check the 4 quadrant boxes:
  // 1. Top-Left (#f0f0f0)
  if (inRoundBox(x512, y512, 184, 184, 56, 56, 24)) {
    return [240, 240, 240, 255];
  }
  // 2. Top-Right (#333333)
  if (inRoundBox(x512, y512, 328, 184, 56, 56, 24)) {
    return [51, 51, 51, 255];
  }
  // 3. Bottom-Left (#333333)
  if (inRoundBox(x512, y512, 184, 328, 56, 56, 24)) {
    return [51, 51, 51, 255];
  }
  // 4. Bottom-Right (#f0f0f0)
  if (inRoundBox(x512, y512, 328, 328, 56, 56, 24)) {
    return [240, 240, 240, 255];
  }
  // Background (#0a0a0a)
  return [10, 10, 10, 255];
}

function generateIcon(size) {
  const SAMPLES = 4; // 4x4 = 16 samples per pixel
  return createPng(size, size, (px, py) => {
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    for (let sy = 0; sy < SAMPLES; sy++) {
      for (let sx = 0; sx < SAMPLES; sx++) {
        const u = (px + (sx + 0.5) / SAMPLES) * (512 / size);
        const v = (py + (sy + 0.5) / SAMPLES) * (512 / size);
        const [r, g, b, a] = sampleColor(u, v);
        sumR += r;
        sumG += g;
        sumB += b;
        sumA += a;
      }
    }
    const count = SAMPLES * SAMPLES;
    return [
      Math.round(sumR / count),
      Math.round(sumG / count),
      Math.round(sumB / count),
      Math.round(sumA / count)
    ];
  });
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating 192x192 icon...');
const png192 = generateIcon(192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
console.log('Saved public/pwa-192x192.png (' + png192.length + ' bytes)');

console.log('Generating 512x512 icon...');
const png512 = generateIcon(512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
console.log('Saved public/pwa-512x512.png (' + png512.length + ' bytes)');
