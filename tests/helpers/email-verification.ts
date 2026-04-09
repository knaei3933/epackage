/**
 * テスト用メール検証ヘルパー
 *
 * 既存の /api/test/emails エンドポイントと
 * src/lib/email.ts の関数を使用します
 */

import { request } from '@playwright/test';

/**
 * TestEmail インターフェース
 * src/lib/email.ts の TestEmail と整合させる
 */
export interface TestEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  timestamp: number;
  messageId?: string;
  previewUrl?: string;
}

/**
 * メール待機オプション
 */
export interface WaitForEmailOptions {
  recipient: string;
  subjectPattern?: string;
  timeout?: number;
  pollInterval?: number;
}

/**
 * メール受信を待機するポーリング関数
 *
 * @param requestContext - Playwright APIRequestContext
 * @param options - 待機オプション
 * @returns 受信したメール
 *
 * @example
 * ```typescript
 * const email = await waitForTestEmail(request, {
 *   recipient: 'test@example.com',
 *   subjectPattern: '見積承認',
 *   timeout: 30000
 * });
 * ```
 */
export async function waitForTestEmail(
  requestContext: import('@playwright/test').APIRequestContext,
  options: WaitForEmailOptions
): Promise<TestEmail> {
  const {
    recipient,
    subjectPattern,
    timeout = 30000,
    pollInterval = 500
  } = options;

  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const params = new URLSearchParams({
      recipient,
      since: startTime.toString()
    });

    // 注: 既存のAPIはsubjectパラメータをサポートしていないため
    // クライアント側でフィルタリングする

    const response = await requestContext.get(
      `${baseURL}/api/test/emails?${params.toString()}`
    );

    if (response.ok()) {
      const data = await response.json();

      if (data.emails && data.emails.length > 0) {
        // 件名パターンでフィルタリング
        let filteredEmails = data.emails;
        if (subjectPattern) {
          filteredEmails = data.emails.filter((email: TestEmail) =>
            email.subject.includes(subjectPattern)
          );
        }

        if (filteredEmails.length > 0) {
          // 最新のメールを返す
          return filteredEmails[filteredEmails.length - 1];
        }
      }
    }

    // 指数バックオフでポーリング
    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error(
    `Email not received for ${recipient} within ${timeout}ms` +
    (subjectPattern ? ` (subject pattern: ${subjectPattern})` : '')
  );
}

/**
 * テストメールをクリア
 *
 * @param requestContext - Playwright APIRequestContext
 * @param recipient - クリアする受信者メールアドレス（省略時は全てクリア）
 *
 * @example
 * ```typescript
 * await clearTestEmails(request, 'test@example.com');
 * ```
 */
export async function clearTestEmails(
  requestContext: import('@playwright/test').APIRequestContext,
  recipient?: string
): Promise<void> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  let url = `${baseURL}/api/test/emails`;
  if (recipient) {
    url += `?recipient=${encodeURIComponent(recipient)}`;
  }

  await requestContext.delete(url);
}

/**
 * 全メールを取得
 *
 * @param requestContext - Playwright APIRequestContext
 * @param recipient - 取得する受信者メールアドレス
 * @returns メール配列
 *
 * @example
 * ```typescript
 * const emails = await getAllEmails(request, 'test@example.com');
 * console.log(`Received ${emails.length} emails`);
 * ```
 */
export async function getAllEmails(
  requestContext: import('@playwright/test').APIRequestContext,
  recipient: string
): Promise<TestEmail[]> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';
  const response = await requestContext.get(
    `${baseURL}/api/test/emails?recipient=${encodeURIComponent(recipient)}`
  );

  if (!response.ok()) {
    throw new Error(`Failed to fetch emails: ${response.status()}`);
  }

  const data = await response.json();
  return data.emails || [];
}

/**
 * メール内容を検証するヘルパー
 *
 * @param email - 検証するメール
 * @param expectations - 期待値
 *
 * @example
 * ```typescript
 * await assertEmailContent(email, {
 *   subjectContains: '見積承認',
 *   bodyContains: '承認されました',
 *   hasOrderNumber: true
 * });
 * ```
 */
export async function assertEmailContent(
  email: TestEmail,
  expectations: {
    subjectContains?: string;
    bodyContains?: string;
    hasOrderNumber?: boolean;
    hasQuotationNumber?: boolean;
  }
): Promise<void> {
  const errors: string[] = [];

  if (expectations.subjectContains) {
    if (!email.subject.includes(expectations.subjectContains)) {
      errors.push(
        `Subject does not contain "${expectations.subjectContains}": ${email.subject}`
      );
    }
  }

  if (expectations.bodyContains) {
    const hasInText = email.text.includes(expectations.bodyContains);
    const hasInHtml = email.html.includes(expectations.bodyContains);
    if (!hasInText && !hasInHtml) {
      errors.push(
        `Body does not contain "${expectations.bodyContains}"`
      );
    }
  }

  if (expectations.hasOrderNumber) {
    const hasOrderNumber =
      email.text.includes('order_number') ||
      email.html.includes('order_number') ||
      email.text.includes('注文番号') ||
      email.html.includes('注文番号');
    if (!hasOrderNumber) {
      errors.push('Email does not contain order number');
    }
  }

  if (expectations.hasQuotationNumber) {
    const hasQuotationNumber =
      email.text.includes('quotation_number') ||
      email.html.includes('quotation_number') ||
      email.text.includes('見積番号') ||
      email.html.includes('見積番号');
    if (!hasQuotationNumber) {
      errors.push('Email does not contain quotation number');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Email validation failed:\n${errors.join('\n')}`);
  }
}
