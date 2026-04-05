import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuote() {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('quotation_number', 'QT20260331-6387')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== QT20260331-6387 ===');
  const specs = data.specifications as any;
  console.log('bagTypeId:', specs?.bagTypeId);
  console.log('spoutSize:', specs?.spoutSize);
  console.log('spoutPosition:', specs?.spoutPosition);
  console.log('hasGusset:', specs?.hasGusset);
  console.log('');

  if (data.items && Array.isArray(data.items)) {
    console.log('=== Items ===');
    data.items.forEach((item: any, idx: number) => {
      console.log(`Item ${idx + 1}:`);
      console.log('  bagTypeId:', item.specifications?.bagTypeId);
      console.log('  spoutSize:', item.specifications?.spoutSize);
      console.log('  spoutPosition:', item.specifications?.spoutPosition);
      console.log('  hasGusset:', item.specifications?.hasGusset);
    });
  }
}

checkQuote();
