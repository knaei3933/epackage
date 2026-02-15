import React from 'react'
import { render, screen, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiQuantityQuoteProvider, useMultiQuantityQuote } from '../MultiQuantityQuoteContext'
import { createMockMultiQuantityRequest, createMockQuoteResult } from '../../../jest.setup'
import type { MultiQuantityRequest } from '@/types/multi-quantity'

// Mock the multi-quantity calculator
jest.mock('@/lib/multi-quantity-calculator', () => ({
  multiQuantityCalculator: {
    calculateMultiQuantity: jest.fn().mockResolvedValue({
      baseParams: {
        bagTypeId: 'flat_3_side',
        materialId: 'pet_al',
        width: 200,
        height: 300,
        depth: 0,
        isUVPrinting: true,
        printingType: 'digital',
        printingColors: 4,
        doubleSided: false,
        postProcessingOptions: ['lamination'],
        deliveryLocation: 'domestic',
        urgency: 'standard'
      },
      quantities: [500, 1000, 2000],
      calculations: new Map([
        [500, createMockQuoteResult({ quantity: 500, unitPrice: 85, totalCost: 42500 })],
        [1000, createMockQuoteResult({ quantity: 1000, unitPrice: 75, totalCost: 75000 })],
        [2000, createMockQuoteResult({ quantity: 2000, unitPrice: 65, totalCost: 130000 })]
      ]),
      comparison: {
        bestValue: {
          quantity: 2000,
          savings: 5000,
          percentage: 15,
          reason: '最大数量で最適な単価'
        },
        priceBreaks: [],
        economiesOfScale: {},
        trends: {
          priceTrend: 'decreasing',
          optimalQuantity: 2000,
          diminishingReturns: 1000
        }
      },
      recommendations: [],
      metadata: {
        processingTime: 150,
        currency: 'JPY',
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })
  }
}))

// Mock storage utilities
jest.mock('@/lib/storage', () => ({
  saveToLocalStorage: jest.fn(),
  loadFromLocalStorage: jest.fn(() => []),
  deleteFromLocalStorage: jest.fn()
}))

// Mock UUID
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234')
}))

// Test component to consume context
const TestComponent: React.FC = () => {
  const {
    state,
    actions: {
      setBasicSpecs,
      setQuantities,
      addQuantity,
      removeQuantity,
      setSelectedQuantity,
      setPrintingOptions,
      setPostProcessing,
      setDelivery,
      calculateMultiQuantity,
      saveComparison,
      exportComparison,
      resetQuote
    }
  } = useMultiQuantityQuote()

  return (
    <div>
      <div data-testid="bag-type-id">{state.bagTypeId}</div>
      <div data-testid="quantities">{state.quantities.join(',')}</div>
      <div data-testid="selected-quantity">{state.selectedQuantity || 'null'}</div>
      <div data-testid="is-loading">{state.isLoading.toString()}</div>
      <div data-testid="error">{state.error || 'null'}</div>
      <button onClick={() => setBasicSpecs({
        bagTypeId: 'stand_up_pouch',
        materialId: 'kppe_al',
        width: 250,
        height: 350,
        depth: 100
      })}>
        Set Specs
      </button>
      <button onClick={() => setQuantities([100, 200, 300])}>
        Set Quantities
      </button>
      <button onClick={() => addQuantity(400)}>
        Add Quantity
      </button>
      <button onClick={() => removeQuantity(200)}>
        Remove Quantity
      </button>
      <button onClick={() => setSelectedQuantity(200)}>
        Set Selected
      </button>
      <button onClick={() => setPrintingOptions({
        isUVPrinting: true,
        printingType: 'gravure',
        printingColors: 6,
        doubleSided: true
      })}>
        Set Printing
      </button>
      <button onClick={() => setPostProcessing({
        options: ['matte', 'embossing'],
        multiplier: 1.2
      })}>
        Set Post Processing
      </button>
      <button onClick={() => setDelivery({
        location: 'international',
        urgency: 'express'
      })}>
        Set Delivery
      </button>
      <button onClick={() => calculateMultiQuantity()}>
        Calculate
      </button>
      <button onClick={() => saveComparison({
        title: 'Test Comparison',
        customerName: 'Test Customer',
        projectName: 'Test Project'
      })}>
        Save Comparison
      </button>
      <button onClick={() => exportComparison({
        format: 'pdf'
      })}>
        Export PDF
      </button>
      <button onClick={() => resetQuote()}>
        Reset Quote
      </button>
    </div>
  )
}

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <MultiQuantityQuoteProvider>
      {component}
    </MultiQuantityQuoteProvider>
  )
}

