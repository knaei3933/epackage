'use client';

import { Button } from '@/components/ui';
import { Mail } from 'lucide-react';
import type { Quotation } from '@/types/quotation';

interface AdminQuotationActionsProps {
  quotation: Quotation;
  onApprove: () => void;
  onReject: () => void;
  onSendEmail: () => void;
}

/**
 * AdminQuotationActions - 管理者用見積アクションコンポーネント
 */
export function AdminQuotationActions({
  quotation,
  onApprove,
  onReject,
  onSendEmail,
}: AdminQuotationActionsProps) {
  const canApprove = quotation.status === 'DRAFT' || quotation.status === 'SENT';
  const canReject = quotation.status !== 'APPROVED' && quotation.status !== 'CONVERTED';

  return (
    <div className="flex gap-2 flex-wrap">
      {canApprove && (
        <Button size="sm" onClick={onApprove}>
          承認
        </Button>
      )}
      {canReject && (
        <Button size="sm" variant="outline" onClick={onReject}>
          拒否
        </Button>
      )}
      <Button size="sm" variant="outline" onClick={onSendEmail}>
        <Mail className="w-4 h-4 mr-1" />
        メール送信
      </Button>
    </div>
  );
}
