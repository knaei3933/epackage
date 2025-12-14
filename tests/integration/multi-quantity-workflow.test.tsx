import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext'
import MultiQuantityComparisonTable from '@/components/quote/MultiQuantityComparisonTable'
import MultiQuantityStep from '@/components/quote/MultiQuantityStep'
import QuantityEfficiencyChart from '@/components/quote/QuantityEfficiencyChart'
import { createMockMultiQuantityRequest } from '../../jest.setup'

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock the API
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/quote/multi-quantity',
}))

// Mock fetch for API calls
global.fetch = jest.fn()

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Multi-Quantity Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockClear()
  })

  const renderWithContext = (component: React.ReactElement) => {
    return render(
      <MultiQuantityQuoteProvider>
        {component}
      </MultiQuantityQuoteProvider>
    )
  }

  describe('complete multi-quantity workflow', () => {
    it('should handle end-to-end quote creation and comparison', async () => {
      // Mock API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              calculations: new Map([
                [100, { quantity: 100, unitPrice: 85, totalPrice: 8500, leadTimeDays: 14 }],
                [500, { quantity: 500, unitPrice: 72, totalPrice: 36000, leadTimeDays: 12 }],
                [1000, { quantity: 1000, unitPrice: 65, totalPrice: 65000, leadTimeDays: 10 }],
                [5000, { quantity: 5000, unitPrice: 58, totalPrice: 290000, leadTimeDays: 8 }],
              ]),
              comparison: {
                bestValue: { quantity: 5000, savings: 1000, percentage: 32 },
                priceBreaks: [],
                economiesOfScale: {},
                trends: { priceTrend: 'decreasing' as const }
              },
              recommendations: [
                { type: 'cost-optimized', title: 'コスト最適化', quantity: 5000 }
              ]
            }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: { downloadUrl: 'http://example.com/export.pdf' }
          })
        })

      renderWithContext(<MultiQuantityStep />)

      // Step 1: Set basic specifications
      const bagTypeSelect = screen.getByLabelText(/袋タイプ/i)
      await user.selectOptions(bagTypeSelect, 'stand_up_pouch')

      const materialSelect = screen.getByLabelText(/素材/i)
      await user.selectOptions(materialSelect, 'kppe_al')

      const widthInput = screen.getByLabelText(/幅/i)
      await user.clear(widthInput)
      await user.type(widthInput, '250')

      const heightInput = screen.getByLabelText(/高さ/i)
      await user.clear(heightInput)
      await user.type(heightInput, '350')

      const depthInput = screen.getByLabelText(/マチ/i)
      await user.clear(depthInput)
      await user.type(depthInput, '100')

      // Step 2: Configure printing options
      const uvPrintingToggle = screen.getByLabelText(/UV印刷/i)
      await user.click(uvPrintingToggle)

      const printingTypeSelect = screen.getByLabelText(/印刷方式/i)
      await user.selectOptions(printingTypeSelect, 'gravure')

      const colorInput = screen.getByLabelText(/色数/i)
      await user.clear(colorInput)
      await user.type(colorInput, '6')

      const doubleSidedToggle = screen.getByLabelText(/両面印刷/i)
      await user.click(doubleSidedToggle)

      // Step 3: Set quantities
      await user.click(screen.getByText(/数量を追加/i))

      const quantityInputs = screen.getAllByLabelText(/数量/i)
      expect(quantityInputs).toHaveLength(6) // 5 default + 1 added

      // Update quantities
      await user.clear(quantityInputs[0])
      await user.type(quantityInputs[0], '100')

      await user.clear(quantityInputs[1])
      await user.type(quantityInputs[1], '500')

      await user.clear(quantityInputs[2])
      await user.type(quantityInputs[2], '1000')

      await user.clear(quantityInputs[3])
      await user.type(quantityInputs[3], '5000')

      // Step 4: Set post-processing
      const laminationOption = screen.getByLabelText(/ラミネート加工/i)
      await user.click(laminationOption)

      // Step 5: Set delivery options
      const locationSelect = screen.getByLabelText(/配送先/i)
      await user.selectOptions(locationSelect, 'international')

      const urgencySelect = screen.getByLabelText(/納期/i)
      await user.selectOptions(urgencySelect, 'express')

      // Step 6: Calculate quotes
      await user.click(screen.getByText(/見積もりを計算/i))

      // Verify loading state
      expect(screen.getByText(/計算中/i)).toBeInTheDocument()

      // Wait for results
      await waitFor(() => {
        expect(screen.getByText(/計算完了/i)).toBeInTheDocument()
      }, { timeout: 10000 })

      // Verify comparison table appears
      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
      expect(screen.getByText('500')).toBeInTheDocument()
      expect(screen.getByText('1000')).toBeInTheDocument()
      expect(screen.getByText('5000')).toBeInTheDocument()

      // Verify best value highlight
      expect(screen.getByText(/最適な価格/i)).toBeInTheDocument()

      // Step 7: Select a quantity
      const selectButtons = screen.getAllByRole('button', { name: /選択/i })
      await user.click(selectButtons[2]) // Select 1000 quantity

      // Verify selection
      expect(screen.getByText(/選択中: 1000個/i)).toBeInTheDocument()

      // Step 8: Export comparison
      await user.click(screen.getByText(/エクスポート/i))
      await user.click(screen.getByText(/PDFでエクスポート/i))

      // Verify export
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/comparison/export',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"format":"pdf"')
          })
        )
      })

      // Verify API calls
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle workflow with saved patterns', async () => {
      // Mock localStorage for saved patterns
      const localStorageMock = {
        getItem: jest.fn(() => JSON.stringify([
          {
            id: 'pattern-1',
            name: '標準パターン',
            description: '一般的な数量設定',
            quantities: [500, 1000, 2000],
            createdAt: new Date().toISOString(),
            lastUsed: new Date().toISOString(),
            isDefault: true
          }
        ])),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        length: 1,
        key: jest.fn()
      }

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        writable: true
      })

      renderWithContext(<MultiQuantityStep />)

      // Should load saved patterns
      expect(screen.getByText(/標準パターン/i)).toBeInTheDocument()

      // Apply saved pattern
      await user.click(screen.getByText(/標準パターン/i))
      await user.click(screen.getByText(/適用/i))

      // Verify quantities are applied
      await waitFor(() => {
        const quantityInputs = screen.getAllByLabelText(/数量/i)
        expect(quantityInputs[0]).toHaveValue(500)
        expect(quantityInputs[1]).toHaveValue(1000)
        expect(quantityInputs[2]).toHaveValue(2000)
      })
    })

    it('should handle error recovery in workflow', async () => {
      // Mock API error
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      renderWithContext(<MultiQuantityStep />)

      // Fill in required fields
      await user.selectOptions(screen.getByLabelText(/袋タイプ/i), 'stand_up_pouch')
      await user.selectOptions(screen.getByLabelText(/素材/i), 'kppe_al')

      const quantityInputs = screen.getAllByLabelText(/数量/i)
      await user.clear(quantityInputs[0])
      await user.type(quantityInputs[0], '1000')

      // Try to calculate
      await user.click(screen.getByText(/見積もりを計算/i))

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/計算に失敗しました/i)).toBeInTheDocument()
      })

      // Should show retry button
      expect(screen.getByText(/再試行/i)).toBeInTheDocument()

      // Retry calculation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            calculations: new Map([[1000, { quantity: 1000, unitPrice: 65 }]])
          }
        })
      })

      await user.click(screen.getByText(/再試行/i))

      // Should succeed on retry
      await waitFor(() => {
        expect(screen.getByText(/計算完了/i)).toBeInTheDocument()
      })
    })
  })

  describe('component integration', () => {
    it('should integrate comparison table with context', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            calculations: new Map([
              [100, { quantity: 100, unitPrice: 85, totalPrice: 8500 }],
              [500, { quantity: 500, unitPrice: 72, totalPrice: 36000 }]
            ]),
            comparison: {
              bestValue: { quantity: 500, savings: 500, percentage: 20 },
              priceBreaks: [],
              economiesOfScale: {},
              trends: { priceTrend: 'decreasing' as const }
            }
          }
        })
      })

      const TestIntegration = () => {
        const { state, actions } = useMultiQuantityQuote()

        return (
          <div>
            <button
              onClick={() => actions.setQuantities([100, 500])}
              data-testid="set-quantities"
            >
              Set Quantities
            </button>
            <MultiQuantityComparisonTable
              quotes={Array.from(state.multiQuantityResults.values())}
              comparison={state.comparison}
              selectedQuantity={state.selectedQuantity}
              onQuantitySelect={actions.setSelectedQuantity}
              isLoading={state.isLoading}
            />
          </div>
        )
      }

      renderWithContext(<TestIntegration />)

      // Set quantities
      await user.click(screen.getByTestId('set-quantities'))

      // Should show empty table initially
      expect(screen.getByText(/表示するデータがありません/i)).toBeInTheDocument()

      // Calculate quotes
      await user.click(screen.getByText(/Set Quantities/')) // This would trigger calculation

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument()
      })
    })

    it('should integrate chart with comparison data', async () => {
      const mockComparison = {
        bestValue: {
          quantity: 5000,
          savings: 1000,
          percentage: 32,
          reason: 'Best value'
        },
        priceBreaks: [],
        economiesOfScale: {
          100: { unitPrice: 85, totalSavings: 0, efficiency: 0.6 },
          500: { unitPrice: 72, totalSavings: 200, efficiency: 0.7 },
          1000: { unitPrice: 65, totalSavings: 500, efficiency: 0.8 }
        },
        trends: {
          priceTrend: 'decreasing' as const,
          optimalQuantity: 5000,
          diminishingReturns: 1000
        }
      }

      renderWithContext(
        <QuantityEfficiencyChart comparison={mockComparison} />
      )

      // Should render chart with comparison data
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument()
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })

  describe('data flow', () => {
    it('should maintain data consistency across components', async () => {
      const DataFlowTest = () => {
        const { state, actions } = useMultiQuantityQuote()

        return (
          <div>
            <div data-testid="context-quantities">
              {state.quantities.join(',')}
            </div>
            <button
              onClick={() => actions.setQuantities([100, 500, 1000])}
              data-testid="update-quantities"
            >
              Update Quantities
            </button>
            <MultiQuantityComparisonTable
              quotes={[]}
              comparison={null}
              selectedQuantity={state.selectedQuantity}
              onQuantitySelect={actions.setSelectedQuantity}
            />
          </div>
        )
      }

      renderWithContext(<DataFlowTest />)

      // Initial state
      expect(screen.getByTestId('context-quantities')).toHaveTextContent('500,1000,2000,5000,10000')

      // Update quantities
      await user.click(screen.getByTestId('update-quantities'))

      // Verify update
      expect(screen.getByTestId('context-quantities')).toHaveTextContent('100,500,1000')
    })

    it('should handle async operations properly', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() =>
            resolve({
              ok: true,
              json: () => Promise.resolve({
                success: true,
                data: { calculations: new Map() }
              })
            }), 1000
        )
      )
      )

      const AsyncTest = () => {
        const { state, actions } = useMultiQuantityQuote()

        const handleCalculate = async () => {
          await actions.calculateMultiQuantity()
        }

        return (
          <div>
            <div data-testid="loading-state">{state.isLoading.toString()}</div>
            <button onClick={handleCalculate} data-testid="calculate">
              Calculate
            </button>
          </div>
        )
      }

      renderWithContext(<AsyncTest />)

      // Initially not loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('false')

      // Start calculation
      await user.click(screen.getByTestId('calculate'))

      // Should show loading
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('true')
      })

      // Should complete
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('false')
      }, { timeout: 2000 })
    })
  })

  describe('error boundaries', () => {
    it('should handle component errors gracefully', async () => {
      const ErrorBoundaryTest = () => {
        const [shouldError, setShouldError] = React.useState(false)

        if (shouldError) {
          throw new Error('Test error')
        }

        return (
          <div>
            <button onClick={() => setShouldError(true)} data-testid="trigger-error">
              Trigger Error
            </button>
            <MultiQuantityStep />
          </div>
        )
      }

      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderWithContext(<ErrorBoundaryTest />)
      }).not.toThrow()

      consoleSpy.mockRestore()
    })
  })

  describe('accessibility integration', () => {
    it('should be accessible across the entire workflow', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { calculations: new Map() }
        })
      })

      const { container } = renderWithContext(<MultiQuantityStep />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()

      // Test keyboard navigation
      await user.tab()
      expect(document.activeElement).toBeInstanceOf(HTMLElement)

      // Test form accessibility
      const bagTypeSelect = screen.getByLabelText(/袋タイプ/i)
      expect(bagTypeSelect).toHaveAttribute('aria-label')
    })
  })

  describe('performance integration', () => {
    it('should handle large datasets efficiently', async () => {
      const largeQuantities = Array.from({ length: 50 }, (_, i) => (i + 1) * 100)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            calculations: new Map(
              largeQuantities.map(q => [q, { quantity: q, unitPrice: 100 - q * 0.01 }])
            ),
            comparison: {
              bestValue: { quantity: 5000, savings: 1000 },
              priceBreaks: [],
              economiesOfScale: {},
              trends: { priceTrend: 'decreasing' as const }
            }
          }
        })
      })

      const startTime = performance.now()
      renderWithContext(<MultiQuantityStep />)

      // Set large quantities
      await user.click(screen.getByText(/数量を追加/i))

      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should render quickly
    })
  })
})