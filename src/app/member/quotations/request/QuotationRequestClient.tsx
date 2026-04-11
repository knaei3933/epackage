/**
 * Quotation Request Page Client Component
 *
 * 見積依頼ページ - Client Component
 */

'use client';

import { useRouter } from 'next/navigation';
import B2BQuotationRequestForm from '@/components/b2b/B2BQuotationRequestForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';

interface Company {
  id: string;
  name: string;
  name_kana: string;
  corporate_number: string;
}

interface QuotationRequestClientProps {
  userId: string;
  companies: Company[];
}

export function QuotationRequestClient({
  userId,
  companies,
}: QuotationRequestClientProps) {
  const router = useRouter();

  const handleSuccess = (quotationId: string) => {
    router.push(`/member/quotations/${quotationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <B2BQuotationRequestForm
        userId={userId}
        companies={companies}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
