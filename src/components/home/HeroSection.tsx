'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Package, CheckCircle, Clock, Calculator, TrendingUp, Shield, Zap, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { heroVariants, statVariants, ctaVariants, numberVariants } from './animations'

export function HeroSection() {
  const ref = useRef(null)
  const inView = useInView(ref, {
    once: true,
    margin: "0px",
    amount: 0.1
  })

  return (
    <motion.section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      variants={heroVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      ref={ref}
    >
      {/* Enhanced Background with Professional Images */}
      <div className="absolute inset-0">
        {/* Professional manufacturing facility background - WebP optimized */}
        <div className="absolute inset-0 relative h-full w-full">
          <Image
            src="/images/main/main15.png"
            alt="オリジナ包装材専用 - 高品質なスタンドパウチ製造"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            className="object-cover opacity-60"
            priority
            quality={95}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>

        {/* Multi-layer gradient overlay for enhanced visual depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-brixa-secondary-900/30 via-transparent to-brixa-900/20"></div>

        {/* Professional pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`,
            }}
          />
        </div>

        {/* Floating product images - WebP optimized with lazy loading */}
        <div className="absolute top-1/4 right-1/4 w-64 h-48 hidden lg:block">
          <div className="relative w-full h-full transform rotate-3 hover:rotate-6 transition-transform duration-700">
            <Image
              src="/images/products/granola-standpouch-real.jpg"
              alt="高品質スタンドパウチ製品コレクションション"
              fill
              sizes="(max-width: 1200px) 0vw, 256px"
              className="object-cover rounded-lg shadow-2xl"
              quality={95}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-brixa-secondary-600/20 to-transparent rounded-lg"></div>
          </div>
        </div>
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
                <h1 className="text-4xl md:text-6xl lg:text-8xl font-extrabold text-white leading-tight tracking-tight">
                  <span className="block text-white drop-shadow-2xl stroke-black stroke-2">
                    もう在庫に縛られない。
                  </span>
                  <span className="block text-green-400 drop-shadow-2xl">
                    500枚から28日。
                  </span>
                  <span className="block text-green-300 drop-shadow-2xl">
                    常識を変えるパッケージ調達。
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

                {/* 早期10日納品 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-brixa-secondary-500 via-brixa-secondary-600 to-brixa-secondary-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-brixa-secondary-400/30 min-w-[280px]"
                >
                  <Zap className="w-7 h-7 flex-shrink-0" />
                  <div className="text-center flex-1">
                    <motion.div
                      variants={numberVariants}
                      animate="pulse"
                      className="text-4xl md:text-5xl font-black text-white drop-shadow-lg"
                    >
                      10
                    </motion.div>
                    <div className="text-sm md:text-base font-semibold">早期納品</div>
                  </div>
                </motion.div>

                {/* 100社以上実績 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-green-400/30 min-w-[280px]"
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
                className="justify-center px-10 py-5 text-lg font-bold bg-gradient-to-r from-brixa-600 to-brixa-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:scale-105 border-2 border-brixa-400 relative overflow-hidden"
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
                <span className="relative flex items-center">
                  <Package className="mr-3 h-5 w-5" />
                  製品を見る
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Button>
              <div className="absolute -top-2 -right-2 bg-brixa-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                人気
              </div>
            </Link>

            <Link href="/quote-simulator" className="inline-flex group">
              <Button
                variant="secondary"
                size="lg"
                className="justify-center px-10 py-5 text-lg font-bold bg-gradient-to-r from-brixa-secondary-600 to-brixa-secondary-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:scale-105 border-2 border-brixa-secondary-400"
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
                <span className="flex items-center">
                  <Calculator className="mr-3 h-5 w-5" />
                  即時見積もり
                </span>
              </Button>
            </Link>

            <Link href="/samples" className="inline-flex group">
              <Button
                variant="outline"
                size="lg"
                className="justify-center px-10 py-5 text-lg font-bold bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white/20 transition-all duration-300"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.gtag) {
                    window.gtag('event', 'click', {
                      event_category: 'cta_button',
                      event_label: 'samples_hero',
                      value: 1
                    })
                  }
                }}
              >
                <span className="flex items-center">
                  <Truck className="mr-3 h-5 w-5" />
                  無料サンプル
                </span>
              </Button>
            </Link>
          </motion.div>

          {/* Enhanced Data-Driven Trust Factors */}
          <motion.div
            variants={ctaVariants}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 max-w-4xl mx-auto"
          >
            {/* 納期 - Enhanced */}
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-brixa-secondary-500 to-brixa-secondary-700 rounded-2xl p-8 text-center shadow-2xl border-2 border-brixa-secondary-400 flex-1 min-w-[200px]"
            >
              <motion.div
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                <Clock className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div
                className="text-3xl font-bold text-white mb-2"
                variants={numberVariants}
                animate="pulse"
              >
                21日
              </motion.div>
              <p className="text-sm text-brixa-secondary-100 font-medium">平均納期</p>
              <div className="text-xs text-brixa-secondary-200 mt-2">緊急対応可能</div>
            </motion.div>

            {/* 品質 - Enhanced */}
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-brixa-600 to-brixa-700 rounded-2xl p-8 text-center shadow-2xl border-2 border-brixa-400 flex-1 min-w-[200px]"
            >
              <motion.div
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                <Shield className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div
                className="text-3xl font-bold text-white mb-2"
                variants={numberVariants}
                animate="pulse"
              >
                100%
              </motion.div>
              <p className="text-sm text-brixa-100 font-medium">全検査合格</p>
              <div className="text-xs text-brixa-200 mt-2">ISO9001認証</div>
            </motion.div>

            {/* コスト - Enhanced */}
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-brixa-secondary-600 to-brixa-secondary-800 rounded-2xl p-8 text-center shadow-2xl border-2 border-brixa-secondary-400 flex-1 min-w-[200px]"
            >
              <motion.div
                className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                <Calculator className="h-8 w-8 text-white" />
              </motion.div>
              <motion.div
                className="text-3xl font-bold text-white mb-2"
                variants={numberVariants}
                animate="pulse"
              >
                30%
              </motion.div>
              <p className="text-sm text-brixa-secondary-100 font-medium">コスト削減</p>
              <div className="text-xs text-brixa-secondary-200 mt-2">日本製比</div>
            </motion.div>
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
              <CheckCircle className="h-5 w-5 text-brixa-secondary-400" />
              <span className="text-sm font-medium text-white">食品安全規格対応</span>
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

      {/* Enhanced floating elements for visual interest */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-brixa-400/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-48 h-48 bg-brixa-secondary-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-24 h-24 bg-brixa-300/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
      <motion.div
        className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-brixa-secondary-300/10 rounded-full blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7
        }}
      />
    </motion.section>
  )
}
