'use client'

import Link from 'next/link'
import { Phone, Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { trackPhoneClick } from '@/lib/analytics'

const PHONE_NUMBER = '050-3613-9673'

interface ContactCTAProps {
  title: string
  description: string
  primaryText: string
  primaryHref: string
  secondaryText: string
  secondaryHref: string
}

/** お問い合わせページ末尾の紺の帯（`StrongCTA` centered と同じ内容を、基準 v1 の見た目で） */
export function ContactCTA({ title, description, primaryText, primaryHref, secondaryText, secondaryHref }: ContactCTAProps) {
  return (
    <div className="rounded-container bg-bg-inverted p-8 text-text-inverse md:p-12">
      <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] [overflow-wrap:anywhere] md:text-[2rem]">
        {title}
      </h2>
      <p className="mt-4 max-w-[40em] leading-[1.8]">{description}</p>

      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
        <Link href={primaryHref} className={buttonVariants({ variant: 'primary', size: 'lg' })}>
          {primaryText}
        </Link>
        <Link href={secondaryHref} className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft">
          {secondaryText}
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        <a
          href={`tel:${PHONE_NUMBER}`}
          onClick={() => trackPhoneClick(PHONE_NUMBER, 'cta')}
          className="inline-flex min-h-11 items-center gap-2 text-xl font-semibold hover:text-brand-soft"
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span>{PHONE_NUMBER}</span>
        </a>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>受付時間: 平日 9:00-18:00</span>
        </div>
      </div>
    </div>
  )
}
