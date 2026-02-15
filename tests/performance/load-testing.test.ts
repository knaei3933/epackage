import { test, expect, type Page } from '@playwright/test'

// Extend Window interface for FPS tracking
declare global {
  interface Window {
    fpsFrameCount?: number
  }
  interface Performance {
    memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    }
  }
}

test.describe('Performance and Load Testing', () => {
  test.describe('Multi-Quantity Calculation Performance', () => {
    test('should handle small quantity sets efficiently', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Fill form with 5 quantities
      await fillBasicForm(page)
      await setQuantities(page, ['100', '500', '1000', '2000', '5000'])

      // Measure calculation time
      const startTime = Date.now()
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')
      const calculationTime = Date.now() - startTime

      // Should complete within 2 seconds
      expect(calculationTime).toBeLessThan(2000)

      // Verify results
      await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="efficiency-chart"]')).toBeVisible()
    })

    test('should handle medium quantity sets efficiently', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Add more quantities
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="add-quantity-btn"]')
      }

      await fillBasicForm(page)
      await setQuantities(page, [
        '100', '250', '500', '750', '1000',
        '1500', '2000', '3000', '4000', '5000'
      ])

      // Measure calculation time
      const startTime = Date.now()
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')
      const calculationTime = Date.now() - startTime

      // Should complete within 5 seconds
      expect(calculationTime).toBeLessThan(5000)
    })

    test('should handle large quantity sets efficiently', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Add maximum quantities (50)
      for (let i = 0; i < 45; i++) {
        await page.click('[data-testid="add-quantity-btn"]')
      }

      await fillBasicForm(page)
      await setLargeQuantities(page)

      // Measure calculation time
      const startTime = Date.now()
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')
      const calculationTime = Date.now() - startTime

      // Should complete within 10 seconds
      expect(calculationTime).toBeLessThan(10000)

      // Verify all results are displayed
      const resultRows = page.locator('[data-testid="result-row"]')
      expect(await resultRows.count()).toBe(50)
    })

    test('should handle concurrent calculations', async ({ page, context }) => {
      // Create multiple pages to simulate concurrent users
      const pages = await Promise.all([
        context.newPage(),
        context.newPage(),
        context.newPage(),
        context.newPage(),
        context.newPage()
      ])

      // Navigate all pages to the quote form
      await Promise.all(pages.map(p => p.goto('/quote/multi-quantity')))

      // Start calculations simultaneously
      const startTime = Date.now()
      await Promise.all(pages.map(async (p, index) => {
        await fillBasicForm(p)
        await setQuantities(p, ['100', '500', '1000', '2000', '5000'])
        await p.click('[data-testid="calculate-btn"]')
      }))

      // Wait for all calculations to complete
      await Promise.all(pages.map(p =>
        p.waitForSelector('[data-testid="comparison-results"]')
      ))
      const totalTime = Date.now() - startTime

      // Should handle concurrent load efficiently
      expect(totalTime).toBeLessThan(8000)

      // Verify all calculations succeeded
      for (const p of pages) {
        await expect(p.locator('[data-testid="comparison-table"]')).toBeVisible()
        await p.close()
      }
    })
  })

  test.describe('Memory Management', () => {
    test('should not leak memory during repeated calculations', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Get initial memory usage
      const initialMemory = await getMemoryUsage(page)

      // Perform multiple calculations
      for (let i = 0; i < 10; i++) {
        await fillBasicForm(page)
        await setQuantities(page, ['100', '500', '1000', '2000', '5000'])
        await page.click('[data-testid="calculate-btn"]')
        await page.waitForSelector('[data-testid="comparison-results"]')

        // Reset form
        await page.click('[data-testid="reset-btn"]')
        await page.waitForSelector('[data-testid="multi-quantity-form"]')
      }

      // Check final memory usage
      const finalMemory = await getMemoryUsage(page)
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be minimal (< 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    test('should handle DOM efficiently', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Add many quantities
      for (let i = 0; i < 30; i++) {
        await page.click('[data-testid="add-quantity-btn"]')
      }

      // Check DOM node count
      const initialNodeCount = await getNodeCount(page)

      // Perform calculation
      await fillBasicForm(page)
      await setLargeQuantities(page)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Check DOM node count after calculation
      const finalNodeCount = await getNodeCount(page)
      const nodeIncrease = finalNodeCount - initialNodeCount

      // Node increase should be reasonable
      expect(nodeIncrease).toBeLessThan(1000)
    })
  })

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', async route => {
        // Add delay to simulate slow network
        await new Promise(resolve => setTimeout(resolve, 1000))
        await route.continue()
      })

      await page.goto('/quote/multi-quantity')

      // Should show loading state during initial load
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()

      // Fill form and calculate
      await fillBasicForm(page)
      await setQuantities(page, ['100', '500', '1000'])

      const startTime = Date.now()
      await page.click('[data-testid="calculate-btn"]')

      // Should show loading state for network requests
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()

      await page.waitForSelector('[data-testid="comparison-results"]')
      const totalTime = Date.now() - startTime

      // Should complete even with slow network
      expect(totalTime).toBeLessThan(20000)
    })

    test('should handle network timeouts', async ({ page }) => {
      // Simulate network timeout for API calls
      await page.route('/api/quotes/multi-quantity', route => {
        // Don't respond to simulate timeout
      })

      await page.goto('/quote/multi-quantity')

      await fillBasicForm(page)
      await setQuantities(page, ['100', '500', '1000'])

      // Should timeout gracefully
      await page.click('[data-testid="calculate-btn"]')

      // Should show timeout error
      await expect(page.locator('[data-testid="timeout-error"]')).toBeVisible({ timeout: 30000 })
    })

    test('should handle network failures gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('/api/quotes/multi-quantity', route => {
        route.abort('failed')
      })

      await page.goto('/quote/multi-quantity')

      await fillBasicForm(page)
      await setQuantities(page, ['100', '500', '1000'])

      await page.click('[data-testid="calculate-btn"]')

      // Should show network error
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
    })
  })

  test.describe('Browser Performance', () => {
    test('should maintain good FPS during interactions', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Monitor FPS while interacting with form
      const fps = await measureFPS(page, async () => {
        // Add and remove quantities rapidly
        for (let i = 0; i < 10; i++) {
          await page.click('[data-testid="add-quantity-btn"]')
          await page.keyboard.type(`${100 + i * 100}`)
          await page.keyboard.press('Tab')
        }
      })

      // Should maintain 30+ FPS
      expect(fps).toBeGreaterThan(30)
    })

    test('should have good first contentful paint', async ({ page }) => {
      const navigationStart = Date.now()
      await page.goto('/quote/multi-quantity')

      // Wait for first meaningful content
      await page.waitForSelector('[data-testid="multi-quantity-form"]')
      const fcp = Date.now() - navigationStart

      // First contentful paint should be under 2 seconds
      expect(fcp).toBeLessThan(2000)
    })

    test('should have good time to interactive', async ({ page }) => {
      const navigationStart = Date.now()
      await page.goto('/quote/multi-quantity')

      // Wait for page to be fully interactive
      await page.waitForSelector('[data-testid="calculate-btn"]:enabled')
      await page.waitForFunction(() => {
        return document.readyState === 'complete' &&
               window.performance?.getEntriesByType?.('navigation')?.[0]?.loadEventEnd > 0
      })
      const tti = Date.now() - navigationStart

      // Time to interactive should be under 3 seconds
      expect(tti).toBeLessThan(3000)
    })
  })

  test.describe('Bundle Performance', () => {
    test('should load efficiently on slow connections', async ({ page }) => {
      // Enable resource monitoring
      const resources: string[] = []
      await page.route('**/*', route => {
        const request = route.request()
        resources.push(request.url())
        route.continue()
      })

      await page.goto('/quote/multi-quantity')

      // Count loaded resources
      const jsResources = resources.filter(url => url.endsWith('.js')).length
      const cssResources = resources.filter(url => url.endsWith('.css')).length

      // Should have reasonable number of resources
      expect(jsResources).toBeLessThan(10)
      expect(cssResources).toBeLessThan(5)
    })

    test('should use efficient asset loading', async ({ page }) => {
      const responses: { url: string, size: number }[] = []

      await page.route('**/*', async route => {
        const response = await route.fetch()
        const buffer = await response.body()
        responses.push({
          url: route.request().url(),
          size: buffer.length
        })
        await route.fulfill({ response })
      })

      await page.goto('/quote/multi-quantity')

      // Check total bundle size
      const jsSize = responses
        .filter(r => r.url.endsWith('.js'))
        .reduce((sum, r) => sum + r.size, 0)

      const cssSize = responses
        .filter(r => r.url.endsWith('.css'))
        .reduce((sum, r) => sum + r.size, 0)

      // Bundle sizes should be reasonable
      expect(jsSize).toBeLessThan(1024 * 1024) // < 1MB JS
      expect(cssSize).toBeLessThan(100 * 1024) // < 100KB CSS
    })
  })

  test.describe('Stress Testing', () => {
    test('should handle rapid form interactions', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Rapidly change form values
      await fillBasicForm(page)

      const startTime = Date.now()
      for (let i = 0; i < 100; i++) {
        await page.fill('[data-testid="width-input"]', (200 + i).toString())
        await page.fill('[data-testid="height-input"]', (300 + i).toString())
        await page.keyboard.press('Tab')
      }
      const interactionTime = Date.now() - startTime

      // Should remain responsive
      expect(interactionTime).toBeLessThan(5000)
      expect(page.locator('[data-testid="width-input"]')).toHaveValue('299')
    })

    test('should handle quantity management efficiently', async ({ page }) => {
      await page.goto('/quote/multi-quantity')

      // Add and remove quantities rapidly
      const startTime = Date.now()
      for (let i = 0; i < 20; i++) {
        await page.click('[data-testid="add-quantity-btn"]')
        await page.keyboard.type(`${100 + i * 100}`)
        await page.keyboard.press('Tab')
      }

      // Remove half of them
      for (let i = 0; i < 10; i++) {
        await page.click('[data-testid="remove-quantity-btn"]:last-child')
      }
      const operationTime = Date.now() - startTime

      // Should complete quickly
      expect(operationTime).toBeLessThan(3000)

      // Verify final state
      const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
      expect(await quantityInputs.count()).toBe(15) // 5 default + 20 added - 10 removed
    })
  })
})

