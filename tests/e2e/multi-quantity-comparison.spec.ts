import { test, expect, devices } from '@playwright/test'

// Define test data
const testQuoteData = {
  bagType: 'stand_up_pouch',
  material: 'kppe_al',
  width: '250',
  height: '350',
  depth: '100',
  quantities: ['100', '500', '1000', '5000'],
  uvPrinting: true,
  printingType: 'gravure',
  colors: '6',
  doubleSided: true,
  postProcessing: ['lamination'],
  deliveryLocation: 'international',
  urgency: 'express'
}

test.describe('Multi-Quantity Comparison System', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the quote page
    await page.goto('/quote/multi-quantity')

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('多数量比較見積もり')
  })

  test.describe('basic functionality', () => {
    test('should load the multi-quantity quote page', async ({ page }) => {
      await expect(page.locator('[data-testid="multi-quantity-form"]')).toBeVisible()
      await expect(page.locator('[data-testid="quantity-inputs"]')).toBeVisible()
      await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible()
    })

    test('should fill basic specifications', async ({ page }) => {
      // Select bag type
      await page.selectOption('[data-testid="bag-type-select"]', testQuoteData.bagType)

      // Select material
      await page.selectOption('[data-testid="material-select"]', testQuoteData.material)

      // Fill dimensions
      await page.fill('[data-testid="width-input"]', testQuoteData.width)
      await page.fill('[data-testid="height-input"]', testQuoteData.height)
      await page.fill('[data-testid="depth-input"]', testQuoteData.depth)

      // Verify values are set
      await expect(page.locator('[data-testid="bag-type-select"]')).toHaveValue(testQuoteData.bagType)
      await expect(page.locator('[data-testid="material-select"]')).toHaveValue(testQuoteData.material)
      await expect(page.locator('[data-testid="width-input"]')).toHaveValue(testQuoteData.width)
    })

    test('should configure printing options', async ({ page }) => {
      // Enable UV printing
      await page.check('[data-testid="uv-printing-toggle"]')

      // Select printing type
      await page.selectOption('[data-testid="printing-type-select"]', testQuoteData.printingType)

      // Set number of colors
      await page.fill('[data-testid="colors-input"]', testQuoteData.colors)

      // Enable double-sided printing
      await page.check('[data-testid="double-sided-toggle"]')

      // Verify options
      await expect(page.locator('[data-testid="uv-printing-toggle"]')).toBeChecked()
      await expect(page.locator('[data-testid="printing-type-select"]')).toHaveValue(testQuoteData.printingType)
      await expect(page.locator('[data-testid="colors-input"]')).toHaveValue(testQuoteData.colors)
      await expect(page.locator('[data-testid="double-sided-toggle"]')).toBeChecked()
    })

    test('should set multiple quantities', async ({ page }) => {
      // Clear existing quantities and set new ones
      const quantityInputs = page.locator('[data-testid^="quantity-input-"]')

      for (let i = 0; i < testQuoteData.quantities.length; i++) {
        await quantityInputs.nth(i).fill('')
        await quantityInputs.nth(i).fill(testQuoteData.quantities[i])
      }

      // Verify quantities
      for (let i = 0; i < testQuoteData.quantities.length; i++) {
        await expect(quantityInputs.nth(i)).toHaveValue(testQuoteData.quantities[i])
      }
    })

    test('should add and remove quantities', async ({ page }) => {
      const initialCount = await page.locator('[data-testid^="quantity-input-"]').count()

      // Add new quantity
      await page.click('[data-testid="add-quantity-btn"]')

      const newCount = await page.locator('[data-testid^="quantity-input-"]').count()
      expect(newCount).toBe(initialCount + 1)

      // Fill new quantity
      const newQuantityInput = page.locator('[data-testid^="quantity-input-"]').last()
      await newQuantityInput.fill('7500')

      // Remove quantity
      await page.click('[data-testid="remove-quantity-btn"]:last-child')

      const finalCount = await page.locator('[data-testid^="quantity-input-"]').count()
      expect(finalCount).toBe(initialCount)
    })
  })

  test.describe('calculation and comparison', () => {
    test('should calculate multi-quantity quotes', async ({ page }) => {
      // Fill all required fields
      await page.selectOption('[data-testid="bag-type-select"]', testQuoteData.bagType)
      await page.selectOption('[data-testid="material-select"]', testQuoteData.material)
      await page.fill('[data-testid="width-input"]', testQuoteData.width)
      await page.fill('[data-testid="height-input"]', testQuoteData.height)

      // Set quantities
      const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
      for (let i = 0; i < testQuoteData.quantities.length; i++) {
        await quantityInputs.nth(i).fill('')
        await quantityInputs.nth(i).fill(testQuoteData.quantities[i])
      }

      // Start calculation
      await page.click('[data-testid="calculate-btn"]')

      // Should show loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible()
      await expect(page.locator('text=計算中...')).toBeVisible()

      // Wait for calculation to complete
      await expect(page.locator('[data-testid="calculation-complete"]')).toBeVisible({ timeout: 15000 })

      // Should show comparison results
      await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="efficiency-chart"]')).toBeVisible()
    })

    test('should display comparison results correctly', async ({ page }) => {
      // Pre-fill and calculate
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Check table headers
      await expect(page.locator('text=数量')).toBeVisible()
      await expect(page.locator('text=単価')).toBeVisible()
      await expect(page.locator('text=合計価格')).toBeVisible()
      await expect(page.locator('text=割引率')).toBeVisible()
      await expect(page.locator('text=納期')).toBeVisible()

      // Check data rows
      for (const quantity of testQuoteData.quantities) {
        await expect(page.locator(`text=${quantity}`)).toBeVisible()
      }

      // Check best value indicator
      await expect(page.locator('[data-testid="best-value-badge"]')).toBeVisible()
    })

    test('should allow selecting quantities for comparison', async ({ page }) => {
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Select a quantity
      const selectButtons = page.locator('[data-testid="select-quantity-btn"]')
      await expect(selectButtons).toHaveCount(testQuoteData.quantities.length)

      await selectButtons.nth(2).click() // Select the third quantity

      // Should show selection state
      await expect(page.locator('[data-testid="selected-quantity-indicator"]')).toBeVisible()
      await expect(page.locator(`text=${testQuoteData.quantities[2]}個が選択されています`)).toBeVisible()
    })

    test('should display recommendations', async ({ page }) => {
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="recommendations"]')

      // Should show at least one recommendation
      await expect(page.locator('[data-testid^="recommendation-"]')).toHaveCount.toBeGreaterThan(0)

      // Check recommendation content
      await expect(page.locator('text=推奨プラン')).toBeVisible()
      await expect(page.locator('[data-testid="recommendation-title"]')).toBeVisible()
      await expect(page.locator('[data-testid="recommendation-description"]')).toBeVisible()
    })
  })

  test.describe('save and export functionality', () => {
    test('should save comparison results', async ({ page }) => {
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Click save button
      await page.click('[data-testid="save-comparison-btn"]')

      // Should open save modal
      await expect(page.locator('[data-testid="save-modal"]')).toBeVisible()
      await expect(page.locator('[data-testid="save-title-input"]')).toBeVisible()

      // Fill save form
      await page.fill('[data-testid="save-title-input"]', 'Test Comparison')
      await page.fill('[data-testid="save-description-input"]', 'Test multi-quantity comparison')

      // Save
      await page.click('[data-testid="confirm-save-btn"]')

      // Should show success message
      await expect(page.locator('[data-testid="save-success"]')).toBeVisible()
    })

    test('should export to different formats', async ({ page }) => {
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Test PDF export
      await page.click('[data-testid="export-btn"]')
      await page.click('[data-testid="export-pdf-btn"]')

      // Should trigger download
      const downloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="confirm-export-pdf"]')
      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/comparison.*\.pdf$/)

      // Test Excel export
      await page.click('[data-testid="export-btn"]')
      await page.click('[data-testid="export-excel-btn"]')

      const excelDownloadPromise = page.waitForEvent('download')
      await page.click('[data-testid="confirm-export-excel"]')
      const excelDownload = await excelDownloadPromise
      expect(excelDownload.suggestedFilename()).toMatch(/comparison.*\.xlsx$/)
    })

    test('should share comparison results', async ({ page }) => {
      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')

      // Click share button
      await page.click('[data-testid="share-btn"]')

      // Should open share modal
      await expect(page.locator('[data-testid="share-modal"]')).toBeVisible()

      // Set share permissions
      await page.selectOption('[data-testid="share-permissions"]', 'view')

      // Generate share link
      await page.click('[data-testid="generate-share-link"]')

      // Should show share link
      await expect(page.locator('[data-testid="share-link"]')).toBeVisible()
      await expect(page.locator('[data-testid="share-link"]')).toHaveValue(/https:\/\//)

      // Copy share link
      await page.click('[data-testid="copy-share-link"]')
      await expect(page.locator('[data-testid="copy-success"]')).toBeVisible()
    })
  })

  test.describe('responsive design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })

      await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible()

      // Should have mobile-optimized controls
      await expect(page.locator('[data-testid="mobile-quantity-controls"]')).toBeVisible()
      await expect(page.locator('[data-testid="mobile-comparison-table"]')).toBeVisible()

      // Test mobile interaction
      await page.selectOption('[data-testid="bag-type-select"]', testQuoteData.bagType)
      await page.tap('[data-testid="add-quantity-btn"]')

      const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
      await expect(quantityInputs).toHaveCount(6) // 5 default + 1 added
    })

    test('should adapt to tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible()

      // Should show tablet-optimized layout
      await expect(page.locator('[data-testid="tablet-comparison-table"]')).toBeVisible()
      await expect(page.locator('[data-testid="tablet-chart"]')).toBeVisible()
    })
  })

  test.describe('error handling', () => {
    test('should handle validation errors', async ({ page }) => {
      // Try to calculate without required fields
      await page.click('[data-testid="calculate-btn"]')

      // Should show validation errors
      await expect(page.locator('[data-testid="validation-error"]')).toBeVisible()
      await expect(page.locator('text=必須項目を入力してください')).toBeVisible()

      // Fill only some fields
      await page.selectOption('[data-testid="bag-type-select"]', testQuoteData.bagType)
      await page.click('[data-testid="calculate-btn"]')

      // Should show specific missing field errors
      await expect(page.locator('[data-testid="field-error-material"]')).toBeVisible()
    })

    test('should handle API errors gracefully', async ({ page }) => {
      // Mock API error
      await page.route('/api/quotes/multi-quantity', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: { message: 'Internal server error' }
          })
        })
      })

      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')

      // Should show error message
      await expect(page.locator('[data-testid="api-error"]')).toBeVisible()
      await expect(page.locator('text=計算に失敗しました')).toBeVisible()

      // Should provide retry option
      await expect(page.locator('[data-testid="retry-btn"]')).toBeVisible()
    })

    test('should handle network errors', async ({ page }) => {
      // Mock network failure
      await page.route('/api/quotes/multi-quantity', route => {
        route.abort('failed')
      })

      await fillQuoteForm(page, testQuoteData)
      await page.click('[data-testid="calculate-btn"]')

      // Should show network error message
      await expect(page.locator('[data-testid="network-error"]')).toBeVisible()
      await expect(page.locator('text=接続エラー')).toBeVisible()
    })
  })

  test.describe('performance', () => {
    test('should load quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/quote/multi-quantity')
      await expect(page.locator('[data-testid="multi-quantity-form"]')).toBeVisible()
      const loadTime = Date.now() - startTime

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })

    test('should handle large calculations efficiently', async ({ page }) => {
      // Set many quantities
      for (let i = 0; i < 5; i++) {
        await page.click('[data-testid="add-quantity-btn"]')
      }

      const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
      await expect(quantityInputs).toHaveCount(10)

      // Fill with test data
      await fillQuoteForm(page, testQuoteData)

      // Measure calculation time
      const startTime = Date.now()
      await page.click('[data-testid="calculate-btn"]')
      await page.waitForSelector('[data-testid="comparison-results"]')
      const calculationTime = Date.now() - startTime

      // Should complete within 10 seconds
      expect(calculationTime).toBeLessThan(10000)
    })
  })
})

