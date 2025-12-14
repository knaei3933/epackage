const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Images to optimize
const images = [
  {
    src: 'public/images/hero-manufacturing-facility.png',
    dest: 'public/images/hero-manufacturing-facility.webp',
    quality: 85
  },
  {
    src: 'public/images/hero-packaging-closeup.png',
    dest: 'public/images/hero-packaging-closeup.webp',
    quality: 90
  }
];

async function optimizeImages() {
  console.log('Starting image optimization...');

  for (const image of images) {
    try {
      if (fs.existsSync(image.src)) {
        await sharp(image.src)
          .webp({
            quality: image.quality,
            effort: 6,
            smartSubsample: true
          })
          .toFile(image.dest);

        console.log(`✅ Optimized: ${image.dest}`);

        // Check file sizes
        const originalStats = fs.statSync(image.src);
        const webpStats = fs.statSync(image.dest);
        const savings = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);

        console.log(`   Original: ${(originalStats.size / 1024 / 1024).toFixed(2)}MB`);
        console.log(`   WebP: ${(webpStats.size / 1024 / 1024).toFixed(2)}MB (${savings}% smaller)`);
      } else {
        console.log(`⚠️  Source not found: ${image.src}`);
      }
    } catch (error) {
      console.error(`❌ Error optimizing ${image.src}:`, error.message);
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error);