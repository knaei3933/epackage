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
  Send,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Users,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SocialLink {
  platform: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  color: string
}

interface PrivacyLink {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
}

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  // Enhanced social links with colors
  const socialLinks: SocialLink[] = [
    {
      platform: 'Facebook',
      href: 'https://facebook.com/epackagelab',
      icon: Facebook,
      label: 'Facebook',
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      platform: 'Twitter',
      href: 'https://twitter.com/epackagelab',
      icon: Twitter,
      label: 'Twitter',
      color: 'hover:bg-sky-500 hover:text-white'
    },
    {
      platform: 'LinkedIn',
      href: 'https://linkedin.com/company/epackagelab',
      icon: Linkedin,
      label: 'LinkedIn',
      color: 'hover:bg-blue-700 hover:text-white'
    },
    {
      platform: 'Instagram',
      href: 'https://instagram.com/epackagelab',
      icon: Instagram,
      label: 'Instagram',
      color: 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white'
    },
    {
      platform: 'YouTube',
      href: 'https://youtube.com/epackagelab',
      icon: Youtube,
      label: 'YouTube',
      color: 'hover:bg-red-600 hover:text-white'
    },
  ]

  // Privacy links
  const privacyLinks: PrivacyLink[] = [
    {
      icon: Shield,
      title: '個人情報保護方針',
      description: 'お客様の個人情報を適切に管理・保護する方針についてご説明します',
      href: '/privacy'
    },
    {
      icon: FileText,
      title: '利用規約',
      description: '当社サービスの利用条件と規約について詳しくご確認いただけます',
      href: '/terms'
    },
    {
      icon: Users,
      title: '特定商取引法',
      description: '表示事項に基づく事業内容と販売条件の詳細情報',
      href: '/legal'
    },
    {
      icon: Heart,
      title: '社会的責任',
      description: '環境配慮と社会的責任に関する当社の取り組みについて',
      href: '/csr'
    }
  ]

  // Animation on mount
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Back to top scroll behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleScroll = () => {
        setShowBackToTop(window.scrollY > 400)
      }

      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setIsSubscribing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setEmail('')
      console.log('Newsletter subscription:', email)
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
    } finally {
      setIsSubscribing(false)
    }
  }

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  const currentYear = new Date().getFullYear()

  return (
    <>
      {/* Enhanced Back to Top Button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-8 right-8 z-50 p-3 bg-gradient-to-r from-brixa-600 to-brixa-700 text-white rounded-full shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:ring-offset-2 transition-all duration-500 transform hover:scale-110",
          showBackToTop
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        )}
        aria-label="ページ上部に移動"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      {/* Modern Footer */}
      <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-t border-slate-200 dark:border-slate-700" role="contentinfo">

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative">
          <Container size="7xl" className="px-6 py-16 lg:py-20">

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">

              {/* Brand Section - 4 columns */}
              <div className={cn(
                "lg:col-span-4 space-y-6",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )} style={{ transition: 'all 0.6s ease-out 0.1s' }}>

                {/* Logo */}
                <Link
                  href="/"
                  className="inline-flex items-center space-x-3 group"
                  aria-label="Epackage Lab - ホームへ戻る"
                >
                  <div className="relative h-10 w-10">
                    <Image
                      src="/logo.svg"
                      alt="Epackage Lab Logo"
                      fill
                      sizes="100vw"
                      className="object-contain"
                      style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        objectFit: 'contain'
                      }}
                    />
                  </div>
                  <span className="text-xl font-bold text-text-primary font-sans tracking-tight">
                    Epackage Lab
                  </span>
                </Link>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm lg:text-base max-w-sm">
                  先進技術と卓越した品質で、お客様の製品価値を最大化し、ブランドイメージを構築します。
                </p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-brixa-500" />
                    <span className="text-sm">info@package-lab.com</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-300">
                    <Phone className="h-4 w-4 text-brixa-500" />
                    <span className="text-sm">050-1793-6500</span>
                  </div>
                  <div className="flex items-start space-x-3 text-slate-600 dark:text-slate-300">
                    <MapPin className="h-4 w-4 text-brixa-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div>本社：兵庫県明石市上ノ丸2-11-21</div>
                      <div className="text-xs mt-1">ロジスティクス：兵庫県加古郡稲美町六分一486</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Features Section - 4 columns */}
              <div className={cn(
                "lg:col-span-4",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )} style={{ transition: 'all 0.6s ease-out 0.2s' }}>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">
                  プライバシーとご利用規約
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {privacyLinks.map((link, index) => {
                    const IconComponent = link.icon
                    return (
                      <Link
                        key={index}
                        href={link.href}
                        className="group p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:border-brixa-200 dark:hover:border-brixa-800 block"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-brixa-100 dark:bg-brixa-900 text-brixa-600 rounded-lg flex items-center justify-center group-hover:bg-brixa-600 group-hover:text-white transition-colors duration-300">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-1 group-hover:text-brixa-600 transition-colors">
                              {link.title}
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {link.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>

              </div>

              {/* Newsletter Section - 4 columns */}
              <div className={cn(
                "lg:col-span-4",
                isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )} style={{ transition: 'all 0.6s ease-out 0.3s' }}>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-700">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-brixa-500 to-brixa-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      最新情報をお届け
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      新製品情報や限定オファーをメールでお知らせします
                    </p>
                  </div>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <Input
                      type="email"
                      placeholder="メールアドレスを入力"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full text-center"
                      leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
                    />
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={isSubscribing}
                      loadingText="購読中..."
                      className="bg-gradient-to-r from-brixa-600 to-brixa-700 hover:from-brixa-700 hover:to-brixa-800 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      購読する
                    </Button>
                  </form>
                </div>

              </div>

            </div>

            {/* Social Media Section */}
            <div className={cn(
              "mt-16 pt-8 border-t border-slate-200 dark:border-slate-700",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )} style={{ transition: 'all 0.6s ease-out 0.4s' }}>

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  ソーシャルメディアでフォロー
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  最新ニュースや製品情報をお届けしています
                </p>
              </div>

              <div className="flex justify-center space-x-3">
                {socialLinks.map((social, index) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={social.platform}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group relative w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all duration-300 transform hover:scale-110",
                        social.color
                      )}
                      aria-label={`${social.label}でフォローする`}
                      style={{ transition: 'all 0.3s ease-out', transitionDelay: `${index * 0.05}s` }}
                    >
                      <IconComponent className="h-5 w-5 text-slate-600 dark:text-slate-300 group-hover:text-white transition-colors duration-300" />
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  )
                })}
              </div>

            </div>

          </Container>

          {/* Bottom Bar */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <Container size="7xl" className="px-6 py-6">
              <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">

                {/* Copyright */}
                <div className="text-center md:text-left">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    © {currentYear} Epackage Lab. 全著作権所有.
                  </p>
                </div>

                {/* Bottom Links */}
                <div className="flex items-center space-x-6">
                  <Link
                    href="/privacy"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brixa-600 dark:hover:text-brixa-400 transition-colors duration-200"
                  >
                    個人情報保護方針
                  </Link>
                  <Link
                    href="/terms"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brixa-600 dark:hover:text-brixa-400 transition-colors duration-200"
                  >
                    利用規約
                  </Link>
                  <Link
                    href="/sitemap.xml"
                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-brixa-600 dark:hover:text-brixa-400 transition-colors duration-200"
                  >
                    サイトマップ
                  </Link>
                </div>

              </div>
            </Container>
          </div>

        </div>
      </footer>
    </>
  )
}