/**
 * Fix Next.js 16 params format in API routes
 * Changes from { params }: { params: { id: string } } to { params }: { params: Promise<{ id: string }> }
 * And adds await when destructuring params
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

// Find all route files with dynamic segments using find
const { execSync } = await import('child_process');

let files;
try {
  files = execSync('find src/app/api -type f -name "route.ts" | grep -E "\\[.*\\]"', {
    cwd: rootDir,
    encoding: 'utf-8'
  }).trim().split('\n').filter(f => f);
} catch {
  files = [];
}

let fixedCount = 0;
let skippedCount = 0;

for (const file of files) {
  const fullPath = join(rootDir, file);
  const content = readFileSync(fullPath, 'utf-8');
  let modified = false;
  let newContent = content;

  // Detect if file uses context.params pattern
  const usesContextParams = newContent.includes('context.params');

  if (!usesContextParams) {
    // Standard pattern: { params }: { params: { id: string } }
    // Step 1: Fix type annotation - find and replace params type
    const typeRegex = /(\{\s*params\s*}\s*:\s*\{\s*params\s*:\s*)\{([^}]+)\}(\s*\})/g;

    newContent = newContent.replace(typeRegex, (match, prefix, innerType, suffix) => {
      if (prefix.includes('Promise<')) {
        return match;
      }
      modified = true;
      return `${prefix}Promise<{${innerType}}>${suffix}`;
    });

    // Step 2: Find destructuring patterns and add await
    const destructuringRegex = /(^|\n)([ \t]*)const\s+(\{[^}]+\})\s*=\s*params\s*;/gm;

    newContent = newContent.replace(destructuringRegex, (match, newline, indent, destructuring) => {
      if (match.includes('await')) {
        return match;
      }
      modified = true;
      return `${newline}${indent}const ${destructuring} = await params;`;
    });

    // Step 3: Find direct property access like const id = params.id;
    const directAccessRegex = /(^|\n)([ \t]*)const\s+(\w+)\s*=\s*params\.(\w+)\s*;/gm;

    newContent = newContent.replace(directAccessRegex, (match, newline, indent, varName, prop) => {
      if (match.includes('await')) {
        return match;
      }
      modified = true;
      return `${newline}${indent}const { ${prop}: ${varName} } = await params;`;
    });
  } else {
    // context.params pattern - params is already awaited
    // Just need to fix direct property access from params.id to destructuring
    // Pattern: const orderId = params.id; -> const { id: orderId } = params;
    const directAccessRegex = /(^|\n)([ \t]*)const\s+(\w+)\s*=\s*params\.(\w+)\s*;/gm;

    newContent = newContent.replace(directAccessRegex, (match, newline, indent, varName, prop) => {
      if (match.includes('await')) {
        return match;
      }
      modified = true;
      // If varName equals prop, use shorthand { id }
      if (varName === prop) {
        return `${newline}${indent}const { ${prop} } = params;`;
      }
      return `${newline}${indent}const { ${prop}: ${varName} } = params;`;
    });
  }

  if (modified) {
    writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`Fixed: ${file}`);
    fixedCount++;
  } else {
    skippedCount++;
  }
}

console.log(`\nFixed ${fixedCount} files, skipped ${skippedCount} files (already correct or no changes needed)`);
