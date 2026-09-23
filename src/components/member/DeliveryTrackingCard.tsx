/**
 * Delivery Tracking Card Component (Member)
 *
 * 配送追跡情報カード — 自分の注文の追跡番号・配送業者・配信予定日を表示
 *
 * 表示条件 (Architect 条件 B): READY_TO_SHIP 以降 または追跡レコード存在時
 * - actual_delivery_date がある場合: 「配達完了」を success 表示
 * - アニメーションは機能的案内のみ（reduced-motion 対応）
 *
 * @client
 */

'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, CheckCircle2, Copy, ExternalLink, Package, Truck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { MemberDeliveryTracking } from '@/lib/delivery-tracking';

interface DeliveryTrackingCardProps {
  tracking: MemberDeliveryTracking;
  className?: string;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

export function DeliveryTrackingCard({ tracking, className }: DeliveryTrackingCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  const estimatedText =
    formatDate(tracking.estimatedDeliveryDateMin) ||
    (tracking.estimatedDeliveryDateMax ? formatDate(tracking.estimatedDeliveryDateMax) : null);

  const handleCopy = async () => {
    if (!tracking.trackingNumber) return;
    try {
      await navigator.clipboard.writeText(tracking.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // クリップボード不可環境では何もしない（番号はテキストで表示済み）
    }
  };

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start gap-4">
        {/* 상태 아이콘 */}
        <div className="relative flex-shrink-0">
          {tracking.isDelivered && !prefersReducedMotion && (
            <motion.span
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="flex"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.span>
          )}
          {tracking.isDelivered && prefersReducedMotion && (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          )}
          {!tracking.isDelivered && (
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                tracking.shippingDate ? 'bg-blue-100' : 'bg-gray-100'
              )}
            >
              {tracking.shippingDate ? (
                <Truck className="w-5 h-5 text-blue-600" />
              ) : (
                <Package className="w-5 h-5 text-gray-500" />
              )}
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="flex-1 min-w-0">
          {tracking.isDelivered ? (
            <>
              <p className="font-semibold text-green-700 flex items-center gap-1">
                📦 配達しました
                {!prefersReducedMotion && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 500, damping: 22 }}
                    className="inline-flex"
                  >
                    <Check className="w-4 h-4" />
                  </motion.span>
                )}
              </p>
              <p className="text-sm text-text-muted mt-1">
                {formatDate(tracking.actualDeliveryDate) && (
                  <>配達日: {formatDate(tracking.actualDeliveryDate)}</>
                )}
              </p>
            </>
          ) : tracking.shippingDate ? (
            <>
              <p className="font-semibold text-blue-700">🚚 配送中です</p>
              <p className="text-sm text-text-muted mt-1">
                {estimatedText && <>お届け予定: {estimatedText} 頃</>}
                {!estimatedText && tracking.carrierLabel && <>配送業者: {tracking.carrierLabel}</>}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-text-primary">📦 出荷準備が整いました</p>
              <p className="text-sm text-text-muted mt-1">
                {estimatedText && <>お届け予定: {estimatedText} 頃</>}
                {!estimatedText && <>まもなく発送いたします</>}
              </p>
            </>
          )}

          {/* 운송장 번호 + 추적 링크 */}
          {tracking.trackingNumber && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-xs text-text-muted">追跡番号:</span>
              <code className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded">
                {tracking.trackingNumber}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="追跡番号をコピー"
                className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors"
              >
                {copied ? (
                  prefersReducedMotion ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex">
                      <Check className="w-3.5 h-3.5" />
                    </motion.span>
                  )
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? 'コピーしました' : 'コピー'}
              </button>
              {tracking.trackingUrl && (
                <a
                  href={tracking.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  配送を追跡
                </a>
              )}
            </div>
          )}
          {!tracking.trackingNumber && tracking.carrierLabel && (
            <p className="mt-3 text-xs text-text-muted">配送業者: {tracking.carrierLabel}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
