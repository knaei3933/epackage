import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CatalogProvider } from '@/contexts/CatalogContext'
import { ComparisonProvider } from '@/contexts/ComparisonContext'
import { CatalogClient } from '../CatalogClient'

jest.mock('next/font/google', () => ({
  Shippori_Mincho_B1: () => ({ variable: 'font-heading-var', className: '', style: {} }),
  Noto_Sans_JP: () => ({ variable: 'font-body-var', className: '', style: {} }),
}))

describe('CatalogClient', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => (k in store ? store[k] : null),
        setItem: (k: string, v: string) => { store[k] = v },
      },
    })
    ;(global as any).fetch = jest.fn() // 本物の API は呼ばない
    jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  const renderCatalog = () =>
    render(
      <CatalogProvider>
        <ComparisonProvider>
          <CatalogClient />
        </ComparisonProvider>
      </CatalogProvider>
    )

  it('開ける。製品が並び、各カードに「比較に追加」と製品ページへの「詳細」リンクがある', async () => {
    renderCatalog()
    await waitFor(() => expect(screen.getAllByRole('button', { name: '比較に追加' }).length).toBeGreaterThan(0))
    const detailLinks = screen.getAllByRole('link', { name: '詳細' })
    expect(detailLinks[0].getAttribute('href')).toMatch(/^\/catalog\/.+/)
  })

  it('納期順は選べず、並べ替えは「おすすめ順」から始まる', async () => {
    renderCatalog()
    const select = (await screen.findByLabelText('並べ替え')) as HTMLSelectElement
    expect(select.value).toBe('relevance')
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['おすすめ順', '名前順'])
  })

  it('「比較に追加」を押すと「比較へ（N件）」が出る', async () => {
    renderCatalog()
    const buttons = await screen.findAllByRole('button', { name: '比較に追加' })
    fireEvent.click(buttons[0])
    expect(await screen.findByRole('link', { name: '比較へ（1件）' })).toBeTruthy()
  })

  it('「優れた密封性」のような全製品共通の特徴の行を出さない', async () => {
    renderCatalog()
    await screen.findAllByRole('button', { name: '比較に追加' })
    expect(screen.queryByText('優れた密封性')).toBeNull()
  })
})
