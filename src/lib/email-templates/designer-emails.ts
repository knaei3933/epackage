/**
 * Designer Email Templates
 *
 * Auto-extracted from email-templates.ts
 */

import {
  formatDateJP,
  formatCurrencyJP,
  getJapaneseEmailHeader,
  getJapaneseEmailFooter,
  sanitizeContent,
  sanitizeText,
} from './helpers';
import type { EmailTemplate } from './types';
import type {
  CorrectionReadyForReviewEmailData,
  CorrectionRejectedEmailData,
  DesignerTokenUploadEmailData,
  KoreaDesignerDataNotificationEmailData,
  KoreaDesignerUploadCompleteEmailData,
  TranslationFailedNoticeEmailData,
} from './types';

export function getKoreaDesignerDataNotificationEmail(data: KoreaDesignerDataNotificationEmailData): EmailTemplate {
  return {
    subject: `【データ入稿依頼】注文 ${data.orderNumber}`,
    text: `
韓国デザイナーの皆様

新しい注文でデータが入稿されました。

────────────────────────────────
■ 注文情報
────────────────────────────────
注文番号　：${data.orderNumber}
顧客名　　：${data.customerName}
顧客メール：${data.customerEmail}

────────────────────────────────
■ データ入稿URL
────────────────────────────────
${data.dataUploadUrl}

────────────────────────────────
■ 教正データアップロード
────────────────────────────────
以下のURLから教正データをアップロードしてください：

${data.correctionUploadUrl}

データをご確認の上、教正データの作成をお願いいたします。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>データ入稿依頼</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1f2937;">【データ入稿依頼】新しい注文のデータが入稿されました</h2>

    <p>以下の注文でデータが入稿されました。</p>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">注文情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
      <p><strong>顧客名：</strong>${data.customerName}</p>
      <p><strong>顧客メール：</strong>${data.customerEmail}</p>
    </div>

    <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">データ入稿URL</h3>
      <p><a href="${data.dataUploadUrl}" style="color: #1d4ed8; text-decoration: none;">${data.dataUploadUrl}</a></p>
    </div>

    <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">教正データアップロード</h3>
      <p>以下のURLから教正データをアップロードしてください：</p>
      <p><a href="${data.correctionUploadUrl}" style="color: #1d4ed8; text-decoration: none; font-weight: bold;">${data.correctionUploadUrl}</a></p>
    </div>

    <p>データをご確認の上、教正データの作成をお願いいたします。</p>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Correction Ready for Review Email Template (Customer)
// =====================================================

/**
 * 教正データ完成通知メール（顧客向け）
 */

export function getCorrectionReadyForReviewEmail(data: CorrectionReadyForReviewEmailData): EmailTemplate {
  return {
    subject: `【教正データ完成】注文 ${data.orderNumber} のご確認をお願いいたします`,
    text: `
${data.recipient.name} 様

平素はEpackage Labをご利用いただき、誠にありがとうございます。

この度、注文 ${data.orderNumber} の教正データが完成いたしました。
以下のページからご確認ください。

────────────────────────────────
■ 教正データ情報
────────────────────────────────
注文番号　　：${data.orderNumber}
教正回数　　：${data.revisionNumber}回目

プレビュー画像：
${data.previewImageUrl}

────────────────────────────────
■ 確認ページ
────────────────────────────────
${data.reviewUrl}

内容をご確認の上、承認または修正依頼をお選びください。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教正データ完成</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #1f2937;">【教正データ完成】ご確認をお願いいたします</h2>

    <p>${data.recipient.name} 様</p>
    <p>平素はEpackage Labをご利用いただき、誠にありがとうございます。</p>

    <p>この度、注文 ${data.orderNumber} の教正データが完成いたしました。</p>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">教正データ情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
      <p><strong>教正回数：</strong>${data.revisionNumber}回目</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <img src="${data.previewImageUrl}" alt="教正データプレビュー" style="max-width: 100%; border-radius: 5px; border: 1px solid #e5e7eb;">
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.reviewUrl}" style="display: inline-block; padding: 12px 24px; background-color: #1d4ed8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">教正データを確認する</a>
    </div>

    <p>内容をご確認の上、承認または修正依頼をお選びください。</p>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Correction Rejected Email Template (Korea Designer)
// =====================================================

/**
 * 教正データ差し戻し通知メール（韓国デザイナー向け）
 */

export function getCorrectionRejectedEmail(data: CorrectionRejectedEmailData): EmailTemplate {
  return {
    subject: `【教正データ差し戻し】注文 ${data.orderNumber}`,
    text: `
韓国デザイナーの皆様

以下の注文で顧客から修正依頼がありました。

────────────────────────────────
■ 注文情報
────────────────────────────────
注文番号：${data.orderNumber}

顧客コメント：
${data.customerComment}

────────────────────────────────
■ 再度教正データをアップロード
────────────────────────────────
以下のURLから再度教正データをアップロードしてください：

${data.correctionUploadUrl}

お手数をおかけしますが、ご対応のほどよろしくお願いいたします。
`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>教正データ差し戻し</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #dc2626;">【教正データ差し戻し】顧客より修正依頼がありました</h2>

    <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
      <h3 style="margin-top: 0; color: #dc2626;">注文情報</h3>
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
    </div>

    <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">顧客コメント</h3>
      <p style="white-space: pre-wrap;">${data.customerComment}</p>
    </div>

    <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="margin-top: 0;">再度教正データをアップロード</h3>
      <p>以下のURLから再度教正データをアップロードしてください：</p>
      <p><a href="${data.correctionUploadUrl}" style="color: #1d4ed8; text-decoration: none; font-weight: bold;">${data.correctionUploadUrl}</a></p>
    </div>

    <p>お手数をおかけしますが、ご対応のほどよろしくお願いいたします。</p>
  </div>
</body>
</html>
`,
  };
}

// =====================================================
// Korea Designer Upload Complete Email Template
// =====================================================

/**
 * 韓国デザイナーアップロード完了通知メール（管理者・顧客向け）
 * Korea Designer Upload Complete Email (Admin & Customer)
 */

export function getKoreaDesignerUploadCompleteEmail(
  data: KoreaDesignerUploadCompleteEmailData
): EmailTemplate {
  const recipientHeader = getJapaneseEmailHeader(data.recipient.name, data.recipient.company);
  const footer = getJapaneseEmailFooter();

  const translationStatusDisplay = {
    pending: '翻訳準備中',
    translated: '翻訳済み',
    failed: '翻訳エラー（管理者に連絡してください）',
    manual: '手動翻訳',
  }[data.translationStatus];

  return {
    subject: `【Epackage Lab】修正データが完成いたしました - ${data.orderNumber}`,
    text: `
${recipientHeader}

平素より格別のご高配を賜り、厚く御礼申し上げます。

韓国デザイナー（${data.designerName}）による修正作業が完了いたしました。

================================
注文情報
================================
注文番号：${data.orderNumber}
修正回数：第${data.revisionNumber}回

================================
デザイナーコメント
================================
${data.commentJa || '(翻訳準備中)'}

${data.commentKo ? `
【原文（韓国語）】
${data.commentKo}
` : ''}

翻訳ステータス：${translationStatusDisplay}

================================
プレビュー・確認
================================
以下のURLから修正データをご確認ください：
${data.reviewUrl}

修正内容をご確認の上、承認または修正依頼をお願いいたします。

${footer}
`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>修正データ完成通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #8b5cf6; margin-bottom: 20px;">修正データが完成いたしました</h2>

      <p>${data.recipient.name} 様</p>

      <p>韓国デザイナー（${data.designerName}）による修正作業が完了いたしました。</p>

      <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #374151;">注文情報</h3>
        <p><strong>注文番号：</strong>${data.orderNumber}</p>
        <p><strong>修正回数：</strong>第${data.revisionNumber}回</p>
      </div>

      ${data.commentJa || data.commentKo ? `
      <div style="background-color: #f0fdf4; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
        <h3 style="margin-top: 0; color: #374151;">デザイナーコメント</h3>
        ${data.commentJa ? `<p style="margin-bottom: 10px;">${data.commentJa}</p>` : ''}
        ${data.commentKo ? `
        <details style="margin-top: 10px;">
          <summary style="cursor: pointer; color: #6b7280; font-size: 14px;">原文（韓国語）を表示</summary>
          <p style="margin-top: 10px; padding: 10px; background-color: #ffffff; border-radius: 4px; font-size: 14px;">${data.commentKo}</p>
        </details>
        ` : ''}
        <p style="font-size: 12px; color: #6b7280; margin-top: 10px;">翻訳ステータス：${translationStatusDisplay}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.reviewUrl}" style="display: inline-block; background-color: #8b5cf6; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          修正データを確認
        </a>
      </div>

      ${data.previewImageUrl ? `
      <div style="margin: 20px 0;">
        <img src="${data.previewImageUrl}" alt="プレビュー" style="max-width: 100%; border-radius: 6px;">
      </div>
      ` : ''}
    </div>

    ${footer}
  </div>
</body>
</html>
    `.trim(),
  };
}

// =====================================================
// Designer Token Upload Email Template (Korean)
// =====================================================

/**
 * デザイナートークンアップロードメール（韓国語）
 * Designer Token Upload Email (Korean)
 */

export function getDesignerTokenUploadEmail(
  data: DesignerTokenUploadEmailData
): EmailTemplate {
  const designerName = data.designerName || data.recipient.name;

  return {
    subject: `[패키지랩] 교정 데이터 업로드를 요청합니다 - 주문 #${data.orderNumber}`,
    text: `
${designerName} 님,

다음 주문의 교정 데이터 업로드를 요청드립니다.

────────────────────────────────
■ 주문 정보
────────────────────────────────
주문 번호: ${data.orderNumber}
고객명: ${data.customerName}

────────────────────────────────
■ 업로드 페이지
────────────────────────────────
아래 링크를 클릭하여 업로드 페이지로 이동하세요:

${data.uploadUrl}

※ 이 링크는 ${data.expiresInDays}일간 유효합니다.
※ 로그인이 필요하지 않습니다.

문의사항이 있으시면 관리자에게 연락해 주세요.

────────────────────────────────
이 메일은 시스템에서 자동으로 발송되었습니다.
패키지랩 (Epackage Lab)
https://epackage-lab.com
────────────────────────────────
`.trim(),
    html: `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>교정 데이터 업로드 요청</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #007bff; margin-bottom: 20px;">교정 데이터 업로드 요청</h2>

      <p><strong>${designerName}</strong> 님,</p>

      <p>다음 주문의 교정 데이터 업로드를 요청드립니다.</p>

      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin-top: 0;"><strong>주문 정보:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>주문 번호: ${data.orderNumber}</li>
          <li>고객명: ${data.customerName}</li>
        </ul>
      </div>

      <p>아래 버튼을 클릭하여 업로드 페이지로 이동하세요.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.uploadUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          업로드 페이지 열기
        </a>
      </div>

      <p style="color: #666; font-size: 14px;">
        ※ 이 링크는 <strong>${data.expiresInDays}일간</strong> 유효합니다.<br>
        ※ 로그인이 필요하지 않습니다.
      </p>

      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

      <p style="font-size: 12px; color: #999; margin: 0;">
        이 메일은 시스템에서 자동으로 발송되었습니다.<br>
        문의사항이 있으시면 관리자에게 연락해 주세요.
      </p>
    </div>

    <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      패키지랩 (Epackage Lab)<br>
      https://epackage-lab.com
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

// =====================================================
// Translation Failed Notice Email Template
// =====================================================

/**
 * 翻訳失敗通知メール（管理者向け）
 * Translation Failed Notice Email (Admin)
 */

export function getTranslationFailedNoticeEmail(
  data: TranslationFailedNoticeEmailData
): EmailTemplate {
  return {
    subject: `【要対応】翻訳エラー - ${data.orderNumber}`,
    text: `
管理者各位

韓国デザイナーのコメント翻訳に失敗しました。手動での翻訳が必要です。

================================
対象情報
================================
注文番号：${data.orderNumber}
修正ID：${data.revisionId}

================================
原文（韓国語）
================================
${data.originalTextKo}

================================
エラー詳細
================================
${data.errorDetails}

================================
対応URL
================================
${data.manualTranslateUrl}

速やかにご対応をお願いいたします。
`,
    html: `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>翻訳エラー通知</title>
</head>
<body style="margin: 0; padding: 20px; font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; background-color: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #dc2626;">【要対応】翻訳エラー</h2>

    <p>韓国デザイナーのコメント翻訳に失敗しました。手動での翻訳が必要です。</p>

    <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; border-left: 4px solid #dc2626;">
      <p><strong>注文番号：</strong>${data.orderNumber}</p>
      <p><strong>修正ID：</strong>${data.revisionId}</p>
    </div>

    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #374151;">原文（韓国語）</h3>
      <p style="white-space: pre-wrap;">${data.originalTextKo}</p>
    </div>

    <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #dc2626;">エラー詳細</h3>
      <p>${data.errorDetails}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${data.manualTranslateUrl}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        手動翻訳画面へ
      </a>
    </div>
  </div>
</body>
</html>
    `.trim(),
  };
}

// =====================================================
// Sample Request Email Templates
// =====================================================

/**
 * サンプルリクエスト確認メール（顧客向け）
 * Sample Request Confirmation Email (Customer)
 */

