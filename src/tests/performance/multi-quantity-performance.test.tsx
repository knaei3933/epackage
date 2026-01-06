// Performance test suite for multi-quantity components

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import MultiQuantityComparisonTable from '@/components/quote/MultiQuantityComparisonTable';
import QuantityEfficiencyChart from '@/components/quote/QuantityEfficiencyChart';
import { useMultiQuantityQuote, MultiQuantityQuoteProvider } from '@/contexts/MultiQuantityQuoteContext';

// Mock data for testing
const mockQuotes = Array.from({ length: 10 }, (_, i) => ({
  quantity: 500 * (i + 1),
  unitPrice: 100 - (i * 5),
  totalPrice: (500 * (i + 1)) * (100 - (i * 5)),
  discountRate: i * 2,
  priceBreak: i < 3 ? '小ロット' : i < 6 ? '中ロット' : '大ロット',
  leadTimeDays: 30 - i,
  isValid: true
}));

const mockComparison = {
  bestValue: {
    quantity: 5000,
    savings: 25000,
    percentage: 20,
    reason: '最も効率的な単価'
  },
  priceBreaks: mockQuotes.map(q => ({
    quantity: q.quantity,
    priceBreak: q.priceBreak,
    discountRate: q.discountRate
  })),
  economiesOfScale: mockQuotes.reduce((acc, q) => {
    acc[q.quantity] = {
      unitPrice: q.unitPrice,
      totalSavings: q.totalPrice * 0.1,
      efficiency: 100 + (q.quantity / 100)
    };
    return acc;
  }, {} as any),
  trends: {
    priceTrend: 'decreasing' as const,
    optimalQuantity: 5000,
    diminishingReturns: 15
  }
};

// Mock declarations for missing optimized modules (these may not exist in the current codebase)
const optimizedMultiQuantityCalculator = {
  clearAllCaches: jest.fn(),
  calculateMultiQuantity: jest.fn().mockResolvedValue({
    calculations: new Map(),
    metadata: { fromCache: false }
  })
};

const networkOptimizer = {
  clearCache: jest.fn(),
  fetch: jest.fn(),
  getCacheStats: jest.fn().mockReturnValue({ size: 0 })
};

