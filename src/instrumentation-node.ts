/**
 * 서버(nodejs 런타임) 전용 에러 에어백 훅 — instrumentation.ts에서 호출됨
 */

export async function onRequestErrorNode(
  request: { headers?: Record<string, string | undefined> },
  error: Error & { digest?: string },
  context: { routerKind: string; route: string; path: string }
) {
  try {
    const { sendErrorAirbag } = await import('@/lib/error-airbag');
    await sendErrorAirbag({
      digest: error.digest || `${context.route}:${error.message.slice(0, 60)}`,
      message: `${error.message} [${context.routerKind} ${context.route}]`,
      stack: error.stack,
      url: context.path,
      userAgent: request.headers?.['user-agent'],
      source: 'server',
    });
  } catch {
    // 재귀 방지
  }
}
