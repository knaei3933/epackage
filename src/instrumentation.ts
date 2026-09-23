/**
 * Next.js 서버사이드 에러 훅 — onRequestError
 * edge 번들링에서 nodemailer가 깨지지 않도록 NEXT_RUNTIME 가드 후
 * node 전용 파일을 지연 로드한다 (Next 공식 패턴).
 */

export async function onRequestError(
  request: { headers?: Record<string, string | undefined> },
  error: Error & { digest?: string },
  context: { routerKind: string; route: string; path: string }
) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { onRequestErrorNode } = await import('./instrumentation-node');
    await onRequestErrorNode(request, error, context);
  }
}
