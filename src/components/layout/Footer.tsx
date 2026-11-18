'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ChevronUp,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialLink {
  platform: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

interface FooterLink {
  label: string
  href: string
}

const socialLinks: SocialLink[] = [
  { platform: 'Facebook', href: 'https://facebook.com/epackagelab', icon: Facebook, label: 'Facebook' },
  { platform: 'Twitter', href: 'https://twitter.com/epackagelab', icon: Twitter, label: 'Twitter' },
  { platform: 'LinkedIn', href: 'https://linkedin.com/company/epackagelab', icon: Linkedin, label: 'LinkedIn' },
  { platform: 'Instagram', href: 'https://instagram.com/epackagelab', icon: Instagram, label: 'Instagram' },
  { platform: 'YouTube', href: 'https://youtube.com/epackagelab', icon: Youtube, label: 'YouTube' },
]

// 内部リンク（孤島ページ回避・クローラー発見経路）
const serviceLinks: FooterLink[] = [
  { label: '製造工程', href: '/flow' },
  { label: '印刷技術', href: '/print' },
  { label: '製品比較', href: '/compare' },
  { label: 'プレミアムコンテンツ', href: '/premium-content' },
  { label: 'デザインテンプレート', href: '/data-templates' },
]

const guideLinks: FooterLink[] = [
  { label: '個人情報保護方針', href: '/privacy' },
  { label: '利用規約', href: '/terms' },
  { label: '特定商取引法', href: '/legal' },
  { label: '社会的責任', href: '/csr' },
]

const bottomLinks: FooterLink[] = [
  { label: 'サイトマップ', href: '/sitemap' },
  { label: '個人情報保護方針', href: '/privacy' },
  { label: '利用規約', href: '/terms' },
]

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D6C65] focus-visible:ring-offset-2 dark:focus-visible:ring-[#5EB6AC]'

const linkClass = cn(
  'inline-flex min-h-11 items-center rounded-[4px] text-[15px] leading-[1.8] text-[#2D6C65] hover:underline underline-offset-4 lg:min-h-0 dark:text-[#5EB6AC]',
  focusRing
)

const headingClass = 'mb-2 text-sm font-medium text-[#2F333D] dark:text-slate-100'

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* 右下のチャット部品（bottom-6・56px）と重ならないよう、その上に置く */}
      <button
        type="button"
        onClick={scrollToTop}
        className={cn(
          'fixed bottom-24 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-[4px] bg-[#2D6C65] text-white hover:bg-[#245a54]',
          focusRing,
          showBackToTop ? 'opacity-100' : 'invisible pointer-events-none opacity-0'
        )}
        aria-label="ページ上部に移動"
        aria-hidden={!showBackToTop}
        tabIndex={showBackToTop ? 0 : -1}
      >
        <ChevronUp className="h-5 w-5" aria-hidden="true" />
      </button>

      <footer
        className="border-t border-[#5EB6AC] bg-[#F4F8F7] text-[#2F333D] dark:bg-slate-900 dark:text-slate-200"
        role="contentinfo"
      >
        <div className="mx-auto max-w-[1120px] px-4 pt-10 sm:px-6 lg:pt-12">
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
            {/* 会社情報 */}
            <div>
              <Link
                href="/"
                className={cn('inline-flex items-center gap-3 rounded-[4px]', focusRing)}
                aria-label="Epackage Lab - ホームへ戻る"
              >
                <span className="relative block h-8 w-8">
                  <Image
                    src="/logo.svg"
                    alt="Epackage Lab Logo"
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </span>
                <span className="text-lg font-medium">Epackage Lab</span>
              </Link>
              <p className="mt-3 max-w-sm text-[15px] leading-[1.8]">
                先進技術と卓越した品質で、お客様の製品価値を最大化し、ブランドイメージを構築します。
              </p>
              <ul className="mt-3 space-y-1 text-[15px] leading-[1.8]">
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-[#2D6C65] dark:text-[#5EB6AC]" aria-hidden="true" />
                  <span>info@package-lab.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 shrink-0 text-[#2D6C65] dark:text-[#5EB6AC]" aria-hidden="true" />
                  <span>050-3613-9673</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="mt-[0.45rem] h-4 w-4 shrink-0 text-[#2D6C65] dark:text-[#5EB6AC]" aria-hidden="true" />
                  <span>本社：兵庫県明石市本町2-1-29 みなとメゾン明石本町2F</span>
                </li>
              </ul>
            </div>

            {/* サービス・コンテンツ */}
            <nav aria-label="サービス・コンテンツへのリンク">
              <h3 className={headingClass}>サービス・コンテンツ</h3>
              <ul>
                {serviceLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* ご利用案内 */}
            <nav aria-label="ご利用案内">
              <h3 className={headingClass}>ご利用案内</h3>
              <ul>
                {guideLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* SNS */}
            <div>
              <h3 className={headingClass}>SNS</h3>
              <ul className="flex flex-wrap gap-2">
                {socialLinks.map(social => {
                  const Icon = social.icon
                  return (
                    <li key={social.platform}>
                      <Link
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#5EB6AC] text-[#2F333D] hover:border-[#2D6C65] hover:text-[#2D6C65] dark:text-slate-200 dark:hover:border-[#5EB6AC] dark:hover:text-[#5EB6AC]',
                          focusRing
                        )}
                        aria-label={`${social.label}でフォローする`}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* 下段 */}
          <div className="mt-8 flex flex-col gap-2 border-t border-[#5EB6AC] pb-20 pt-4 md:flex-row md:items-center md:justify-between lg:py-4 lg:pr-20">
            <p className="text-sm leading-[1.8]">© {currentYear} Epackage Lab. 全著作権所有.</p>
            <nav aria-label="フッターのリンク">
              <ul className="flex flex-wrap gap-x-6">
                {bottomLinks.map(link => (
                  <li key={link.href}>
                    <Link href={link.href} className={cn(linkClass, 'text-sm')}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </footer>
    </>
  )
}