// Helper function to fill the quote form
async function fillQuoteForm(page: any, data: any) {
  await page.selectOption('[data-testid="bag-type-select"]', data.bagType)
  await page.selectOption('[data-testid="material-select"]', data.material)
  await page.fill('[data-testid="width-input"]', data.width)
  await page.fill('[data-testid="height-input"]', data.height)
  await page.fill('[data-testid="depth-input"]', data.depth)

  if (data.uvPrinting) {
    await page.check('[data-testid="uv-printing-toggle"]')
  }

  if (data.printingType) {
    await page.selectOption('[data-testid="printing-type-select"]', data.printingType)
  }

  if (data.colors) {
    await page.fill('[data-testid="colors-input"]', data.colors)
  }

  if (data.doubleSided) {
    await page.check('[data-testid="double-sided-toggle"]')
  }

  if (data.postProcessing) {
    for (const option of data.postProcessing) {
      await page.check(`[data-testid="post-processing-${option}"]`)
    }
  }

  if (data.deliveryLocation) {
    await page.selectOption('[data-testid="delivery-location-select"]', data.deliveryLocation)
  }

  if (data.urgency) {
    await page.selectOption('[data-testid="urgency-select"]', data.urgency)
  }

  // Set quantities
  const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
  for (let i = 0; i < data.quantities.length; i++) {
    await quantityInputs.nth(i).fill('')
    await quantityInputs.nth(i).fill(data.quantities[i])
  }
}

