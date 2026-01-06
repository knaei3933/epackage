const fs = require('fs');
const path = require('path');

// Fix createClient import to createServiceClient
function fixSupabaseImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace createClient with createServiceClient for server-side usage
  content = content.replace(
    /import \{ createClient \} from ['"]@\/lib\/supabase['"]/g,
    "import { createServiceClient } from '@/lib/supabase'"
  );

  // Replace usage of createClient() with createServiceClient()
  content = content.replace(
    /createClient\(/g,
    'createServiceClient('
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed Supabase imports in ${filePath}`);
    return true;
  }

  return false;
}

// Fix email imports
function fixEmailImports(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Replace sendEmail with sendContactEmail
  content = content.replace(
    /import \{ sendEmail, getEmailConfigStatus \} from ['"]\.\/email['"]/g,
    "import { sendContactEmail as sendEmail, getEmailConfigStatus } from './email'"
  );

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed email imports in ${filePath}`);
    return true;
  }

  return false;
}

// Files to fix
const supabaseFiles = [
  'src/app/api/admin/production/jobs/route.ts',
  'src/app/api/admin/shipping/shipments/route.ts',
  'src/app/api/admin/shipping/tracking/[shipmentId]/route.ts',
  'src/app/api/ai-parser/approve/route.ts',
  'src/app/api/ai-parser/extract/route.ts',
  'src/app/api/ai-parser/reprocess/route.ts',
  'src/app/api/ai-parser/validate/route.ts',
  'src/lib/production-actions.ts',
];

const emailFiles = [
  'src/lib/email-order.ts',
];

console.log('🔧 Fixing Supabase and email imports...\n');

let fixedCount = 0;
for (const file of supabaseFiles) {
  if (fixSupabaseImports(file)) fixedCount++;
}
for (const file of emailFiles) {
  if (fixEmailImports(file)) fixedCount++;
}

console.log(`\n✅ Fixed ${fixedCount} files`);
