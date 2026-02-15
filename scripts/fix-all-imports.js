const fs = require('fs');
const path = require('path');

// Fix @/lib/supabase/server imports to @/lib/supabase
const filesToFix = [
  'src/app/api/shipments/bulk-create/route.ts',
  'src/app/api/shipments/[id]/track/route.ts',
  'src/app/api/shipments/[id]/label/route.ts',
  'src/app/api/shipments/[id]/schedule-pickup/route.ts',
  'src/app/api/shipments/[id]/route.ts',
  'src/app/api/shipments/route.ts',
  'src/app/api/shipments/create/route.ts',
];

function fixImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace @/lib/supabase/server with @/lib/supabase
  content = content.replace(
    /from ['"]@\/lib\/supabase\/server['"]/g,
    "from '@/lib/supabase'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Fixing supabase/server imports...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixImports(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
