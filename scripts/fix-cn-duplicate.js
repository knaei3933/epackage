const fs = require('fs');
const path = require('path');

// Files with duplicate cn function
const filesToFix = [
  'src/app/portal/orders/[id]/page.tsx',
  'src/app/portal/orders/page.tsx',
  'src/app/portal/documents/page.tsx',
  'src/components/admin/CatalogDownloadAdmin.tsx',
];

function fixCnDuplicate(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Remove the local cn function definition (usually at the end)
  // Pattern 1: function cn(...)
  content = content.replace(
    /\n?function cn\([^)]*\)[^{]*\{[^}]*classes\.filter\(Boolean\)\.join\(' '\)[^}]*\}\s*\n?/g,
    '\n'
  );

  // Pattern 2: const cn = ...
  content = content.replace(
    /\n?const cn = \([^)]*\) =>[^;]*classes\.filter\(Boolean\)\.join\(' '\)[;]?\s*\n?/g,
    '\n'
  );

  // Check if @/lib/utils is imported
  if (!content.includes("from '@/lib/utils'") && !content.includes('from "@/lib/utils"')) {
    // Add the import at the top after other imports
    const importMatch = content.match(/^(import .+;)$/m);
    if (importMatch) {
      const lastImportIndex = content.lastIndexOf(importMatch[0]);
      const insertPosition = content.indexOf('\n', lastImportIndex) + 1;
      content = content.slice(0, insertPosition) +
        `import { cn } from '@/lib/utils';\n` +
        content.slice(insertPosition);
    } else {
      // No imports found, add at the very top
      content = `import { cn } from '@/lib/utils';\n\n` + content;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed cn duplicate in ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Fixing duplicate cn function definitions...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixCnDuplicate(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
