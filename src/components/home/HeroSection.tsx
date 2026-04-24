'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Package, CheckCircle, Clock, Calculator, TrendingUp, Shield, Zap, Truck, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { heroVariants, statVariants, ctaVariants, numberVariants } from './animations'
import { trackPhoneClick } from '@/lib/analytics'

export function HeroSection() {
  const ref = useRef(null)
  const inView = useInView(ref, {
    once: true,
    margin: "0px",
    amount: 0.1
  })

  return (
    <motion.section
      className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-12"
      variants={heroVariants}
      initial="hidden"
      animate="visible"
      ref={ref}
    >
      {/* Enhanced Background with Professional Images */}
      <div className="absolute inset-0">
        {/* Professional manufacturing facility background - WebP optimized */}
        <div className="absolute inset-0 relative h-full w-full">
          <picture>
            <source srcSet="/images/main/main15.webp" type="image/webp" />
            <Image
              src="/images/main/main15.png"
              alt="オリジナ包装材専用 - 高品質なスタンドパウチ製造"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover opacity-60"
              priority
              fetchPriority="high"
              quality={80}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </picture>
        </div>

        {/* Single optimized gradient overlay for LCP performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 to-gray-900/60"></div>
      </div>

      {/* Enhanced Content container */}
      <Container size="6xl" className="relative z-10 py-20 lg:py-32">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          {/* Professional main headline */}
          <div className="space-y-8">
            <motion.div
              variants={statVariants}
              className="space-y-4"
            >
                <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold text-white leading-tight tracking-tight">
                  <span className="block text-white drop-shadow-2xl">
                    あなたの製品を
                  </span>
                  <span className="block text-green-400 drop-shadow-2xl">
                    最適な包装で
                  </span>
                  <span className="block text-green-300 drop-shadow-2xl">
                    輝かせる
                  </span>
                </h1>
            </motion.div>

            {/* Enhanced value propositions with Brixa-style emphasis */}
            <motion.div
              variants={statVariants}
              className="space-y-6"
            >
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 text-2xl md:text-3xl font-extrabold">
                {/* 500種以上製造可能 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-brixa-500 via-brixa-600 to-brixa-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-brixa-400/30 min-w-[280px]"
                >
                  <TrendingUp className="w-7 h-7 flex-shrink-0" />
                  <div className="text-center flex-1">
                    <motion.div
                      variants={numberVariants}
                      animate="pulse"
                      className="text-4xl md:text-5xl font-black text-white drop-shadow-lg"
                    >
                      500
                    </motion.div>
                    <div className="text-sm md:text-base font-semibold">種以上製造可能</div>
                  </div>
                </motion.div>

                {/* 21日平均納期緊急対応可能 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-brixa-secondary-500 via-brixa-secondary-600 to-brixa-secondary-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-brixa-secondary-400/30 min-w-[280px]"
                >
                  <Clock className="w-7 h-7 flex-shrink-0" />
                  <div className="text-center flex-1">
                    <motion.div
                      variants={numberVariants}
                      animate="pulse"
                      className="text-4xl md:text-5xl font-black text-white drop-shadow-lg"
                    >
                      21日
                    </motion.div>
                    <div className="text-sm md:text-base font-semibold">平均納期</div>
                    <div className="text-xs text-white/80 mt-1">緊急対応可能</div>
                  </div>
                </motion.div>

                {/* 100社以上実績 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-brixa-500 via-brixa-600 to-brixa-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-brixa-400/30 min-w-[280px]"
                >
                  <Shield className="w-7 h-7 flex-shrink-0" />
                  <div className="text-center flex-1">
                    <motion.div
                      variants={numberVariants}
                      animate="pulse"
                      className="text-4xl md:text-5xl font-black text-white drop-shadow-lg"
                    >
                      100
                    </motion.div>
                    <div className="text-sm md:text-base font-semibold">社以上実績</div>
                  </div>
                </motion.div>
              </div>
              <motion.p
                variants={statVariants}
                className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-4xl mx-auto bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                食品や化粧品、電子部品など、あらゆる業界に対応する高品質パウチ包装を。
                あなたの製品価値を最大限に引き出す、カスタマイズされたソリューションをご提案いたします。
              </motion.p>
            </motion.div>
          </div>

          {/* Enhanced CTA Buttons with Brixa-style design and tracking */}
          <motion.div
            variants={ctaVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/catalog" className="inline-flex group relative">
              <Button
                variant="primary"
                size="lg"
                className="justify-center px-12 py-6 text-lg font-bold bg-gradient-to-br from-brixa-500 via-brixa-600 to-brixa-800 text-white shadow-2xl hover:shadow-4xl transition-all duration-300 group-hover:scale-105 border-2 border-brixa-300 relative overflow-hidden"
                onClick={() => {
                  // Conversion tracking
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'click', {
                      event_category: 'cta_button',
                      event_label: 'catalog_hero',
                      value: 1
                    })
                  }
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brixa-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Package className="h-6 w-6" />
                  </div>
                  <span className="text-xl">製品を見る</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                人気
              </div>
            </Link>

            <Link href="/quote-simulator" className="inline-flex group relative">
              <Button
                variant="secondary"
                size="lg"
                className="justify-center px-12 py-6 text-lg font-bold bg-gradient-to-br from-brixa-secondary-500 via-brixa-secondary-600 to-brixa-secondary-800 text-white shadow-2xl hover:shadow-4xl transition-all duration-300 group-hover:scale-105 border-2 border-brixa-secondary-300"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'click', {
                      event_category: 'cta_button',
                      event_label: 'quote_simulator_hero',
                      value: 1
                    })
                  }
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-brixa-secondary-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <span className="text-xl">即時見積もり</span>
                </span>
              </Button>
            </Link>

            <Link href="/samples" className="inline-flex group relative">
              <Button
                variant="outline"
                size="lg"
                className="justify-center px-12 py-6 text-lg font-bold bg-white/95 backdrop-blur-md border-3 border-white/40 text-gray-800 hover:bg-white hover:border-white hover:shadow-2xl transition-all duration-300 group-hover:scale-105"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'click', {
                      event_category: 'cta_button',
                      event_label: 'samples',
                      value: 1
                    })
                  }
                }}
              >
                <span className="relative flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-gray-200 transition-colors">
                    <Truck className="h-6 w-6 text-gray-700" />
                  </div>
                  <span className="text-xl text-gray-800">無料サンプル</span>
                </span>
              </Button>
            </Link>

            {/* Phone CTA - Hidden */}
            {/* <a
              href="tel:050-1793-6500"
              onClick={() => trackPhoneClick('050-1793-6500', 'hero')}
              className="inline-flex group"
            >
              <Button
                variant="outline"
                size="lg"
                className="justify-center px-8 py-5 text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-700 border-2 border-purple-400 text-white hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
              >
                <span className="flex items-center">
                  <Phone className="mr-3 h-5 w-5" />
                  <span className="hidden sm:inline">050-1793-6500</span>
                  <span className="sm:hidden">お電話</span>
                </span>
              </Button>
            </a> */}
          </motion.div>


          {/* Enhanced Technical Features */}
          <motion.div
            variants={ctaVariants}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30"
            >
              <CheckCircle className="h-5 w-5 text-brixa-400" />
              <span className="text-sm font-medium text-white">食品包装対応</span>
            </motion.div>
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30"
            >
              <CheckCircle className="h-5 w-5 text-brixa-400" />
              <span className="text-sm font-medium text-white">厳格な品質管理</span>
            </motion.div>
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30"
            >
              <CheckCircle className="h-5 w-5 text-brixa-400" />
              <span className="text-sm font-medium text-white">完全カスタマイズ</span>
            </motion.div>
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30"
            >
              <CheckCircle className="h-5 w-5 text-brixa-300" />
              <span className="text-sm font-medium text-white">日本語サポート</span>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </motion.section>
  )
}
