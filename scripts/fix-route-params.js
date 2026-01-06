const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all dynamic route files with params
function findDynamicRoutes() {
  try {
    const result = execSync(
      'find src/app/api -type f -name "route.ts" -o -name "route.tsx" | grep "\\[.*\\]"',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function fixRouteParams(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Fix params type from { params: { id: string } } to { params: Promise<{ id: string }> }
  content = content.replace(
    /\{ params \}: \{ params: \{ ([^}]+) \} \}/g,
    '{ params: { params: Promise<{ $1 }> } }'
  );

  // Fix usage from params.id to await params; const { id } = await params;
  content = content.replace(
    /const (\w+) = params\.(\w+);/g,
    'const { $2: $1 } = await params;'
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Finding and fixing dynamic route params...\n');

const files = findDynamicRoutes();
console.log(`Found ${files.length} dynamic route files\n`);

let fixedCount = 0;
for (const file of files) {
  if (fixRouteParams(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
