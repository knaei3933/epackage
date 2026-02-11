/**
 * Fix RouteContext interface to use Promise<> for params
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const files = [
  'src/app/api/admin/customers/[id]/route.ts',
  'src/app/api/admin/customers/[id]/contact-history/route.ts',
  'src/app/api/admin/settings/customer-markup/%5Bid%5D/route.ts',
  'src/app/api/admin/settings/%5Bkey%5D/route.ts',
  'src/app/api/admin/coupons/%5Bid%5D/route.ts',
];

for (const file of files) {
  const fullPath = join(rootDir, file);
  const content = readFileSync(fullPath, 'utf-8');

  // Fix RouteContext interface - wrap params type in Promise<>
  const newContent = content.replace(
    /interface RouteContext\s*\{\s*params\s*:\s*\{([^}]+)\}\s*;\s*\}/g,
    (match, inner) => {
      if (inner.includes('Promise<')) {
        return match;
      }
      return `interface RouteContext {\n  params: Promise<{${inner}}>;\n}`;
    }
  );

  if (newContent !== content) {
    writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`Fixed: ${file}`);
  }
}

console.log('RouteContext interfaces fixed');
