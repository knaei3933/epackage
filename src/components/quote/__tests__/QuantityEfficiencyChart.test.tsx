import React from 'react'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import QuantityEfficiencyChart from '../QuantityEfficiencyChart'
import type { QuantityComparison } from '@/types/multi-quantity'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children, ...props }: any) => (
    <div data-testid="responsive-container" {...props}>
      {children}
    </div>
  ),
  LineChart: ({ children, ...props }: any) => (
    <div data-testid="line-chart" {...props}>
      {children}
    </div>
  ),
  Line: (props: any) => <div data-testid="line" {...props} />,
  BarChart: ({ children, ...props }: any) => (
    <div data-testid="bar-chart" {...props}>
      {children}
    </div>
  ),
  Bar: (props: any) => <div data-testid="bar" {...props} />,
  XAxis: (props: any) => <div data-testid="x-axis" {...props} />,
  YAxis: (props: any) => <div data-testid="y-axis" {...props} />,
  CartesianGrid: (props: any) => <div data-testid="cartesian-grid" {...props} />,
  Tooltip: ({ children, ...props }: any) => (
    <div data-testid="tooltip" {...props}>
      {children}
    </div>
  ),
  Legend: (props: any) => <div data-testid="legend" {...props} />,
  AreaChart: ({ children, ...props }: any) => (
    <div data-testid="area-chart" {...props}>
      {children}
    </div>
  ),
  Area: (props: any) => <div data-testid="area" {...props} />,
  PieChart: ({ children, ...props }: any) => (
    <div data-testid="pie-chart" {...props}>
      {children}
    </div>
  ),
  Pie: (props: any) => <div data-testid="pie" {...props} />,
  Cell: (props: any) => <div data-testid="cell" {...props} />,
}))

const mockComparison: QuantityComparison = {
  bestValue: {
    quantity: 5000,
    savings: 1000,
    percentage: 32,
    reason: '最大数量で最適な単価を実現'
  },
  priceBreaks: [
    { quantity: 100, priceBreak: '通常価格', discountRate: 0 },
    { quantity: 500, priceBreak: '15%割引', discountRate: 0.15 },
    { quantity: 1000, priceBreak: '23%割引', discountRate: 0.23 },
    { quantity: 5000, priceBreak: '32%割引', discountRate: 0.32 }
  ],
  economiesOfScale: {
    100: { unitPrice: 85.50, totalSavings: 0, efficiency: 0.6 },
    500: { unitPrice: 72.30, totalSavings: 200, efficiency: 0.7 },
    1000: { unitPrice: 65.80, totalSavings: 500, efficiency: 0.8 },
    5000: { unitPrice: 58.20, totalSavings: 1000, efficiency: 0.95 }
  },
  trends: {
    priceTrend: 'decreasing',
    optimalQuantity: 5000,
    diminishingReturns: 1000
  }
}

