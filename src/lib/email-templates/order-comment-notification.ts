/**
 * Order Comment Email Template
 *注文コメント追加通知メールテンプレート
 */

export function generateOrderCommentEmailHtml(data: {
  orderId: string;
  orderNumber: string;
  customerName: string | null;
  adminDisplayName: string;
  commentContent: string;
  siteUrl: string;
}): string {
  const { orderId, orderNumber, customerName, adminDisplayName, commentContent, siteUrl } = data;

  return `
    <!DOCTYPE html>
    <html lang="ja">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>注文コメント通知</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1a365d 0%, #2c5282 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
          }
          .content {
            padding: 30px 20px;
          }
          .order-info {
            background: #f7fafc;
            border-left: 4px solid #2c5282;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .order-info p {
            margin: 5px 0;
            font-size: 14px;
          }
          .order-info strong {
            color: #2d3748;
          }
          .comment-box {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .comment-box .label {
            font-size: 12px;
            color: #92400e;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .comment-box .content {
            background: white;
            padding: 12px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
          }
          .button-container {
            text-align: center;
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: #2c5282;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 6px;
            font-weight: bold;
            transition: background 0.3s;
          }
          .button:hover {
            background: #2a4365;
          }
          .footer {
            background: #f7fafc;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #718096;
            border-top: 1px solid #e2e8f0;
          }
          .footer a {
            color: #4299e1;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>注文コメント通知</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; margin: 0 0 20px 0;">
              ${customerName || 'お客様'}様
            </p>
            <p style="font-size: 14px; line-height: 1.8; margin: 0 0 20px 0;">
              ご注文のコメント欄に、新しいコメントが追加されました。<br>
              内容をご確認ください。
            </p>
            <div class="order-info">
              <p><strong>注文番号:</strong> ${orderNumber}</p>
              <p><strong>コメント担当者:</strong> ${adminDisplayName}</p>
              <p><strong>投稿日時:</strong> ${new Date().toLocaleString('ja-JP')}</p>
            </div>
            <div class="comment-box">
              <div class="label">コメント内容</div>
              <div class="content">${commentContent.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="button-container">
              <a href="${siteUrl}/member/orders/${orderId}" class="button">注文詳細を確認する</a>
            </div>
            <p style="font-size: 12px; color: #718096; text-align: center; margin: 30px 0 0;">
              このメールはシステムから自動送信されています。<br>
              ご質問がある場合は、注文詳細ページからコメントをお願いいたします。
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 10px 0;">
              <a href="${siteUrl}">イーパックラボ (EPackage Lab)</a>
            </p>
            <p style="margin: 0;">
              &copy; ${new Date().getFullYear()} EPackage Lab. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}
