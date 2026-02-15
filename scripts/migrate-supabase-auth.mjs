/**
 * Migration Script: @supabase/auth-helpers-nextjs → @supabase/ssr
 *
 * This script automatically migrates API routes from the deprecated
 * createRouteHandlerClient to the modern createSupabaseSSRClient pattern.
 */

import { readFileSync, writeFileSync } from 'fs';
import { readdir, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Patterns to replace
const replacements = [
  // Import statement replacements
  {
    pattern: /import\s+{\s*createRouteHandlerClient\s*}.*?from\s+['"]@supabase\/auth-helpers-nextjs['"];?\s*\nimport\s+{\s*cookies\s*}\s+from\s+['"]next\/headers['"];?/gs,
    replacement: "import { createSupabaseSSRClient } from '@/lib/supabase-ssr';",
  },
  {
    pattern: /import\s+{\s*cookies\s*}\s+from\s+['"]next\/headers['"];?\s*\n.*?createRouteHandlerClient.*?from\s+['"]@supabase\/auth-helpers-nextjs['"];?/gs,
    replacement: "import { createSupabaseSSRClient } from '@/lib/supabase-ssr';",
  },
  {
    pattern: /import\s+{\s*createRouteHandlerClient\s*}.*?from\s+['"]@supabase\/auth-helpers-nextjs['"];?\s*\nimport\s+{\s*cookies\s*}\s+from\s+['"]next\/headers['"];?/gs,
    replacement: "import { createSupabaseSSRClient } from '@/lib/supabase-ssr';",
  },
  // Single import replacements
  {
    pattern: /import\s+{\s*createRouteHandlerClient\s*}.*?from\s+['"]@supabase\/auth-helpers-nextjs['"];?\s*\n/g,
    replacement: '',
  },
  {
    pattern: /import\s+{\s*cookies\s*}\s+from\s+['"]next\/headers['"];?\s*\n/g,
    replacement: '',
  },
  // Usage replacements - POST/GET/PATCH/DELETE handlers
  {
    pattern: /\/\/\s*Next\.js\s*16:\s*cookies\(\)\s*now\s*returns\s*a\s*Promise\s*and\s*must\s*be\s*awaited\s*\n\s*const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*\n\s*const\s+(\w+)\s*=\s*createRouteHandlerClient\(\{\s*cookies:\s*\(\)\s*=>\s*cookieStore\s*\}\);?\s*\n/gs,
    replacement: "// Initialize Supabase client using modern @supabase/ssr pattern\n    const { client: $1 } = createSupabaseSSRClient(request);\n",
  },
  {
    pattern: /const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*\n\s*const\s+(\w+)\s*=\s*createRouteHandlerClient\(\{\s*cookies:\s*\(\)\s*=>\s*cookieStore\s*\}\);?\s*\n/gs,
    replacement: "const { client: $1 } = createSupabaseSSRClient(request);\n",
  },
  {
    pattern: /const\s+(\w+)\s*=\s*createRouteHandlerClient<\w+>\(\{[^}]*cookies[^}]*\}\);?\s*\n/g,
    replacement: "const { client: $1 } = createSupabaseSSRClient(request);\n",
  },
  {
    pattern: /const\s+(\w+)\s*=\s*createRouteHandlerClient\(\{[^}]*cookies[^}]*\}\);?\s*\n/g,
    replacement: "const { client: $1 } = createSupabaseSSRClient(request);\n",
  },
];

// Files to exclude
const excludePatterns = [
  /\.test\.ts$/,
  /\.spec\.ts$/,
  /__tests__/,
];

async function findFilesToMigrate(dir) {
  const files = [];

  async function traverse(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip if matches exclude patterns
        if (excludePatterns.some(pattern => pattern.test(fullPath))) {
          continue;
        }
        await traverse(fullPath);
      } else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
        // Skip if matches exclude patterns
        if (excludePatterns.some(pattern => pattern.test(fullPath))) {
          continue;
        }

        const content = readFileSync(fullPath, 'utf-8');
        if (content.includes('createRouteHandlerClient')) {
          files.push(fullPath);
        }
      }
    }
  }

  await traverse(dir);
  return files;
}

function migrateFile(filePath) {
  console.log(`Migrating: ${filePath.replace(projectRoot, '')}`);

  let content = readFileSync(filePath, 'utf-8');
  let modified = false;

  // Apply all replacements
  for (const { pattern, replacement } of replacements) {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      modified = true;
      content = newContent;
    }
  }

  // Add import if missing and file was modified
  if (modified && !content.includes('createSupabaseSSRClient')) {
    // Find the last import statement
    const importMatch = content.match(/^import\s+.*?;$/gm);
    if (importMatch && importMatch.length > 0) {
      const lastImport = importMatch[importMatch.length - 1];
      const insertIndex = content.indexOf(lastImport) + lastImport.length;
      content =
        content.slice(0, insertIndex) +
        `\nimport { createSupabaseSSRClient } from '@/lib/supabase-ssr';` +
        content.slice(insertIndex);
    }
  }

  if (modified) {
    writeFileSync(filePath, content, 'utf-8');
    return true;
  }

  return false;
}

async function main() {
  const apiDir = join(projectRoot, 'src', 'app', 'api');

  console.log('🔍 Finding files to migrate...\n');
  const filesToMigrate = await findFilesToMigrate(apiDir);

  console.log(`📊 Found ${filesToMigrate.length} files to migrate\n`);

  if (filesToMigrate.length === 0) {
    console.log('✅ All files already migrated!');
    return;
  }

  let migratedCount = 0;
  let failedCount = 0;

  for (const file of filesToMigrate) {
    try {
      const success = migrateFile(file);
      if (success) {
        migratedCount++;
        console.log(`  ✅ ${file.replace(projectRoot, '')}`);
      }
    } catch (error) {
      failedCount++;
      console.error(`  ❌ ${file.replace(projectRoot, '')}`);
      console.error(`     Error: ${error.message}`);
    }
  }

  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Migrated: ${migratedCount} files`);
  console.log(`   ❌ Failed: ${failedCount} files`);
  console.log(`   📊 Total: ${filesToMigrate.length} files`);

  if (failedCount > 0) {
    console.log('\n⚠️  Some files failed to migrate. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

main().catch(console.error);
