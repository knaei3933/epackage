const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwanlkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjQ4MDAsImV4cCI6MjA1MTcwMDgwMH0.eV7aZW8ZlqXFqDIQplLVhZJbUiJAKW2yNqV5u3XOlwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestQuotation() {
  // Get the latest quotation
  const { data: quotation, error: qError } = await supabase
    .from('quotations')
    .select('id, quote_number, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (qError) {
    console.error('Error fetching quotation:', qError);
    return;
  }

  console.log('=== Latest Quotation ===');
  console.log('ID:', quotation.id);
  console.log('Quote Number:', quotation.quote_number);
  console.log('Created At:', quotation.created_at);

  // Get quotation items for this quotation
  const { data: items, error: iError } = await supabase
    .from('quotation_items')
    .select('*')
    .eq('quotation_id', quotation.id)
    .order('created_at', { ascending: false });

  if (iError) {
    console.error('Error fetching items:', iError);
    return;
  }

  console.log('\n=== Quotation Items ===');
  items.forEach((item, index) => {
    console.log(`\n--- Item ${index + 1} ---`);
    console.log('ID:', item.id);
    console.log('Product Name:', item.product_name);

    const specs = typeof item.specifications === 'string' ? JSON.parse(item.specifications) : item.specifications;

    console.log('Raw specifications:', JSON.stringify(specs, null, 2));
    console.log('\n--- Key Fields ---');
    console.log('dimensions:', specs.dimensions);
    console.log('sideWidth:', specs.sideWidth);
    console.log('sealWidth:', specs.sealWidth);
    console.log('width:', specs.width);
    console.log('height:', specs.height);
    console.log('depth:', specs.depth);
    console.log('bagTypeId:', specs.bagTypeId);
    console.log('materialId:', specs.materialId);
  });
}

checkLatestQuotation();
