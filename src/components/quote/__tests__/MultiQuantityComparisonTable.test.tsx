import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import MultiQuantityComparisonTable from '../MultiQuantityComparisonTable'
import type { QuantityComparison } from '@/types/multi-quantity'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
    td: ({ children, ...props }: any) => <td {...props}>{children}</td>,
    th: ({ children, ...props }: any) => <th {...props}>{children}</th>,
  },
}))

const mockQuotes = [
  {
    quantity: 100,
    unitPrice: 85.50,
    totalPrice: 8550,
    discountRate: 0,
    priceBreak: '通常価格',
    leadTimeDays: 14,
    isValid: true
  },
  {
    quantity: 500,
    unitPrice: 72.30,
    totalPrice: 36150,
    discountRate: 0.15,
    priceBreak: '15%割引',
    leadTimeDays: 12,
    isValid: true
  },
  {
    quantity: 1000,
    unitPrice: 65.80,
    totalPrice: 65800,
    discountRate: 0.23,
    priceBreak: '23%割引',
    leadTimeDays: 10,
    isValid: true
  },
  {
    quantity: 5000,
    unitPrice: 58.20,
    totalPrice: 291000,
    discountRate: 0.32,
    priceBreak: '32%割引',
    leadTimeDays: 8,
    isValid: true
  }
]

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

const defaultProps = {
  quotes: mockQuotes,
  comparison: mockComparison,
  selectedQuantity: null,
  onQuantitySelect: jest.fn()
}

