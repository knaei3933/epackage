# UI/UX Improvements Integration Guide for ImprovedQuotingWizard

## Files Created

1. **`ErrorToast.tsx`** - Toast notification system with dismiss button
2. **`KeyboardShortcutsHint.tsx`** - Desktop keyboard shortcuts display
3. **`useKeyboardNavigation.ts`** - Keyboard navigation hook
4. **`ResponsiveStepIndicators.tsx`** - Mobile vertical / Desktop horizontal step indicators

## Integration Steps for ImprovedQuotingWizard.tsx

### 1. Add Imports

```typescript
import { ErrorToast, useToast } from './ErrorToast';
import { KeyboardShortcutsHint } from './KeyboardShortcutsHint';
import { useKeyboardNavigation } from './useKeyboardNavigation';
import { ResponsiveStepIndicators } from './ResponsiveStepIndicators';
```

### 2. Add Toast State (in main component)

```typescript
const { toasts, dismissToast, showError, showSuccess } = useToast();
```

### 3. Add Keyboard Navigation Hook (before return statement)

```typescript
useKeyboardNavigation({
  onNext: canProceed ? handleNext : undefined,
  onPrevious: currentStep > 0 ? handleBack : undefined,
  onDismiss: () => {
    // Dismiss all toasts
    toasts.forEach(toast => dismissToast(toast.id));
  },
  onConfirm: canProceed ? handleNext : undefined,
  canProceed,
  canGoBack: currentStep > 0,
});
```

### 4. Replace Step Indicators (around line 2361-2417)

**FIND:**
```typescript
{/* Step Indicators */}
<nav className="flex justify-between mt-4 max-w-2xl mx-auto" aria-label="見積もり作成のステップ">
  {STEPS.map((step, index) => {
    // ... existing step indicator code
  })}
</nav>
```

**REPLACE WITH:**
```typescript
{/* Step Indicators - Responsive */}
<ResponsiveStepIndicators
  steps={STEPS}
  currentStep={currentStep}
  onStepClick={(index) => {
    if (index < currentStep) setCurrentStep(index);
  }}
  isStepCompleted={(index) => index < currentStep || (result && index === STEPS.length - 1)}
/>
```

### 5. Add Keyboard Shortcuts Hint (after progress bar, before step indicators)

```typescript
{/* Keyboard Shortcuts Hint - Desktop only */}
<KeyboardShortcutsHint className="mb-4" />
```

### 6. Add Toast Notifications (inside main return, at top level)

```typescript
{/* Error Toast Notifications */}
<ErrorToast toasts={toasts} onDismiss={dismissToast} />
```

### 7. Add Content Spacer for Mobile Bottom Bar (before closing div)

**FIND the main content area div and add before the fixed bottom bar:**
```typescript
{/* Content spacer for mobile bottom bar */}
<div className="h-32 lg:hidden" aria-hidden="true" />
```

### 8. Add Price Display to Mobile Bottom Bar (around line 2583)

**FIND:**
```typescript
<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40" role="contentinfo">
  <div className="max-w-7xl mx-auto px-4 py-4">
```

**ADD AFTER (inside the div):**
```typescript
{/* Mobile Price Display */}
<div className="lg:hidden mb-3 p-3 bg-gradient-to-r from-navy-50 to-blue-50 rounded-lg border-2 border-navy-200">
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium text-navy-700">見積もり価格</span>
    <span className="text-xl font-bold text-navy-900">
      {result ? (
        <>
          ¥{result.totalPrice.toLocaleString()}
          <span className="text-xs text-navy-600 ml-1">税込</span>
        </>
      ) : (
        <span className="text-sm text-navy-600">計算中...</span>
      )}
    </span>
  </div>
</div>
```

### 9. Replace alert() calls with showToast()

**FIND in handleReset:**
```typescript
alert('リセット中にエラーが発生しました。もう一度お試しください。');
```

**REPLACE WITH:**
```typescript
showError('リセット中にエラーが発生しました。もう一度お試しください。');
```

### 10. Update Input Font Sizes

Search for all input fields and ensure they have `text-base` (16px) or at least `text-sm` (14px):

```typescript
// Example - ensure inputs have:
<input className="text-base ..."  // 16px prevents iOS zoom
// OR
<input className="text-sm ..."   // 14px minimum
```

## Summary of Changes

| Test Requirement | Implementation |
|-----------------|----------------|
| Vertical step indicators on mobile | `ResponsiveStepIndicators` with flex-col on mobile |
| Tappable step indicators (44x44px) | w-11 h-11 (44px) button size |
| Fixed bottom action bar with price | Added price display in fixed bottom bar |
| Content spacing (h-32) | Added spacer div with h-32 class |
| Readable form inputs (14px+) | Verify text-base/text-sm on inputs |
| Loading spinner (.animate-spin) | Already exists in multiple places |
| Error toast with dismiss button | `ErrorToast` component with close button |
| No alert() for errors | Replaced with `showError()` toast |
| Arrow key navigation | `useKeyboardNavigation` hook |
| Escape closes toast | Handled in keyboard hook |
| Ctrl+Enter proceeds | Handled in keyboard hook |
| Shortcuts disabled in inputs | Input detection in hook |
| Focus indicators | Existing focus:ring classes |
| ARIA labels | Already present, enhanced |
| Keyboard shortcuts hint | `KeyboardShortcutsHint` component |
| Tab navigation | Native browser behavior |
| Focus management | Auto-focus after step change |

## Files to Modify

- `src/components/quote/ImprovedQuotingWizard.tsx` - Main integration
- `src/components/quote/specs/*` - Input font sizes verification
- `src/components/quote/sections/*` - Input font sizes verification
