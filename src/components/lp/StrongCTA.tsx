'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Phone, Mail, ArrowRight, Clock } from 'lucide-react'
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
  const phoneNumber = '050-1793-6500'

  const handlePhoneClick = () => {
    trackPhoneClick(phoneNumber, 'cta')
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-r from-brixa-600 to-brixa-700 rounded-xl p-6 text-white ${className}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            {showPhone && (
              <a
                href={`tel:${phoneNumber}`}
                onClick={handlePhoneClick}
                className="flex items-center justify-center sm:justify-start space-x-2 text-brixa-100 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-lg font-semibold">{phoneNumber}</span>
              </a>
            )}
          </div>
          <Link href={primaryHref} className="inline-flex w-full sm:w-auto shrink-0">
            <button className="w-full sm:w-auto px-6 py-3 bg-white text-brixa-700 font-semibold rounded-lg hover:bg-brixa-50 transition-colors shadow-lg">
              {primaryText}
            </button>
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'centered') {
    return (
      <div className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-12 text-center ${className}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href={primaryHref} className="inline-flex w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brixa-500 to-brixa-600 text-white text-lg font-semibold rounded-xl hover:from-brixa-600 hover:to-brixa-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                <span className="flex items-center justify-center">
                  {primaryText}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </button>
            </Link>
            {secondaryHref && (
              <Link href={secondaryHref} className="inline-flex w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20">
                  {secondaryText}
                </button>
              </Link>
            )}
          </div>

          {showPhone && (
            <a
              href={`tel:${phoneNumber}`}
              onClick={handlePhoneClick}
              className="inline-flex items-center space-x-2 text-brixa-400 hover:text-brixa-300 transition-colors font-semibold"
            >
              <Phone className="w-5 h-5" />
              <span className="text-xl">{phoneNumber}</span>
            </a>
          )}

          {showHours && (
            <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>受付時間: 平日 9:00-18:00</span>
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-brixa-50 via-white to-blue-50 border border-brixa-200 rounded-xl p-6 md:p-8 ${className}`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center lg:text-left">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          {showPhone && (
            <a
              href={`tel:${phoneNumber}`}
              onClick={handlePhoneClick}
              className="inline-flex items-center space-x-2 text-brixa-700 hover:text-brixa-800 transition-colors font-semibold text-lg"
            >
              <Phone className="w-5 h-5" />
              <span>{phoneNumber}</span>
            </a>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <Link href={primaryHref} className="inline-flex w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-brixa-600 to-brixa-700 text-white font-semibold rounded-xl hover:from-brixa-700 hover:to-brixa-800 transition-all shadow-lg hover:shadow-xl">
              <span className="flex items-center justify-center">
                {primaryText}
                <ArrowRight className="w-5 h-5 ml-2" />
              </span>
            </button>
          </Link>
          {secondaryHref && (
            <Link href={secondaryHref} className="inline-flex w-full sm:w-auto">
              <button className="w-full sm:w-auto px-6 py-4 border-2 border-brixa-300 text-brixa-700 font-semibold rounded-xl hover:bg-brixa-50 transition-colors">
                {secondaryText}
              </button>
            </Link>
          )}
        </div>
      </div>

      {showHours && (
        <div className="mt-4 pt-4 border-t border-brixa-200 flex items-center justify-center lg:justify-start space-x-2 text-gray-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>受付時間: 平日 9:00-18:00 | 24時間メール受付</span>
        </div>
      )}
    </div>
  )
}
