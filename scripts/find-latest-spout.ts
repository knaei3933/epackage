import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findLatestSpoutQuotes() {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Latest 20 Quotations ===');
  let foundSpout = false;
  data.forEach((q) => {
    const specs = q.specifications as any;
    const hasSpout = specs?.bagTypeId === 'spout_pouch' || specs?.items?.some((i: any) => i.specifications?.bagTypeId === 'spout_pouch');

    if (hasSpout) {
      foundSpout = true;
      console.log(`\n📦 ${q.quotation_number} (${q.created_at})`);
      if (specs?.bagTypeId === 'spout_pouch') {
        console.log('   Direct specs:');
        console.log('     - bagTypeId:', specs.bagTypeId);
        console.log('     - spoutSize:', specs.spoutSize);
        console.log('     - spoutPosition:', specs.spoutPosition);
      } else if (specs?.items) {
        specs.items.forEach((item: any, idx: number) => {
          if (item.specifications?.bagTypeId === 'spout_pouch') {
            console.log(`   Item ${idx + 1}:`);
            console.log('     - bagTypeId:', item.specifications.bagTypeId);
            console.log('     - spoutSize:', item.specifications.spoutSize);
            console.log('     - spoutPosition:', item.specifications.spoutPosition);
          }
        });
      }
    }
  });

  if (!foundSpout) {
    console.log('\n❌ No spout pouch quotations found in latest 20 quotes');
  }
}

findLatestSpoutQuotes();
