import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSealingWidth() {
  // QT20260331-6387（スパウトパウチ）を確認
  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260331-6387')
    .single();

  if (!quote) {
    console.log('Quote not found');
    return;
  }

  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (items && items.length > 0) {
    const item = items[0];
    const specs = item.specifications as Record<string, unknown>;

    console.log('=== QT20260331-6387 Specifications ===');
    console.log('postProcessingOptions:', specs.postProcessingOptions);
    console.log('');

    // シール幅オプションをチェック
    const postOps = specs.postProcessingOptions as string[] || [];
    const hasSealingWidth = postOps.some(opt => opt.includes('sealing-width'));

    console.log('シール幅オプションが含まれているか:', hasSealingWidth);
    if (hasSealingWidth) {
      const sealingWidthOps = postOps.filter(opt => opt.includes('sealing-width'));
      console.log('シール幅オプション:', sealingWidthOps);
    }
  }
}

checkSealingWidth().catch(console.error);