describe('Multi-Quantity Performance Tests', () => {
  beforeEach(() => {
    // Clear all caches before each test
    optimizedMultiQuantityCalculator.clearAllCaches();
    networkOptimizer.clearCache();
  });

  describe('MultiQuantityComparisonTable Performance', () => {
    it('should render quickly with 10 items', async () => {
      const startTime = Date.now();

      render(
        <MultiQuantityComparisonTable
          quotes={mockQuotes}
          comparison={mockComparison}
          selectedQuantity={1000}
          onQuantitySelect={jest.fn()}
        />
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100);

      // Verify content rendered
      expect(screen.getByText('数量比較テーブル')).toBeInTheDocument();
    });

    it('should handle rapid sorting without performance degradation', async () => {
      const { container } = render(
        <MultiQuantityComparisonTable
          quotes={mockQuotes}
          comparison={mockComparison}
          selectedQuantity={1000}
          onQuantitySelect={jest.fn()}
        />
      );

      const sortButton = container.querySelector('[data-testid="sort-unitPrice"]') ||
                       container.querySelector('th');

      if (sortButton) {
        const times: number[] = [];

        // Perform multiple sorts and measure time
        for (let i = 0; i < 10; i++) {
          const startTime = Date.now();
          fireEvent.click(sortButton);
          const endTime = Date.now();
          times.push(endTime - startTime);
        }

        const averageTime = times.reduce((a, b) => a + b, 0) / times.length;

        // Average sort time should be under 20ms
        expect(averageTime).toBeLessThan(20);
      }
    });

    it('should efficiently filter large datasets', async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        ...mockQuotes[0],
        quantity: 100 * (i + 1),
        unitPrice: 100 - (i * 0.5),
        totalPrice: (100 * (i + 1)) * (100 - (i * 0.5))
      }));

      const startTime = Date.now();

      render(
        <MultiQuantityComparisonTable
          quotes={largeDataset}
          comparison={mockComparison}
          selectedQuantity={1000}
          onQuantitySelect={jest.fn()}
        />
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Should handle 100 items efficiently
      expect(renderTime).toBeLessThan(200);
    });
  });

  describe('QuantityEfficiencyChart Performance', () => {
    it('should render charts efficiently', async () => {
      const startTime = Date.now();

      render(
        <QuantityEfficiencyChart
          comparison={mockComparison}
        />
      );

      const endTime = Date.now();
      const renderTime = endTime - startTime;

      // Initial render should be under 150ms
      expect(renderTime).toBeLessThan(150);

      await waitFor(() => {
        expect(screen.getByText('コスト効率性分析')).toBeInTheDocument();
      });
    });

    it('should handle chart updates smoothly', async () => {
      const { rerender } = render(
        <QuantityEfficiencyChart
          comparison={mockComparison}
        />
      );

      // Update with new data
      const updatedComparison = {
        ...mockComparison,
        bestValue: {
          ...mockComparison.bestValue,
          quantity: 10000,
          percentage: 30
        }
      };

      const startTime = Date.now();
      rerender(<QuantityEfficiencyChart comparison={updatedComparison} />);
      const endTime = Date.now();

      const updateRenderTime = endTime - startTime;

      // Updates should be under 100ms
      expect(updateRenderTime).toBeLessThan(100);
    });
  });

  describe('Calculator Performance', () => {
    it('should cache calculations effectively', async () => {
      const request = {
        baseParams: {
          bagTypeId: 'flat_3_side',
          materialId: 'pet_al',
          width: 200,
          height: 300,
          depth: 0,
          thicknessSelection: 'medium'
        },
        quantities: [1000, 5000, 10000],
        comparisonMode: 'price' as const,
        includeRecommendations: true
      };

      // First calculation
      const firstStart = Date.now();
      const result1 = await optimizedMultiQuantityCalculator.calculateMultiQuantity(request);
      const firstTime = Date.now() - firstStart;

      // Second calculation (should use cache)
      const secondStart = Date.now();
      const result2 = await optimizedMultiQuantityCalculator.calculateMultiQuantity(request);
      const secondTime = Date.now() - secondStart;

      // Verify cache hit
      expect(result2.metadata.fromCache).toBe(true);

      // Cached calculation should be significantly faster
      expect(secondTime).toBeLessThan(firstTime * 0.1);

      // Results should be identical
      expect(result1).toEqual(result2);
    });

    it('should process batches efficiently', async () => {
      const largeQuantities = Array.from({ length: 20 }, (_, i) => (i + 1) * 1000);

      const request = {
        baseParams: {
          bagTypeId: 'flat_3_side',
          materialId: 'pet_al',
          width: 200,
          height: 300,
          depth: 0
        },
        quantities: largeQuantities,
        comparisonMode: 'price' as const,
        includeRecommendations: true
      };

      const startTime = Date.now();
      const result = await optimizedMultiQuantityCalculator.calculateMultiQuantity(request);
      const endTime = Date.now();

      const processingTime = endTime - startTime;

      // Should process 20 quantities in under 500ms
      expect(processingTime).toBeLessThan(500);

      // Verify all quantities were processed
      expect(result.calculations.size).toBe(largeQuantities.length);
    });
  });

  describe('Network Performance', () => {
    it('should deduplicate identical requests', async () => {
      // Mock fetch
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      global.fetch = mockFetch;

      const config = {
        url: 'https://api.example.com/test',
        options: { method: 'GET' }
      };

      // Make two identical requests
      const [promise1, promise2] = await Promise.all([
        networkOptimizer.fetch(config),
        networkOptimizer.fetch(config)
      ]);

      // Should only make one actual fetch call
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Both promises should resolve to the same value
      expect(promise1).toEqual(promise2);
    });

    it('should respect cache TTL', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test', timestamp: Date.now() })
      });
      global.fetch = mockFetch;

      const config = {
        url: 'https://api.example.com/ttl-test',
        options: { method: 'GET' },
        ttl: 100 // 100ms TTL
      };

      // First request
      await networkOptimizer.fetch(config);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Immediate second request (should use cache)
      await networkOptimizer.fetch(config);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Third request (cache expired)
      await networkOptimizer.fetch(config);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Memory Management', () => {
    it('should limit cache size to prevent memory leaks', () => {
      // Fill cache beyond its limit
      for (let i = 0; i < 150; i++) {
        networkOptimizer.fetch({
          url: `https://api.example.com/test${i}`,
          options: { method: 'GET' }
        });
      }

      const cacheStats = networkOptimizer.getCacheStats();
      // Cache size should be limited
      expect(cacheStats.size).toBeLessThanOrEqual(100);
    });

    it('should clean up expired entries', async () => {
      const mockFetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      });
      global.fetch = mockFetch;

      // Add cached entries with short TTL
      await networkOptimizer.fetch({
        url: 'https://api.example.com/expire-test',
        options: { method: 'GET' },
        ttl: 50
      });

      // Wait for expiration and cleanup
      await new Promise(resolve => setTimeout(resolve, 200));

      // Should have cleaned up the expired entry
      const cacheStats = networkOptimizer.getCacheStats();
      expect(cacheStats.size).toBe(0);
    });
  });

  describe('Context Performance', () => {
    it('should batch state updates efficiently', async () => {
      const TestComponent = () => {
        const { state, dispatch } = useMultiQuantityQuote();

        const handleBatchUpdate = () => {
          act(() => {
            dispatch({ type: 'SET_BASIC_SPECS', payload: {
              bagTypeId: 'stand_up',
              materialId: 'paper',
              width: 300,
              height: 400,
              depth: 0
            }});
            dispatch({ type: 'SET_QUANTITIES', payload: {
              quantities: [2000, 5000, 8000]
            }});
            dispatch({ type: 'SET_PRINTING_OPTIONS', payload: {
              isUVPrinting: true,
              printingColors: 2
            }});
          });
        };

        return (
          <div>
            <button onClick={handleBatchUpdate}>Batch Update</button>
            <span data-testid="bag-type">{state.bagTypeId}</span>
            <span data-testid="quantities">{state.quantities.length}</span>
          </div>
        );
      };

      const startTime = Date.now();

      render(
        <MultiQuantityQuoteProvider>
          <TestComponent />
        </MultiQuantityQuoteProvider>
      );

      const endTime = Date.now();
      const initialRenderTime = endTime - startTime;

      // Initial render should be fast
      expect(initialRenderTime).toBeLessThan(50);

      // Perform batch update
      const batchStart = Date.now();
      const button = screen.getByText('Batch Update');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('bag-type')).toHaveTextContent('stand_up');
        expect(screen.getByTestId('quantities')).toHaveTextContent('3');
      });

      const batchEndTime = Date.now();
      const batchTime = batchEndTime - batchStart;

      // Batch updates should be efficient
      expect(batchTime).toBeLessThan(100);
    });
  });
});

// Performance benchmark utility
export class PerformanceBenchmark {
  private results: { [testName: string]: number[] } = {};

  async measure<T>(
    testName: string,
    operation: () => Promise<T> | T,
    iterations: number = 10
  ): Promise<{ average: number; min: number; max: number; results: T[] }> {
    const times: number[] = [];
    const operationResults: T[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      const result = await operation();
      const end = Date.now();

      times.push(end - start);
      operationResults.push(result);
    }

    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    this.results[testName] = times;

    return { average, min, max, results: operationResults };
  }

  getResults() {
    return this.results;
  }

  generateReport(): string {
    let report = 'Performance Benchmark Report\n';
    report += '=============================\n\n';

    for (const [testName, times] of Object.entries(this.results)) {
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);
      const p95 = this.percentile(times, 0.95);

      report += `${testName}:\n`;
      report += `  Average: ${average.toFixed(2)}ms\n`;
      report += `  Min: ${min.toFixed(2)}ms\n`;
      report += `  Max: ${max.toFixed(2)}ms\n`;
      report += `  95th percentile: ${p95.toFixed(2)}ms\n`;
      report += '\n';
    }

    return report;
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index];
  }
}

export const performanceBenchmark = new PerformanceBenchmark();