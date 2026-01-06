/**
 * Test Script: Sample Request Data Storage Verification
 *
 * Purpose: Verify that sample request form data is correctly stored in:
 * - sample_requests table (main record)
 * - sample_items table (1-5 items)
 * - admin_notifications table (notification)
 * - Email sending (SendGrid)
 */

const testPayload = {
  customerInfo: {
    companyName: "テスト株式会社",
    contactPerson: "山田 太郎",
    email: "test.yamada@example.com",
    phone: "03-1234-5678"
  },
  deliveryType: "normal",
  deliveryDestinations: [
    {
      id: "dest-1",
      companyName: "テスト株式会社",
      contactPerson: "山田 太郎",
      phone: "03-1234-5678",
      postalCode: "100-0001",
      address: "東京都千代田区丸の内1-1-1",
      isPrimary: true
    }
  ],
  samples: [
    {
      productId: "prod-001",
      productName: "三方止めパウチ（サンプル）",
      category: "flat_3_side",
      quantity: 2
    },
    {
      productId: "prod-002",
      productName: "スタンドパウチ（サンプル）",
      category: "stand_up",
      quantity: 1
    }
  ],
  message: "API経由でのサンプルリクエストテストです。2種類のサンプルをリクエストします。",
  urgency: "normal",
  privacyConsent: true
};

async function testSampleRequestAPI() {
  const baseUrl = 'http://localhost:3000';
  const endpoint = '/api/samples/request';

  console.log('='.repeat(60));
  console.log('Sample Request Data Storage Test');
  console.log('='.repeat(60));
  console.log('\n📋 Test Payload:');
  console.log(JSON.stringify(testPayload, null, 2));
  console.log('\n🔄 Sending POST request to', endpoint);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📊 Response Body:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      console.log('\n✅ SUCCESS: Sample request created successfully!');
      console.log('\n📝 Details:');
      console.log('  - Request Number:', result.data.requestNumber);
      console.log('  - Sample Request ID:', result.data.sampleRequestId);
      console.log('  - Sample Items Count:', result.data.sampleItemsCount);
      console.log('  - Email Sent:', result.data.emailSent);

      if (result.data.messageIds) {
        console.log('  - Customer Email Message ID:', result.data.messageIds.customer || 'N/A');
        console.log('  - Admin Email Message ID:', result.data.messageIds.admin || 'N/A');
      }

      console.log('\n🔍 Next Steps: Verify database storage');
      console.log('  1. Check sample_requests table for request_number:', result.data.requestNumber);
      console.log('  2. Check sample_items table for sample_request_id:', result.data.sampleRequestId);
      console.log('  3. Check admin_notifications table for related_id:', result.data.sampleRequestId);

    } else {
      console.log('\n❌ FAILED: Sample request creation failed');
      console.log('Error:', result.error);
      if (result.details) {
        console.log('Details:', result.details);
      }
    }

  } catch (error) {
    console.error('\n❌ ERROR: Request failed');
    console.error(error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Test Complete');
  console.log('='.repeat(60));
}

// Run test
testSampleRequestAPI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Test script error:', error);
    process.exit(1);
  });