// Helper functions
async function fillBasicForm(page: any) {
  await page.selectOption('[data-testid="bag-type-select"]', 'stand_up_pouch')
  await page.selectOption('[data-testid="material-select"]', 'kppe_al')
  await page.fill('[data-testid="width-input"]', '250')
  await page.fill('[data-testid="height-input"]', '350')
  await page.fill('[data-testid="depth-input"]', '100')
  await page.check('[data-testid="uv-printing-toggle"]')
}

async function setQuantities(page: any, quantities: string[]) {
  const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
  for (let i = 0; i < Math.min(quantities.length, await quantityInputs.count()); i++) {
    await quantityInputs.nth(i).fill('')
    await quantityInputs.nth(i).fill(quantities[i])
  }
}

async function setLargeQuantities(page: Page) {
  const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
  const count = await quantityInputs.count()

  for (let i = 0; i < count; i++) {
    await quantityInputs.nth(i).fill('')
    await quantityInputs.nth(i).fill((i + 1).toString())
  }
}

async function getMemoryUsage(page: Page): Promise<number> {
  try {
    const metrics = await page.evaluate(() => {
      return performance.memory?.usedJSHeapSize || 0
    })
    return metrics || 0
  } catch {
    return 0
  }
}

async function getNodeCount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    return document.querySelectorAll('*').length
  })
}

async function measureFPS(page: Page, action: () => Promise<void>): Promise<number> {
  const frames: number[] = []

  // Start FPS monitoring
  await page.evaluate(() => {
    let frameCount = 0
    let lastTime = performance.now()

    function countFrame() {
      frameCount++
      const currentTime = performance.now()
      if (currentTime - lastTime >= 100) {
        window.fpsFrameCount = frameCount
        frameCount = 0
        lastTime = currentTime
      }
      requestAnimationFrame(countFrame)
    }

    requestAnimationFrame(countFrame)
  })

  await action()

  // Stop monitoring and get average FPS
  const fps = await page.evaluate(() => {
    return window.fpsFrameCount || 60
  })

  return fps
}