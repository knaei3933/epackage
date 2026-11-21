jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}))

import { render, screen, fireEvent } from '@testing-library/react'
import { ComparisonProvider, COMPARISON_STORAGE_KEY } from '@/contexts/ComparisonContext'
import { CompareToggle, CompareLink } from '../CompareToggle'
import { ComparisonClient } from '@/app/compare/ComparisonClient'
import { getAllProducts } from '@/lib/product-data'

const product = (id: string, name: string) =>
  ({ id, name_ja: name, materials: ['PE'], lead_time_days: 30, min_order_quantity: 500 }) as any

function mockStorage(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial }
  const mock = {
    getItem: jest.fn((k: string) => (k in store ? store[k] : null)),
    setItem: jest.fn((k: string, v: string) => { store[k] = v }),
    removeItem: jest.fn((k: string) => { delete store[k] }),
  }
  Object.defineProperty(window, 'localStorage', { value: mock, configurable: true })
  return { store, mock }
}

describe('CompareToggle / CompareLink', () => {
  it('「比較に追加」を押すと件数が増え、「比較へ（N件）」が出て、localStorage に保存される', () => {
    const { store } = mockStorage()
    render(
      <ComparisonProvider>
        <CompareLink />
        <CompareToggle product={product('a', '平袋')} />
        <CompareToggle product={product('b', 'スタンド')} />
      </ComparisonProvider>
    )
    expect(screen.queryByText(/比較へ/)).toBeNull()
    const buttons = screen.getAllByRole('button', { name: '比較に追加' })
    expect(buttons).toHaveLength(2)

    fireEvent.click(buttons[0])
    expect(screen.getByRole('link', { name: '比較へ（1件）' }).getAttribute('href')).toBe('/compare')
    fireEvent.click(screen.getAllByRole('button', { name: '比較に追加' })[0])
    expect(screen.getByRole('link', { name: '比較へ（2件）' })).toBeTruthy()
    expect(JSON.parse(store[COMPARISON_STORAGE_KEY]).map((p: any) => p.id)).toEqual(['a', 'b'])
  })

  it('保存済みの製品を読み戻し、/compare に並ぶ', () => {
    const real = getAllProducts(null, 'ja').slice(0, 2)
    mockStorage({ [COMPARISON_STORAGE_KEY]: JSON.stringify(real) })
    render(
      <ComparisonProvider>
        <ComparisonClient />
      </ComparisonProvider>
    )
    expect(screen.getByText(/2個の製品を比較中/)).toBeTruthy()
  })

  it('保存が使えなくても落ちない', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => { throw new Error('blocked') },
        setItem: () => { throw new Error('blocked') },
      },
    })
    render(
      <ComparisonProvider>
        <CompareToggle product={product('a', '平袋')} />
        <CompareLink />
      </ComparisonProvider>
    )
    fireEvent.click(screen.getByRole('button', { name: '比較に追加' }))
    expect(screen.getByRole('link', { name: '比較へ（1件）' })).toBeTruthy()
  })

  it('/compare は空のとき、カタログへの入口を出す', () => {
    mockStorage()
    render(
      <ComparisonProvider>
        <ComparisonClient />
      </ComparisonProvider>
    )
    expect(screen.getByText(/カタログから製品を選んでください/)).toBeTruthy()
    const links = screen.getAllByRole('link').filter((a) => a.getAttribute('href') === '/catalog')
    expect(links.length).toBeGreaterThan(0)
  })
})
