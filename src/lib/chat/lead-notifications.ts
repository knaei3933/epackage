import 'server-only';

import { ADMIN_EMAIL, escapeHtml, sendEmail } from '@/lib/email/transport';
import { Logger } from '@/lib/logger';
import type { ChatLeadSubmission } from '@/lib/chat/lead-schema';
import type { ChatPageContext } from '@/lib/chat/page-context';

const logger = new Logger({ component: 'chat/lead-notifications' });

const APP_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://www.package-lab.com'
).replace(/\/+$/, '');

const INTENT_LABELS: Record<ChatLeadSubmission['intent'], string> = {
  quote: '見積もり相談',
  sample: 'サンプル相談',
  technical: '技術相談',
  general: '一般相談',
  human: '担当者相談',
};

const CHANNEL_LABELS = {
  email: 'メール',
  phone: '電話',
} as const;

const PREFERRED_CHANNEL_LABELS = {
  email: 'メール希望',
  phone: '電話希望',
  any: 'どちらでも可',
} as const;

const CONTACT_WINDOW_LABELS = {
  unspecified: '指定なし',
  weekday_daytime: '平日日中',
  weekday_evening: '平日夜間',
  weekend: '土日',
} as const;

type OptionalText = string | undefined;

const line = (label: string, value: OptionalText): string =>
  value ? `${label}: ${value}` : '';

const requirementLines = (
  requirements: ChatLeadSubmission['requirements'],
): Array<[string, OptionalText]> => [
  ['内容・用途', requirements.contentsDescription],
  ['数量', requirements.quantityDescription],
  ['サイズ・仕様状況', requirements.sizeSpecState],
  ['素材・印刷希望', requirements.materialPrintingNeeds],
  ['希望時期', requirements.deadlineText],
];

const contactLines = (
  contact: ChatLeadSubmission['contact'],
): Array<[string, OptionalText]> => [
  ['連絡方法', CHANNEL_LABELS[contact.channel]],
  ['メールアドレス', contact.email],
  ['電話番号', contact.phone],
  ['会社名', contact.companyName],
  ['お名前', contact.contactName],
  ['ご希望連絡方法', PREFERRED_CHANNEL_LABELS[contact.preferredChannel]],
  ['連絡可能時間', CONTACT_WINDOW_LABELS[contact.contactWindow]],
];

const renderText = (rows: Array<[string, OptionalText]>): string =>
  rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `【${label}】${value}`)
    .join('\n');

const renderHtml = (
  heading: string,
  rows: Array<[string, OptionalText]>,
): string => {
  const body = rows
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `
      <tr>
        <th>${escapeHtml(label)}</th>
        <td style="white-space: pre-wrap;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('');

  return `
<!DOCTYPE html>
<html lang="ja">
<body style="font-family: 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; color:#333;">
  <h2 style="font-size:18px;">${escapeHtml(heading)}</h2>
  <table style="border-collapse:collapse;width:100%;max-width:640px;">
    ${body}
  </table>
</body>
</html>
  `.trim();
};

export interface ChatLeadNotificationInput {
  leadId: string;
  lead: ChatLeadSubmission;
  routeFamily: string;
}

export interface ChatLeadNotificationResult {
  adminEmail: { attempted: true; success: boolean; error?: string };
  customerEmail?: { attempted: true; success: boolean; error?: string };
}

export async function sendChatLeadNotifications(
  input: ChatLeadNotificationInput,
): Promise<ChatLeadNotificationResult> {
  const { lead, leadId, routeFamily } = input;
  const requirementRows = requirementLines(lead.requirements);
  const contactRows = contactLines(lead.contact);

  const adminText = [
    '新しいチャット相談リードを受け付けました。',
    '',
    `リードID: ${leadId}`,
    `相談種別: ${INTENT_LABELS[lead.intent]}`,
    `ページ: ${routeFamily}`,
    '',
    renderText(requirementRows),
    '',
    renderText(contactRows),
    '',
    `確認: ${APP_URL}/admin/leads`,
  ].join('\n');

  const adminHtml = `
    <p>新しいチャット相談リードを受け付けました。</p>
    <p><a href="${APP_URL}/admin/leads">管理画面でリードを確認する</a></p>
    ${renderHtml(`相談種別: ${INTENT_LABELS[lead.intent]} / ページ: ${routeFamily}`, [
      ['リードID', leadId],
      ...requirementRows,
      ...contactRows,
    ])}
  `;

  const customerText = [
    'お問い合わせありがとうございます。',
    '担当者が内容を確認し、ご希望の連絡方法にてご連絡いたします。',
    '',
    renderText(requirementRows),
    '',
    'Epackage Lab',
    'https://www.package-lab.com',
  ].join('\n');

  const customerHtml = `
    <p>お問い合わせありがとうございます。</p>
    <p>担当者が内容を確認し、ご希望の連絡方法にてご連絡いたします。</p>
    ${renderHtml('受け付けた相談内容', requirementRows)}
    <p style="font-size:12px;color:#666;">※このメールはシステムによる自動送信です。</p>
  `;

  const [adminResult, customerResult] = await Promise.allSettled([
    sendEmail(
      ADMIN_EMAIL,
      '【Epackage Lab】新しいチャット相談リード',
      adminText,
      adminHtml,
      lead.contact.email,
    ),
    lead.contact.email
      ? sendEmail(
          lead.contact.email,
          '【Epackage Lab】相談内容を受け付けました',
          customerText,
          customerHtml,
        )
      : Promise.resolve({
          success: true,
          messageId: 'not-applicable-phone-contact',
        } as const),
  ]);

  const normalize = (
    settled: PromiseSettledResult<{ success: boolean; error?: string }>,
  ): { attempted: true; success: boolean; error?: string } => {
    if (settled.status === 'fulfilled' && settled.value.success) {
      return { attempted: true, success: true };
    }
    const error = settled.status === 'rejected'
      ? String(settled.reason)
      : settled.value.error;
    return { attempted: true, success: false, error };
  };

  const result: ChatLeadNotificationResult = {
    adminEmail: normalize(adminResult),
  };

  if (lead.contact.email) {
    result.customerEmail = normalize(customerResult);
  }

  logger.info('Chat lead notifications processed', {
    leadId,
    adminEmailSent: result.adminEmail.success,
    customerEmailAttempted: Boolean(result.customerEmail),
    customerEmailSent: result.customerEmail?.success ?? null,
  });

  return result;
}
