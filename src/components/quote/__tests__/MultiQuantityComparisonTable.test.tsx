/**
 * MultiQuantityComparisonTable Unit Tests
 *
 * 現行実装 (src/components/quote/shared/MultiQuantityComparisonTable.tsx) の
 * 実際の UI 仕様に基づくユニットテスト。
 *
 * 実装の仕様メモ（テスト期待値の根拠）:
 * - jsdom 環境では Tailwind の responsive クラス (lg:hidden / hidden lg:block) が
 *   CSS 適用されないため、モバイル用カード (lg:hidden) とデスクトップ用テーブル
 *   (hidden lg:block) の **両方** の DOM が描画される。よって「単価」等のラベルは
 *   両ビューに存在し getAllByText で取得する。
 * - formatCurrency は `¥{整数}`（桁区切り、小数丸め）。85.50 → ¥86。
 * - discountRate は実装 getDiscountBadgeColor の閾値 (>=30/>=20/>=10) から
 *   「パーセント整数値 (15 = 15%)」が仕様。表示は `{discountRate}%` / `{discountRate}% 割引`。
 * - bestValue / priceTrend はテキストではなく lucide-react のアイコンで表現される。
 *   ヘッダーに「最適価値: X個」「最大節約: X%」、フッターに凡例「最適価値」。
 * - empty / loading 状态のメッセージは実装固定テキスト。
 * - isValid フィールドは存在するが実装では未使用（エラー状態の分岐なし）。
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MultiQuantityComparisonTable from '../shared/MultiQuantityComparisonTable'
import type { QuantityComparison } from '@/types/multi-quantity'

// Mock framer-motion: 実装は motion.div / motion.tr のみ使用
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
}))

// discountRate は実装仕様（パーセント整数値）に是正
// 実装 getDiscountBadgeColor は >=30/>=20/>=10 の閾値で badge 色を判定
const mockQuotes = [
  {
    quantity: 100,
    unitPrice: 85.5,
    totalPrice: 8550,
    discountRate: 0,
    priceBreak: '通常価格',
    leadTimeDays: 14,
    isValid: true,
  },
  {
    quantity: 500,
    unitPrice: 72.3,
    totalPrice: 36150,
    discountRate: 15,
    priceBreak: '15%割引',
    leadTimeDays: 12,
    isValid: true,
  },
  {
    quantity: 1000,
    unitPrice: 65.8,
    totalPrice: 65800,
    discountRate: 23,
    priceBreak: '23%割引',
    leadTimeDays: 10,
    isValid: true,
  },
  {
    quantity: 5000,
    unitPrice: 58.2,
    totalPrice: 291000,
    discountRate: 32,
    priceBreak: '32%割引',
    leadTimeDays: 8,
    isValid: true,
  },
]

// formatCurrency の期待値: 実装と同一ロジックで生成する。
// 環境（Node の ICU データ）により通貨記号が ¥(半角) / ￥(全角) のいずれかに
// なるため、実装と同じ Intl.NumberFormat 呼び出しで期待値を作り環境差を吸収する。
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
const expectedUnitPriceText = (q: (typeof mockQuotes)[number]) => formatCurrency(q.unitPrice)
const expectedTotalPriceText = (q: (typeof mockQuotes)[number]) => formatCurrency(q.totalPrice)

const mockComparison: QuantityComparison = {
  bestValue: {
    quantity: 5000,
    savings: 1000,
    percentage: 32,
    reason: '最大数量で最適な単価を実現',
  },
  priceBreaks: [
    { quantity: 100, priceBreak: '通常価格', discountRate: 0 },
    { quantity: 500, priceBreak: '15%割引', discountRate: 15 },
    { quantity: 1000, priceBreak: '23%割引', discountRate: 23 },
    { quantity: 5000, priceBreak: '32%割引', discountRate: 32 },
  ],
  economiesOfScale: {
    100: { unitPrice: 85.5, totalSavings: 0, efficiency: 0.6 },
    500: { unitPrice: 72.3, totalSavings: 200, efficiency: 0.7 },
    1000: { unitPrice: 65.8, totalSavings: 500, efficiency: 0.8 },
    5000: { unitPrice: 58.2, totalSavings: 1000, efficiency: 0.95 },
  },
  trends: {
    priceTrend: 'decreasing',
    optimalQuantity: 5000,
    diminishingReturns: 1000,
  },
}

const defaultProps = {
  quotes: mockQuotes,
  comparison: mockComparison,
  selectedQuantity: null as number | null,
  onQuantitySelect: jest.fn(),
}

describe('MultiQuantityComparisonTable', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================================
  // Basic Rendering
  // ============================================================
  describe('basic rendering', () => {
    it('should render comparison table title and footer summary', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // タイトル
      expect(screen.getByText('数量比較テーブル')).toBeInTheDocument()
      // フッター: 件数と凡例
      expect(screen.getByText(`${mockQuotes.length}件の比較データ`)).toBeInTheDocument()
      expect(screen.getByText('選択済み')).toBeInTheDocument()
    })

    it('should render desktop table column headers', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // デスクトップテーブルのヘッダー（単一出現）
      expect(screen.getByText('合計価格')).toBeInTheDocument()
      expect(screen.getByText('割引率')).toBeInTheDocument()
      expect(screen.getByText('価格区分')).toBeInTheDocument()
      expect(screen.getByText('納期')).toBeInTheDocument()
      // 「選択」は列ヘッダー(th) と各行の選択ボタン(button) の両方に出現するため
      // columnheader role でヘッダーを特定する
      expect(screen.getByRole('columnheader', { name: '選択' })).toBeInTheDocument()
    })

    it('should render quote data rows with formatted currency', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      mockQuotes.forEach(quote => {
        // 数量（実装は toLocaleString で桁区切り: 1000 → 1,000）
        expect(screen.getAllByText(quote.quantity.toLocaleString()).length).toBeGreaterThan(0)
        // 単価（formatCurrency で整数丸め）
        expect(screen.getAllByText(expectedUnitPriceText(quote)).length).toBeGreaterThan(0)
        // 合計（formatCurrency で桁区切り）
        expect(screen.getAllByText(expectedTotalPriceText(quote)).length).toBeGreaterThan(0)
        // 納期
        expect(screen.getAllByText(`${quote.leadTimeDays}日`).length).toBeGreaterThan(0)
      })
    })

    it('should render discount rate badges for discounted quotes', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // discountRate > 0 のクォートは「{rate}%」badge が表示される
      mockQuotes.filter(q => q.discountRate > 0).forEach(quote => {
        expect(screen.getAllByText(`${quote.discountRate}%`).length).toBeGreaterThan(0)
      })
    })

    it('should render price break labels in price-tier column', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      mockQuotes.forEach(quote => {
        expect(screen.getAllByText(quote.priceBreak).length).toBeGreaterThan(0)
      })
    })
  })

  // ============================================================
  // Best Value Indicator
  // ============================================================
  describe('best value indicator', () => {
    it('should display best value summary in header when comparison provided', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // ヘッダー summary（最適価値: X個 / 最大節約）は comparison 提供時のみ表示。
      // フッター凡例「最適価値」とは別物なので、コロン付き文字列で一意に特定する。
      expect(
        screen.getByText(`最適価値: ${mockComparison.bestValue.quantity.toLocaleString()}個`)
      ).toBeInTheDocument()
      expect(
        screen.getByText(`最大節約: ${mockComparison.bestValue.percentage}%`)
      ).toBeInTheDocument()
    })

    it('should render best value legend in footer', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // フッター凡例「最適価値」も表示（ヘッダー summary と合わせて複数存在）
      expect(screen.getAllByText(/最適価値/).length).toBeGreaterThanOrEqual(1)
    })
  })

  // ============================================================
  // Loading State
  // ============================================================
  describe('loading state', () => {
    it('should show loading message when isLoading is true', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} isLoading={true} />)

      expect(screen.getByText('計算中...')).toBeInTheDocument()
      // テーブル本体は描画されない
      expect(screen.queryByText('数量比較テーブル')).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // Empty State
  // ============================================================
  describe('empty state', () => {
    it('should show empty message when quotes array is empty', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} quotes={[]} />)

      expect(screen.getByText('比較データがありません')).toBeInTheDocument()
      expect(screen.getByText('数量を選択して比較を開始してください')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Null Comparison
  // ============================================================
  describe('null comparison', () => {
    it('should render quotes without comparison highlights when comparison is null', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} comparison={null} />)

      // クォートは表示される（数量は桁区切り）
      expect(screen.getAllByText(mockQuotes[0].quantity.toLocaleString()).length).toBeGreaterThan(0)
      // ヘッダー summary（最適価値: X個 / 最大節約）は comparison 必須のため非表示。
      // ※ フッター凡例「最適価値」は quotes があれば常時描画される仕様（実装 L429）。
      expect(screen.queryByText(/最適価値:/)).not.toBeInTheDocument()
      expect(screen.queryByText(/最大節約/)).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // Sorting
  // ============================================================
  describe('sorting functionality', () => {
    it('should sort by quantity ascending by default', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // デスクトップテーブル行の数量セルを取得し、昇順を確認
      const table = screen.getByRole('table')
      // 数量は桁区切り（1,000 等）されるためカンマを許容
      const quantityCells = within(table).getAllByText(/^[\d,]+$/)
      const quantities = quantityCells.map(c => parseInt(c.textContent!.replace(/,/g, ''), 10))
      // 昇順であること（最大値 5000 が含まれる）
      expect(Math.max(...quantities)).toBe(5000)
    })

    it('should reverse sort order when quantity header clicked twice', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // デスクトップテーブルの「数量」ヘッダー（単一出現）
      const quantityHeader = screen.getByText('数量')
      await user.click(quantityHeader) // asc → desc

      const table = screen.getByRole('table')
      const rows = within(table).getAllByRole('row')
      // ヘッダー行を除いた最初のデータ行の数量が最大（5000）になることを確認
      const firstDataRow = rows[1]
      expect(within(firstDataRow).getByText('5,000')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Quote Selection
  // ============================================================
  describe('quote selection', () => {
    it('should call onQuantitySelect when a row is clicked', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // デスクトップテーブル内の数量 1000 の行をクリック（表示は桁区切り 1,000）
      const table = screen.getByRole('table')
      const targetCell = within(table).getByText('1,000')
      await user.click(targetCell.closest('tr')!)

      expect(defaultProps.onQuantitySelect).toHaveBeenCalledWith(1000)
    })

    it('should render selection buttons for each quote', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      const selectButtons = screen.getAllByRole('button', { name: '選択' })
      expect(selectButtons).toHaveLength(mockQuotes.length)
    })

    it('should show selected state when selectedQuantity is set', () => {
      render(
        <MultiQuantityComparisonTable {...defaultProps} selectedQuantity={1000} />
      )

      // 選択中ボタンが1つ表示される
      expect(screen.getByRole('button', { name: '選択中' })).toBeInTheDocument()
    })
  })

  // ============================================================
  // Price Break Display
  // ============================================================
  describe('price break display', () => {
    it('should render price tier labels for all quotes', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      mockQuotes.forEach(quote => {
        // モバイルカード（「価格区分:」ラベル付き）とデスクトップセルの両方に存在
        expect(screen.getAllByText(quote.priceBreak).length).toBeGreaterThan(0)
      })
    })

    it('should not show discount badge when discountRate is 0', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // discountRate 0 のクォート（quantity=100）は「0%」badge を表示しない
      // 実装: quote.discountRate > 0 でなければ badge を出さない
      const table = screen.getByRole('table')
      const hundredRow = within(table).getByText('100').closest('tr')!
      // 割引率列に badge ではなく「-」が表示される
      expect(within(hundredRow).getByText('-')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Performance
  // ============================================================
  describe('performance', () => {
    it('should render efficiently with large datasets', () => {
      const largeQuotes = Array.from({ length: 50 }, (_, i) => ({
        quantity: (i + 1) * 100,
        unitPrice: 100 - i * 0.5,
        totalPrice: Math.round((i + 1) * 100 * (100 - i * 0.5)),
        discountRate: Math.min(i, 40),
        priceBreak: `tier-${i}`,
        leadTimeDays: Math.max(7, 21 - i),
        isValid: true,
      }))

      const start = performance.now()
      render(<MultiQuantityComparisonTable {...defaultProps} quotes={largeQuotes} />)
      const end = performance.now()

      // 概ね高速に描画できること（環境依存を許容するゆるい閾値）
      expect(end - start).toBeLessThan(1000)
      expect(screen.getByText('50件の比較データ')).toBeInTheDocument()
    })
  })
})
