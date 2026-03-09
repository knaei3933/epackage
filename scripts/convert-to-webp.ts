import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = path.join(process.cwd(), 'public/images');
const targetFiles = ['cut.png', 'pouch.png', 'print.png', 'rami.png'];
const targetSizeKB = 100;

async function convertToWebP(filePath: string, targetSizeKB: number): Promise<void> {
  const stats = fs.statSync(filePath);
  const originalSizeKB = stats.size / 1024;

  console.log(`\n処理中: ${path.basename(filePath)}`);
  console.log(`  元のサイズ: ${originalSizeKB.toFixed(2)} KB`);

  const outputPath = filePath.replace('.png', '.webp');

  // 品質を段階的に下げて目標サイズに達するまで試行
  let quality = 90;
  let success = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!success && attempts < maxAttempts) {
    const tempPath = outputPath.replace('.webp', `-temp-${quality}.webp`);

    await sharp(filePath)
      .webp({ quality, effort: 6 })
      .toFile(tempPath);

    const newStats = fs.statSync(tempPath);
    const newSizeKB = newStats.size / 1024;

    console.log(`  品質 ${quality}%: ${newSizeKB.toFixed(2)} KB`);

    if (newSizeKB <= targetSizeKB) {
      // 目標サイズ以下の場合、この品質を採用
      fs.renameSync(tempPath, outputPath);
      console.log(`  ✓ 変換完了: ${newSizeKB.toFixed(2)} KB (品質: ${quality}%)`);
      success = true;
    } else {
      // 一時ファイルを削除
      fs.unlinkSync(tempPath);
      quality -= 5;
      if (quality < 50) {
        quality = 50;
      }
    }

    attempts++;
  }

  if (!success) {
    console.log(`  ⚠ 警告: 目標サイズ(${targetSizeKB}KB)以下に圧縮できませんでした`);
  }
}

async function main() {
  console.log('=== WebP変換スクリプト ===');
  console.log(`目標サイズ: ${targetSizeKB}KB以下\n`);

  for (const filename of targetFiles) {
    const filePath = path.join(imagesDir, filename);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠ ファイルが存在しません: ${filename}`);
      continue;
    }

    await convertToWebP(filePath, targetSizeKB);
  }

  console.log('\n=== 変換完了 ===');

  // 結果サマリー
  console.log('\n=== 変換結果サマリー ===');
  for (const filename of targetFiles) {
    const webpPath = path.join(imagesDir, filename.replace('.png', '.webp'));
    if (fs.existsSync(webpPath)) {
      const stats = fs.statSync(webpPath);
      const sizeKB = stats.size / 1024;
      const originalPath = path.join(imagesDir, filename);
      const originalStats = fs.statSync(originalPath);
      const originalSizeKB = originalStats.size / 1024;
      const reduction = ((originalSizeKB - sizeKB) / originalSizeKB * 100).toFixed(1);

      console.log(`${filename.replace('.png', '.webp')}`);
      console.log(`  ${originalSizeKB.toFixed(2)} KB → ${sizeKB.toFixed(2)} KB (${reduction}% 削減)`);
    }
  }
}

main().catch(console.error);
