'use client'

import Link from 'next/link'
import { Package, Calculator, Truck, MessageSquare, CheckCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { MotionWrapper } from '@/components/ui/MotionWrapper'

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-brixa-600 to-brixa-secondary-700">
      <MotionWrapper delay={0.4}>
        <Container size="6xl" className="text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Package className="w-4 h-4 fill-current" />
              <span>製品購入・見積もり</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              あなたの製品包装を今すぐ始めよう
            </h2>
            <p className="text-lg text-white/90 max-w-3xl mx-auto">
              製品確認から価格計算、専門家相談まで、あらゆるニーズに応じた方法でお問い合わせください。
            </p>

            {/* Lead Generation Options - Single Row */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-6xl mx-auto">
              {/* Product Catalog */}
              <Link href="/catalog" className="group flex-1 min-w-[200px]">
                <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-2 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">製品カタログ</h3>
                    <p className="text-white/80 text-xs sm:text-sm hidden sm:block">
                      製品を詳しく確認。仕様と価格を比較し
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-500/30 px-2 py-1 rounded">すばやめ</span>
                      <span>製品確認</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Price Calculator */}
              <Link href="/roi-calculator" className="group flex-1 min-w-[200px]">
                <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-2 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">価格計算</h3>
                    <p className="text-white/80 text-xs sm:text-sm hidden sm:block">
                      座席製造価格を計算し仕様調整で最適コストを見
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-secondary-500/30 px-2 py-1 rounded">人気</span>
                      <span>即時計算</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Product Samples */}
              <Link href="/samples" className="group flex-1 min-w-[200px]">
                <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-2 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">無料サンプル</h3>
                    <p className="text-white/80 text-xs sm:text-sm hidden sm:block">
                      実際の製品品質を確認し、サンプルを発送
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-400/30 px-2 py-1 rounded">定番</span>
                      <span>実物確認</span>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Contact */}
              <Link href="/contact" className="group flex-1 min-w-[200px]">
                <Card className="p-4 sm:p-6 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className="text-center space-y-2 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto group-hover:bg-white/30 transition-colors">
                      <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">お問合せ</h3>
                    <p className="text-white/80 text-xs sm:text-sm hidden sm:block">
                      手軽にご要望を送信し、迅速な見積りをご案内
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-white/60">
                      <span className="bg-brixa-300/30 px-2 py-1 rounded">手軽</span>
                      <span>迅速対応</span>
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
