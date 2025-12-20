'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Package, CheckCircle, Clock, Calculator, TrendingUp, Shield, Zap, Star, Truck, FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
// Removed sections as per modification request:
// - ComplianceSection (日本規制準拠と信頼構築)
// - TrustSignalsSection (信頼の証明)
// - CertificationBadges (認証・規格証明)
// - JapanBusinessSupport (日本企業向けビジネスサポート)
import { PerformanceMonitor } from '@/components/PerformanceMonitor'
import { OrganizationSchema, LocalBusinessSchema, FAQSchema } from '@/components/seo/StructuredData'
import { ManufacturingProcessShowcase } from '@/components/home/ManufacturingProcessShowcase'
import type { Product } from '@/types/database'

// Framer Motion variants for enhanced animations
const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
}

const statVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 12,
      mass: 1,
    }
  },
  hover: {
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10,
    }
  }
}

const ctaVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 10,
      delay: 0.4
    }
  }
}

const numberVariants = {
  hidden: {
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 8,
    }
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const
    }
  }
}

// Enhanced Hero Section Component with Brixa-style data emphasis
function HeroSection() {
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
        <div className="absolute inset-0">
          <picture>
            <source
              srcSet="/images/stand-pouch-real.jpg"
              type="image/jpeg"
            />
            <Image
              src="/images/stand-pouch-real.jpg"
              alt="オリジナル包装材専門 - 高品質なスタンドパウチ製品"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              className="object-cover opacity-60"
              priority
              quality={95}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </picture>
        </div>

        {/* Multi-layer gradient overlay for enhanced visual depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-900/50 to-gray-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 via-transparent to-brixa-900/20"></div>

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
            <picture>
              <source
                srcSet="/images/products/granola-standpouch-real.jpg"
                type="image/jpeg"
              />
              <Image
                src="/images/products/granola-standpouch-real.jpg"
                alt="高品質スタンドパウチ製品のアップショット"
                fill
                sizes="(max-width: 1200px) 0vw, 256px"
                className="object-cover rounded-lg shadow-2xl"
                quality={95}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </picture>
            <div className="absolute inset-0 bg-gradient-to-tr from-navy-600/20 to-transparent rounded-lg"></div>
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
                {/* 500枚から製造可能 */}
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
                    <div className="text-sm md:text-base font-semibold">枚から製造可能</div>
                  </div>
                </motion.div>

                {/* 最短10日納期 */}
                <motion.div
                  variants={statVariants}
                  whileHover="hover"
                  className="bg-gradient-to-r from-navy-500 via-navy-600 to-navy-700 text-white px-6 py-5 rounded-2xl shadow-2xl flex items-center space-x-3 border-2 border-navy-400/30 min-w-[280px]"
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
                    <div className="text-sm md:text-base font-semibold">日最短納期</div>
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
                食品・化粧品・電子部品など、あらゆる業界に対応する高品質パウチ包装。
                あなたの製品価値を最大限に引き出す最適な包装ソリューションをご提案します。
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
                  全製品を見る
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
                className="justify-center px-10 py-5 text-lg font-bold bg-gradient-to-r from-navy-600 to-navy-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group-hover:scale-105 border-2 border-navy-400"
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
              className="bg-gradient-to-br from-navy-500 to-navy-700 rounded-2xl p-8 text-center shadow-2xl border-2 border-navy-400 flex-1 min-w-[200px]"
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
              <p className="text-sm text-navy-100 font-medium">最短納期</p>
              <div className="text-xs text-navy-200 mt-2">緊急対応可能</div>
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
              <p className="text-sm text-brixa-100 font-medium">品検合格率</p>
              <div className="text-xs text-brixa-200 mt-2">ISO9001認証</div>
            </motion.div>

            {/* コスト - Enhanced */}
            <motion.div
              variants={statVariants}
              whileHover="hover"
              className="bg-gradient-to-br from-navy-600 to-navy-800 rounded-2xl p-8 text-center shadow-2xl border-2 border-navy-400 flex-1 min-w-[200px]"
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
              <p className="text-sm text-navy-100 font-medium">コスト削減</p>
              <div className="text-xs text-navy-200 mt-2">日本製比</div>
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
              <CheckCircle className="h-5 w-5 text-navy-400" />
              <span className="text-sm font-medium text-white">JIS規格対応</span>
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
        className="absolute bottom-20 right-10 w-48 h-48 bg-navy-400/15 rounded-full blur-3xl"
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
        className="absolute bottom-1/3 left-1/4 w-20 h-20 bg-navy-300/10 rounded-full blur-2xl"
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

// Simple Product Card for Homepage
function HomePageProductCard({ product, delay }: { product: Product; delay: number }) {
  const categoryNames = {
    flat_3_side: '平袋',
    stand_up: 'スタンドパウチ',
    gusset: 'ガゼットパウチ',
    box: 'BOX型パウチ',
    flat_with_zip: 'チャック付き平袋',
    special: '特殊仕様パウチ',
    soft_pouch: 'ソフトパウチ'
  }

  const features = [
    '優れた密封性',
    'コスト競争力',
    '迅速な納期',
    'カスタマイズ可能',
    'ISO規格対応',
    '食品包装対応'
  ]

  return (
    <MotionWrapper delay={delay}>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
        <div className="aspect-video relative bg-gradient-to-br from-brixa-100 to-navy-100 flex items-center justify-center overflow-hidden">
          {product.image ? (
            <div className="relative w-full h-full">
              <Image
                src={product.image}
                alt={product.name_ja}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.log('Image failed to load:', product.image);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.parentElement?.querySelector('.image-fallback');
                  if (fallback) {
                    (fallback as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              {/* Fallback placeholder - initially hidden */}
              <div className="image-fallback absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brixa-100 to-navy-100" style={{ display: 'none' }}>
                <Package className="w-16 h-16 text-brixa-600" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-gradient-to-br from-brixa-100 to-navy-100">
              <Package className="w-16 h-16 text-brixa-600" />
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-brixa-600 bg-brixa-50 px-2 py-1 rounded-full">
              {categoryNames[product.category] || product.category}
            </span>
            <div className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs ml-1 text-gray-600">4.8</span>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name_ja}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description_ja}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">最低注文数</span>
              <span className="font-medium text-gray-900">
                {product.min_order_quantity.toLocaleString()}個
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">納期</span>
              <span className="font-medium text-gray-900">
                {product.lead_time_days}日
              </span>
            </div>

            <div className="flex flex-wrap gap-1">
              {features.slice(0, 3).map((feature, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Link href="/catalog" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-sm">
                詳細をご確認
              </Button>
            </Link>
            <Link href="/samples" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-sm">
                サンプル
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </MotionWrapper>
  )
}

// Enhanced Product Showcase Section Component - Premium Product Focus
function ProductShowcaseSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?locale=ja&limit=6')
        const data = await response.json()

        if (data.success) {
          setProducts(data.products.slice(0, 6)) // Show only 6 products on homepage
        } else {
          // Fallback mock data if API fails
          const mockProducts: Product[] = [
            {
              id: 'stand-up-001',
              category: 'stand_up',
              name_ja: 'チャック付きスタンドパウチ',
              name_en: 'Stand-up Pouch with Zipper',
              description_ja: '自立しやすいスタンドパウチ。食品、化粧品、医薬品など多用途に対応。',
              description_en: 'Self-standing pouch with zipper. Suitable for food, cosmetics, pharmaceuticals, etc.',
              specifications: {},
              materials: ['PET', 'PE', 'CPP'],
              pricing_formula: {},
              min_order_quantity: 1000,
              lead_time_days: 16,
              sort_order: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/portfolio/granola-standpouch-real.jpg'
            },
            {
              id: 'gusset-001',
              category: 'gusset',
              name_ja: 'ガゼットパウチ',
              name_en: 'Gusset Pouch',
              description_ja: '底面が広がるガゼットパウチ。大容量製品に最適で、安定した保管が可能。',
              description_en: 'Gusset pouch with expandable bottom. Ideal for bulk products with stable storage.',
              specifications: {},
              materials: ['PET', 'PE', 'ALUMINUM'],
              pricing_formula: {},
              min_order_quantity: 1000,
              lead_time_days: 18,
              sort_order: 2,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/archives/gusset-pouch-1.jpg'
            },
            {
              id: 'box-001',
              category: 'box',
              name_ja: 'BOX型パウチ',
              name_en: 'Box Type Pouch',
              description_ja: '立方体形状のBOX型パウチ。高級感があり、プレゼント包装にも適しています。',
              description_en: 'Cubic box-shaped pouch. Premium look suitable for gift packaging.',
              specifications: {},
              materials: ['PET', 'PE', 'NYLON'],
              pricing_formula: {},
              min_order_quantity: 500,
              lead_time_days: 20,
              sort_order: 3,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/products/product-box.jpg'
            },
            {
              id: 'flat-zip-001',
              category: 'flat_with_zip',
              name_ja: 'チャック付き平袋',
              name_en: 'Flat Pouch with Zipper',
              description_ja: '再封可能なチャック付き平袋。コンパクトで保管に便利です。',
              description_en: 'Reusable flat pouch with zipper. Compact and convenient for storage.',
              specifications: {},
              materials: ['PET', 'PE', 'CPP'],
              pricing_formula: {},
              min_order_quantity: 1000,
              lead_time_days: 15,
              sort_order: 4,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/archives/anti-static-pouch-1.jpg'
            },
            {
              id: 'flat-3side-001',
              category: 'flat_3_side',
              name_ja: '平袋',
              name_en: '3-Side Seal Flat Pouch',
              description_ja: 'コスト競争力の高い平袋。最も一般的な包装形式です。',
              description_en: 'Cost-effective 3-side seal flat pouch. Most common packaging format.',
              specifications: {},
              materials: ['PE', 'PP', 'PET'],
              pricing_formula: {},
              min_order_quantity: 1000,
              lead_time_days: 14,
              sort_order: 5,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/real-products/3sealpouch.png'
            },
            {
              id: 'special-001',
              category: 'special',
              name_ja: '特殊仕様パウチ',
              name_en: 'Custom Special Pouch',
              description_ja: 'お客様の要望に合わせたカスタム仕様パウチ。特殊機能にも対応可能。',
              description_en: 'Custom specification pouch according to customer requirements. Special features available.',
              specifications: {},
              materials: ['PET', 'PE', 'ALUMINUM', 'NYLON'],
              pricing_formula: {},
              min_order_quantity: 500,
              lead_time_days: 30,
              sort_order: 6,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              image: '/images/archives/cosmetics-pouch-1.jpg'
            }
          ]
          setProducts(mockProducts)
        }
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Set empty array on error
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <MotionWrapper delay={0.2}>
        <Container size="6xl">
          <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              あなたの製品に最適な
              <br />
              <span className="text-brixa-600">
                パッケージソリューション
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              食品・化粧品・電子部品など、あらゆる製品に対応する専門パウチ製品。
              お客様のニーズに合わせて最適な包装ソリューションをご提案します。
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {products.map((product, index) => (
                <HomePageProductCard
                  key={product.id}
                  product={product}
                  delay={0.3 + index * 0.1}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">製品データの読み込み中にエラーが発生しました</p>
              <Link href="/catalog">
                <Button variant="primary">
                  カタログページで確認
                </Button>
              </Link>
            </div>
          )}

          <div className="text-center">
            <Link href="/catalog">
              <Button variant="primary" size="lg" className="px-8 py-3">
                全製品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Container>
      </MotionWrapper>
    </section>
  )
}

// CTA Section Component
function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brixa-600 to-navy-700">
      <MotionWrapper delay={0.4}>
        <Container size="6xl" className="text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4 fill-current" />
              <span>製品購入・見積もり</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              あなたの製品包装を今すぐ始める
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              製品確認から価格計算、専門家相談まで、あなたのニーズに最適な方法をお選びください。
            </p>

            {/* Lead Generation Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Product Catalog */}
              <Link href="/catalog" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Package className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">全製品カタログ</h3>
                    <p className="text-white/80 text-sm">
                      全製品を詳しく確認。仕様と価格を比較。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-500/30 px-2 py-1 rounded">おすすめ</span>
                      <span>全製品確認</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Price Calculator */}
              <Link href="/roi-calculator" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">価格計算</h3>
                    <p className="text-white/80 text-sm">
                      即座に製品価格を計算。仕様調整で最適コスト発見。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-navy-500/30 px-2 py-1 rounded">人気</span>
                      <span>即時計算</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Product Samples */}
              <Link href="/samples" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Truck className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">無料サンプル</h3>
                    <p className="text-white/80 text-sm">
                      実際の製品品質を確認。最大5種類サンプル発送。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-400/30 px-2 py-1 rounded">定番</span>
                      <span>実物確認</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Custom Order */}
              <Link href="/inquiry/detailed" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">カスタム注文</h3>
                    <p className="text-white/80 text-sm">
                      完全オリジナル包装をご要望。詳細仕様でご提案。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-navy-500/30 px-2 py-1 rounded">特注</span>
                      <span>完全カスタム</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Quick Quote */}
              <Link href="/contact" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">簡単見積もり</h3>
                    <p className="text-white/80 text-sm">
                      手軽にご要望を送信。迅速な見積もりとご提案。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-300/30 px-2 py-1 rounded">手軽</span>
                      <span>迅速対応</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Expert Support */}
              <Link href="/premium-content" className="group">
                <Card className="p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white">製品資料</h3>
                    <p className="text-white/80 text-sm">
                      仕様書、事例集、ROI比較資料を無料ダウンロード。
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-400/30 px-2 py-1 rounded">新着</span>
                      <span>専門資料</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              <div className="flex items-center text-white/80">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">24時間対応</span>
              </div>
              <div className="flex items-center text-white/80">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">無料相談</span>
              </div>
              <div className="flex items-center text-white/80">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">100社以上実績</span>
              </div>
              <div className="flex items-center text-white/80">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="text-sm">専門スタッフ</span>
              </div>
            </div>
          </div>
        </Container>
      </MotionWrapper>
    </section>
  )
}

