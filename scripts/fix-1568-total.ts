import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixQuotationTotal() {
  const quotationId = 'QT20260401-1568';

  // Get current quotation
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .select('*')
    .eq('quotation_number', quotationId)
    .single();

  if (qError || !quotation) {
    console.error('Quotation not found:', qError);
    return;
  }

  console.log('Current quotation:', {
    id: quotation.id,
    quotationNumber: quotation.quotation_number,
    subtotal: quotation.subtotal_amount,
    tax: quotation.tax_amount,
    total: quotation.total_amount,
    status: quotation.status,
  });

  // Get quotation items
  const { data: items, error: iError } = await supabase
    .from('quotation_items')
    .select('quantity, unit_price')
    .eq('quotation_id', quotation.id);

  if (iError || !items) {
    console.error('Items not found:', iError);
    return;
  }

  // Recalculate
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unit_price), 0);
  const roundedSubtotal = Math.round(subtotal / 100) * 100;
  const tax = roundedSubtotal * 0.1;
  const roundedTax = Math.round(tax);
  const total = roundedSubtotal + roundedTax; // No rounding to 100

  console.log('\nRecalculation:');
  console.log('  Raw subtotal:', subtotal);
  console.log('  Rounded subtotal:', roundedSubtotal);
  console.log('  Tax (10%):', tax);
  console.log('  Rounded tax:', roundedTax);
  console.log('  Total (subtotal + tax):', total);

  console.log('\nOld total:', quotation.total_amount);
  console.log('New total:', total);
  console.log('Difference:', total - quotation.total_amount);

  // Update
  const { error: uError } = await supabase
    .from('quotations')
    .update({
      subtotal_amount: roundedSubtotal,
      tax_amount: roundedTax,
      total_amount: total,
    })
    .eq('id', quotation.id);

  if (uError) {
    console.error('Update failed:', uError);
  } else {
    console.log('\n✓ Updated successfully!');
  }
}

fixQuotationTotal().catch(console.error);
