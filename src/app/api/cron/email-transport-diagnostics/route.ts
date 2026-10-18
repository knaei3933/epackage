import { NextRequest, NextResponse } from 'next/server';
import {
  transporter,
  transportType,
  sendEmail,
  getEmailConfigStatus,
} from '@/lib/email/transport';

export const dynamic = 'force-dynamic';

/**
 * Email transport diagnostics (CRON_SECRET protected).
 *
 * Verifies whether the configured SMTP transport can actually reach the
 * mail server from this runtime and optionally sends a test email.
 *
 * GET /api/cron/email-transport-diagnostics
 * GET /api/cron/email-transport-diagnostics?send=1  (also sends a test mail to ADMIN_EMAIL)
 */
export async function GET(request: NextRequest) {
  const CRON_SECRET = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const status = getEmailConfigStatus();

  let verifyResult: { ok: boolean; error?: string } = {
    ok: false,
    error: 'transporter not initialized',
  };
  if (transporter) {
    try {
      await transporter.verify();
      verifyResult = { ok: true };
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      verifyResult = { ok: false, error: `[${err.code}] ${err.message}` };
    }
  }

  let sendResult: { attempted: boolean; success?: boolean; messageId?: string; error?: string } = {
    attempted: false,
  };
  if (request.nextUrl.searchParams.get('send') === '1') {
    const to = process.env.ADMIN_EMAIL || 'info@package-lab.com';
    const result = await sendEmail(
      to,
      '【診断】email transport diagnostics test',
      'Email transport diagnostic test. Safe to discard.',
      '<p>Email transport diagnostic test. Safe to discard.</p>'
    );
    sendResult = { attempted: true, success: result.success, messageId: result.messageId, error: result.error };
  }

  return NextResponse.json({
    success: true,
    runtime: process.env.NODE_ENV,
    config: status,
    verify: verifyResult,
    send: sendResult,
    checkedAt: new Date().toISOString(),
  });
}
