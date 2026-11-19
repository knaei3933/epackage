import { Metadata } from 'next';
import { PageHeader } from '@/components/layout';

export default async function InvalidTokenPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="min-h-screen bg-bg-primary">
      <PageHeader
        title="링크가 유효하지 않습니다"
        lead={
          reason === 'expired'
            ? '링크가 만료되었습니다. 새 링크를 요청해 주세요.'
            : '올바른 링크인지 확인해 주세요.'
        }
      />
    </div>
  );
}

export const metadata: Metadata = {
  title: '유효하지 않은 링크 | EPackage Lab',
};
