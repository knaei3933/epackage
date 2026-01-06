const fs = require('fs');
const path = require('path');

// Fix all createClient imports to use createSupabaseClient
function fixCreateClientImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace createClient import with createSupabaseClient
  content = content.replace(
    /import \{ createClient \} from ['"]@\/lib\/supabase['"]/g,
    "import { createSupabaseClient } from '@/lib/supabase'"
  );

  // Replace usage
  content = content.replace(
    /createClient\(/g,
    'createSupabaseClient('
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

// Files that were previously using createClient
const filesToFix = [
  'src/app/api/admin/production/jobs/route.ts',
  'src/app/api/admin/shipping/shipments/route.ts',
  'src/app/api/admin/shipping/tracking/[shipmentId]/route.ts',
  'src/app/api/ai-parser/approve/route.ts',
  'src/app/api/ai-parser/extract/route.ts',
  'src/app/api/ai-parser/reprocess/route.ts',
  'src/app/api/ai-parser/validate/route.ts',
  'src/lib/production-actions.ts',
];

console.log('🔧 Fixing createClient imports...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixCreateClientImports(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
