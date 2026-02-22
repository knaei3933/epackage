import { Metadata } from 'next';

export default async function InvalidTokenPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">
          링크가 유효하지 않습니다
        </h1>
        <p className="text-slate-600">
          {reason === 'expired'
            ? '링크가 만료되었습니다. 새 링크를 요청해 주세요.'
            : '올바른 링크인지 확인해 주세요.'}
        </p>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: '유효하지 않은 링크 | EPackage Lab',
};
