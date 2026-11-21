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
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/layout";
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
    ]
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
    ]
  },
  {
    id: "quality",
    title: "品質保証システム",
    description: "厳格な品質管理システムで、安定した高品質な製品を保証します。",
    icon: Shield,
    features: [
      "工程内検査",
      "品質記録管理",
      "継続的改善",
      "トレーサビリティ体制"
    ]
  },
  {
    id: "delivery",
    title: "迅速な納期対応",
    description: "最小ロット500個から、最短30日で納品可能。お客様のビジネススピードに合わせます。",
    icon: Clock,
    features: [
      "最小ロット500個",
      "最短30日納品",
      "進捗リアルタイム報告",
      "緊急対応可能"
    ]
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

export function ServicePageContent() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageHeader
          title={
            <>
              パッケージ製造
              <span className="block">サービス内容</span>
            </>
          }
          lead="6種類のパウチ製品で、お客様のニーズに最適な包装ソリューションを提供"
          actions={
            <>
              <Link href="/catalog" className={buttonVariants({ variant: "primary", size: "lg" })}>
                <Package className="mr-2 h-5 w-5" aria-hidden="true" />
                製品を見る
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
                相談する
              </Link>
            </>
          }
        />
      </motion.div>

      {/* Service Categories */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.2}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                サービスカテゴリー
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                お客様のニーズに合わせた包括的な包装ソリューションを提供します
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {serviceCategories.map((category, index) => (
                <MotionWrapper key={category.id} delay={0.1 * (index + 1)}>
                  <Card className="h-full p-6 md:p-8">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-brand-muted text-brand">
                        <category.icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-3 text-xl font-bold text-text-primary">
                          {category.title}
                        </h3>
                        <p className="mb-4 leading-[1.8] text-text-secondary">
                          {category.description}
                        </p>
                        <ul className="space-y-2">
                          {category.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                              <span className="text-text-primary">{feature}</span>
                            </li>
                          ))}
                        </ul>
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
      <section className="bg-bg-secondary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.3}>
            <div className="mb-12">
              <h2 className="font-heading text-2xl leading-[1.4] text-text-primary [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                技術力と設備
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8] text-text-secondary">
                最新の技術と設備で、高品質なパッケージ製造を実現します
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {technicalCapabilities.map((capability, index) => (
                <MotionWrapper key={capability.title} delay={0.1 * (index + 1)} className="h-full">
                  <Card className="h-full p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-muted text-brand">
                      <capability.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-text-primary">
                      {capability.title}
                    </h3>
                    <p className="mb-4 text-sm leading-[1.8] text-text-secondary">
                      {capability.description}
                    </p>
                    <ul className="space-y-1">
                      {capability.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Zap className="h-3 w-3 shrink-0 text-brand" aria-hidden="true" />
                          <span className="text-sm text-text-secondary">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </MotionWrapper>
              ))}
            </div>
          </MotionWrapper>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="bg-bg-primary py-16 md:py-24">
        <Container size="6xl">
          <MotionWrapper delay={0.5}>
            <div className="rounded-container bg-bg-inverted p-6 text-text-inverse sm:p-8 md:p-12">
              <h2 className="font-heading text-2xl leading-[1.4] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] text-balance md:text-[2rem]">
                パッケージ製造のご相談はこちら
              </h2>
              <p className="mt-4 max-w-[40em] leading-[1.8]">
                専門スタッフが、お客様のニーズに最適な包装ソリューションをご提案します。
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-x-8">
                <Link href="/contact" className={buttonVariants({ variant: "primary", size: "lg" })}>
                  無料相談する
                </Link>
                <Link
                  href="/samples"
                  className="inline-flex min-h-11 items-center text-base underline underline-offset-4 hover:text-brand-soft"
                >
                  サンプル請求
                </Link>
              </div>
            </div>
          </MotionWrapper>
        </Container>
      </section>
    </div>
  );
}
