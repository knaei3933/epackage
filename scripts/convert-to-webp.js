const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../public/images/blog');

async function convertToWebP() {
  const dirs = fs.readdirSync(BLOG_DIR).filter(d => fs.statSync(path.join(BLOG_DIR, d)).isDirectory());

  let totalConverted = 0;
  let totalSizeBefore = 0;
  let totalSizeAfter = 0;

  for (const dir of dirs) {
    const dirPath = path.join(BLOG_DIR, dir);
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));

    for (const file of files) {
      const inputPath = path.join(dirPath, file);
      const outputPath = inputPath.replace('.png', '.webp');

      const statsBefore = fs.statSync(inputPath);
      totalSizeBefore += statsBefore.size;

      await sharp(inputPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);

      const statsAfter = fs.statSync(outputPath);
      totalSizeAfter += statsAfter.size;

      const savings = ((1 - statsAfter.size / statsBefore.size) * 100).toFixed(1);
      console.log(`✓ ${dir}/${file}: ${statsBefore.size} -> ${statsAfter.size} bytes (${savings}% reduction)`);
      totalConverted++;
    }
  }

  const totalSavings = ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1);
  console.log('\n=== Summary ===');
  console.log(`Total converted: ${totalConverted} images`);
  console.log(`Total size before: ${(totalSizeBefore / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total size after: ${(totalSizeAfter / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total savings: ${totalSavings}%`);
}

convertToWebP().catch(console.error);
