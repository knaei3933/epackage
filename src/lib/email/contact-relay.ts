import 'server-only';

import { Logger } from '@/lib/logger';

const logger = new Logger({ component: 'email/contact-relay' });

/**
 * Contact emails are delivered through the NAS email relay because
 * XServer SMTP rejects connections from cloud provider IPs (Vercel/AWS).
 * The relay runs on the on-premises NAS and is allowed to submit via XServer.
 */

interface NotificationRelayPayload {
  accepted?: boolean;
  adminSent?: boolean;
  customerAttempted?: boolean;
  customerSent?: boolean;
}

// Values are restricted to the labels the relay already accepts from the
// chat lead flow, in case the relay validates intent server-side.
const INTENT_BY_INQUIRY_TYPE: Record<string, string> = {
  product: '一般相談',
  quotation: '見積もり相談',
  sample: 'サンプル相談',
  order: '一般相談',
  other: '一般相談',
};

export interface ContactRelayInput {
  requestId: string;
  inquiryType: string;
  subject: string;
  message: string;
  customerName: string;
  company?: string;
  email: string;
  phone: string;
}

export interface ContactRelayResult {
  attempted: boolean;
  adminSent: boolean;
  customerSent: boolean;
  error?: string;
}

export async function sendContactViaRelay(
  input: ContactRelayInput,
): Promise<ContactRelayResult> {
  const relayUrl = process.env.EMAIL_RELAY_URL;
  const relayKey = process.env.EMAIL_RELAY_API_KEY;

  if (!relayUrl || !relayKey) {
    logger.warn('Contact email relay is not configured', { requestId: input.requestId });
    return {
      attempted: false,
      adminSent: false,
      customerSent: false,
      error: 'relay_not_configured',
    };
  }

  try {
    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${relayKey}`,
      },
      body: JSON.stringify({
        leadId: input.requestId,
        intent: INTENT_BY_INQUIRY_TYPE[input.inquiryType] || '一般相談',
        routeFamily: 'contact-form',
        requirements: {
          contentsDescription: [input.subject, input.message]
            .filter((part) => part && part.trim().length > 0)
            .join('\n\n'),
        },
        contact: {
          channel: 'email',
          email: input.email,
          phone: input.phone,
          companyName: input.company,
          contactName: input.customerName,
          preferredChannel: 'email',
          contactWindow: 'unspecified',
        },
        appUrl:
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXT_PUBLIC_APP_URL ||
          'https://www.package-lab.com',
      }),
    });

    const payload = await response
      .json()
      .catch((): NotificationRelayPayload | null => null);

    const adminSent = response.ok && payload?.adminSent === true;
    const customerSent = response.ok && payload?.customerSent === true;

    if (!adminSent) {
      logger.error('Contact email relay did not deliver admin email', {
        requestId: input.requestId,
        status: response.status,
        accepted: payload?.accepted,
      });
    }

    return {
      attempted: true,
      adminSent,
      customerSent,
      ...(response.ok ? {} : { error: `relay_http_${response.status}` }),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'relay_request_failed';
    logger.error('Contact email relay request failed', {
      requestId: input.requestId,
      message,
    });
    return {
      attempted: true,
      adminSent: false,
      customerSent: false,
      error: message,
    };
  }
}
