"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Shield,
  Clock,
  TrendingUp,
  Settings,
  Award,
  CheckCircle,
  Star,
  Zap,
  Cpu,
  Eye,
  Palette,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { MotionWrapper } from "@/components/ui/MotionWrapper";

const serviceCategories = [
  {
    id: "manufacturing",
    title: "6種類パウチ製造",
    description: "スタンドパウチ、ガゼットパウチ、三方シール袋など、6種類のパウチ製品を高品質で製造します。",
    icon: Package,
    features: [
      "高精度製造設備",
      "多様な素材対応",
      "カスタム仕様",
      "厳格な品質管理"
    ],
    color: "orange"
  },
  {
    id: "customization",
    title: "カスタマイズサービス",
    description: "お客様のブランドや製品に合わせて、最適なパッケージ設計から製造までワンストップで対応します。",
    icon: Settings,
    features: [
      "デザインコンサルティング",
      "素材選定サポート",
      "試作品製作",
      "仕様調整"
    ],
    color: "blue"
  },
  {
    id: "quality",
    title: "品質保証システム",
    description: "ISO9001規格に基づいた品質管理システムで、安定した高品質な製品を保証します。",
    icon: Shield,
    features: [
      "ISO9001認証取得",
      "工程内検査",
      "品質記録管理",
      "継続的改善"
    ],
    color: "green"
  },
  {
    id: "delivery",
    title: "迅速な納期対応",
    description: "最小ロット500枚から、最短30日で納品可能。お客様のビジネススピードに合わせます。",
    icon: Clock,
    features: [
      "最小ロット500枚",
      "最短30日納品",
      "進捗リアルタイム報告",
      "緊急対応可能"
    ],
    color: "purple"
  }
];

const technicalCapabilities = [
  {
    title: "最新製造設備",
    description: "最新の自動製造機と検査装置で、高精度で効率的な生産を実現します。",
    icon: Cpu,
    details: [
      "全自動製造ライン",
      "AI検査システム",
      "リアルタイム監視",
      "24時間稼働対応"
    ]
  },
  {
    title: "多様な素材対応",
    description: "PET、PE、アルミ箔、ナイロンなど、幅広い素材の知識と経験があります。",
    icon: Eye,
    details: [
      "単層・多層フィルム",
      "バリア性素材",
      "環境対応素材",
      "特殊機能素材"
    ]
  },
  {
    title: "印刷技術",
    description: "グラビア印刷からデジタル印刷まで、ニーズに合わせた印刷技術を提供します。",
    icon: Palette,
    details: [
      "グラビア印刷",
      "フレキソ印刷",
      "デジタル印刷",
      "特殊加工技術"
    ]
  },
  {
    title: "物流システム",
    description: "効率的な物流システムで、製品を安全・迅速にお届けします。",
    icon: Truck,
    details: [
      "国内ネットワーク",
      "国際物流対応",
      "追跡システム",
      "梱包最適化"
    ]
  }
];

const qualityStandards = [
  {
    title: "ISO9001",
    description: "品質マネジメントシステムの国際規格を取得しています。",
    icon: Award,
    color: "blue"
  },
  {
    title: "食品安全",
    description: "食品衛生法に準拠した衛生的な製造環境を整備しています。",
    icon: Shield,
    color: "green"
  },
  {
    title: "環境対応",
    description: "環境配慮型素材と持続可能な製造プロセスを採用しています。",
    icon: Star,
    color: "orange"
  }
];

export function ServicePageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brixa-600 via-brixa-700 to-navy-700 text-white">
        <Container size="6xl" className="py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto space-y-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              <span className="block">パッケージ製造</span>
              <span className="block text-2xl md:text-3xl lg:text-4xl mt-4 font-medium text-brixa-600">
                サービス内容
              </span>
            </h1>
            <p className="text-xl text-brixa-600 max-w-3xl mx-auto leading-relaxed">
              6種類のパウチ製品で、お客様のニーズに最適な包装ソリューションを提供
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/catalog">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white text-brixa-700 hover:bg-gray-50 border-2 border-white"
                >
                  <Package className="mr-2 h-5 w-5" />
                  製品を見る
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-brixa-700"
                >
                  相談する
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                サービスカテゴリー
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                お客様のニーズに合わせた包括的な包装ソリューションを提供します
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {serviceCategories.map((category, index) => (
                <MotionWrapper key={category.id} delay={0.1 * (index + 1)}>
                  <Card className="p-8 hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 bg-${category.color}-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <category.icon className={`h-8 w-8 text-${category.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          {category.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                          {category.description}
                        </p>
                        <div className="space-y-2">
                          {category.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Technical Capabilities */}
      <section className="py-20 bg-gray-50">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                技術力と設備
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                最新の技術と設備で、高品質なパッケージ製造を実現します
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {technicalCapabilities.map((capability, index) => (
                <MotionWrapper key={capability.title} delay={0.1 * (index + 1)}>
                  <Card className="p-6 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-brixa-600 to-navy-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <capability.icon className="h-8 w-8 text-brixa-700" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {capability.title}
                      </h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                        {capability.description}
                      </p>
                      <div className="text-left space-y-1">
                        {capability.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center space-x-2">
                            <Zap className="h-3 w-3 text-brixa-600 flex-shrink-0" />
                            <span className="text-xs text-gray-600">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* Quality Standards */}
      <section className="py-20 bg-white">
        <Container size="6xl">
          <MotionWrapper delay={0.4}>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                品質基準と認証
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                国際基準の品質管理体制で、安心・安全な製品を提供します
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {qualityStandards.map((standard, index) => (
                <MotionWrapper key={standard.title} delay={0.1 * (index + 1)}>
                  <Card className="p-8 text-center hover:shadow-lg transition-all duration-300">
                    <div className="w-20 h-20 bg-gradient-to-br from-navy-600 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <standard.icon className={`h-10 w-10 text-${standard.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {standard.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {standard.description}
                    </p>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-brixa-700 to-navy-700">
        <Container size="4xl" className="text-center">
          <MotionWrapper delay={0.5}>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                パッケージ製造のご相談はこちら
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                専門スタッフが、お客様のニーズに最適な包装ソリューションをご提案します。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="justify-center bg-white text-brixa-700 hover:bg-gray-50 px-8"
                  >
                    無料相談する
                  </Button>
                </Link>
                <Link href="/samples">
                  <Button
                    variant="outline"
                    size="lg"
                    className="justify-center border-white text-white hover:bg-white hover:text-brixa-700 px-8"
                  >
                    サンプル請求
                  </Button>
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  );
}