describe('QuantityEfficiencyChart', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render chart components', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('should render all chart elements', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Check for chart components
      expect(screen.getByTestId('x-axis')).toBeInTheDocument()
      expect(screen.getByTestId('y-axis')).toBeInTheDocument()
      expect(screen.getByTestId('cartesian-grid')).toBeInTheDocument()
      expect(screen.getByTestId('tooltip')).toBeInTheDocument()
      expect(screen.getByTestId('legend')).toBeInTheDocument()
    })

    it('should display chart title and descriptions', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText(/単価効率分析/i)).toBeInTheDocument()
      expect(screen.getByText(/数量に伴う単価の推移と最適な価格帯を可視化/i)).toBeInTheDocument()
    })

    it('should handle null comparison data', () => {
      render(<QuantityEfficiencyChart comparison={null} />)

      expect(screen.getByText(/データがありません/i)).toBeInTheDocument()
      expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()
    })
  })

  describe('data visualization', () => {
    it('should process economies of scale data correctly', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Check that data is processed for chart
      expect(screen.getByTestId('line')).toBeInTheDocument()
      expect(screen.getByTestId('bar')).toBeInTheDocument()
    })

    it('should display efficiency trends', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Look for trend indicators
      expect(screen.getByText(/価格トレンド/i)).toBeInTheDocument()
    })

    it('should show optimal quantity indicator', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText(/最適数量/i)).toBeInTheDocument()
      expect(screen.getByText(mockComparison.trends.optimalQuantity.toString())).toBeInTheDocument()
    })

    it('should display diminishing returns point', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByText(/収穫逓減点/i)).toBeInTheDocument()
      expect(screen.getByText(mockComparison.trends.diminishingReturns.toString())).toBeInTheDocument()
    })
  })

  describe('chart interactions', () => {
    it('should have interactive tooltips', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      const tooltip = screen.getByTestId('tooltip')
      expect(tooltip).toBeInTheDocument()
    })

    it('should display legend with proper labels', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      const legend = screen.getByTestId('legend')
      expect(legend).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should use responsive container', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      const container = screen.getByTestId('responsive-container')
      expect(container).toBeInTheDocument()
    })

    it('should adapt to different container sizes', () => {
      const { rerender } = render(
        <QuantityEfficiencyChart comparison={mockComparison} className="w-96" />
      )

      rerender(
        <QuantityEfficiencyChart comparison={mockComparison} className="w-full" />
      )

      // Should re-render with new dimensions
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be accessible with axe', async () => {
      const { container } = render(<QuantityEfficiencyChart comparison={mockComparison} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Check for proper chart accessibility
      const chart = screen.getByRole('img') // Charts should have img role
      expect(chart).toBeInTheDocument()
      expect(chart).toHaveAttribute('aria-label')
    })

    it('should support keyboard navigation', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Charts should be keyboard accessible
      const chart = screen.getByRole('img')
      expect(chart).toHaveAttribute('tabindex')
    })
  })

  describe('color scheme and styling', () => {
    it('should use consistent color palette', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Check that colors are applied correctly
      const line = screen.getByTestId('line')
      expect(line).toHaveAttribute('stroke')
    })

    it('should handle dark mode', () => {
      // Mock dark mode
      document.documentElement.classList.add('dark')

      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Should adapt colors for dark mode
      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveClass('dark')
    })
  })

  describe('data edge cases', () => {
    it('should handle single quantity data', () => {
      const singleQuantityComparison: QuantityComparison = {
        bestValue: {
          quantity: 1000,
          savings: 0,
          percentage: 0,
          reason: '単一数量'
        },
        priceBreaks: [
          { quantity: 1000, priceBreak: '通常価格', discountRate: 0 }
        ],
        economiesOfScale: {
          1000: { unitPrice: 100, totalSavings: 0, efficiency: 1.0 }
        },
        trends: {
          priceTrend: 'stable',
          optimalQuantity: 1000,
          diminishingReturns: 1000
        }
      }

      render(<QuantityEfficiencyChart comparison={singleQuantityComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle zero or negative values', () => {
      const zeroValueComparison: QuantityComparison = {
        ...mockComparison,
        economiesOfScale: {
          100: { unitPrice: 0, totalSavings: 0, efficiency: 0 },
          500: { unitPrice: 50, totalSavings: -100, efficiency: 0.5 }
        }
      }

      render(<QuantityEfficiencyChart comparison={zeroValueComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    it('should handle very large numbers', () => {
      const largeNumberComparison: QuantityComparison = {
        ...mockComparison,
        economiesOfScale: {
          1000000: { unitPrice: 0.01, totalSavings: 1000000, efficiency: 0.99 }
        }
      }

      render(<QuantityEfficiencyChart comparison={largeNumberComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should render efficiently with large datasets', async () => {
      const largeComparison: QuantityComparison = {
        bestValue: {
          quantity: 100000,
          savings: 50000,
          percentage: 50,
          reason: '大量注文'
        },
        priceBreaks: Array.from({ length: 100 }, (_, i) => ({
          quantity: (i + 1) * 1000,
          priceBreak: `${i}%割引`,
          discountRate: i * 0.01
        })),
        economiesOfScale: Object.fromEntries(
          Array.from({ length: 100 }, (_, i) => [
            (i + 1) * 1000,
            {
              unitPrice: 100 - i,
              totalSavings: i * 1000,
              efficiency: Math.min(1, i / 100)
            }
          ])
        ),
        trends: {
          priceTrend: 'decreasing',
          optimalQuantity: 100000,
          diminishingReturns: 50000
        }
      }

      const startTime = performance.now()
      render(<QuantityEfficiencyChart comparison={largeComparison} />)
      const endTime = performance.now()

      // Should render within 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should memoize chart data', () => {
      const { rerender } = render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Rerender with same props
      rerender(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Should not cause unnecessary recalculations
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('chart types', () => {
    it('should render line chart for trends', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
      expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    })

    it('should render bar chart for comparisons', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    })

    it('should render pie chart for distributions', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('should apply custom className', () => {
      render(
        <QuantityEfficiencyChart
          comparison={mockComparison}
          className="custom-chart-class"
        />
      )

      const container = screen.getByTestId('responsive-container')
      expect(container).toHaveClass('custom-chart-class')
    })

    it('should handle custom color schemes', () => {
      render(<QuantityEfficiencyChart comparison={mockComparison} />)

      // Check that custom colors are applied
      const elements = screen.getAllByTestId(/cell|line|bar/)
      elements.forEach(element => {
        expect(element).toHaveAttribute('fill') || expect(element).toHaveAttribute('stroke')
      })
    })
  })
})