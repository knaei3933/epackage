/**
 * Error Airbag — 최소 에러 모니터링
 *
 * 심각 에러를 기존 SMTP로 관리자(info@package-lab.com)에게 통지.
 * - Rate-limit: 동일 digest 30분 1회 (스팸 방지)
 * - 재귀 방지: 발송 실패해도 절대 throw하지 않음
 * - 의존성: 기존 nodemailer만 사용
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@package-lab.com';
const RATE_LIMIT_MS = 30 * 60 * 1000;
const recentSends = new Map<string, number>();

export interface AirbagPayload {
  digest?: string;
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  source?: 'client' | 'server';
}

export async function sendErrorAirbag(payload: AirbagPayload): Promise<{ sent: boolean; reason?: string }> {
  try {
    const digest = payload.digest || payload.message.slice(0, 80);
    const now = Date.now();
    const last = recentSends.get(digest);
    if (last && now - last < RATE_LIMIT_MS) {
      return { sent: false, reason: 'rate-limited' };
    }
    recentSends.set(digest, now);

    // Map 무한정 증가 방지 (1000개 초과 시 오래된 것 정리)
    if (recentSends.size > 1000) {
      for (const [k, v] of recentSends) {
        if (now - v > RATE_LIMIT_MS) recentSends.delete(k);
      }
    }

    const { epackMailer } = await import('./email/epack-mailer');
    const subject = `🚨 [에러에어백] ${payload.source || 'client'} — ${payload.message.slice(0, 60)}`;
    const text = [
      `시각(JST): ${new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo' }).format(new Date())}`,
      `소스: ${payload.source || 'client'}`,
      `URL: ${payload.url || '(unknown)'}`,
      `User-Agent: ${payload.userAgent || '(unknown)'}`,
      `digest: ${digest}`,
      '',
      `메시지: ${payload.message}`,
      '',
      '스택:',
      payload.stack || '(no stack)',
    ].join('\n');

    const result = await epackMailer.sendCustom(ADMIN_EMAIL, subject, { text });
    return { sent: result.success, reason: result.error };
  } catch {
    // 재귀 방지 — 어떤 실패도 조용히 무시
    return { sent: false, reason: 'airbag-error' };
  }
}