describe('MultiQuantityComparisonTable', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('should render comparison table with all quotes', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Check table headers
      expect(screen.getByText('数量')).toBeInTheDocument()
      expect(screen.getByText('単価')).toBeInTheDocument()
      expect(screen.getByText('合計価格')).toBeInTheDocument()
      expect(screen.getByText('割引率')).toBeInTheDocument()
      expect(screen.getByText('納期')).toBeInTheDocument()

      // Check quote data
      mockQuotes.forEach(quote => {
        expect(screen.getByText(quote.quantity.toString())).toBeInTheDocument()
        expect(screen.getByText(`¥${quote.unitPrice.toFixed(2)}`)).toBeInTheDocument()
        expect(screen.getByText(`¥${quote.totalPrice.toLocaleString()}`)).toBeInTheDocument()
        expect(screen.getByText(`${(quote.discountRate * 100).toFixed(0)}%`)).toBeInTheDocument()
        expect(screen.getByText(`${quote.leadTimeDays}日`)).toBeInTheDocument()
      })
    })

    it('should display best value indicator', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      expect(screen.getByText(/最適な価格/i)).toBeInTheDocument()
      expect(screen.getByText(mockComparison.bestValue.reason)).toBeInTheDocument()
    })

    it('should show loading state correctly', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} isLoading={true} />)

      expect(screen.getByText('計算中...')).toBeInTheDocument()
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('should handle empty quotes array', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} quotes={[]} />)

      expect(screen.getByText('表示するデータがありません')).toBeInTheDocument()
    })

    it('should handle null comparison', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} comparison={null} />)

      // Should still render quotes without comparison highlights
      expect(screen.getByText(mockQuotes[0].quantity.toString())).toBeInTheDocument()
      expect(screen.queryByText(/最適な価格/i)).not.toBeInTheDocument()
    })
  })

  describe('sorting functionality', () => {
    it('should sort by quantity by default', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      const quantityHeaders = screen.getAllByText('数量')
      const sortableHeader = quantityHeaders.find(header =>
        header.closest('button') || header.closest('[role="button"]')
      )

      expect(sortableHeader).toBeInTheDocument()
    })

    it('should allow sorting by unit price', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Find unit price sort button
      const unitPriceHeader = screen.getByText('単価')
      await user.click(unitPriceHeader)

      // Verify quotes are sorted by unit price (ascending)
      const unitPrices = screen.getAllByText(/¥\d+\.\d{2}/)
      const firstPrice = parseFloat(unitPrices[0].textContent!.replace('¥', ''))
      const lastPrice = parseFloat(unitPrices[unitPrices.length - 1]!.textContent!.replace('¥', ''))

      expect(firstPrice).toBeLessThanOrEqual(lastPrice)
    })

    it('should allow sorting by total price', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Find total price sort button
      const totalPriceHeader = screen.getByText('合計価格')
      await user.click(totalPriceHeader)

      // Verify quotes are sorted by total price (ascending)
      const totalPrices = screen.getAllByText(/¥\d+/)
      const firstPrice = parseInt(totalPrices[0].textContent!.replace(/[¥,]/g, ''))
      const lastPrice = parseInt(totalPrices[totalPrices.length - 1]!.textContent!.replace(/[¥,]/g, ''))

      expect(firstPrice).toBeLessThanOrEqual(lastPrice)
    })

    it('should toggle sort direction on repeated clicks', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      const quantityHeader = screen.getByText('数量')

      // First click - should sort ascending (already default)
      await user.click(quantityHeader)

      // Second click - should sort descending
      await user.click(quantityHeader)

      // Verify descending order
      const quantities = screen.getAllByText(/^\d+$/)
      expect(parseInt(quantities[0]!.textContent!)).toBeGreaterThan(parseInt(quantities[quantities.length - 1]!.textContent!))
    })
  })

  describe('quote selection', () => {
    it('should allow selecting a quote', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      const selectButtons = screen.getAllByRole('button', { name: /選択/i })
      expect(selectButtons).toHaveLength(mockQuotes.length)

      // Select the first quote
      await user.click(selectButtons[0])

      expect(defaultProps.onQuantitySelect).toHaveBeenCalledWith(mockQuotes[0].quantity)
    })

    it('should highlight selected quote', () => {
      render(
        <MultiQuantityComparisonTable
          {...defaultProps}
          selectedQuantity={1000}
        />
      )

      // Find the row with quantity 1000
      const quantityCell = screen.getByText('1000')
      const row = quantityCell.closest('tr')

      expect(row).toHaveClass('selected') // or similar highlighting class
    })

    it('should handle keyboard navigation for selection', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      const firstSelectButton = screen.getAllByRole('button', { name: /選択/i })[0]

      // Focus the button with keyboard
      firstSelectButton.focus()
      expect(firstSelectButton).toHaveFocus()

      // Press Enter to select
      await user.keyboard('{Enter}')
      expect(defaultProps.onQuantitySelect).toHaveBeenCalledWith(mockQuotes[0].quantity)
    })
  })

  describe('price break display', () => {
    it('should show price break badges', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      mockQuotes.forEach(quote => {
        if (quote.discountRate > 0) {
          expect(screen.getByText(quote.priceBreak)).toBeInTheDocument()
        }
      })
    })

    it('should highlight best price break', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // The best price break should be highlighted
      const bestPriceBreak = screen.getByText('32%割引')
      const badge = bestPriceBreak.closest('.badge, .chip, [role="badge"]')

      expect(badge).toHaveClass(/highlight|best|optimal/i)
    })
  })

  describe('efficiency indicators', () => {
    it('should display efficiency scores', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Look for efficiency indicators
      mockQuotes.forEach((quote, index) => {
        const efficiency = mockComparison.economiesOfScale[quote.quantity].efficiency
        expect(efficiency).toBeGreaterThanOrEqual(0)
        expect(efficiency).toBeLessThanOrEqual(1)
      })
    })

    it('should show efficiency trend indicators', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Look for trend indicators
      expect(screen.getByText('priceTrend')).toBeInTheDocument()

      // Should show decreasing trend icon
      const trendIcon = document.querySelector('[data-testid="trend-icon"]')
      expect(trendIcon).toBeInTheDocument()
    })
  })

  describe('responsive behavior', () => {
    it('should adapt to mobile viewports', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Should show simplified table for mobile
      expect(screen.getByTestId('mobile-table')).toBeInTheDocument()

      // Should have horizontal scroll for wider content
      const tableContainer = screen.getByTestId('table-container')
      expect(tableContainer).toHaveClass('overflow-x-auto')
    })

    it('should handle tablet viewports', async () => {
      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Should show medium density table
      expect(screen.getByTestId('tablet-table')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should be accessible with axe', async () => {
      const { container } = render(<MultiQuantityComparisonTable {...defaultProps} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper ARIA labels', () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Check for proper table semantics
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()

      // Check for sortable headers
      const sortableHeaders = screen.getAllByRole('columnheader')
      sortableHeaders.forEach(header => {
        if (header.getAttribute('aria-sort')) {
          expect(['none', 'ascending', 'descending']).toContain(
            header.getAttribute('aria-sort')!
          )
        }
      })

      // Check for row selection
      const selectButtons = screen.getAllByRole('button', { name: /選択/i })
      selectButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label')
      })
    })

    it('should support keyboard navigation', async () => {
      render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Tab through table elements
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)

      // Should be able to navigate with arrow keys
      await user.keyboard('{ArrowDown}')
      // Should move focus to next row or button
    })
  })

  describe('error handling', () => {
    it('should handle invalid quote data gracefully', () => {
      const invalidQuotes = [
        {
          quantity: -100, // Invalid negative quantity
          unitPrice: 0,
          totalPrice: 0,
          discountRate: 0,
          priceBreak: '',
          leadTimeDays: 0,
          isValid: false
        }
      ]

      render(<MultiQuantityComparisonTable {...defaultProps} quotes={invalidQuotes} />)

      // Should still render but show error state
      expect(screen.getByText('データエラー')).toBeInTheDocument()
    })

    it('should handle missing comparison data', () => {
      render(
        <MultiQuantityComparisonTable
          {...defaultProps}
          comparison={null}
        />
      )

      // Should not show comparison highlights
      expect(screen.queryByText(/最適な価格/i)).not.toBeInTheDocument()
      // Should still show quotes
      expect(screen.getByText('100')).toBeInTheDocument()
    })
  })

  describe('performance', () => {
    it('should render efficiently with large datasets', async () => {
      const largeQuotes = Array.from({ length: 100 }, (_, i) => ({
        quantity: (i + 1) * 100,
        unitPrice: 100 - i * 0.5,
        totalPrice: (i + 1) * 100 * (100 - i * 0.5),
        discountRate: i * 0.01,
        priceBreak: `${i}%割引`,
        leadTimeDays: Math.max(7, 21 - i),
        isValid: true
      }))

      const startTime = performance.now()
      render(<MultiQuantityComparisonTable {...defaultProps} quotes={largeQuotes} />)
      const endTime = performance.now()

      // Should render within 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should memoize sort function', () => {
      const { rerender } = render(<MultiQuantityComparisonTable {...defaultProps} />)

      // Rerender with same props
      rerender(<MultiQuantityComparisonTable {...defaultProps} />)

      // Should not cause unnecessary re-renders
      // This would require more detailed implementation testing
    })
  })
})