import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { getAllProducts } from '@/lib/product-data'
import { catalogProducts } from '@/data/catalogData'
import { MIN_ORDER_BAG, MIN_ORDER_ROLL } from '@/lib/site-facts'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ className: 'f1', variable: 'f1' }),
  Noto_Sans_JP: () => ({ className: 'f2', variable: 'f2' }),
}))
jest.mock('next/image', () => ({ __esModule: true, default: (p: any) => <img alt={p.alt} src={typeof p.src === 'string' ? p.src : ''} /> }))
jest.mock('next/link', () => ({ __esModule: true, default: ({ children, href }: any) => <a href={href}>{children}</a> }))
jest.mock('framer-motion', () => {
  const R = require('react')
  const motion = new Proxy({}, { get: (_t: any, tag: string) => ({ children, className }: any) => R.createElement(tag, { className }, children) })
  return { motion, AnimatePresence: ({ children }: any) => children }
})
jest.mock('@/components/comparison', () => ({ CompareToggle: () => null }))

import { ProductDetailClient } from '@/app/catalog/[slug]/ProductDetailClient'

function optionTexts(id: string) {
  const product = (getAllProducts(null, 'ja') as any[]).find((p) => p.id === id)
  const r = render(<ProductDetailClient product={product} />)
  fireEvent.click(r.getByText('価格'))
  const select = r.container.querySelector('select') as HTMLSelectElement
  return { r, select, texts: Array.from(select.options).map((o) => o.textContent || '') }
}

describe('ロール詳細の価格タブ: 数量の単位', () => {
  it('ロールは「m」、最小は MIN_ORDER_ROLL 以上', () => {
    const { r, select, texts } = optionTexts('roll-film-001')
    expect(texts[0]).toBe(`${MIN_ORDER_ROLL}m`)
    texts.forEach((t) => expect(t).toMatch(/m$/))
    Array.from(select.options).forEach((o) => expect(Number(o.value)).toBeGreaterThanOrEqual(MIN_ORDER_ROLL))
    fireEvent.change(select, { target: { value: '5000' } })
    expect(r.container.textContent).toMatch(/\/m/)
  })
  it('袋は「個」のまま', () => {
    const { select, texts } = optionTexts('box-pouch-001')
    texts.forEach((t) => expect(t).toMatch(/個$/))
    Array.from(select.options).forEach((o) => expect(Number(o.value)).toBeGreaterThanOrEqual(MIN_ORDER_BAG))
  })
})

describe('製品名: 見積もりの呼び名にそろえる', () => {
  it('box-pouch-001 は両方のデータでガゼットパウチ', () => {
    expect(catalogProducts.find((p) => p.id === 'box-pouch-001')!.name).toBe('ガゼットパウチ')
    expect((getAllProducts(null, 'ja') as any[]).find((p) => p.id === 'box-pouch-001').name_ja).toBe('ガゼットパウチ')
  })
  it('/catalog の製品名はすべて product-data の名前と一致', () => {
    const pd = new Map((getAllProducts(null, 'ja') as any[]).map((p) => [p.id, p.name_ja]))
    for (const p of catalogProducts) if (pd.has(p.id)) expect(p.name).toBe(pd.get(p.id))
  })
})