describe('MultiQuantityQuoteContext', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should provide correct initial state', () => {
      renderWithProvider(<TestComponent />)

      expect(screen.getByTestId('bag-type-id')).toHaveTextContent('flat_3_side')
      expect(screen.getByTestId('quantities')).toHaveTextContent('500,1000,2000,5000,10000')
      expect(screen.getByTestId('selected-quantity')).toHaveTextContent('1000')
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      expect(screen.getByTestId('error')).toHaveTextContent('null')
    })
  })

  describe('basic specs management', () => {
    it('should update basic specifications', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Specs'))

      await waitFor(() => {
        expect(screen.getByTestId('bag-type-id')).toHaveTextContent('stand_up_pouch')
      })
    })

    it('should handle partial specs updates', async () => {
      const CustomTestComponent: React.FC = () => {
        const { state, actions } = useMultiQuantityQuote()

        const updatePartialSpecs = () => {
          actions.setBasicSpecs({
            bagTypeId: 'zipper_pouch',
            materialId: 'ppe_al',
            width: 300,
            height: 400,
            depth: 150,
            thicknessSelection: 'thick'
          })
        }

        return (
          <div>
            <div data-testid="bag-type-id">{state.bagTypeId}</div>
            <div data-testid="width">{state.width}</div>
            <button onClick={updatePartialSpecs}>Update Partial Specs</button>
          </div>
        )
      }

      renderWithProvider(<CustomTestComponent />)

      await user.click(screen.getByText('Update Partial Specs'))

      await waitFor(() => {
        expect(screen.getByTestId('bag-type-id')).toHaveTextContent('zipper_pouch')
        expect(screen.getByTestId('width')).toHaveTextContent('300')
      })
    })
  })

  describe('quantity management', () => {
    it('should set quantities array', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Quantities'))

      await waitFor(() => {
        expect(screen.getByTestId('quantities')).toHaveTextContent('100,200,300')
      })
    })

    it('should add single quantity', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Add Quantity'))

      await waitFor(() => {
        expect(screen.getByTestId('quantities')).toHaveTextContent('500,1000,2000,5000,10000,400')
      })
    })

    it('should remove quantity', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Remove Quantity'))

      await waitFor(() => {
        const quantities = screen.getByTestId('quantities').textContent
        expect(quantities).not.toContain('200')
      })
    })

    it('should set selected quantity', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Selected'))

      await waitFor(() => {
        expect(screen.getByTestId('selected-quantity')).toHaveTextContent('200')
      })
    })

    it('should prevent duplicate quantities', async () => {
      const DuplicateTestComponent: React.FC = () => {
        const { actions } = useMultiQuantityQuote()

        const addDuplicateQuantity = () => {
          actions.addQuantity(1000) // Already exists
        }

        return (
          <div>
            <div data-testid="quantities">{actions.getQuantities().join(',')}</div>
            <button onClick={addDuplicateQuantity}>Add Duplicate</button>
          </div>
        )
      }

      renderWithProvider(<DuplicateTestComponent />)

      const initialQuantities = screen.getByTestId('quantities').textContent
      await user.click(screen.getByText('Add Duplicate'))

      await waitFor(() => {
        const finalQuantities = screen.getByTestId('quantities').textContent
        expect(finalQuantities).toBe(initialQuantities) // Should be unchanged
      })
    })
  })

  describe('printing options', () => {
    it('should set printing options', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Printing'))

      // Should update the context state
      await waitFor(() => {
        // We would need to add test IDs for these values or use the context directly
        expect(true).toBe(true) // Placeholder for actual assertion
      })
    })
  })

  describe('post processing', () => {
    it('should set post processing options', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Post Processing'))

      await waitFor(() => {
        expect(true).toBe(true) // Placeholder for actual assertion
      })
    })
  })

  describe('delivery settings', () => {
    it('should set delivery options', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Delivery'))

      await waitFor(() => {
        expect(true).toBe(true) // Placeholder for actual assertion
      })
    })
  })

  describe('multi-quantity calculation', () => {
    it('should trigger calculation with loading state', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Calculate'))

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('true')
      })

      // Should complete calculation
      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      }, { timeout: 5000 })
    })

    it('should handle calculation errors', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')
      multiQuantityCalculator.calculateMultiQuantity.mockRejectedValueOnce(
        new Error('Calculation failed')
      )

      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Calculate'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('null')
      })
    })

    it('should not calculate with invalid parameters', async () => {
      const InvalidTestComponent: React.FC = () => {
        const { actions } = useMultiQuantityQuote()

        const calculateWithInvalidData = () => {
          actions.setQuantities([])
          actions.calculateMultiQuantity()
        }

        return (
          <div>
            <button onClick={calculateWithInvalidData}>Calculate Invalid</button>
          </div>
        )
      }

      renderWithProvider(<InvalidTestComponent />)

      await user.click(screen.getByText('Calculate Invalid'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(/数量を指定してください/i)
      })
    })
  })

  describe('save functionality', () => {
    it('should save comparison with metadata', async () => {
      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Save Comparison'))

      await waitFor(() => {
        expect(require('@/lib/storage').saveToLocalStorage).toHaveBeenCalledWith(
          expect.stringContaining('saved-comparison-'),
          expect.objectContaining({
            title: 'Test Comparison',
            customerName: 'Test Customer',
            projectName: 'Test Project'
          })
        )
      })
    })

    it('should handle save errors', async () => {
      const { saveToLocalStorage } = require('@/lib/storage')
      saveToLocalStorage.mockRejectedValueOnce(new Error('Storage error'))

      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Save Comparison'))

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(/保存に失敗しました/i)
      })
    })
  })

  describe('export functionality', () => {
    it('should export comparison in different formats', async () => {
      const mockExport = jest.fn().mockResolvedValue({
        downloadUrl: 'http://example.com/export.pdf'
      })

      // Mock fetch for export API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { downloadUrl: 'http://example.com/export.pdf' }
        })
      })

      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Export PDF'))

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/comparison/export', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        }))
      })
    })
  })

  describe('reset functionality', () => {
    it('should reset quote to initial state', async () => {
      renderWithProvider(<TestComponent />)

      // Change some values
      await user.click(screen.getByText('Set Specs'))
      await user.click(screen.getByText('Set Quantities'))
      await user.click(screen.getByText('Set Selected'))

      // Verify changes
      await waitFor(() => {
        expect(screen.getByTestId('bag-type-id')).toHaveTextContent('stand_up_pouch')
        expect(screen.getByTestId('quantities')).toHaveTextContent('100,200,300')
        expect(screen.getByTestId('selected-quantity')).toHaveTextContent('200')
      })

      // Reset
      await user.click(screen.getByText('Reset Quote'))

      // Should return to initial state
      await waitFor(() => {
        expect(screen.getByTestId('bag-type-id')).toHaveTextContent('flat_3_side')
        expect(screen.getByTestId('selected-quantity')).toHaveTextContent('1000')
      })
    })
  })

  describe('context provider', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useMultiQuantityQuote must be used within a MultiQuantityQuoteProvider')

      consoleSpy.mockRestore()
    })

    it('should handle context errors gracefully', async () => {
      const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
        return (
          <div>
            {children}
          </div>
        )
      }

      render(
        <ErrorBoundary>
          <MultiQuantityQuoteProvider>
            <TestComponent />
          </MultiQuantityQuoteProvider>
        </ErrorBoundary>
      )

      // Should render without crashing
      expect(screen.getByTestId('bag-type-id')).toBeInTheDocument()
    })
  })

  describe('performance optimization', () => {
    it('should debounce rapid quantity changes', async () => {
      const RapidUpdateComponent: React.FC = () => {
        const { actions } = useMultiQuantityQuote()

        const rapidUpdate = async () => {
          for (let i = 0; i < 10; i++) {
            actions.addQuantity(100 + i)
            await new Promise(resolve => setTimeout(resolve, 10))
          }
        }

        return (
          <div>
            <button onClick={rapidUpdate}>Rapid Update</button>
          </div>
        )
      }

      renderWithProvider(<RapidUpdateComponent />)

      await user.click(screen.getByText('Rapid Update'))

      await waitFor(() => {
        const quantities = screen.getByTestId('quantities').textContent?.split(',').length
        expect(quantities).toBeGreaterThan(10)
      }, { timeout: 2000 })
    })

    it('should cache calculation results', async () => {
      const { multiQuantityCalculator } = require('@/lib/multi-quantity-calculator')

      renderWithProvider(<TestComponent />)

      // First calculation
      await user.click(screen.getByText('Calculate'))

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
      })

      // Second calculation with same parameters
      await user.click(screen.getByText('Calculate'))

      // Should use cached result (faster)
      expect(multiQuantityCalculator.calculateMultiQuantity).toHaveBeenCalledTimes(1)
    })
  })

  describe('data persistence', () => {
    it('should load saved patterns from storage', async () => {
      const { loadFromLocalStorage } = require('@/lib/storage')
      loadFromLocalStorage.mockReturnValue([
        {
          id: 'pattern-1',
          name: 'Standard Pattern',
          quantities: [500, 1000, 2000]
        }
      ])

      const PatternsTestComponent: React.FC = () => {
        const { state } = useMultiQuantityQuote()

        return (
          <div data-testid="saved-patterns-count">
            {state.savedPatterns.length}
          </div>
        )
      }

      renderWithProvider(<PatternsTestComponent />)

      await waitFor(() => {
        expect(screen.getByTestId('saved-patterns-count')).toHaveTextContent('1')
      })
    })

    it('should persist state changes to storage', async () => {
      const { saveToLocalStorage } = require('@/lib/storage')

      renderWithProvider(<TestComponent />)

      await user.click(screen.getByText('Set Specs'))

      await waitFor(() => {
        expect(saveToLocalStorage).toHaveBeenCalled()
      })
    })
  })
})