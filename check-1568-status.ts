import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('quotation')
    .select('*')
    .eq('quotation_number', 'QT20260401-1568')
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Status:', data.status);
  console.log('Subtotal:', data.subtotal_amount);
  console.log('Tax:', data.tax_amount);
  console.log('Total:', data.total_amount);
  console.log('Calculated total (subtotal + tax):', data.subtotal_amount + data.tax_amount);
  
  // Check items
  const { data: items } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', data.id);
    
  console.log('\nItems count:', items?.length || 0);
}

main();
