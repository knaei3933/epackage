import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('=== Database Connection Test ===\n');

  // Test 1: Count quotation_items
  const { count, error: countError } = await client
    .from('quotation_items')
    .select('*', { count: 'exact', head: true });

  console.log('1. Total quotation_items:', count);
  if (countError) console.log('   Error:', countError.message);

  // Test 2: Get recent items with materialId
  const { data, error } = await client
    .from('quotation_items')
    .select('id, specifications')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\n2. Recent items:');
  for (const item of data || []) {
    const specs = item.specifications as any;
    console.log('   -', item.id?.substring(0, 8), 'material:', specs.materialId || 'N/A');
  }

  if (error) console.log('   Error:', error.message);

  // Test 3: Check for KRAFT
  const { data: allData } = await client
    .from('quotation_items')
    .select('specifications')
    .limit(100);

  const materials = new Set<string>();
  for (const item of allData || []) {
    const specs = item.specifications as any;
    if (specs.materialId) materials.add(specs.materialId);
  }

  console.log('\n3. All material types:');
  console.log('   ', Array.from(materials).sort().join(', '));
}

main().catch(console.error);
