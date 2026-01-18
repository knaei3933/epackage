/**
 * Cleanup Script: Remove unused cookies() calls
 *
 * This script removes leftover "await cookies()" lines that are no longer
 * needed after migrating to createSupabaseSSRClient.
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Pattern to remove unused cookies() calls
const unusedCookiesPattern = /\s*\/\/\s*Next\.js\s*16:\s*cookies\(\)\s*now\s*returns\s*a\s*Promise\s*and\s*must\s*be\s*awaited\s*\n\s*const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*\n?/g;

// Files to exclude
const excludePatterns = [
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /__tests__/,
];

async function findFilesToClean(dir) {
  const files = [];

  async function traverse(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (excludePatterns.some(pattern => pattern.test(fullPath))) {
          continue;
        }
        await traverse(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        if (excludePatterns.some(pattern => pattern.test(fullPath))) {
          continue;
        }

        const content = readFileSync(fullPath, 'utf-8');
        if (content.match(unusedCookiesPattern)) {
          files.push(fullPath);
        }
      }
    }
  }

  await traverse(dir);
  return files;
}

function cleanFile(filePath) {
  console.log(`Cleaning: ${filePath.replace(projectRoot, '')}`);

  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Remove unused cookies() calls
  content = content.replace(unusedCookiesPattern, '\n');

  // Remove simple standalone cookies() calls
  content = content.replace(/\s*const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*\n?/g, '\n');

  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

async function main() {
  const apiDir = join(projectRoot, 'src', 'app', 'api');

  console.log('🔍 Finding files with unused cookies() calls...\n');
  const filesToClean = await findFilesToClean(apiDir);

  console.log(`📊 Found ${filesToClean.length} files to clean\n`);

  if (filesToClean.length === 0) {
    console.log('✅ No unused cookies() calls found!');
    return;
  }

  let cleanedCount = 0;
  let failedCount = 0;

  for (const file of filesToClean) {
    try {
      const success = cleanFile(file);
      if (success) {
        cleanedCount++;
        console.log(`  ✅ ${file.replace(projectRoot, '')}`);
      }
    } catch (error) {
      failedCount++;
      console.error(`  ❌ ${file.replace(projectRoot, '')}`);
      console.error(`     Error: ${error.message}`);
    }
  }

  console.log('\n📈 Cleanup Summary:');
  console.log(`   ✅ Cleaned: ${cleanedCount} files`);
  console.log(`   ❌ Failed: ${failedCount} files`);
  console.log(`   📊 Total: ${filesToClean.length} files`);

  if (failedCount > 0) {
    console.log('\n⚠️  Some files failed to clean. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Cleanup completed successfully!');
  }
}

main().catch(console.error);
