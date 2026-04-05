import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwempkZmlwem1qdmF3b2ZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjU1ODI3NywiZXhwIjoyMDgyMTM0Mjc3fQ.LWSHBw-dbVkMjLMaZk3fyadfY_VrOEP7eVUMXNsvt58';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('quotations')
    .select('id, quotation_number, status, subtotal_amount, tax_amount, total_amount')
    .eq('quotation_number', 'QT20260401-1568')
    .single();
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('='.repeat(60));
  console.log('QT20260401-1568 Database Values:');
  console.log('='.repeat(60));
  console.log('Status:', data.status);
  console.log('Subtotal:', data.subtotal_amount);
  console.log('Tax:', data.tax_amount);
  console.log('Total (DB):', data.total_amount);
  console.log('Calculated total (subtotal + tax):', data.subtotal_amount + data.tax_amount);
  console.log('Difference:', data.total_amount - (data.subtotal_amount + data.tax_amount));
}

main();
