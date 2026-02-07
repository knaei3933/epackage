const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPDFGeneration() {
  // Find the item with valve-no and 5000 quantity
  const { data: items } = await supabase
    .from('quotation_items')
    .select('id, quotation_id, specifications')
    .eq('quantity', 5000)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!items || items.length === 0) {
    console.log('No items found');
    return;
  }

  const item = items[0];
  console.log('=== Testing Item ===');
  console.log('Item ID:', item.id);
  console.log('Quotation ID:', item.quotation_id);

  const specs = typeof item.specifications === 'string'
    ? JSON.parse(item.specifications)
    : item.specifications;

  console.log('postProcessingOptions:', JSON.stringify(specs.postProcessingOptions, null, 2));

  // Now test the actual PDF generation API
  const fetch = require('node-fetch');

  try {
    // First, login to get session
    console.log('\\n=== Logging in... ===');
    const loginResponse = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'member@test.com',
        password: 'Member1234!'
      })
    });

    if (!loginResponse.ok) {
      console.log('Login failed:', loginResponse.status);
      return;
    }

    console.log('Login successful');

    // Get the quotation details
    console.log('\\n=== Fetching quotation details... ===');
    const quotationResponse = await fetch(`http://localhost:3000/api/member/quotations/${item.quotation_id}`);

    if (!quotationResponse.ok) {
      console.log('Quotation fetch failed:', quotationResponse.status);
      const text = await quotationResponse.text();
      console.log('Response:', text);
      return;
    }

    const quotationData = await quotationResponse.json();
    console.log('Quotation data keys:', Object.keys(quotationData));

    if (quotationData.success && quotationData.data) {
      const q = quotationData.data.quotation;
      const qItems = quotationData.data.items;

      console.log('\\n=== Quotation Info ===');
      console.log('Quotation number:', q.quotation_number);

      if (qItems && qItems.length > 0) {
        const itemSpecs = typeof qItems[0].specifications === 'string'
          ? JSON.parse(qItems[0].specifications)
          : qItems[0].specifications;

        console.log('Item specifications:');
        console.log('  postProcessingOptions:', JSON.stringify(itemSpecs.postProcessingOptions, null, 2));
        console.log('  processingOptions:', JSON.stringify(itemSpecs.processingOptions, null, 2));
        console.log('  postProcessing:', JSON.stringify(itemSpecs.postProcessing, null, 2));
      }
    }

    // Now try to export to PDF
    console.log('\\n=== Exporting to PDF... ===');
    const exportResponse = await fetch(`http://localhost:3000/api/member/quotations/${item.quotation_id}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        format: 'pdf',
        saveToStorage: false
      })
    });

    if (!exportResponse.ok) {
      console.log('Export failed:', exportResponse.status);
      const text = await exportResponse.text();
      console.log('Response:', text);
      return;
    }

    console.log('Export successful');

    // The response should be the PDF file
    const contentType = exportResponse.headers.get('content-type');
    console.log('Response content-type:', contentType);

    if (contentType && contentType.includes('application/json')) {
      // JSON response with download URL
      const jsonData = await exportResponse.json();
      console.log('Export response:', JSON.stringify(jsonData, null, 2));
    } else {
      // Direct PDF file
      console.log('PDF file size:', exportResponse.headers.get('content-length'), 'bytes');
      console.log('Content-disposition:', exportResponse.headers.get('content-disposition'));
    }

  } catch (error) {
    console.log('Error:', error.message);
  }
}

testPDFGeneration().catch(console.error);
