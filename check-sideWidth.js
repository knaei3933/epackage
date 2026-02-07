const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ijlgpzjdfipzmjvawofp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlqbGdwanlkZmlwem1qdmF3b2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjQ4MDAsImV4cCI6MjA1MTcwMDgwMH0.eV7aZW8ZlqXFqDIQplLVhZJbUiJAKW2yNqV5u3XOlwY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuotationData() {
  const { data, error } = await supabase
    .from('quotation_items')
    .select('id, specifications, bag_type, dimensions')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('=== Recent quotation_items ===');
  data.forEach(item => {
    console.log('---');
    console.log('ID:', item.id);
    console.log('Raw specifications:', JSON.stringify(item.specifications, null, 2));
    const specs = typeof item.specifications === 'string' ? JSON.parse(item.specifications) : item.specifications;
    console.log('sideWidth:', specs?.sideWidth);
    console.log('dimensions:', specs?.dimensions);
    console.log('bagTypeId:', specs?.bagTypeId);
    console.log('width:', specs?.width);
    console.log('height:', specs?.height);
    console.log('depth:', specs?.depth);
  });
}

checkQuotationData();
