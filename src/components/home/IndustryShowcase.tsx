'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface IndustryShowcaseProps {
  title?: string
}

const ITEMS_DEFAULT = [
  { id: '1', image: '/images/main/main1.png', alt: '実績1' },
  { id: '2', image: '/images/main/main2.png', alt: '実績2' },
  { id: '3', image: '/images/main/main3.png', alt: '実績3' },
  { id: '4', image: '/images/main/main4.png', alt: '実績4' },
  { id: '5', image: '/images/main/main5.png', alt: '実績5' },
  { id: '6', image: '/images/main/main6.png', alt: '実績6' },
  { id: '7', image: '/images/main/main7.png', alt: '実績7' },
  { id: '8', image: '/images/main/main8.png', alt: '実績8' },
  { id: '9', image: '/images/main/main9.png', alt: '実績9' },
  { id: '10', image: '/images/main/main10.png', alt: '実績10' },
  { id: '11', image: '/images/main/main11.png', alt: '実績11' },
  { id: '12', image: '/images/main/main12.png', alt: '実績12' },
  { id: '13', image: '/images/main/main13.png', alt: '実績13' },
  { id: '14', image: '/images/main/main14.png', alt: '実績14' },
  { id: '15', image: '/images/main/main15.png', alt: '実績15' },
  { id: '16', image: '/images/main/main16.png', alt: '実績16' },
  { id: '17', image: '/images/main/main17.png', alt: '実績17' },
]

export function IndustryShowcase({
  title = '食品から化粧品、日用品、産業用途まで。多様な業界で信頼される包装ソリューション。',
}: IndustryShowcaseProps) {
  const sliderRef = useRef<HTMLDivElement>(null)

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
    <section className="w-full py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-5">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8"
        >
          {title}
        </motion.p>
      </div>

      {/* Infinite Slider */}
      <div
        ref={sliderRef}
        className="flex gap-5 overflow-x-auto scrollbar-hide"
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
            <div className="w-full h-full rounded-lg overflow-hidden shadow-md bg-white border border-gray-200">
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
