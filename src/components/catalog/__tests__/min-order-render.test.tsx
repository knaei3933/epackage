import React from 'react'
import { render } from '@testing-library/react'
import { getAllProducts } from '@/lib/product-data'
import { catalogProducts } from '@/data/catalogData'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'mock-serif', variable: '--font-serif' }),
  Noto_Sans_JP: () => ({ className: 'mock-sans', variable: '--font-sans' }),
}))
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : ''} /> }))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))
jest.mock('framer-motion', () => {
  const R = require('react')
  const motion = new Proxy({}, { get: (_t: any, tag: string) => ({ children, className }: any) => R.createElement(tag, { className }, children) })
  return { motion, AnimatePresence: ({ children }: any) => children }
})
jest.mock('@/components/comparison', () => ({ CompareToggle: () => null }))

import { CatalogProvider } from '@/contexts/CatalogContext'
import { ProductCard } from '../ProductCard'
import { EnhancedProductCard } from '../EnhancedProductCard'
import { ProductListItem } from '../ProductListItem'

describe('/catalog カードの最小注文数量', () => {
  it('ProductCard: 袋は「500個」、ロールは「500m」（旧: pieces/meters の英語表示を出さない）', () => {
    const bag: any = catalogProducts.find(p => p.id === 'box-pouch-001')
    const roll: any = catalogProducts.find(p => p.id === 'roll-film-001')
    const a = render(<CatalogProvider><ProductCard product={bag} /></CatalogProvider>)
    expect(a.container.textContent).toContain('最小注文数: 500個')
    a.unmount()
    const b = render(<CatalogProvider><ProductCard product={roll} /></CatalogProvider>)
    expect(b.container.textContent).toContain('最小注文数: 500m')
    expect(b.container.textContent).not.toContain('meters')
  })

  it('商品データの全製品が 500 で、画面の文字と一致する', () => {
    for (const p of getAllProducts(null, 'ja') as any[]) {
      expect(p.min_order_quantity).toBe(500)
    }
  })

  it('一覧・拡張カード・比較で、DBの値が 10,000 でも「500個」「500m」を出す', () => {
    const all = getAllProducts(null, 'ja') as any[]
    const bag = { ...all.find(p => p.id === 'box-pouch-001'), min_order_quantity: 10000 }
    const roll = { ...all.find(p => p.id === 'roll-film-001'), min_order_quantity: 1000 }
    const l1 = render(<ProductListItem product={bag} index={0} />)
    expect(l1.container.textContent).toContain('500個')
    expect(l1.container.textContent).not.toContain('10,000')
    l1.unmount()
    const l2 = render(<ProductListItem product={roll} index={0} />)
    expect(l2.container.textContent).toContain('500m')
    l2.unmount()
    const e1 = render(<EnhancedProductCard product={bag} index={0} />)
    expect(e1.container.textContent).toContain('500個')
    expect(e1.container.textContent).not.toContain('10,000')
    e1.unmount()
    const e2 = render(<EnhancedProductCard product={roll} index={0} />)
    expect(e2.container.textContent).toContain('500m')
  })
})
