const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const folders = [
  '01-gazette-pouch',
  '02-variable-printing',
  '03-small-lot-guide',
  '04-stand-pouch',
  '05-printing-comparison'
];

async function convertToWebP() {
  // Go up from scripts/ to project root
  const basePath = path.join(__dirname, '..', 'public', 'images', 'blog');
  console.log('Base path:', basePath);
  console.log('Base path exists:', fs.existsSync(basePath));
  
  for (const folder of folders) {
    const dir = path.join(basePath, folder);
    console.log(`Checking dir: ${dir}, exists: ${fs.existsSync(dir)}`);

    if (!fs.existsSync(dir)) {
      console.log(`Skipping ${folder} - directory not found`);
      continue;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    console.log(`Processing ${folder}: ${files.length} PNG files`);

    for (const file of files) {
      const pngPath = path.join(dir, file);
      const webpPath = pngPath.replace('.png', '.webp');

      if (fs.existsSync(webpPath)) {
        console.log(`  Skipping ${file} - WebP already exists`);
        continue;
      }

      try {
        await sharp(pngPath).webp({ quality: 85 }).toFile(webpPath);
        console.log(`  Converted: ${file} -> ${path.basename(webpPath)}`);
      } catch (error) {
        console.error(`  Error converting ${file}:`, error.message);
      }
    }
  }
  console.log('WebP conversion complete!');
}

convertToWebP().catch(console.error);
