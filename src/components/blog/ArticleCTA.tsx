'use client';

import Link from 'next/link';
import { MessageSquare, FileText } from 'lucide-react';

interface ArticleCTAProps {
  variant?: 'mid-article' | 'end-article';
}

export function ArticleCTA({ variant = 'mid-article' }: ArticleCTAProps) {
  const isCompact = variant === 'mid-article';

  return (
    <div
      className={`
        my-8 rounded-2xl border border-[#8380FF]/20 bg-gradient-to-r from-[#8380FF]/5 to-[#8380FF]/10
        ${isCompact
          ? 'py-4 px-4 sm:py-5 sm:px-6 lg:py-6 lg:px-8'
          : 'py-6 px-4 sm:py-8 sm:px-6 lg:py-10 lg:px-8'
        }
      `}
    >
      {/* Title */}
      <h3
        className={`
          font-bold text-[#1D1D1F] mb-2
          ${isCompact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
        `}
      >
        {isCompact ? 'お気軽にご相談ください' : 'パッケージ制作のご相談はこちら'}
      </h3>

      {/* Description */}
      <p
        className={`
          text-gray-600 mb-4
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
          className="
            inline-flex items-center justify-center gap-2
            min-h-[44px] min-w-[44px]
            px-5 py-3
            bg-[#8380FF] text-white
            font-medium text-sm sm:text-base
            rounded-xl
            hover:bg-[#6B6AFF] transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#8380FF] focus:ring-offset-2
          "
        >
          <MessageSquare className="w-4 h-4" aria-hidden="true" />
          お問い合わせ
        </Link>

        <Link
          href="/quote"
          className="
            inline-flex items-center justify-center gap-2
            min-h-[44px] min-w-[44px]
            px-5 py-3
            bg-white text-[#8380FF]
            font-medium text-sm sm:text-base
            rounded-xl
            border border-[#8380FF]
            hover:bg-[#8380FF]/5 transition-colors
            focus:outline-none focus:ring-2 focus:ring-[#8380FF] focus:ring-offset-2
          "
        >
          <FileText className="w-4 h-4" aria-hidden="true" />
          見積もり依頼
        </Link>
      </div>
    </div>
  );
}
