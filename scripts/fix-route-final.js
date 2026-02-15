const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/app/api/b2b/documents/[id]/download/route.ts',
  'src/app/api/b2b/orders/[id]/production-logs/route.ts',
  'src/app/api/b2b/orders/[id]/tracking/route.ts',
  'src/app/api/customer/orders/[id]/route.ts',
  'src/app/api/notes/[id]/route.ts',
  'src/app/api/shipments/[id]/label/route.ts',
  'src/app/api/shipments/[id]/route.ts',
  'src/app/api/shipments/[id]/schedule-pickup/route.ts',
  'src/app/api/shipments/[id]/track/route.ts',
];

function fixRouteParams(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace all variations with the correct format
  // 1. { params: Promise<{ id: string }> } (missing outer params:)
  // 2. { params: { params: Promise<{ id: string }> } } (double params)

  content = content.replace(
    /\{ params: \{ params: Promise<\{ id: string \}> \} \}/g,
    '{ params: Promise<{ id: string }> }'
  );

  // Also fix cases where the type annotation might have other property names
  content = content.replace(
    /\{ params: \{ params: Promise<\{ ([a-z]+): string \}> \} \}/g,
    '{ params: Promise<{ $1: string }> }'
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Final route params fix...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixRouteParams(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
