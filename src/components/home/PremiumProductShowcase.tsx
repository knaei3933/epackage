'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { Badge } from '@/components/ui/Badge'
import {
  Package,
  Shield,
  Truck,
  Award,
  Star,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

// Premium product data with high-quality images
const premiumProducts = [
  {
    id: 1,
    name: 'スタンドパウチ',
    nameEn: 'Stand Pouch',
    image: '/images/products/stand-pouch.jpg',
    features: ['食品対応', 'バリア性向上', 'デザイン自由'],
    applications: ['食品', '化粧品', '医療品'],
    badge: '人気',
    badgeVariant: 'success' as const
  },
  {
    id: 2,
    name: 'ガセットパウチ',
    nameEn: 'Gusset Pouch',
    image: '/images/products/gusset-pouch.jpg',
    features: ['底部拡張', '大容量対応', '安定性'],
    applications: ['穀物', 'ペットフード', '液体製品'],
    badge: '新機能',
    badgeVariant: 'info' as const
  },
  {
    id: 3,
    name: '3シールパウチ',
    nameEn: 'Three Side Seal Pouch',
    image: '/images/real-products/3sealpouch.png',
    features: ['コスト効率', '生産性向上', 'シンプル設計'],
    applications: ['粉末', '液体', '個包装'],
    badge: 'コスト優位',
    badgeVariant: 'warning' as const
  },
  {
    id: 4,
    name: 'ピローパウチ',
    nameEn: 'Pillow Pouch',
    image: '/images/products/pillow-pouch.jpg',
    features: ['高生産性', '安定した形状', '自動包装対応'],
    applications: ['スナック', '菓子', '個別包装'],
    badge: '高生産性',
    badgeVariant: 'metallic' as const
  },
  {
    id: 5,
    name: 'ソフトパウチ',
    nameEn: 'Soft Pouch',
    image: '/images/products/soft-pouch.jpg',
    features: ['柔軟性', '軽量化', '環境配慮'],
    applications: ['液体', 'ゲル', '化粧品'],
    badge: '環境対応',
    badgeVariant: 'secondary' as const
  },
  {
    id: 6,
    name: '特殊形状',
    nameEn: 'Special Shape',
    image: '/images/products/special-shape.jpg',
    features: ['完全カスタム', 'ブランド差別化', 'デザイン自由'],
    applications: ['プレミアム製品', '限定版', '特許製品'],
    badge: '特別注文',
    badgeVariant: 'primary' as const
  }
]

const qualityFeatures = [
  { icon: Shield, text: '日本規制完全準拠', description: '食品衛生法・食品安全規格対応' },
  { icon: Truck, text: '全国無料配送', description: 'ご注文5万円以上で送料無料' },
  { icon: Award, text: '品質管理システム', description: '体系的な品質管理体制' },
  { icon: CheckCircle, text: '完全品質保証', description: '不具合製品は無償再製作' }
]

export function PremiumProductShowcase() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <Container size="6xl">
        {/* Header */}
        <MotionWrapper delay={0.1}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-brixa-700 to-navy-700 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Package className="w-4 h-4" />
              <span>プロ仕様包装材コレクション</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              6種類の専門パウチ製品
              <span className="block text-brixa-700 mt-2">完全カスタマイズ対応</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              食品から化粧品まで、あらゆる業界に対応する高品質な包装材を提供。
              日本の厳しい品質基準をクリアした製品を、オリジナルデザインでご提案します。
            </p>
          </div>
        </MotionWrapper>

        {/* Product Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {premiumProducts.map((product, index) => (
            <MotionWrapper key={product.id} delay={0.2 + index * 0.1}>
              <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 bg-white border border-gray-100">
                {/* Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Badge Overlay */}
                  <div className="absolute top-4 left-4">
                    <Badge variant={product.badgeVariant as "metallic" | "success" | "warning" | "error" | "info" | "secondary" | "default" | "outline"} size="sm">
                      {product.badge}
                    </Badge>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Product Info */}
                <div className="p-6 space-y-4">
                  {/* Product Name */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      {product.nameEn}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">主な特徴：</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" size="sm">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Applications */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">主な用途：</h4>
                    <p className="text-sm text-gray-600">
                      {product.applications.join('・')}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link href="/catalog" className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-center group-hover:bg-brixa-700 group-hover:text-white group-hover:border-brixa-700 transition-all duration-300"
                      size="sm"
                    >
                      詳細を見る
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </MotionWrapper>
          ))}
        </div>

        {/* Quality Features */}
        <MotionWrapper delay={0.8}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {qualityFeatures.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-brixa-600 to-brixa-600 rounded-full flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-brixa-700" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.text}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </MotionWrapper>

        {/* CTA Section */}
        <MotionWrapper delay={0.9}>
          <Card className="bg-gradient-to-r from-brixa-700 to-navy-700 text-white p-8 md:p-12 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold">
                あなたの製品に最適な包装材を見つけましょう
              </h3>
              <p className="text-lg text-white/90 leading-relaxed">
                業界の専門家がご要望に合わせて最適な包装ソリューションをご提案します。
                無料相談で製品の可能性を最大化しましょう。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-brixa-700 hover:bg-gray-50 font-medium px-8"
                  >
                    <Star className="mr-2 h-5 w-5" />
                    無料専門相談
                  </Button>
                </Link>
                <Link href="/catalog">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-brixa-700 font-medium px-8"
                  >
                    <Package className="mr-2 h-5 w-5" />
                    全製品カタログ
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </MotionWrapper>
      </Container>
    </section>
  )
}