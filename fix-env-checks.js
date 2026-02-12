/**
 * Fix module-level environment variable checks in API routes
 * These throw errors during Vercel build when env vars aren't available
 */

const fs = require('fs');
const path = require('path');

const files = [
  'src/app/api/admin/orders/[id]/send-to-korea/route.ts',
  'src/app/api/admin/orders/[id]/payment-confirmation/route.ts',
  'src/app/api/admin/orders/[id]/start-production/route.ts',
  'src/app/api/admin/orders/[id]/delivery-note/route.ts',
  'src/app/api/admin/orders/bulk-status/route.ts',
  'src/app/api/admin/quotations/route.ts',
  'src/app/api/quotations/save/route.ts',
  'src/app/api/quotations/guest-save/route.ts',
  'src/app/api/profile/[id]/route.ts',
  'src/app/api/profile/route.ts',
  'src/app/api/quotation/route.ts',
  'src/app/api/orders/route.ts',
  'src/app/api/orders/[id]/status/route.ts',
  'src/app/api/orders/[id]/cancel/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/member/quotations/[id]/invoice/route.ts',
  'src/app/api/member/quotations/[id]/route.ts',
  'src/app/api/member/quotations/route.ts',
  'src/app/api/member/quotations/[id]/confirm-payment/route.ts',
  'src/app/api/member/orders/confirm/route.ts',
  'src/app/api/member/orders/[id]/spec-approval/route.ts',
  'src/app/api/member/orders/[id]/data-receipt/route.ts',
  'src/app/api/member/orders/[id]/production-data/route.ts',
  'src/app/api/cron/archive-orders/route.ts',
  'src/app/api/shipments/[id]/route.ts',
];

const rootDir = process.cwd();

files.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Pattern 1: Remove module-level env check with anonKey
  const pattern1 = /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n\nif \(!supabaseUrl \|\| !supabaseAnonKey\) \{\n  throw new Error\('Missing Supabase environment variables'\);\n}\n\n/g;

  // Pattern 2: Remove module-level env check with serviceKey
  const pattern2 = /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseServiceKey = process\.env\.SUPABASE_SERVICE_ROLE_KEY;\n\nif \(!supabaseUrl \|\| !supabaseServiceKey\) \{\n  throw new Error\('Missing Supabase environment variables'\);\n}\n\n/g;

  // Pattern 3: Remove typed version with anonKey
  const pattern3 = /const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL;\nconst supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n\nif \(!supabaseUrl \|\| !supabaseAnonKey\) \{\n  throw new Error\('Missing Supabase environment variables'\);\n}\n\n\/\/ Type assertions for TypeScript.*?\nconst supabaseUrlTyped = supabaseUrl as string;\nconst supabaseAnonKeyTyped = supabaseAnonKey as string;\n\n/g;

  let originalContent = content;
  content = content.replace(pattern1, '');
  content = content.replace(pattern2, '');
  content = content.replace(pattern3, '');

  if (content !== originalContent) {
    // Now replace supabaseUrl/supabaseAnonKey references in handlers
    // For files using Typed versions
    if (originalContent.includes('supabaseUrlTyped')) {
      content = content.replace(/supabaseUrlTyped/g,
        '(process.env.NEXT_PUBLIC_SUPABASE_URL as string)');
      content = content.replace(/supabaseAnonKeyTyped/g,
        '(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string)');
    } else if (originalContent.includes('supabaseServiceKey')) {
      // For files using service key
      content = content.replace(/const supabase = createClient\(supabaseUrl, supabaseServiceKey\)/g,
        'const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\n    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;\n    if (!supabaseUrl || !supabaseServiceKey) {\n      return NextResponse.json(\n        { error: 'Server configuration error' },\n        { status: 500 }\n      );\n    }\n    const supabase = createClient(supabaseUrl, supabaseServiceKey)');
    } else {
      // For regular anon key files
      content = content.replace(/const supabase = createServerClient\(supabaseUrl, supabaseAnonKey/g,
        'const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\n    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n    if (!supabaseUrl || !supabaseAnonKey) {\n      return NextResponse.json(\n        { error: \'Supabase environment variables not configured\' },\n        { status: 500 }\n      );\n    }\n    const supabase = createServerClient(supabaseUrl, supabaseAnonKey');
      content = content.replace(/const supabase = createClient\(supabaseUrl, supabaseAnonKey/g,
        'const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;\n    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\n    if (!supabaseUrl || !supabaseAnonKey) {\n      return NextResponse.json(\n        { error: \'Supabase environment variables not configured\' },\n        { status: 500 }\n      );\n    }\n    const supabase = createClient(supabaseUrl, supabaseAnonKey');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${file}`);
  } else {
    console.log(`Skipped (no pattern match): ${file}`);
  }
});

console.log('\nDone!');
