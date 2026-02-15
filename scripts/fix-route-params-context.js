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
];

function fixRouteParams(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace { params: Promise<{ id: string }> } with context: { params: Promise<{ id: string }> }
  content = content.replace(
    /\{ params: Promise<\{ ([a-z]+): string \}> \}/g,
    'context: { params: Promise<{ $1: string }> }'
  );

  // Fix usage from await params to await context.params
  content = content.replace(
    /const \{ ([a-z]+): ([a-z]+) \} = await params;/g,
    'const { $1: $2 } = await context.params;'
  );

  // Also fix destructuring directly
  content = content.replace(
    /const \{ ([a-z]+) \} = await params;/g,
    'const { $1 } = await context.params;'
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Fixing route params with context pattern...\n');

let fixedCount = 0;
for (const file of filesToFix) {
  if (fixRouteParams(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
