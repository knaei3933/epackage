const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function findDynamicRoutes() {
  try {
    const result = execSync(
      'grep -r "params: { params: Promise" src/app/api --include="*.ts" -l',
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

  // Fix the broken syntax from previous script
  // Change: { params: { params: Promise<{ id: string }> } }
  // To: { params: Promise<{ id: string }> }
  content = content.replace(
    /\{ params: \{ params: Promise<\{ ([^}]+) \}> \} \}/g,
    '{ params: Promise<{ $1 }> }'
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  }

  return false;
}

console.log('🔧 Fixing broken route params syntax...\n');

const files = findDynamicRoutes();
console.log(`Found ${files.length} files to fix\n`);

let fixedCount = 0;
for (const file of files) {
  if (fixRouteParams(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
