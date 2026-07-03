/**
 * QuantityEfficiencyChart Unit Tests
 *
 * 現行実装 (src/components/quote/shared/QuantityEfficiencyChart.tsx) の
 * 実際の UI 仕様に基づくユニットテスト。
 *
 * 実装の仕様メモ（テスト期待値の根拠）:
 * - タイトルは「コスト効率性分析」（旧テストの「単価効率分析」から変更）。
 * - 4 種のチャートを描画: 単価トレンド(LineChart), 効率性指標(AreaChart),
 *   コスト構成(PieChart), 節約効果(BarChart)。
 * - recharts モック構造より、XAxis/YAxis/CartesianGrid は各 3、Tooltip は 4、
 *   Legend は 2、Line/Area/Bar/Pie は各 1、Cell は costBreakdownData の 3 要素。
 * - 価格トレンドは trendInfo（chartData 2 件未満は stable、変化率 < -5% で decreasing、
 *   > 5% で increasing）に基づき「低下/上昇/安定」で表示。
 * - 最適数量は bestValue.quantity を toLocaleString で表示（5000 → 5,000）。
 * - null 時は「比較データがありません」を表示しチャートは描画しない。
 * - 収穫逓減点 / img role / aria-label / dark mode は実装に存在しない（検証対象外）。
 * - className はルート div（space-y-6 ${className}）に適用される。
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import QuantityEfficiencyChart from '../shared/QuantityEfficiencyChart'
import type { QuantityComparison } from '@/types/multi-quantity'

// Mock recharts
// Pie は子要素として Cell を map するため children を描画する。
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>{children}</div>
  ),
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>{children}</div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>{children}</div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: ({ children, ...props }: any) => (
    <div data-testid="tooltip" {...props}>{children}</div>
  ),
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="area-chart" {...props}>{children}</div>
  ),
  Area: (props: any) => <div data-testid="area" {...props} />,
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>{children}</div>
  ),
  Pie: ({ children, ...props }: any) => (
    <div data-testid="pie" {...props}>{children}</div>
  ),
  Cell: (props: any) => <div data-testid="cell" {...props} />,
}))

const mockComparison: QuantityComparison = {
  bestValue: {
    quantity: 5000,
    savings: 1000,
    percentage: 32,
    reason: '最大数量で最適な単価を実現',
  },
  priceBreaks: [
    { quantity: 100, priceBreak: '通常価格', discountRate: 0 },
    { quantity: 500, priceBreak: '15%割引', discountRate: 0.15 },
    { quantity: 1000, priceBreak: '23%割引', discountRate: 0.23 },
    { quantity: 5000, priceBreak: '32%割引', discountRate: 0.32 },
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

describe('QuantityEfficiencyChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ============================================================
  // Basic Rendering
  // ============================================================
  describe('basic rendering', () => {
    it('should render the chart title', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText('コスト効率性分析')).toBeInTheDocument()
    })

    it('should render all four chart types', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('should render chart axes, grid, tooltips, and legends', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // XAxis/YAxis/CartesianGrid は LineChart, AreaChart, BarChart の各 1 = 3
      expect(screen.getAllByTestId('x-axis')).toHaveLength(3)
      expect(screen.getAllByTestId('y-axis')).toHaveLength(3)
      expect(screen.getAllByTestId('cartesian-grid')).toHaveLength(3)
      // Tooltip は LineChart, AreaChart, PieChart, BarChart = 4
      expect(screen.getAllByTestId('tooltip')).toHaveLength(4)
      // Legend は LineChart, AreaChart = 2
      expect(screen.getAllByTestId('legend')).toHaveLength(2)
    })

    it('should render each chart section heading', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText('単価トレンド')).toBeInTheDocument()
      expect(screen.getByText('効率性指標')).toBeInTheDocument()
      expect(screen.getByText('コスト構成')).toBeInTheDocument()
      expect(screen.getByText('節約効果')).toBeInTheDocument()
    })

    it('should display price trend derived from data (decreasing → 低下)', () => {
      // mock: 単価 85.5 → 58.2 で変化率 -31.9% (< -5%) → decreasing → 低下
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText(/価格トレンド/)).toBeInTheDocument()
      expect(screen.getByText('価格トレンド: 低下')).toBeInTheDocument()
    })

    it('should display optimal quantity with grouping', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText(/最適数量/)).toBeInTheDocument()
      expect(
        screen.getByText(`最適数量: ${mockComparison.bestValue.quantity.toLocaleString()}個`)
      ).toBeInTheDocument()
    })

    it('should render the insights summary section', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText('分析インサイト')).toBeInTheDocument()
      expect(screen.getByText('最適コスト効率')).toBeInTheDocument()
      expect(screen.getByText('最大節約効果')).toBeInTheDocument()
      expect(screen.getByText('規模の経済')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Null Comparison
  // ============================================================
  describe('null comparison', () => {
    it('should show empty message when comparison is null', () => {
      render(<QuantityEfficiencyChart comparison={null} />)

      expect(screen.getByText('比較データがありません')).toBeInTheDocument()
      expect(screen.getByText('数量を選択して分析を開始してください')).toBeInTheDocument()
    })

    it('should not render any charts when comparison is null', () => {
      render(<QuantityEfficiencyChart comparison={null} />)

      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
      expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
    })
  })

  // ============================================================
  // Chart Types
  // ============================================================
  describe('chart types', () => {
    it('should render line chart and area chart for trends', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('should render bar chart for savings comparison', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('should render pie chart for cost breakdown with cells', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
      // costBreakdownData は 変動費/固定費/利益 の 3 要素
      expect(screen.getAllByTestId('cell')).toHaveLength(3)
    })
  })

  // ============================================================
  // Data Edge Cases
  // ============================================================
  describe('data edge cases', () => {
    it('should handle single quantity data and show stable trend', () => {
      const singleQuantityComparison: QuantityComparison = {
        bestValue: {
          quantity: 1000,
          savings: 0,
          percentage: 0,
          reason: '単一数量',
        },
        priceBreaks: [{ quantity: 1000, priceBreak: '通常価格', discountRate: 0 }],
        economiesOfScale: {
          1000: { unitPrice: 100, totalSavings: 0, efficiency: 1.0 },
        },
        trends: {
          priceTrend: 'stable',
          optimalQuantity: 1000,
          diminishingReturns: 1000,
        },
      }

      render(<QuantityEfficiencyChart comparison={singleQuantityComparison} />)

      // chartData.length < 2 → trendInfo は stable
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByText('価格トレンド: 安定')).toBeInTheDocument()
    })

    it('should handle zero or negative values without crashing', () => {
      const zeroValueComparison: QuantityComparison = {
        ...mockComparison,
        economiesOfScale: {
          100: { unitPrice: 0, totalSavings: 0, efficiency: 0 },
          500: { unitPrice: 50, totalSavings: -100, efficiency: 0.5 },
        },
      }

      render(<QuantityEfficiencyChart comparison={zeroValueComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      const largeNumberComparison: QuantityComparison = {
        ...mockComparison,
        economiesOfScale: {
          1000000: { unitPrice: 0.01, totalSavings: 1000000, efficiency: 0.99 },
        },
      }

      render(<QuantityEfficiencyChart comparison={largeNumberComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  // ============================================================
  // Custom Styling
  // ============================================================
  describe('custom styling', () => {
    it('should apply custom className to the root element', () => {
      const { container } = render(
        <QuantityEfficiencyChart comparison={mockComparison} className="custom-chart-class" />
      )

      // 実装はルート div に `${className}` を適用（L125）
      expect(container.firstChild as Element).toHaveClass('custom-chart-class')
    })

    it('should apply stroke to the unit-price Line and fill to the savings Bar', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('line')).toHaveAttribute('stroke')
      expect(screen.getByTestId('bar')).toHaveAttribute('fill')
    })
  })

  // ============================================================
  // Performance
  // ============================================================
  describe('performance', () => {
    it('should render efficiently with large datasets', () => {
      const largeComparison: QuantityComparison = {
        bestValue: {
          quantity: 100000,
          savings: 50000,
          percentage: 50,
          reason: '大量注文',
        },
        priceBreaks: Array.from({ length: 100 }, (_, i) => ({
          quantity: (i + 1) * 1000,
          priceBreak: `${i}%割引`,
          discountRate: i * 0.01,
        })),
        economiesOfScale: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            (i + 1) * 1000,
            {
              unitPrice: 100 - i,
              totalSavings: i * 1000,
              efficiency: Math.min(1, i / 100),
            },
          ])
        ),
        trends: {
          priceTrend: 'decreasing',
          optimalQuantity: 100000,
          diminishingReturns: 50000,
        },
      }

      const start = performance.now()
      render(<QuantityEfficiencyChart comparison={largeComparison} />)
      const end = performance.now()

      // 環境依存を許容するゆるい閾値
      expect(end - start).toBeLessThan(1000)
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