// Cross-browser compatibility tests
test.describe('Cross-browser compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test.describe(`Browser: ${browserName}`, () => {
      test.use({ ...devices[browserName === 'chromium' ? 'Desktop Chrome' : browserName === 'firefox' ? 'Desktop Firefox' : 'Desktop Safari'] })

      test('should work consistently across browsers', async ({ page }) => {
        await page.goto('/quote/multi-quantity')

        // Test basic functionality
        await expect(page.locator('h1')).toContainText('多数量比較見積もり')
        await expect(page.locator('[data-testid="multi-quantity-form"]')).toBeVisible()

        // Test form interactions
        await page.selectOption('[data-testid="bag-type-select"]', 'stand_up_pouch')
        await page.fill('[data-testid="width-input"]', '250')

        // Verify values are set
        await expect(page.locator('[data-testid="bag-type-select"]')).toHaveValue('stand_up_pouch')
        await expect(page.locator('[data-testid="width-input"]')).toHaveValue('250')
      })

      test('should handle responsive design consistently', async ({ page }) => {
        // Test mobile view
        await page.setViewportSize({ width: 375, height: 812 })
        await page.goto('/quote/multi-quantity')

        await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible()

        // Test desktop view
        await page.setViewportSize({ width: 1920, height: 1080 })
        await page.reload()

        await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()
      })
    })
  })
})