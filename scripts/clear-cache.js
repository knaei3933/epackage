#!/usr/bin/env node

/**
 * Complete Next.js Cache Clearance Script
 * Solves hydration mismatch issues caused by cached SSR content
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
};

const deleteFolderRecursive = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.rmSync(folderPath, { recursive: true, force: true });
    log(`✓ Deleted: ${folderPath}`, 'success');
  }
};

const main = () => {
  log('🧹 Starting Next.js Complete Cache Clearance...', 'info');

  const projectRoot = process.cwd();

  // Clear all Next.js caches
  const cachesToClear = [
    '.next',
    '.next/cache',
    '.next/server/app',
    '.next/static',
    '.next/static/chunks',
    '.next/static/media',
    '.next/static/css',
    '.next/static/webpack',
    'node_modules/.cache',
    '.vercel',
    'out'
  ];

  cachesToClear.forEach(cache => {
    const cachePath = path.join(projectRoot, cache);
    deleteFolderRecursive(cachePath);
  });

  // Clear Turbopack cache
  const turbopackCache = path.join(projectRoot, '.turbo');
  deleteFolderRecursive(turbopackCache);

  // Clear any Next.js cache in user home directory
  const homeNextCache = path.join(require('os').homedir(), '.next');
  deleteFolderRecursive(homeNextCache);

  // Clear package manager lock files for fresh install (optional)
  log('📦 Clearing package manager caches...', 'info');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
  } catch (e) {
    log('Warning: Could not clear npm cache', 'warning');
  }

  // Create a cache-busting timestamp file
  const timestampFile = path.join(projectRoot, '.next-build-timestamp');
  fs.writeFileSync(timestampFile, new Date().toISOString());
  log(`✓ Created cache-busting timestamp: ${timestampFile}`, 'success');

  // Environment variable to force refresh
  process.env.NEXT_CACHE_REBUILD = 'true';

  log('\n✨ Cache clearance complete!', 'success');
  log('\n📋 Next steps:', 'info');
  log('1. Run: npm run dev', 'info');
  log('2. Open browser in incognito/private mode', 'info');
  log('3. Do hard refresh (Ctrl+Shift+R or Cmd+Shift+R)', 'info');
  log('\n🔧 For persistent issues, try:', 'info');
  log('- Disable browser extensions temporarily', 'warning');
  log('- Clear browser cache completely', 'warning');
  log('- Use different browser', 'warning');
};

main();