/**
 * Japanese Business Email Templates - Usage Examples
 *
 * This file contains practical examples for using the email templates system.
 */

import {
  sendWelcomeEmail,
  sendApprovalEmail,
  sendRejectionEmail,
  sendQuoteCreatedEmail,
  sendOrderStatusUpdateEmail,
  sendShipmentNotificationEmail,
  sendAdminNewOrderEmail,
  sendAdminQuoteRequestEmail,
  createRecipient,
} from './email';
import type { QuoteInfo, OrderInfo, ShipmentInfo } from './email-templates';

// =====================================================
// Example 1: Send Welcome Email to New Customer
// =====================================================

export async function exampleWelcomeEmail() {
  const recipient = createRecipient(
    '山田太郎',
    'yamada.taro@example.com',
    '株式会社ABC'
  );

  const result = await sendWelcomeEmail(recipient, {
    loginUrl: 'https://epackage-lab.com/login',
    tempPassword: 'TempPass123!',
  });

  console.log('Welcome email sent:', result.success);
  console.log('Message ID:', result.messageId);
  console.log('Preview URL:', result.previewUrl);
}

// =====================================================
// Example 2: Send Approval Notification
// =====================================================

export async function exampleApprovalEmail() {
  const recipient = createRecipient(
    '佐藤花子',
    'sato.hanako@example.com',
    'XYZ商事'
  );

  const result = await sendApprovalEmail(
    recipient,
    'サンプルリクエスト',
    '商品サンプル5点のリクエスト\n・OPPアルミ袋: 3点\n・PETアルミ袋: 2点',
    '担当者: 田中',
    {
      approvalDate: new Date().toISOString(),
      nextSteps: `
1. サンプル準備（2-3営業日）
2. 配送手配
3. お届け（配送地域によります）

詳細はマイページよりご確認いただけます。
      `,
    }
  );

  console.log('Approval email sent:', result.success);
}

// =====================================================
// Example 3: Send Rejection Notification
// =====================================================

export async function exampleRejectionEmail() {
  const recipient = createRecipient(
    '鈴木一郎',
    'suzuki.ichiro@example.com'
  );

  const result = await sendRejectionEmail(
    recipient,
    '大量注文リクエスト',
    '大変申し訳ございませんが、現在の生産体制によりご希望の数量をご提供することが難しい状況です。',
    {
      alternativeOptions: `
代替案としてご提案できます：
・少量での分割納品
・次回生産ロットでのご対応
・類似製品のご提案

ご希望の方は、お気軽にお問い合わせください。
      `,
      contactInfo: '担当者: 田中\n電話: 03-1234-5678\nメール: info@epackage-lab.com',
    }
  );

  console.log('Rejection email sent:', result.success);
}

// =====================================================
// Example 4: Send Quote Created Notification
// =====================================================

export async function exampleQuoteCreatedEmail() {
  const recipient = createRecipient(
    '高橋美咲',
    'takahisa.misaki@example.com',
    'DEF工業'
  );

  const quoteInfo: QuoteInfo = {
    quoteId: 'QT-2024-001234',
    validUntil: '2024-03-31',
    totalAmount: 250000,
    items: [
      {
        description: 'OPPアルミ袋 (サイズ: 200x300mm)',
        quantity: 1000,
        unitPrice: 150,
        amount: 150000,
      },
      {
        description: 'PETアルミ袋 (サイズ: 250x350mm)',
        quantity: 500,
        unitPrice: 200,
        amount: 100000,
      },
    ],
  };

  const result = await sendQuoteCreatedEmail(
    recipient,
    quoteInfo,
    'https://epackage-lab.com/quotes/QT-2024-001234'
  );

  console.log('Quote created email sent:', result.success);
}

// =====================================================
// Example 5: Send Order Status Update
// =====================================================

export async function exampleOrderStatusUpdateEmail() {
  const recipient = createRecipient(
    '伊藤健太',
    'ito.kenta@example.com',
    'GHI物産'
  );

  const orderInfo: OrderInfo = {
    orderId: 'ORD-2024-005678',
    orderDate: '2024-01-15',
    totalAmount: 450000,
    items: [
      {
        name: 'スタンドアップパウチ',
        quantity: 2000,
        price: 225,
      },
    ],
  };

  const result = await sendOrderStatusUpdateEmail(
    recipient,
    orderInfo,
    'in_production',
    {
      estimatedCompletion: '2024-02-15',
      statusDetails: `
現在、製造工程を進めております。

工程進捗：
・印刷完了
・ラミネート加工中
・次工程: 製袋加工

予定通り進んでおりますので、今しばらくお待ちください。
      `,
    }
  );

  console.log('Order status update email sent:', result.success);
}

// =====================================================
// Example 6: Send Shipment Notification
// =====================================================

export async function exampleShipmentNotificationEmail() {
  const recipient = createRecipient(
    '渡辺麻衣',
    'watanabe.mai@example.com'
  );

  const orderInfo: OrderInfo = {
    orderId: 'ORD-2024-005678',
    orderDate: '2024-01-15',
    totalAmount: 450000,
    items: [
      {
        name: 'スタンドアップパウチ',
        quantity: 2000,
        price: 225,
      },
    ],
  };

  const shipmentInfo: ShipmentInfo = {
    trackingNumber: 'JP12345678901234567890',
    carrier: 'ヤマト運輸',
    estimatedDelivery: '2024-01-20',
    shippingAddress: '〒100-0001\n東京都千代田区1-1-1\n渡辺麻衣 様',
  };

  const result = await sendShipmentNotificationEmail(
    recipient,
    orderInfo,
    shipmentInfo,
    {
      trackingUrl: 'https://track.yamato-transport.co.jp/JA01?id=JP12345678901234567890',
    }
  );

  console.log('Shipment notification email sent:', result.success);
}

