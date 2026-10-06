import 'server-only';

import { createAdminNotification } from '@/lib/admin-notifications';
import { Logger } from '@/lib/logger';
import type { ChatLeadSubmission } from '@/lib/chat/lead-schema';

const logger = new Logger({ component: 'chat/lead-notifications' });

const INTENT_LABELS: Record<ChatLeadSubmission['intent'], string> = {
  quote: '見積もり相談',
  sample: 'サンプル相談',
  technical: '技術相談',
  general: '一般相談',
  human: '担当者相談',
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

  const relayUrl = process.env.EMAIL_RELAY_URL;
  const relayKey = process.env.EMAIL_RELAY_API_KEY;

  if (!relayUrl || !relayKey) {
    logger.warn('Chat lead email relay is not configured', { leadId });
    return {
      adminEmail: {
        attempted: true,
        success: false,
        error: 'relay_not_configured',
      },
    };
  }

  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${relayKey}`,
    },
    body: JSON.stringify({
      leadId,
      intent: INTENT_LABELS[lead.intent],
      routeFamily,
      requirements: lead.requirements,
      contact: lead.contact,
      appUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        'https://www.package-lab.com',
    }),
  });

  const payload = await response.json().catch(() => null) as {
    accepted?: boolean;
    adminSent?: boolean;
    customerAttempted?: boolean;
    customerSent?: boolean;
  } | null;

  const result: ChatLeadNotificationResult = {
    adminEmail: {
      attempted: true,
      success: response.ok && payload?.adminSent === true,
      ...(response.ok ? {} : { error: `relay_http_${response.status}` }),
    },
  };

  if (lead.contact.channel === 'email') {
    result.customerEmail = {
      attempted: true,
      success: response.ok && payload?.customerSent === true,
      ...(response.ok ? {} : { error: `relay_http_${response.status}` }),
    };
  }

  if (!result.adminEmail.success) {
    const notification = await createAdminNotification({
      type: 'system',
      title: '新しいチャット相談リード',
      message: `チャットリード ${leadId} が保存されました。メール通知失敗のため管理画面から確認してください。`,
      relatedId: leadId,
      relatedType: 'chat_lead',
      priority: 'high',
      actionUrl: 'https://www.package-lab.com/admin/leads',
      actionLabel: 'リードを確認',
      metadata: {
        intent: lead.intent,
        routeFamily,
        adminEmailSuccess: false,
      },
    });

    if (notification) {
      logger.info('Chat lead admin dashboard fallback created', { leadId });
    }
  }

  logger.info('Chat lead notifications processed', {
    leadId,
    adminEmailSent: result.adminEmail.success,
    customerEmailAttempted: Boolean(result.customerEmail),
    customerEmailSent: result.customerEmail?.success ?? null,
  });

  return result;
}
