import 'server-only';

/**
 * Shared client for the NAS email relay (chatbot.package-lab.com/email-relay).
 *
 * XServer SMTP rejects connections from cloud provider IPs (Vercel/AWS), so
 * every transactional email on the server is submitted through the on-premises
 * relay, which runs on the home network and can reach XServer.
 */

const RELAY_TIMEOUT_MS = 15000;

export interface EmailRelayAttachment {
  filename: string;
  contentType?: string;
  /** Base64-encoded content. */
  contentBase64: string;
  disposition?: 'attachment' | 'inline';
}

export interface EmailRelaySendParams {
  to: string;
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
  attachments?: EmailRelayAttachment[];
}

export interface EmailRelayResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export function isEmailRelayConfigured(): boolean {
  return Boolean(process.env.EMAIL_RELAY_URL && process.env.EMAIL_RELAY_API_KEY);
}

export async function sendViaEmailRelay(
  params: EmailRelaySendParams,
): Promise<EmailRelayResult> {
  const relayUrl = process.env.EMAIL_RELAY_URL;
  const relayKey = process.env.EMAIL_RELAY_API_KEY;

  if (!relayUrl || !relayKey) {
    return { success: false, error: 'relay_not_configured' };
  }

  try {
    const response = await fetch(relayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${relayKey}`,
      },
      body: JSON.stringify({
        type: 'send',
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
        ...(params.attachments?.length
          ? {
              attachments: params.attachments.map((att) => ({
                filename: att.filename,
                contentType: att.contentType,
                contentBase64: att.contentBase64,
                disposition: att.disposition,
              })),
            }
          : {}),
      }),
      signal: AbortSignal.timeout(RELAY_TIMEOUT_MS),
    });

    const payload = (await response.json().catch((): null => null)) as {
      success?: boolean;
      messageId?: string;
      error?: string;
    } | null;

    if (response.ok && payload?.success) {
      return { success: true, messageId: payload.messageId };
    }

    return {
      success: false,
      error: payload?.error || `relay_http_${response.status}`,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'relay_request_failed';
    return { success: false, error: message };
  }
}

/**
 * Normalizes attachment content (Buffer or base64 string) to base64.
 * String content is assumed to already be base64, matching the existing
 * nodemailer usage in this codebase (PDF attachments).
 */
export function toBase64Attachment(
  attachment: { filename: string; content: Buffer | string; type?: string; disposition?: 'attachment' | 'inline' },
): EmailRelayAttachment {
  return {
    filename: attachment.filename,
    contentType: attachment.type,
    contentBase64:
      Buffer.isBuffer(attachment.content)
        ? attachment.content.toString('base64')
        : attachment.content,
    disposition: attachment.disposition,
  };
}
