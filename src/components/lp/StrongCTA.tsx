'use client'

import { BUSINESS_HOURS_LABEL, REPLY_TIME_LABEL } from '@/lib/site-facts'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, Mail, ArrowRight, Clock } from 'lucide-react'
import { buttonVariants } from '@/components/ui/Button'
import { trackPhoneClick } from '@/lib/analytics'

interface StrongCTAProps {
  title?: string
  description?: string
  primaryText?: string
  primaryHref?: string
  secondaryText?: string
  secondaryHref?: string
  showPhone?: boolean
  showHours?: boolean
  variant?: 'default' | 'compact' | 'centered'
  className?: string
}

export function StrongCTA({
  title = '今すぐご相談ください',
  description = '専門スタッフが最適な包装ソリューションをご提案します',
  primaryText = '今すぐ見積もる',
  primaryHref = '/quote-simulator',
  secondaryText = 'お問い合わせ',
  secondaryHref = '/contact',
  showPhone = true,
  showHours = true,
  variant = 'default',
  className = ''
}: StrongCTAProps) {
  const phoneNumber = '050-3613-9673'

  const handlePhoneClick = () => {
    trackPhoneClick(phoneNumber, 'cta')
  }

  const phoneLinkBase =
    'inline-flex min-h-11 items-center gap-2 font-semibold text-text-inverse hover:text-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-soft'

  if (variant === 'compact') {
    return (
      <div className={`rounded-container bg-bg-inverted p-6 text-text-inverse ${className}`}>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="mb-1 text-xl font-bold">{title}</h3>
            {showPhone && (
              <a href={`tel:${phoneNumber}`} onClick={handlePhoneClick} className={phoneLinkBase}>
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span className="text-lg">{phoneNumber}</span>
              </a>
            )}
          </div>
          <Link href={primaryHref} className={`${buttonVariants({ variant: 'primary', size: 'lg' })} w-full shrink-0 sm:w-auto`}>
            {primaryText}
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'centered') {
    return (
      <div className={`rounded-container bg-bg-inverted p-8 text-center text-text-inverse md:p-12 ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl"
        >
          <h2 className="mb-4 font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
            {title}
          </h2>
          <p className="mx-auto mb-8 max-w-[40em] leading-[1.8]">{description}</p>

          <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-x-8">
            <Link href={primaryHref} className={`${buttonVariants({ variant: 'primary', size: 'lg' })} w-full sm:w-auto`}>
              {primaryText}
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
            {secondaryHref && (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
              >
                {secondaryText}
              </Link>
            )}
          </div>

          {showPhone && (
            <a href={`tel:${phoneNumber}`} onClick={handlePhoneClick} className={phoneLinkBase}>
              <Phone className="h-5 w-5" aria-hidden="true" />
              <span className="text-xl">{phoneNumber}</span>
            </a>
          )}

          {showHours && (
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>受付時間: 平日 9:00-18:00</span>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`rounded-container bg-bg-inverted p-6 text-text-inverse md:p-8 ${className}`}>
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex-1">
          <h3 className="mb-2 font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-3xl">
            {title}
          </h3>
          <p className="mb-4 max-w-[40em] leading-[1.8]">{description}</p>
          {showPhone && (
            <a href={`tel:${phoneNumber}`} onClick={handlePhoneClick} className={phoneLinkBase}>
              <Phone className="h-5 w-5" aria-hidden="true" />
              <span className="text-lg">{phoneNumber}</span>
            </a>
          )}
        </div>

        <div className="flex w-full flex-col items-start gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-x-8">
          <Link href={primaryHref} className={`${buttonVariants({ variant: 'primary', size: 'lg' })} w-full sm:w-auto`}>
            {primaryText}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Link>
          {secondaryHref && (
            <Link
              href={secondaryHref}
              className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
            >
              {secondaryText}
            </Link>
          )}
        </div>
      </div>

      {showHours && (
        <div className="mt-4 flex items-center gap-2 border-t border-border-strong pt-4 text-sm">
          <Clock className="h-4 w-4" aria-hidden="true" />
          <span>受付時間: {BUSINESS_HOURS_LABEL} | メールは{REPLY_TIME_LABEL}にご返信</span>
        </div>
      )}
    </div>
  )
}
