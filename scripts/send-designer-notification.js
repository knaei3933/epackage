/**
 * Simple Designer Notification Test
 */

// Load environment
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const orderId = '009b31e0-6014-40c7-8025-bc2b049169d0';

async function main() {
  console.log('📧 Sending Designer Notification Email...\n');

  // Import Supabase
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get order data
  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, customer_name')
    .eq('id', orderId)
    .single();

  console.log(`Order: ${order.order_number} (${order.customer_name})`);

  // Get files
  const { data: files } = await supabase
    .from('files')
    .select('original_filename, file_type, uploaded_at')
    .eq('order_id', orderId)
    .order('uploaded_at', { ascending: false });

  console.log(`Files: ${files.length} found`);

  // Get designer emails
  const { data: designerSettings } = await supabase
    .from('notification_settings')
    .select('value')
    .eq('key', 'korea_designer_emails')
    .maybeSingle();

  const designerEmails = designerSettings?.value || [];
  console.log(`Designers: ${designerEmails.join(', ')}`);

  // Import email service
  const { sendCustomEmail } = await import('../src/lib/email/epack-mailer.ts');

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://package-lab.com';

  // Send emails
  let sentCount = 0;

  for (const designerEmail of designerEmails) {
    for (const file of files) {
      console.log(`\n📧 Sending to: ${designerEmail}`);
      console.log(`   File: ${file.original_filename}`);

      const subject = `[EPackage Lab] 데이터 업로드 알림: ${order.order_number}`;

      const plainText = `
${order.customer_name} 고객님께서 새로운 데이터를 업로드하셨습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
【업로드 정보】
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

주문 번호：${order.order_number}
고객명：${order.customer_name}
파일명：${file.original_filename}
파일 유형：${file.file_type}
업로드 시간：${file.uploaded_at}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

아래 링크에서 확인하세요:
${baseUrl}/designer/orders/${orderId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EPackage Lab
이 메일은 자동으로 발송되었습니다.
문의: support@package-lab.com
URL: https://package-lab.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();

      const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }
    .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">데이터 업로드 알림</h1>
    </div>
    <div class="content">
      <p style="margin-top: 0;"><strong>${order.order_number}</strong> 주문에 새로운 데이터가 업로드되었습니다.</p>

      <div class="info-box">
        <h3 style="margin-top: 0;">업로드 정보</h3>
        <p><strong>주문 번호:</strong> ${order.order_number}</p>
        <p><strong>고객명:</strong> ${order.customer_name}</p>
        <p><strong>파일명:</strong> ${file.original_filename}</p>
        <p><strong>파일 유형:</strong> ${file.file_type}</p>
        <p><strong>업로드 시간:</strong> ${file.uploaded_at}</p>
      </div>

      <div style="text-align: center; margin: 20px 0;">
        <a href="${baseUrl}/designer/orders/${orderId}" class="button">확인하기</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 5px 0;"><strong>EPackage Lab</strong></p>
      <p style="margin: 5px 0;">Email: support@package-lab.com</p>
      <p style="margin: 5px 0;">URL: https://package-lab.com</p>
      <p style="margin: 15px 0 5px 0;">이 메일은 자동으로 발송되었습니다.</p>
    </div>
  </div>
</body>
</html>
      `.trim();

      try {
        const result = await sendCustomEmail(designerEmail, subject, { html, text: plainText });

        if (result.success) {
          console.log(`   ✅ Success! Message ID: ${result.messageId || 'sent'}`);
          sentCount++;
        } else {
          console.log(`   ❌ Failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n\n✅ Total emails sent: ${sentCount}`);
  process.exit(0);
}

main().catch(console.error);
