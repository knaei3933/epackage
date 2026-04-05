import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuote() {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('quotation_number', 'QT20260401-1568')
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== QT20260401-1568 見積もりデータ ===');
  console.log('ID:', data.id);
  console.log('quotation_number:', data.quotation_number);
  console.log('');
  console.log('=== Specifications ===');
  console.log('bagTypeId:', data.specifications?.bagTypeId);
  console.log('spoutSize:', data.specifications?.spoutSize);
  console.log('spoutPosition:', data.specifications?.spoutPosition);
  console.log('hasGusset:', data.specifications?.hasGusset);
  console.log('');
  console.log('=== Cost Breakdown ===');
  if (data.cost_breakdown) {
    console.log('baseCost:', data.cost_breakdown.baseCost);
    console.log('materialCost:', data.cost_breakdown.materialCost);
    console.log('printingCost:', data.cost_breakdown.printingCost);
    console.log('postProcessingCost:', data.cost_breakdown.postProcessingCost);
    console.log('pouchProcessingCost:', data.cost_breakdown.pouchProcessingCost);
    console.log('totalCost:', data.cost_breakdown.totalCost);
  }
  console.log('');
  console.log('=== Total Price ===');
  console.log('total_price:', data.total_price);
  console.log('final_price:', data.final_price);
}

checkQuote();
