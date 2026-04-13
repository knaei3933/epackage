const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Main hero images to optimize
const mainImages = [
  { name: 'main15.png', quality: 75, width: 1920 }, // Primary hero image
  { name: 'main1.png', quality: 70, width: 1920 },
  { name: 'main16.png', quality: 70, width: 1920 },
  { name: 'main17.png', quality: 70, width: 1920 },
];

async function convertToWebP() {
  const basePath = __dirname;

  console.log('Starting WebP conversion for main hero images...');
  console.log('Base path:', basePath);

  for (const img of mainImages) {
    const pngPath = path.join(basePath, img.name);
    const webpPath = pngPath.replace('.png', '.webp');

    if (!fs.existsSync(pngPath)) {
      console.log(`  Skipping ${img.name} - file not found`);
      continue;
    }

    if (fs.existsSync(webpPath)) {
      console.log(`  Skipping ${img.name} - WebP already exists`);
      continue;
    }

    try {
      // Get original image info
      const metadata = await sharp(pngPath).metadata();
      console.log(`  Processing ${img.name} (${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB)`);

      // Convert to WebP with optimization
      await sharp(pngPath)
        .resize(img.width, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({
          quality: img.quality,
          nearLossless: true,
          smartSubsample: true
        })
        .toFile(webpPath);

      const webpSize = fs.statSync(webpPath).size;
      const pngSize = fs.statSync(pngPath).size;
      const savings = ((1 - webpSize / pngSize) * 100).toFixed(1);

      console.log(`  ✓ Converted: ${img.name} -> ${img.name.replace('.png', '.webp')} (${Math.round(webpSize / 1024)}KB, ${savings}% smaller)`);
    } catch (error) {
      console.error(`  ✗ Error converting ${img.name}:`, error.message);
    }
  }

  console.log('\nWebP conversion complete!');
  console.log('\nNext steps:');
  console.log('1. Update HeroSection.tsx to use WebP images');
  console.log('2. Test LCP with Google PageSpeed Insights');
}

convertToWebP().catch(console.error);