// =====================================================
// Example 7: Send Admin Notification for New Order
// =====================================================

export async function exampleAdminNewOrderEmail() {
  const orderInfo: OrderInfo = {
    orderId: 'ORD-2024-009999',
    orderDate: '2024-01-20',
    totalAmount: 890000,
    items: [
      {
        name: 'ガセット袋 (サイズ: 300x400mm)',
        quantity: 3000,
        price: 180,
      },
      {
        name: '三元共押袋 (サイズ: 250x350mm)',
        quantity: 2000,
        price: 175,
      },
    ],
  };

  const result = await sendAdminNewOrderEmail(orderInfo, {
    name: '近藤太一',
    email: 'kondo.taichi@example.com',
    company: 'JKL包装',
  });

  console.log('Admin new order email sent:', result.success);
}

// =====================================================
// Example 8: Send Admin Notification for Quote Request
// =====================================================

export async function exampleAdminQuoteRequestEmail() {
  const quoteInfo: QuoteInfo = {
    quoteId: 'QT-2024-002222',
    validUntil: '2024-04-15',
    totalAmount: 1200000,
    items: [
      {
        description: 'アルミ蒸着フィルム (厚み: 12μ)',
        quantity: 5000,
        unitPrice: 150,
        amount: 750000,
      },
      {
        description: 'PETフィルム (厚み: 12μ)',
        quantity: 3000,
        unitPrice: 150,
        amount: 450000,
      },
    ],
  };

  const result = await sendAdminQuoteRequestEmail(quoteInfo, {
    name: '中田裕子',
    email: 'nakata.yuko@example.com',
    company: 'MNL食品',
  });

  console.log('Admin quote request email sent:', result.success);
}

// =====================================================
// Example 9: Error Handling
// =====================================================

export async function exampleWithErrorHandling() {
  try {
    const recipient = createRecipient(
      'テストユーザー',
      'test@example.com'
    );

    const result = await sendWelcomeEmail(recipient, {
      loginUrl: 'https://epackage-lab.com/login',
    });

    if (result.success) {
      console.log('Email sent successfully!');
      console.log('Message ID:', result.messageId);
      if (result.previewUrl) {
        console.log('Preview at:', result.previewUrl);
      }
    } else {
      console.error('Failed to send email:', result.error);
      // Handle error (e.g., log to database, notify admin)
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    // Handle unexpected errors
  }
}

// =====================================================
// Example 10: Batch Email Sending
// =====================================================

export async function exampleBatchEmailSending() {
  const recipients = [
    createRecipient('顧客A', 'customer-a@example.com', '株式会社A'),
    createRecipient('顧客B', 'customer-b@example.com', '株式会社B'),
    createRecipient('顧客C', 'customer-c@example.com', '株式会社C'),
  ];

  const results = await Promise.allSettled(
    recipients.map(recipient =>
      sendWelcomeEmail(recipient, {
        loginUrl: 'https://epackage-lab.com/login',
      })
    )
  );

  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - successful;

  console.log(`Batch email sending completed: ${successful} successful, ${failed} failed`);

  // Detailed results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`Recipient ${index + 1}: ${result.value.success ? 'Success' : 'Failed'}`);
    } else {
      console.log(`Recipient ${index + 1}: Error -`, result.reason);
    }
  });
}

// =====================================================
// Example 11: Order Status Flow
// =====================================================

export async function exampleOrderStatusFlow() {
  const recipient = createRecipient(
    '注文者名',
    'customer@example.com'
  );

  const orderInfo: OrderInfo = {
    orderId: 'ORD-2024-12345',
    orderDate: new Date().toISOString(),
    totalAmount: 500000,
    items: [
      {
        name: '商品A',
        quantity: 1000,
        price: 500,
      },
    ],
  };

  // Step 1: Order received
  await sendOrderStatusUpdateEmail(recipient, orderInfo, 'processing');

  // Step 2: In production (after a few days)
  await sendOrderStatusUpdateEmail(recipient, orderInfo, 'in_production', {
    estimatedCompletion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // Step 3: Quality check
  await sendOrderStatusUpdateEmail(recipient, orderInfo, 'quality_check');

  // Step 4: Ready for shipment
  await sendOrderStatusUpdateEmail(recipient, orderInfo, 'ready');

  // Step 5: Shipped
  const shipmentInfo: ShipmentInfo = {
    trackingNumber: 'JP123456789',
    carrier: 'ヤマト運輸',
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    shippingAddress: '〒100-0001\n東京都千代田区1-1-1',
  };

  await sendShipmentNotificationEmail(recipient, orderInfo, shipmentInfo, {
    trackingUrl: 'https://track.yamato-transport.co.jp/JA01?id=JP123456789',
  });
}

// =====================================================
// Example 12: Using in API Route
// =====================================================

export async function exampleApiRouteUsage() {
  // This shows how to use the templates in a Next.js API route
  //
  // In src/app/api/emails/send/route.ts:
  //
  // import { sendWelcomeEmail, createRecipient } from '@/lib/email';
  //
  // export async function POST(request: Request) {
  //   try {
  //     const body = await request.json();
  //     const { name, email, company, loginUrl } = body;
  //
  //     const recipient = createRecipient(name, email, company);
  //     const result = await sendWelcomeEmail(recipient, { loginUrl });
  //
  //     if (!result.success) {
  //       return Response.json(
  //         { error: result.error },
  //         { status: 500 }
  //       );
  //     }
  //
  //     return Response.json({
  //       success: true,
  //       messageId: result.messageId,
  //       previewUrl: result.previewUrl,
  //     });
  //   } catch (error) {
  //     return Response.json(
  //       { error: 'Internal server error' },
  //       { status: 500 }
  //     );
  //   }
  // }
}
