import { config } from 'dotenv';
config();
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPouchProcessing() {
  const { data: quote } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', 'QT20260401-1568')
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
    const filmDetails = item.film_cost_details as any;
    const costBreakdown = item.cost_breakdown as any;

    console.log('=== Film Cost Details ===');
    console.log('pouchProcessingCost:', filmDetails?.pouchProcessingCost);
    console.log('');
    console.log('=== Cost Breakdown ===');
    console.log('pouchProcessingCost:', costBreakdown?.pouchProcessingCost);
    console.log('materialCost:', costBreakdown?.materialCost);
    console.log('totalCost:', costBreakdown?.totalCost);
    console.log('');
    console.log('=== Expected Spout Cost ===');
    const spoutPrice = 80; // 15mm
    const quantity = 5000;
    const roundTripShipping = 150000;
    const spoutCost = spoutPrice * quantity + roundTripShipping;
    console.log('スパウト単価:', spoutPrice, 'ウォン');
    console.log('数量:', quantity);
    console.log('往復配送料:', roundTripShipping, 'ウォン');
    console.log('スパウト加工費:', spoutCost, 'ウォン');
  }
}

checkPouchProcessing();
