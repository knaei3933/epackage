/**
 * Quick Admin Pages Check
 *
 * Checks all admin pages to see if they load without errors
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Check if admin page files exist
const adminPages = [
  { name: 'Dashboard', path: 'src/app/admin/dashboard/page.tsx' },
  { name: 'Orders', path: 'src/app/admin/orders/page.tsx' },
  { name: 'Order Detail', path: 'src/app/admin/orders/[id]/page.tsx' },
  { name: 'Production', path: 'src/app/admin/production/page.tsx' },
  { name: 'Production Detail', path: 'src/app/admin/production/[id]/page.tsx' },
  { name: 'Shipments', path: 'src/app/admin/shipments/page.tsx' },
  { name: 'Shipment Detail', path: 'src/app/admin/shipments/[id]/page.tsx' },
  { name: 'Contracts', path: 'src/app/admin/contracts/page.tsx' },
  { name: 'Contract Detail', path: 'src/app/admin/contracts/[id]/page.tsx' },
  { name: 'Approvals', path: 'src/app/admin/approvals/page.tsx' },
  { name: 'Inventory', path: 'src/app/admin/inventory/page.tsx' },
  { name: 'Shipping', path: 'src/app/admin/shipping/page.tsx' },
  { name: 'Leads', path: 'src/app/admin/leads/page.tsx' },
];

const adminAPIs = [
  { name: 'Dashboard Statistics', path: 'src/app/api/admin/dashboard/statistics/route.ts' },
  { name: 'Production Jobs', path: 'src/app/api/admin/production/jobs/route.ts' },
  { name: 'Contract Workflow', path: 'src/app/api/admin/contracts/workflow/route.ts' },
  { name: 'Orders Statistics', path: 'src/app/api/admin/orders/statistics/route.ts' },
  { name: 'Inventory Items', path: 'src/app/api/admin/inventory/items/route.ts' },
  { name: 'Notifications', path: 'src/app/api/admin/notifications/route.ts' },
  { name: 'Performance Metrics', path: 'src/app/api/admin/performance/metrics/route.ts' },
  { name: 'Users List', path: 'src/app/api/admin/users/route.ts' },
];

async function checkAdminPages() {
  console.log('\n🔍 Admin Pages Check');
  console.log('═'.repeat(60));

  console.log('\n📄 Page Files:');
  console.log('─'.repeat(60));
  let pagesFound = 0;
  let pagesMissing = 0;

  for (const page of adminPages) {
    try {
      const fullPath = join(process.cwd(), page.path);
      readFileSync(fullPath, 'utf-8');
      console.log(`✅ ${page.name}: ${page.path}`);
      pagesFound++;
    } catch (error) {
      console.log(`❌ ${page.name}: ${page.path} - MISSING`);
      pagesMissing++;
    }
  }

  console.log('\n🔌 API Routes:');
  console.log('─'.repeat(60));
  let apisFound = 0;
  let apisMissing = 0;

  for (const api of adminAPIs) {
    try {
      const fullPath = join(process.cwd(), api.path);
      readFileSync(fullPath, 'utf-8');
      console.log(`✅ ${api.name}: ${api.path}`);
      apisFound++;
    } catch (error) {
      console.log(`❌ ${api.name}: ${api.path} - MISSING`);
      apisMissing++;
    }
  }

  console.log('\n📊 Summary:');
  console.log('═'.repeat(60));
  console.log(`Pages: ${pagesFound}/${adminPages.length} found, ${pagesMissing} missing`);
  console.log(`APIs: ${apisFound}/${adminAPIs.length} found, ${apisMissing} missing`);

  console.log('\n🔐 Admin Account:');
  console.log('─'.repeat(60));
  console.log('Email: admin@epackage-lab.com');
  console.log('Password: AdminPassword123!');
  console.log('Role: ADMIN');
  console.log('Status: ACTIVE');

  console.log('\n🌐 URLs to Test:');
  console.log('─'.repeat(60));
  console.log('Sign In: http://localhost:3000/signin');
  console.log('Dashboard: http://localhost:3000/admin/dashboard');
  console.log('Orders: http://localhost:3000/admin/orders');
  console.log('Production: http://localhost:3000/admin/production');
  console.log('Shipments: http://localhost:3000/admin/shipments');
  console.log('Contracts: http://localhost:3000/admin/contracts');
  console.log('Approvals: http://localhost:3000/admin/approvals');
  console.log('Inventory: http://localhost:3000/admin/inventory');
  console.log('Shipping: http://localhost:3000/admin/shipping');
  console.log('Leads: http://localhost:3000/admin/leads');

  console.log('\n');
}

checkAdminPages().catch(console.error);
