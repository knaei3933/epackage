/**
 * Contact Email Test
 * お問い合わせフォームメール送信テスト
 */

import { sendContactEmail } from '../src/lib/email/epack-mailer';

async function testContactEmail() {
  console.log('=== Contact Email Test ===\n');

  const testData = {
    name: 'テストユーザー',
    email: 'test@example.com',
    company: 'テスト株式会社',
    inquiryType: 'quotation',
    subject: '見積もり依頼テスト',
    message: 'これはお問い合わせフォームのテストです。\nメールが正常に送信されることを確認しています。',
    urgency: 'normal',
    preferredContact: 'email',
    requestId: `TEST-${Date.now()}`
  };

  console.log('Sending contact emails...');
  console.log('To:', testData.email);
  console.log('Admin: info@package-lab.com');
  console.log('');

  try {
    const result = await sendContactEmail(testData);

    console.log('Result:', result.success ? '✅ Success' : '❌ Failed');
    
    if (result.customerEmail) {
      console.log('Customer email:', result.customerEmail.success ? '✅ Sent' : '❌ Failed');
      console.log('  Message ID:', result.customerEmail.messageId);
      if (result.customerEmail.error) {
        console.log('  Error:', result.customerEmail.error);
      }
    }
    
    if (result.adminEmail) {
      console.log('Admin email:', result.adminEmail.success ? '✅ Sent' : '❌ Failed');
      console.log('  Message ID:', result.adminEmail.messageId);
      if (result.adminEmail.error) {
        console.log('  Error:', result.adminEmail.error);
      }
    }
    
    if (result.errors) {
      console.log('\nErrors:');
      result.errors.forEach(err => {
        console.log(`  - ${err.to}: ${err.error}`);
      });
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testContactEmail();
