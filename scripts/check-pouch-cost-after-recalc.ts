import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 環境変数をロード
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'set' : 'not set');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'set' : 'not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCostBreakdown() {
  const quotationNumber = 'QT20260401-1568';

  // 見積を取得
  const { data: quote, error: quoteError } = await supabase
    .from('quotations')
    .select('id')
    .eq('quotation_number', quotationNumber)
    .single();

  if (quoteError || !quote) {
    console.error('Quote not found:', quoteError);
    return;
  }

  console.log('Quote ID:', quote.id);

  // 見積アイテムを取得
  const { data: items, error: itemsError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quote.id);

  if (itemsError || !items || items.length === 0) {
    console.error('Items not found:', itemsError);
    return;
  }

  const item = items[0];
  const specs = item.specifications as any;
  const costBreakdown = item.cost_breakdown as any;
  const filmCostDetails = item.film_cost_details as any;

  console.log('\n=== Quotation Item ===');
  console.log('ID:', item.id);
  console.log('Quantity:', item.quantity);
  console.log('Unit Price:', item.unit_price);
  console.log('Total Price:', item.total_price);
  console.log('\n=== Specifications ===');
  console.log('bagTypeId:', specs.bagTypeId);
  console.log('spoutSize:', specs.spoutSize);
  console.log('spoutPosition:', specs.spoutPosition);
  console.log('width:', specs.width);
  console.log('height:', specs.height);
  console.log('depth:', specs.depth);
  console.log('\n=== Cost Breakdown ===');
  console.log('JSON:', JSON.stringify(costBreakdown, null, 2));
  console.log('\n=== Key Values ===');
  console.log('pouchProcessingCost:', costBreakdown?.pouchProcessingCost || 'not found');
  console.log('baseCost:', costBreakdown?.baseCost || 'not found');
  console.log('totalCost:', costBreakdown?.totalCost || 'not found');
  console.log('\n=== Expected Calculation ===');
  console.log('Spout size:', specs.spoutSize, 'mm (type:', typeof specs.spoutSize, ')');
  console.log('Spout size == 15:', specs.spoutSize == 15);
  console.log('Spout size === 15:', specs.spoutSize === 15);
  console.log('Spout size == "15":', specs.spoutSize == '15');
  console.log('Spout size === "15":', specs.spoutSize === '15');

  // Convert to number for comparison
  const spoutSizeNum = typeof specs.spoutSize === 'string' ? parseInt(specs.spoutSize, 10) : specs.spoutSize;
  const spoutPrice = spoutSizeNum === 15 ? 80 : spoutSizeNum === 9 ? 70 : spoutSizeNum === 18 ? 110 : spoutSizeNum === 22 ? 130 : spoutSizeNum === 28 ? 200 : 110;

  console.log('Spout size (number):', spoutSizeNum);
  console.log('Spout price:', spoutPrice, 'KRW');
  console.log('Quantity:', item.quantity);
  console.log('Round trip shipping: 150,000 KRW');
  const expectedKRW = spoutPrice * item.quantity + 150000;
  const expectedJPY = expectedKRW * 0.12;
  console.log('Expected pouchProcessingCost (KRW):', expectedKRW);
  console.log('Expected pouchProcessingCost (JPY):', expectedJPY);
  console.log('\n=== Comparison ===');
  const actualPouchProcessingCost = costBreakdown?.pouchProcessingCost || 0;
  console.log('Actual pouchProcessingCost (JPY):', actualPouchProcessingCost);
  console.log('Expected pouchProcessingCost (JPY):', expectedJPY);
  console.log('Match:', Math.round(actualPouchProcessingCost) === Math.round(expectedJPY) ? '✓ YES' : '✗ NO');
  console.log('Difference:', Math.abs(actualPouchProcessingCost - expectedJPY).toFixed(2), 'JPY');
}

checkCostBreakdown().catch(console.error);
