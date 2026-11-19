'use client';

import Link from 'next/link';
import { MessageSquare, FileText } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';
import { pushToDataLayer } from '@/lib/analytics/dataLayer';

interface ArticleCTAProps {
  variant?: 'mid-article' | 'end-article';
}

export function ArticleCTA({ variant = 'mid-article' }: ArticleCTAProps) {
  const isCompact = variant === 'mid-article';

  return (
    <div
      className={`
        my-8 rounded-container border border-border-medium bg-bg-secondary
        ${isCompact
          ? 'py-4 px-4 sm:py-5 sm:px-6 lg:py-6 lg:px-8'
          : 'py-6 px-4 sm:py-8 sm:px-6 lg:py-10 lg:px-8'
        }
      `}
    >
      {/* Title */}
      <h3
        className={`
          font-bold text-text-primary mb-2
          ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
        `}
      >
        {isCompact ? 'お気軽にご相談ください' : 'パッケージ制作のご相談はこちら'}
      </h3>

      {/* Description */}
      <p
        className={`
          text-text-secondary mb-4
          ${isCompact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'}
        `}
      >
        {isCompact
          ? '最適なパッケージソリューションをご提案いたします。'
          : 'お客様のニーズに合わせた最適なパッケージをご提案いたします。お気軽にお問い合わせください。'
        }
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/contact"
          onClick={() => pushToDataLayer('cta_click', { cta_type: 'contact', location: variant })}
          className={buttonVariants({ variant: 'primary', size: 'md' })}
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          お問い合わせ
        </Link>

        <Link
          href="/quote-simulator"
          onClick={() => pushToDataLayer('cta_click', { cta_type: 'quote', location: variant })}
          className={buttonVariants({ variant: 'outline', size: 'md' })}
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          見積もり依頼
        </Link>
      </div>
    </div>
  );
}
