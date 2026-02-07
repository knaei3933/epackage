require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  const quoteId = '4d2ae72f-c784-479d-be40-fcd71a736186';
  
  console.log('Checking all tables for quote ID:', quoteId);
  
  // Get quotation details
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', quoteId)
    .single();
  
  console.log('\n=== Quotation ===');
  console.log('ID:', quotation?.id);
  console.log('Number:', quotation?.quotation_number);
  console.log('Status:', quotation?.status);
  console.log('Total:', quotation?.total_amount);
  console.log('Has items_data?:', quotation?.items_data ? 'yes' : 'no');
  console.log('Has saved_specifications?:', quotation?.saved_specifications ? 'yes' : 'no');
  console.log('Has specifications?:', quotation?.specifications ? 'yes' : 'no');
  
  // Check if items_data contains the data
  if (quotation?.items_data) {
    console.log('\n=== items_data ===');
    console.log(JSON.stringify(quotation.items_data, null, 2).substring(0, 1000));
  }
  
  // Check if saved_specifications contains the data
  if (quotation?.saved_specifications) {
    console.log('\n=== saved_specifications ===');
    console.log(JSON.stringify(quotation.saved_specifications, null, 2).substring(0, 1000));
  }
}

checkSchema().then(() => process.exit(0));