// FAQ Schema data for homepage
const faqData = [
  {
    question: '韓国の包装材の品質は本当に日本の基準に満たしていますか？',
    answer: 'はい、当社の包装材はJIS規格などの国際標準に完全準拠しており、日本の厳しい品質基準を満たしています。実際に100社以上の日本企業様にご採用いただいております。'
  },
  {
    question: '最低注文数量（MOQ）はどのくらいですか？',
    answer: '製品によって異なりますが、一般的に500個から1000個からの対応が可能です。小ロット試作にも柔軟に対応いたしますので、まずはお気軽にご相談ください。'
  },
  {
    question: '納期はどのくらいかかりますか？',
    answer: '標準的な製品で最短21日、通常25-30日での納品が可能です。緊急のご要望には最優先で対応いたしますので、お気軽にご相談ください。'
  },
  {
    question: '日本の法規制（食品衛生法、薬機法など）に対応していますか？',
    answer: 'はい、食品衛生法、薬機法、JIS規格など日本の主要法規制に完全準拠した製品をご提供しています。必要な証明書も全て整備しております。'
  },
  {
    question: 'カスタマイズはどの程度可能ですか？',
    answer: 'サイズ、印刷、材質、機能など、あらゆる面でのカスタマイズが可能です。お客様の要件に合わせて最適なソリューションをご提案します。'
  }
]

// Main Home Page Component with Performance Monitoring and SEO
export default function Home() {
  return (
    <>
      {/* Structured Data for SEO */}
      <OrganizationSchema />
      <LocalBusinessSchema />
      <FAQSchema faqs={faqData} />

      <div className="min-h-screen">
        <PerformanceMonitor />
        <HeroSection />
        <ProductShowcaseSection />

        {/* Manufacturing Process Showcase - Real Production Images */}
        <ManufacturingProcessShowcase />

        {/* Removed sections as per modification request:
            - ComplianceSection (日本規制準拠と信頼構築)
            - TrustSignalsSection (信頼の証明)
            - CertificationBadges (認証・規格証明)
            - JapanBusinessSupport (日本企業向けビジネスサポート)
          */}
        <CTASection />
      </div>
    </>
  )
}