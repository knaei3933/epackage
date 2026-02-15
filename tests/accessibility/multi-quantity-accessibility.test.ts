import { test, expect } from '@playwright/test'
import { injectAxe, getViolations, checkA11y } from 'axe-playwright'

test.describe('Multi-Quantity System Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quote/multi-quantity')
    await injectAxe(page)
  })

  test('should pass initial page accessibility audit', async ({ page }) => {
    await checkA11y(page)
  })

  test('should have proper heading structure', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()

    // Should have exactly one h1
    const h1Elements = await page.locator('h1').all()
    expect(h1Elements).toHaveLength(1)

    // Should have proper heading hierarchy
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = parseInt(await headings[i].getAttribute('data-testid') || '1')
      const nextLevel = parseInt(await headings[i + 1].getAttribute('data-testid') || '1')

      // Heading levels should not increase by more than 1
      expect(nextLevel - currentLevel).toBeLessThanOrEqual(1)
    }
  })

  test('should have accessible form controls', async ({ page }) => {
    // Check form labels
    const bagTypeSelect = page.locator('[data-testid="bag-type-select"]')
    await expect(bagTypeSelect).toHaveAttribute('aria-label')

    const widthInput = page.locator('[data-testid="width-input"]')
    await expect(widthInput).toHaveAttribute('aria-label')

    const materialSelect = page.locator('[data-testid="material-select"]')
    await expect(materialSelect).toHaveAttribute('aria-label')

    // Check form descriptions
    const formElements = page.locator('input, select, textarea')
    const elementCount = await formElements.count()

    for (let i = 0; i < elementCount; i++) {
      const element = formElements.nth(i)
      const hasLabel = await element.evaluate(el => {
        const id = el.getAttribute('id')
        return id ? document.querySelector(`label[for="${id}"]`) !== null : false
      })

      if (!hasLabel) {
        await expect(element).toHaveAttribute('aria-label')
      }
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Test Tab navigation
    await page.keyboard.press('Tab')

    let focusedElement = await page.locator(':focus')
    expect(focusedElement).toBeVisible()

    // Test Tab through all interactive elements
    const interactiveElements = page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')
    const elementCount = await interactiveElements.count()

    for (let i = 0; i < Math.min(elementCount, 10); i++) { // Test first 10 elements
      await page.keyboard.press('Tab')
      focusedElement = await page.locator(':focus')

      expect(focusedElement).toBeVisible()

      // Check for focus indicator
      const hasFocusStyle = await focusedElement.evaluate(el => {
        const styles = window.getComputedStyle(el)
        return styles.outline !== 'none' || styles.boxShadow !== 'none'
      })

      expect(hasFocusStyle).toBe(true)
    }

    // Test Shift+Tab for backward navigation
    await page.keyboard.press('Shift+Tab')
    focusedElement = await page.locator(':focus')
    expect(focusedElement).toBeVisible()
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check form validation
    const requiredFields = page.locator('[required], [aria-required="true"]')
    const requiredCount = await requiredFields.count()

    for (let i = 0; i < requiredCount; i++) {
      const field = requiredFields.nth(i)
      await expect(field).toHaveAttribute('aria-required')
    }

    // Check error messages
    await page.click('[data-testid="calculate-btn"]') // Trigger validation

    const errorMessages = page.locator('[data-testid*="error"]')
    const errorCount = await errorMessages.count()

    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i)
        await expect(error).toHaveAttribute('role', 'alert')
      }
    }

    // Check loading states
    await page.selectOption('[data-testid="bag-type-select"]', 'stand_up_pouch')
    await page.click('[data-testid="calculate-btn"]')

    const loadingSpinner = page.locator('[data-testid="loading-spinner"]')
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toHaveAttribute('aria-label', '計算中')
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    const violations = await getViolations(page, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })

    expect(violations).toHaveLength(0)
  })

  test('should support screen readers', async ({ page }) => {
    // Test semantic HTML structure
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()

    // Test ARIA landmarks
    const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
    await expect(landmarks).toHaveCount.toBeGreaterThan(0)

    // Test table accessibility if present
    const tables = page.locator('table')
    const tableCount = await tables.count()

    for (let i = 0; i < tableCount; i++) {
      const table = tables.nth(i)

      // Should have caption or aria-label
      const hasCaption = await table.locator('caption').count() > 0
      const hasAriaLabel = await table.getAttribute('aria-label') !== null

      expect(hasCaption || hasAriaLabel).toBe(true)

      // Should have proper headers
      const headers = table.locator('th')
      expect(await headers.count()).toBeGreaterThan(0)

      // Should have scope attributes
      const headerCells = await headers.all()
      for (const header of headerCells) {
        const hasScope = await header.getAttribute('scope') !== null
        expect(hasScope).toBe(true)
      }
    }
  })

  test('should handle dynamic content accessibility', async ({ page }) => {
    // Fill form to trigger dynamic content
    await page.selectOption('[data-testid="bag-type-select"]', 'stand_up_pouch')
    await page.fill('[data-testid="width-input"]', '250')
    await page.fill('[data-testid="height-input"]', '350')

    // Set quantities
    const quantityInputs = page.locator('[data-testid^="quantity-input-"]')
    await quantityInputs.first().fill('100')
    await quantityInputs.nth(1).fill('500')

    // Calculate to show results
    await page.click('[data-testid="calculate-btn"]')

    // Wait for dynamic content
    await page.waitForSelector('[data-testid="comparison-results"]', { timeout: 15000 })

    // Check accessibility of dynamic content
    await checkA11y(page, null, {
      includedImpacts: ['critical', 'serious']
    })

    // Check for ARIA live regions
    const liveRegions = page.locator('[aria-live]')
    const liveRegionCount = await liveRegions.count()

    if (liveRegionCount > 0) {
      for (let i = 0; i < liveRegionCount; i++) {
        const region = liveRegions.nth(i)
        const politeness = await region.getAttribute('aria-live')
        expect(['polite', 'assertive', 'off']).toContain(politeness || 'off')
      }
    }
  })

  test('should have accessible error handling', async ({ page }) => {
    // Trigger validation errors
    await page.click('[data-testid="calculate-btn"]')

    // Check error accessibility
    const errors = page.locator('[data-testid*="error"]')
    const errorCount = await errors.count()

    for (let i = 0; i < errorCount; i++) {
      const error = errors.nth(i)

      // Should have proper role
      await expect(error).toHaveAttribute('role', 'alert')

      // Should be associated with form controls
      const errorFor = await error.getAttribute('data-error-for')
      if (errorFor) {
        const targetField = page.locator(`[data-testid="${errorFor}"]`)
        expect(targetField).toBeVisible()
      }
    }

    // Check focus management
    const firstError = errors.first()
    if (await firstError.isVisible()) {
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')

      // Should focus on either error or associated field
      const isErrorOrField = await focusedElement.evaluate(el => {
        return el.getAttribute('role') === 'alert' ||
               el.tagName === 'INPUT' ||
               el.tagName === 'SELECT' ||
               el.tagName === 'TEXTAREA'
      })

      expect(isErrorOrField).toBe(true)
    }
  })

  test('should have accessible charts and graphs', async ({ page }) => {
    // Calculate to show charts
    await page.selectOption('[data-testid="bag-type-select"]', 'stand_up_pouch')
    await page.fill('[data-testid="width-input"]', '250')
    await page.click('[data-testid="calculate-btn"]')

    await page.waitForSelector('[data-testid="efficiency-chart"]', { timeout: 15000 })

    // Check chart accessibility
    const charts = page.locator('[data-testid*="chart"], svg')
    const chartCount = await charts.count()

    for (let i = 0; i < chartCount; i++) {
      const chart = charts.nth(i)

      // Should have accessible name or description
      const hasAriaLabel = await chart.getAttribute('aria-label') !== null
      const hasTitle = await chart.locator('title').count() > 0

      expect(hasAriaLabel || hasTitle).toBe(true)

      // Should have alternative text or data table
      const altText = await chart.getAttribute('aria-label')
      const dataTable = page.locator('[data-testid="chart-data-table"]')

      expect(altText !== null || await dataTable.count() > 0).toBe(true)
    }
  })

  test('should work with screen reader gestures', async ({ page }) => {
    // Test screen reader specific features
    await page.addStyleTag({
      content: `
        /* Hide visual content to simulate screen reader */
        body > *:not([role="status"]):not([role="alert"]) {
          display: none;
        }
        /* Show only screen reader accessible content */
        .sr-only {
          display: block;
        }
      `
    })

    // Should still have accessible content
    const accessibleContent = page.locator('[role="main"], [aria-label], [aria-labelledby]')
    expect(await accessibleContent.count()).toBeGreaterThan(0)

    // Test skip links
    const skipLinks = page.locator('a[href^="#"]')
    if (await skipLinks.count() > 0) {
      for (let i = 0; i < await skipLinks.count(); i++) {
        const skipLink = skipLinks.nth(i)
        const href = await skipLink.getAttribute('href')

        if (href && href !== '#') {
          const target = page.locator(href)
          if (await target.count() > 0) {
            await expect(target).toBeVisible()
          }
        }
      }
    }
  })

  test('should maintain accessibility during interactions', async ({ page }) => {
    // Test form interactions
    const bagTypeSelect = page.locator('[data-testid="bag-type-select"]')
    await bagTypeSelect.selectOption('stand_up_pouch')

    // Check accessibility after interaction
    await checkA11y(page, null, {
      includedImpacts: ['critical']
    })

    // Test quantity management
    await page.click('[data-testid="add-quantity-btn"]')
    const newQuantityInput = page.locator('[data-testid^="quantity-input-"]').last()
    await newQuantityInput.fill('7500')

    await checkA11y(page, null, {
      includedImpacts: ['critical']
    })

    // Test calculation process
    await page.fill('[data-testid="width-input"]', '250')
    await page.click('[data-testid="calculate-btn"]')

    // Wait for completion
    await page.waitForSelector('[data-testid="comparison-results"]', { timeout: 15000 })

    // Final accessibility check
    await checkA11y(page)
  })

  test('should have responsive accessibility', async ({ page }) => {
    // Test mobile accessibility
    await page.setViewportSize({ width: 375, height: 812 })

    // Should still be accessible
    await checkA11y(page, null, {
      includedImpacts: ['critical', 'serious']
    })

    // Test tablet accessibility
    await page.setViewportSize({ width: 768, height: 1024 })

    await checkA11y(page, null, {
      includedImpacts: ['critical', 'serious']
    })

    // Test desktop accessibility
    await page.setViewportSize({ width: 1920, height: 1080 })

    await checkA11y(page)
  })
})