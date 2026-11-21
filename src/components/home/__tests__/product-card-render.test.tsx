import React from 'react'
import { render } from '@testing-library/react'
import { HomePageProductCard } from '../HomePageProductCard'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'mock-serif', variable: '--font-serif' }),
  Noto_Sans_JP: () => ({ className: 'mock-sans', variable: '--font-sans' }),
}))
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : ''} /> }))
jest.mock('framer-motion', () => {
  const R = require('react')
  const motion = new Proxy({}, { get: (_t, tag: string) => ({ children, className }: any) => R.createElement(tag, { className }, children) })
  return { motion }
})

describe('HomePageProductCard', () => {
  it('納期はDBの値ではなく定数「最短30日」を出す', () => {
    const product: any = {
      id: 'p1', name_ja: 'スタンドパウチ', category: 'stand_up', materials: ['PET'],
      min_order_quantity: 500, lead_time_days: 28, images: [],
    }
    const { container } = render(<ul><HomePageProductCard product={product} /></ul>)
    expect(container.textContent).toContain('最短30日')
    expect(container.textContent).not.toContain('28日')
  })

  it('最小注文数量はDBの値（10,000）ではなく、見積もりと同じ「500個」を出す', () => {
    const product: any = {
      id: 'p2', name_ja: 'ガゼットパウチ', category: 'box', materials: ['PET'],
      min_order_quantity: 10000, lead_time_days: 28, images: [],
    }
    const { container } = render(<ul><HomePageProductCard product={product} /></ul>)
    expect(container.textContent).toContain('500個')
    expect(container.textContent).not.toContain('10,000')
  })

  it('ロールフィルムは「500m」', () => {
    const product: any = {
      id: 'roll-film-001', name_ja: 'ロールフィルム', category: 'roll_film', materials: ['PET'],
      min_order_quantity: 1000, lead_time_days: 28, images: [],
    }
    const { container } = render(<ul><HomePageProductCard product={product} /></ul>)
    expect(container.textContent).toContain('500m')
  })
})
