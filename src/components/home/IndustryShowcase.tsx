'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface IndustryShowcaseProps {
  title?: string
}

const ITEMS_DEFAULT = [
  { id: '1', image: '/images/main/main1.png', alt: '化粧品用スタンドパウチパッケージ実績 - 高品質な印刷とデザイン' },
  { id: '2', image: '/images/main/main2.png', alt: '食品用ガゼットパウチパッケージ実績 - 鮮度保持と保管性' },
  { id: '3', image: '/images/main/main3.png', alt: '医薬品用三方シール袋実績 - 衛生管理とバリア性' },
  { id: '4', image: '/images/main/main4.png', alt: '電子部品用防湿パウチ実績 - 静電気対策と保護' },
  { id: '5', image: '/images/main/main5.png', alt: '健康食品用スパウトパウチ実績 - 使いやすさと再封性' },
  { id: '6', image: '/images/main/main6.png', alt: 'ペットフード用チャック付き袋実績 - 保存性と利便性' },
  { id: '7', image: '/images/main/main7.png', alt: '菓子用透明パッケージ実績 - 製品の視認性とデザイン性' },
  { id: '8', image: '/images/main/main8.png', alt: '液体用レトルトパウチ実績 - 耐熱性と保存性' },
  { id: '9', image: '/images/main/main9.png', alt: '農産物用通気性パッケージ実績 - 鮮度保持技術' },
  { id: '10', image: '/images/main/main10.png', alt: '調味料用小袋パッケージ実績 - 使い切りサイズと利便性' },
  { id: '11', image: '/images/main/main11.png', alt: 'サプリメント用個別包装実績 - 携帯性と品質保持' },
  { id: '12', image: '/images/main/main12.png', alt: '冷凍食品用耐冷パッケージ実績 - 低温耐性と品質保持' },
  { id: '13', image: '/images/main/main13.png', alt: 'ギフト用高級パッケージ実績 - デザイン性とプレミアム感' },
  { id: '14', image: '/images/main/main14.png', alt: 'サンプル用小ロットパッケージ実績 - 試作対応と柔軟性' },
  { id: '15', image: '/images/main/main15.png', alt: '工業用資材包装実績 - 耐久性と保護性能' },
  { id: '16', image: '/images/main/main16.png', alt: 'オーガニック製品用パッケージ実績 - 環境配慮と自然素材' },
  { id: '17', image: '/images/main/main17.png', alt: '多品目対応パッケージ実績 - 汎用性とカスタマイズ' },
]

export function IndustryShowcase({
  title = '食品から化粧品、日用品、産業用途まで。多様な業界で信頼される包装ソリューション。',
}: IndustryShowcaseProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  // 停止状態は ref で持つ（再描画しない）。ポインタ（マウス・タッチ）とフォーカスのどちらかがあれば停止。
  const hoverRef = useRef(false)
  const focusRef = useRef(false)

  // Duplicate items for infinite scroll effect
  const duplicatedItems = [...ITEMS_DEFAULT, ...ITEMS_DEFAULT]

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider) return

    let animationId: number
    // Start from the middle (right side) for left-to-right scrolling
    let scrollPosition = slider.scrollWidth / 2
    const speed = 1.21 // pixels per frame

    const animate = () => {
      if (hoverRef.current || focusRef.current) {
        // 停止中は位置を進めない（再開時に飛ばないよう現在位置に合わせる）
        scrollPosition = slider.scrollLeft
        animationId = requestAnimationFrame(animate)
        return
      }
      scrollPosition -= speed

      // Reset when we've scrolled to the beginning
      if (scrollPosition <= 0) {
        scrollPosition = slider.scrollWidth / 2
      }

      slider.scrollLeft = scrollPosition
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <section className="w-full bg-bg-primary py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-10 max-w-[40em] [word-break:keep-all] supports-[word-break:auto-phrase]:[word-break:auto-phrase] [overflow-wrap:anywhere] font-heading text-2xl leading-[1.6] text-text-primary md:text-3xl">
          {title}
        </motion.h2>
      </div>

      {/* Infinite Slider */}
      <div
        ref={sliderRef}
        onPointerEnter={(e) => { if (e.pointerType === 'mouse') hoverRef.current = true }}
        onPointerLeave={(e) => { if (e.pointerType === 'mouse') hoverRef.current = false }}
        onFocus={() => { focusRef.current = true }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focusRef.current = false
        }}
        className="flex gap-4 overflow-x-auto scrollbar-hide"
        style={{
          scrollBehavior: 'auto',
        }}
      >
        {duplicatedItems.map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.36, delay: index * 0.018 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[180px] sm:w-[220px] md:w-[265px] aspect-square relative"
          >
            <div className="relative w-full h-full rounded-inner overflow-hidden bg-bg-primary">
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 180px, (max-width: 768px) 220px, 265px"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
