#!/usr/bin/env node
/**
 * Fix Framer Motion Dynamic Import Pattern
 *
 * This script fixes incorrect dynamic imports of Framer Motion components.
 * The pattern `const motion = dynamic(...)` doesn't work because:
 * 1. motion is not a component, it's a function that returns JSX elements
 * 2. Hooks like useInView cannot be dynamically imported
 * 3. Next.js dynamic() only works for React components
 *
 * Solution: Revert to static imports for Framer Motion
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = join(__dirname, '..');
const SRC_DIR = join(ROOT_DIR, 'src');

/**
 * Fix Framer Motion imports in a file
 */
function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf-8');
    let modified = false;

    // Pattern 1: Single motion import
    const pattern1 = /import dynamic from ['"]next\/dynamic['"]\s*const motion = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.motion \}\)\), \{ ssr: false \}\)\s*/g;
    if (pattern1.test(content)) {
      content = content.replace(pattern1, "import { motion } from 'framer-motion'\n");
      modified = true;
    }

    // Pattern 2: motion + AnimatePresence
    const pattern2 = /import dynamic from ['"]next\/dynamic['"]\s*const motion = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.motion \}\)\), \{ ssr: false \}\)\s*const AnimatePresence = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.AnimatePresence \}\)\), \{ ssr: false \}\)\s*/g;
    if (pattern2.test(content)) {
      content = content.replace(pattern2, "import { motion, AnimatePresence } from 'framer-motion'\n");
      modified = true;
    }

    // Pattern 3: Single AnimatePresence import
    const pattern3 = /const AnimatePresence = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.AnimatePresence \}\)\), \{ ssr: false \}\)\s*/g;
    if (pattern3.test(content)) {
      content = content.replace(pattern3, '');
      // Check if motion import exists, if not add it
      if (!content.includes("import { motion")) {
        content = content.replace(
          /import dynamic from ['"]next\/dynamic['"]\s*/,
          "import { motion } from 'framer-motion'\n"
        );
      }
      modified = true;
    }

    // Pattern 4: useInView import (hook)
    const pattern4 = /const useInView = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.useInView \}\)\), \{ ssr: false \}\)\s*/g;
    if (pattern4.test(content)) {
      content = content.replace(pattern4, '');
      // Add useInView to existing imports
      if (content.includes("import { motion")) {
        content = content.replace(
          /import \{ motion \}/,
          "import { motion, useInView }"
        );
      } else if (content.includes("import { motion, AnimatePresence")) {
        content = content.replace(
          /import \{ motion, AnimatePresence \}/,
          "import { motion, AnimatePresence, useInView }"
        );
      } else {
        content = content.replace(
          /import dynamic from ['"]next\/dynamic['"]\s*/,
          "import { useInView } from 'framer-motion'\n"
        );
      }
      modified = true;
    }

    // Pattern 5: type imports with dynamic motion
    const pattern5 = /import type \{ ([^}]+) \} from ['"]framer-motion['"]\s*import dynamic from ['"]next\/dynamic['"]\s*const motion = dynamic\(\(\) => import\(['"]framer-motion['"]\)\.then\(mod => \(\{ default: mod\.motion \}\)\), \{ ssr: false \}\);?\s*/g;
    if (pattern5.test(content)) {
      const match = content.match(pattern5);
      if (match) {
        const types = match[1];
        content = content.replace(pattern5, `import type { ${types} } from 'framer-motion'\nimport { motion } from 'framer-motion'\n`);
        modified = true;
      }
    }

    // Clean up leftover dynamic import if no other dynamic imports exist
    if (modified && content.includes("import dynamic from 'next/dynamic'")) {
      // Check if dynamic is still used for other imports
      const hasOtherDynamicImports = /const \w+ = dynamic\(/.test(content) && !/const (motion|AnimatePresence|useInView) = dynamic\(/.test(content);
      if (!hasOtherDynamicImports) {
        content = content.replace(/import dynamic from ['"]next\/dynamic['"]\s*\n?/g, '');
      }
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively find all TS/TSX files
 */
function findFiles(dir, extensions = ['.ts', '.tsx']) {
  const files = [];

  const items = readdirSync(dir);
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (item !== 'node_modules' && item !== '.next' && item !== '.git') {
        files.push(...findFiles(fullPath, extensions));
      }
    } else if (stat.isFile()) {
      const ext = item.substring(item.lastIndexOf('.'));
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Main execution
 */
function main() {
  console.log('🔧 Fixing Framer Motion imports...\n');

  const allFiles = findFiles(SRC_DIR);
  const affectedFiles = [];
  let fixedCount = 0;

  // First pass: find affected files
  for (const file of allFiles) {
    try {
      const content = readFileSync(file, 'utf-8');
      if (content.includes("const motion = dynamic") ||
          content.includes("const AnimatePresence = dynamic") ||
          content.includes("const useInView = dynamic")) {
        affectedFiles.push(file);
      }
    } catch (error) {
      // Skip unreadable files
    }
  }

  console.log(`Found ${affectedFiles.length} files with Framer Motion dynamic imports\n`);

  // Second pass: fix files
  for (const file of affectedFiles) {
    const relativePath = file.replace(ROOT_DIR + '/', '');
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
      console.log(`✅ Fixed: ${relativePath}`);
    } else {
      console.log(`⚠️  Skipped: ${relativePath} (no changes needed)`);
    }
  }

  console.log(`\n✨ Fixed ${fixedCount} files`);

  if (fixedCount > 0) {
    console.log('\n📝 Summary:');
    console.log('   - Replaced dynamic imports with static imports');
    console.log('   - motion, AnimatePresence, useInView now use standard imports');
    console.log('   - Removed unnecessary dynamic() calls for Framer Motion');
  }
}

// Run the script
main();
