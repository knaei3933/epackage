const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with createClient import from @/lib/supabase
function findFilesWithCreateClient() {
  try {
    const result = execSync(
      'grep -r "import.*createClient.*from.*@/lib/supabase" src --include="*.ts" --include="*.tsx" -l',
      { cwd: path.join(__dirname, '..'), encoding: 'utf8' }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

function fixFile(filePath) {
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

console.log('🔧 Finding and fixing all createClient imports...\n');

const files = findFilesWithCreateClient();
console.log(`Found ${files.length} files with createClient imports\n`);

let fixedCount = 0;
for (const file of files) {
  if (fixFile(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
