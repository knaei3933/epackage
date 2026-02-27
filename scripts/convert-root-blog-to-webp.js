const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Root blog directory PNG files that need WebP conversion
const rootFiles = [
  'cost-reduction-comparison',
  'cta-banner',
  'customer-reaction',
  'future-vision',
  'inventory-problem',
  'packaging-selection',
  'president-interview',
  'quality-assurance',
  'results-chart',
  'stand-pouch-product'
];

async function convertRootFiles() {
  const blogDir = path.join(__dirname, '..', 'public', 'images', 'blog');
  console.log('Converting root blog directory PNG files to WebP...');
  
  for (const basename of rootFiles) {
    const pngPath = path.join(blogDir, `${basename}.png`);
    const webpPath = path.join(blogDir, `${basename}.webp`);
    
    if (!fs.existsSync(pngPath)) {
      console.log(`  Skipping ${basename}.png - not found`);
      continue;
    }
    
    if (fs.existsSync(webpPath)) {
      console.log(`  Skipping ${basename}.webp - already exists`);
      continue;
    }
    
    try {
      await sharp(pngPath).webp({ quality: 85 }).toFile(webpPath);
      const stats = fs.statSync(pngPath);
      const webpStats = fs.statSync(webpPath);
      const savings = ((1 - webpStats.size / stats.size) * 100).toFixed(1);
      console.log(`  Converted: ${basename}.png (${formatSize(stats.size)}) -> ${basename}.webp (${formatSize(webpStats.size)}) - ${savings}% reduction`);
    } catch (error) {
      console.error(`  Error converting ${basename}:`, error.message);
    }
  }
  console.log('Root blog directory WebP conversion complete!');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

convertRootFiles().catch(console.error);
