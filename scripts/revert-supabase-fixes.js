const fs = require('fs');
const path = require('path');

// Revert createServiceClient back to createClient
function revertSupabaseImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Revert createServiceClient back to createClient
  content = content.replace(
    /import \{ createServiceClient \} from ['"]@\/lib\/supabase['"]/g,
    "import { createClient } from '@/lib/supabase'"
  );

  // Revert usage
  content = content.replace(
    /createServiceClient\(/g,
    'createClient('
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Reverted ${filePath}`);
    return true;
  }

  return false;
}

// Files to revert
const filesToRevert = [
  'src/app/api/admin/production/jobs/route.ts',
  'src/app/api/admin/shipping/shipments/route.ts',
  'src/app/api/admin/shipping/tracking/[shipmentId]/route.ts',
  'src/app/api/ai-parser/approve/route.ts',
  'src/app/api/ai-parser/extract/route.ts',
  'src/app/api/ai-parser/reprocess/route.ts',
  'src/app/api/ai-parser/validate/route.ts',
  'src/lib/production-actions.ts',
];

console.log('🔄 Reverting Supabase import fixes...\n');

let revertedCount = 0;
for (const file of filesToRevert) {
  if (revertSupabaseImports(file)) revertedCount++;
}

console.log(`\n✅ Reverted ${revertedCount} files`);
