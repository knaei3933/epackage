import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkQT6387() {
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
    console.log('product_name:', item.product_name);
    console.log('');
    console.log('bag_type:', specs.bag_type);
    console.log('bagTypeId:', specs.bagTypeId);
    console.log('material:', specs.material);
    console.log('materialId:', specs.materialId);
    console.log('width:', specs.width);
    console.log('height:', specs.height);
    console.log('depth:', specs.depth);
    console.log('contents:', specs.contents);
    console.log('contentsType:', specs.contentsType);
    console.log('postProcessingOptions:', specs.postProcessingOptions);
    console.log('sku_quantities:', specs.sku_quantities);
    console.log('printingType:', specs.printingType);
    console.log('colors:', specs.colors);
    console.log('deliveryLocation:', specs.deliveryLocation);
  }
}

checkQT6387().catch(console.error);
