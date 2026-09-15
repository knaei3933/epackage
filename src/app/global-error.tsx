'use client';

/**
 * Root Global Error Boundary — 레이아웃 크래시 시 최후의 보루
 * (에어백 통지 포함)
 */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (typeof window !== 'undefined') {
    fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        digest: error.digest,
        message: `[global] ${error.message}`,
        stack: error.stack,
        url: window.location.href,
      }),
    }).catch(() => {});
  }

  return (
    <html lang="ja">
      <body style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
        <h2>システムエラーが発生しました</h2>
        <p style={{ color: '#666' }}>お手数ですが、時間をおいて再度お試しください。</p>
        <button
          onClick={() => reset()}
          style={{ padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          再試行
        </button>
      </body>
    </html>
  );
}
