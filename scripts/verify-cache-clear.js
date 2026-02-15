#!/usr/bin/env node

/**
 * Cache Clearance Verification Script
 * Verifies that old image paths are no longer being served
 */

const http = require('http');
const https = require('https');

const checkUrls = [
  'http://localhost:3000',
  'http://localhost:3000/',
  'http://localhost:3000/home',
  'http://localhost:3000/about'
];

const oldImagePaths = [
  '/images/printing-process.jpg',
  '/images/sealing-process.jpg',
  '/images/cutting-process.jpg'
];

const newImagePaths = [
  '/images/print.png',
  '/images/rami.png',
  '/images/cut.png',
  '/images/pouch.png'
];

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

const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ url, statusCode: res.statusCode, data }));
    });

    req.on('error', reject);
    req.setTimeout(5000, () => reject(new Error('Timeout')));
  });
};

const main = async () => {
  log('🔍 Verifying cache clearance and image paths...', 'info');

  let serverRunning = false;

  // Check if server is running
  for (const url of checkUrls) {
    try {
      const response = await fetchUrl(url);
      if (response.statusCode === 200) {
        serverRunning = true;
        log(`✓ Server is running at ${url}`, 'success');

        // Check for old image paths in HTML
        const htmlContent = response.data;
        const foundOldPaths = [];
        const foundNewPaths = [];

        oldImagePaths.forEach(path => {
          if (htmlContent.includes(path)) {
            foundOldPaths.push(path);
          }
        });

        newImagePaths.forEach(path => {
          if (htmlContent.includes(path)) {
            foundNewPaths.push(path);
          }
        });

        if (foundOldPaths.length > 0) {
          log(`❌ OLD IMAGE PATHS DETECTED:`, 'error');
          foundOldPaths.forEach(path => log(`   - ${path}`, 'error'));
        } else {
          log(`✓ No old image paths found`, 'success');
        }

        if (foundNewPaths.length > 0) {
          log(`✓ NEW IMAGE PATHS FOUND:`, 'success');
          foundNewPaths.forEach(path => log(`   - ${path}`, 'success'));
        } else {
          log(`⚠️  No new image paths detected in HTML`, 'warning');
        }

        break;
      }
    } catch (error) {
      // Server not running on this URL, try next
    }
  }

  if (!serverRunning) {
    log('❌ Next.js development server is not running!', 'error');
    log('\n📋 To fix this:', 'info');
    log('1. Run: npm run dev', 'info');
    log('2. Wait for server to start', 'info');
    log('3. Run this script again: node scripts/verify-cache-clear.js', 'info');
    process.exit(1);
  }

  log('\n✨ Verification complete!', 'success');
};

main().catch(error => {
  log(`Error: ${error.message}`, 'error');
  process.exit(1);
});