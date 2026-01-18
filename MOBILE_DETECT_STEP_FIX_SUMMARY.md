# Mobile-Friendly `detectCurrentStep` Function Improvements

## Overview
Enhanced the `detectCurrentStep` function in `tests/e2e/workflow/01-quotation-to-order.spec.ts` to be more robust and mobile-friendly with multiple fallback strategies.

## File Location
`C:\Users\kanei\claudecode\02.Homepage_Dev\02.epac_homepagever1.1\tests\e2e\workflow\01-quotation-to-order.spec.ts`

## Problem Statement
The original `detectCurrentStep` function had limitations on mobile browsers:
1. **Mobile UI Structure Differences**: Mobile uses vertical step indicators, desktop uses horizontal
2. **Text Truncation**: Mobile viewports may truncate text (e.g., "基本..." instead of "基本仕様")
3. **Different Styling Classes**: Mobile uses different Tailwind classes for active states
4. **Aria Attributes**: Different aria attributes on mobile vs desktop

## Solution: Multi-Strategy Detection Approach

### Strategy 1: Mobile-Specific Vertical Nav Detection
```typescript
// Detects mobile vertical navigation with specific selectors
- nav button[aria-current="step"]
- nav.lg\:hidden button[disabled]
- nav.lg\:hidden button[class*="bg-navy-700"][class*="ring-navy-200"]
```

**Key Features:**
- Iterates through all mobile step buttons
- Checks multiple active state indicators (aria-current, disabled, CSS classes)
- Handles truncated text with partial matching (e.g., "基本" matches "基本仕様")

### Strategy 2: Desktop-Specific Horizontal Nav Detection
```typescript
// Detects desktop horizontal navigation
- nav.hidden.lg\:flex button[aria-current="step"]
- nav.hidden.lg\:flex button[class*="scale-110"]
- button[disabled] with "現在のステップ" text
- button:not([disabled]) with step titles
```

**Key Features:**
- Uses lg: breakpoint classes to identify desktop layout
- Checks for scale-110 transform (desktop active state)
- Falls back to text content matching

### Strategy 3: Aria-Label Parsing (Universal)
```typescript
// Works on both mobile and desktop
- Parses aria-label attribute (format: "Title - Status")
- Extracts title part before the dash
- Handles partial matches for truncation
```

**Key Features:**
- Most reliable method as it doesn't depend on visual text
- Works regardless of viewport size
- Uses semantic aria attributes

### Strategy 4: Progress Bar Percentage
```typescript
// Falls back to progress bar if navigation detection fails
- 0-25%: specs
- 25-50%: post-processing
- 50-75%: sku-quantity
- 75-100%: result
```

### Strategy 5: Unique Form Field Detection
```typescript
// Detects by checking for unique form elements
- Specs: width/height inputs
- Post-processing: zipper/finish buttons
- SKU: "1種類", "2種類" buttons
- Result: price/total display
```

**Key Features:**
- Most reliable fallback as it checks for actual UI elements
- Works even if all text is different
- Checks in reverse order (result is most unique)

### Strategy 6: Visible Heading Text
```typescript
// Checks h2, h3 headings for step-specific content
```

### Strategy 7: URL Fragment/Params (Last Resort)
```typescript
// Parses URL hash or query parameters for step information
```

## Mobile-Optimized Helper Functions

All step completion functions now include mobile optimizations:

### completeSpecsStep
- `mobileClick()`: Scrolls element into view, handles sticky headers/footers
- `mobileFill()`: Focuses input before filling, handles virtual keyboards
- Dismisses mobile UI overlays before interaction
- Longer wait times for mobile animations

### completePostProcessingStep
- Same mobile-optimized helpers as specs step
- Handles all post-processing options (zipper, finish, notch, hang hole)

### completeSKUQuantityStep
- Handles number input with virtual keyboard dismissal
- Falls back to quantity pattern buttons if input fails
- Proper blur() to dismiss keyboard and trigger validation

## Key Mobile Considerations

1. **Viewport Size**: Mobile viewports are smaller, requiring scroll-into-view
2. **Sticky Headers/Footers**: May obscure elements, requiring force click
3. **Virtual Keyboard**: Number inputs trigger keyboards, need proper focus/blur
4. **Touch Timing**: Touch events may have different timing than mouse events
5. **Text Truncation**: Mobile UI truncates text with ellipsis
6. **Animation Timing**: Mobile devices may have slower animations

## Testing Recommendations

When running tests on mobile browsers:
1. Use appropriate mobile viewport sizes in playwright.config.ts
2. Increase timeout values for mobile devices
3. Test on actual mobile devices when possible
4. Monitor console logs for detection strategy used

## Benefits

1. **Robustness**: 7 fallback strategies ensure detection works in various scenarios
2. **Cross-Platform**: Works on both mobile and desktop browsers
3. **Maintainability**: Clear documentation and comments
4. **Debugging**: Console logs show which strategy succeeded
5. **Future-Proof**: Multiple strategies reduce risk of UI changes breaking tests

## Related Files

- `src/components/quote/ResponsiveStepIndicators.tsx` - Component with mobile/desktop layouts
- `playwright.config.ts` - Test configuration (ensure mobile viewport sizes are set)

## Next Steps

1. Run the workflow tests on mobile browsers to verify improvements
2. Monitor test results for any remaining mobile-specific issues
3. Consider adding mobile-specific viewport configurations to playwright.config.ts
4. Document any additional mobile-specific test patterns discovered
