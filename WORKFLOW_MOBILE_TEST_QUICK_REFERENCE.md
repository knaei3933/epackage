# Workflow Tests - Mobile Quick Reference

## Test File
`tests/e2e/workflow/01-quotation-to-order.spec.ts`

## Run Tests

### All Workflow Tests
```bash
# Desktop browsers
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts

# Mobile browsers (emulated)
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts --project="Mobile Chrome"
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts --project="Mobile Safari"

# All projects (desktop + mobile)
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts --project="all"
```

### Specific Test
```bash
# WF-01: Complete quote to order workflow
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-01"

# WF-02: Smart quote access
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-02"

# WF-03: Status transitions
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts -g "WF-03"
```

### With UI Mode (Debugging)
```bash
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts --ui
npx playwright test tests/e2e/workflow/01-quotation-to-order.spec.ts --ui --project="Mobile Chrome"
```

## Test Scenarios

### WF-01: Complete Quote to Order Workflow
1. Navigate to `/quote-simulator`
2. Complete specs step (bag type, material, thickness, dimensions)
3. Complete post-processing step (zipper, finish, notch, hang hole)
4. Complete SKU/quantity step (SKU count, quantity)
5. Verify result step (price display)
6. Save quotation
7. Navigate to quotations list
8. Convert to order (if quotation is APPROVED)

### WF-02: Smart Quote Access
1. Navigate to `/smart-quote`
2. Verify page loads

### WF-03: Status Transitions
1. Navigate to `/member/quotations`
2. Open first quotation
3. Check current status
4. Submit quotation (if button available)
5. Verify status change

## Detection Strategies

The `detectCurrentStep` function uses 7 strategies in order:

1. **Mobile Vertical Nav**: `aria-current="step"` + CSS classes
2. **Desktop Horizontal Nav**: `aria-current="step"` + scale transform
3. **Aria-Label Parsing**: Universal, most reliable
4. **Progress Bar**: Percentage-based detection
5. **Form Fields**: Unique elements per step
6. **Heading Text**: h2/h3 content
7. **URL**: Fragment/params (last resort)

## Mobile Optimizations

### Step Completion Functions
All step completion functions (`completeSpecsStep`, `completePostProcessingStep`, `completeSKUQuantityStep`) include:

- `mobileClick()`: Scroll into view, force click, handle sticky elements
- `mobileFill()`: Focus before fill, handle virtual keyboard
- Overlay dismissal before interactions
- Longer wait times for animations

### Mobile-Specific Considerations
- Sticky headers/footers may obscure elements
- Virtual keyboards for number inputs
- Slower animations on mobile devices
- Text truncation in small viewports
- Touch events vs mouse events timing

## Console Output

Tests include detailed console logging:

```
=== Completing Specs Step (Mobile-Optimized) ===
✓ Selected bag type: 平袋
✓ Selected material: PET_AL
✓ Selected thickness: 標準
✓ Entered width: 100
✓ Entered height: 150
=== Specs Step Complete ===
```

## Troubleshooting

### Detection Fails
If step detection returns 'unknown':
1. Check browser console for errors
2. Verify ResponsiveStepIndicators component renders correctly
3. Check if aria attributes are present
4. Try running in UI mode to inspect elements

### Mobile Click Fails
If mobile clicks don't register:
1. Verify element is scrolled into view
2. Check for sticky headers/footers obscuring element
3. Increase timeout values
4. Try force click option

### Virtual Keyboard Issues
If number input has issues:
1. Ensure blur() is called to dismiss keyboard
2. Add longer wait after fill()
3. Consider using quantity pattern buttons instead

## Viewport Configuration

Ensure `playwright.config.ts` includes mobile projects:

```typescript
projects: [
  {
    name: 'Mobile Chrome',
    use: {
      ...devices['Pixel 5'],
    },
  },
  {
    name: 'Mobile Safari',
    use: {
      ...devices['iPhone 12'],
    },
  },
]
```

## Related Documentation

- `MOBILE_DETECT_STEP_FIX_SUMMARY.md` - Detailed improvements documentation
- `src/components/quote/ResponsiveStepIndicators.tsx` - Mobile/desktop UI component
- `playwright.config.ts` - Test configuration

## Success Indicators

Tests pass when:
- Step detection correctly identifies current step on mobile
- All step completion functions work smoothly
- Navigation between steps works correctly
- Quote can be created and saved
- Order conversion works (for APPROVED quotations)
