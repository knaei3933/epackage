/**
 * Test script to verify quotation save works with NULL user_id
 * Run with: node test-quotation-fix.js
 */

const mockQuotationData = {
  userId: 'mock-user-dev-test', // Will be converted to NULL in dev mode
  quotationNumber: `Q${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}TEST`,
  status: 'draft',
  totalAmount: 10000,
  validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Test quotation with NULL user_id',
  items: [
    {
      productName: 'Test Product',
      quantity: 1,
      unitPrice: 10000,
      specifications: { category: 'OTHER' }
    }
  ]
};

async function testQuotationSave() {
  console.log('Testing quotation save with mock user...');
  console.log('Mock userId:', mockQuotationData.userId);
  console.log('Expected: user_id should be NULL in database\n');

  try {
    const response = await fetch('http://localhost:3000/api/quotations/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockQuotationData),
    });

    const result = await response.json();

    console.log('Response status:', response.status);
    console.log('Response success:', result.success);
    console.log('Response message:', result.message);
    console.log('Quotation data:', JSON.stringify(result.quotation, null, 2));

    if (response.ok && result.success) {
      console.log('\n✅ SUCCESS: Quotation saved without foreign key error!');
      console.log('The fix is working correctly.');
    } else {
      console.log('\n❌ FAILED: Quotation save failed');
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('Make sure the dev server is running on http://localhost:3000');
  }
}

// Run the test
testQuotationSave();
