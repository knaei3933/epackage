'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { MotionWrapper } from '@/components/ui/MotionWrapper'
import { HomePageProductCard } from './HomePageProductCard'
import { getAllProducts } from '@/lib/product-data'

export function ProductShowcaseSection() {
  const products = getAllProducts(null, 'ja').slice(0, 6) // Show only 6 products on homepage

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
              食品や化粧品、電子部品など、あらゆる製造に対応する専門パウチ製造・
              あなたのニーズに合わせて最適な包装ソリューションをご提案いたします。
            </p>
          </div>

          {/* Products Grid - No loading states needed with static data */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {products.map((product, index) => (
              <HomePageProductCard
                key={product.id}
                product={product}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>

          <div className="text-center">
            <Link href="/catalog">
              <button className="bg-brixa-600 hover:bg-brixa-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center">
                製品を見る
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </Container>
      </MotionWrapper>
    </section>
  )
}
