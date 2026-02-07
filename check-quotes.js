require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuotes() {
  const quoteId = '4d2ae72f-c784-479d-be40-fcd71a736186';
  
  console.log('Checking quotes table for:', quoteId);
  
  // Check quotes table
  const { data: quote, error: qError } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .maybeSingle();
  
  console.log('Quote found:', quote ? 'yes' : 'no');
  if (quote) {
    console.log('Quote:', JSON.stringify(quote, null, 2).substring(0, 500));
  }
  console.log('Error:', qError);
  
  // Check quote_items
  const { data: quoteItems, error: qiError } = await supabase
    .from('quote_items')
    .select('*')
    .eq('quote_id', quoteId);
  
  console.log('Quote items:', quoteItems?.length || 0);
  if (quoteItems && quoteItems.length > 0) {
    console.log('First item:', JSON.stringify(quoteItems[0], null, 2));
  }
  console.log('Error:', qiError);
  
  // List all tables that might contain quote data
  const { data: tables } = await supabase
    .from('quotes')
    .select('id')
    .limit(5);
  
  console.log('Total quotes in DB:', tables?.length || 0);
}

checkQuotes().then(() => process.exit(0));
