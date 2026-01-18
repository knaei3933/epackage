# Quote Wizard UI/UX Improvement Design Document

**Project**: Epackage Lab Web - Quote Enhancement
**Date**: 2026-01-12
**Designer**: Claude Code (UI/UX Designer)
**Status**: Design Proposal

---

## Executive Summary

This document outlines comprehensive UI/UX improvements for the quote wizard, focusing on:
1. Cleaner 5-page flow structure
2. Significantly larger product images (200-400px)
3. Better layout with prominent product previews
4. Roll film specific improvements (length vs height, 500m minimum)
5. Spout pouch position selector with visual feedback

---

## Current State Analysis

### Existing Issues

#### 1. Small Product Images
- **Current Size**: 80x80px (`w-20 h-20` in line 343)
- **Location**: Bag type selection cards
- **Problem**: Too small for users to clearly see product details
- **Impact**: Reduced user confidence in product selection

#### 2. Small Preview Area
- **Current Max Width**: 280px (EnvelopePreview.tsx line 91)
- **Location**: Left sidebar preview
- **Problem**: Preview is not prominent enough
- **Impact**: Users may not notice real-time updates

#### 3. Page Flow Confusion
- **Current Pages**: 5 steps (specs, quantity, post-processing, delivery, result)
- **Problem**: Delivery step is unnecessary for quoting
- **Impact**: Extra click reduces conversion rate

#### 4. Roll Film Terminology
- **Current**: Uses "高さ" (height) for roll film
- **Problem**: Roll film is measured by length, not height
- **Impact**: Confusing for customers ordering roll film

#### 5. No Spout Position Selection
- **Current**: Spout pouch selected but no position option
- **Problem**: Missing critical specification
- **Impact**: Requires manual follow-up with customer

---

## Proposed Design Solutions

### 1. Page Structure Redesign

#### New 5-Page Flow

```
1. 基本仕様 (Basic Specs)
   - Bag type selection (with large images)
   - Material selection
   - Size specifications
   - Thickness selection

2. 数量 (Quantity)
   - Quantity input (single or multi-quantity comparison)
   - Roll film length (500m minimum)
   - Quantity breakdown display

3. 後加工 (Post-Processing)
   - Zipper options
   - Finish options (glossy/matte)
   - Notch options
   - Hang hole options
   - Spout position (for spout pouch only)

4. 確認 (Confirmation)
   - Summary of all selections
   - Large product preview
   - Specification review
   - Edit buttons for each section

5. 完了 (Completion)
   - Quote results
   - PDF download
   - Save quotation
   - Reset/start over
```

**Removed**: "配送・納期" (Delivery) step - move to order confirmation phase

---

### 2. Image Size Improvements

#### Product Card Images (Selection)

**Before**:
```tsx
<div className="w-20 h-20 bg-gray-100 rounded-lg">  // 80x80px
  <img className="w-full h-full object-contain p-2" />
</div>
```

**After**:
```tsx
<div className="w-48 h-48 bg-gray-100 rounded-xl shadow-sm">  // 192x192px
  <img className="w-full h-full object-contain p-4" />
</div>
```

**Sizing Strategy**:
- **Mobile**: 140x140px minimum
- **Tablet**: 180x180px
- **Desktop**: 220x220px
- **Large Desktop**: 260x260px

#### Main Preview Area

**Before**:
```tsx
const maxPreviewWidth = 280;  // Line 91 in EnvelopePreview.tsx
```

**After**:
```tsx
const maxPreviewWidth = 480;  // Nearly 2x larger
const maxPreviewHeight = 600;
```

**Preview Enhancement**:
- Add zoom on hover
- Show dimensions overlay
- Material swatch indicator
- Real-time spec updates

---

### 3. Layout Redesign

#### Option A: Split View Layout (Recommended for Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│                    Quote Wizard Header                      │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────┬──────────────────────────────────────┐
│                      │                                       │
│   PRODUCT PREVIEW    │      SELECTION AREA                  │
│                      │                                       │
│   [LARGE IMAGE]      │   ┌─────────────────────────────┐   │
│   480x600px          │   │  Bag Type Cards (Grid)      │   │
│                      │   │  [240x240px each]           │   │
│   Specifications:    │   └─────────────────────────────┘   │
│   • Size: 200x300    │                                       │
│   • Material: PET+AL │   ┌─────────────────────────────┐   │
│   • Thickness: Med   │   │  Material Cards (2-col)     │   │
│                      │   └─────────────────────────────┘   │
│   [Zoom Button]      │                                       │
│   [Compare Button]   │   Size Inputs                         │
│                      │   [___] Width [___] Height           │
│                      │                                       │
└──────────────────────┴──────────────────────────────────────┘
│                      [Navigation Buttons]                   │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior**:
- **Desktop (>1024px)**: Split view with left preview (40%) and right selection (60%)
- **Tablet (768-1024px)**: Stacked with preview on top
- **Mobile (<768px)**: Single column, preview as modal/overlay

#### Option B: Centered Focus Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Quote Wizard Header                      │
├─────────────────────────────────────────────────────────────┤
│
│                    [LARGE PREVIEW]
│                        600x400px
│                      (Center Stage)
│
├─────────────────────────────────────────────────────────────┤
│
│              Bag Type Selection (Horizontal Scroll)
│              [240x240px cards in carousel]
│
├─────────────────────────────────────────────────────────────┤
│
│              Material & Thickness Options
│
├─────────────────────────────────────────────────────────────┤
│                      [Navigation]                           │
└─────────────────────────────────────────────────────────────┘
```

**Recommendation**: Use Option A (Split View) for better desktop UX, with Option B for tablet/mobile.

---

### 4. Component-Level Improvements

#### A. Enhanced Product Card

```tsx
// New ProductCard Component
interface ProductCardProps {
  product: BagType;
  isSelected: boolean;
  onSelect: () => void;
  size?: 'compact' | 'standard' | 'large';
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isSelected,
  onSelect,
  size = 'standard'
}) => {
  const sizeClasses = {
    compact: 'w-32 h-32',      // 128px - for comparison view
    standard: 'w-48 h-48',     // 192px - default
    large: 'w-64 h-64'         // 256px - for featured display
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative rounded-2xl border-2 transition-all duration-300
        ${isSelected
          ? 'border-green-500 bg-green-50 shadow-lg scale-105'
          : 'border-gray-200 hover:border-navy-400 hover:shadow-md'
        }
      `}
    >
      {/* Selection Badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      {/* Large Product Image */}
      <div className={`${sizeClasses[size]} bg-white rounded-t-2xl p-4`}>
        <img
          src={product.image}
          alt={product.nameJa}
          className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
          loading="lazy"
        />
      </div>

      {/* Product Info */}
      <div className="p-4 bg-white rounded-b-2xl">
        <h3 className="font-bold text-gray-900 text-lg mb-1">
          {product.nameJa}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {product.descriptionJa}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium bg-navy-100 text-navy-700 px-2 py-1 rounded-full">
            ¥{product.basePrice}/個
          </span>
          {isSelected && (
            <span className="text-xs text-green-600 font-medium">
              選択中
            </span>
          )}
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-navy-900/0 hover:bg-navy-900/5 rounded-2xl transition-colors duration-300 pointer-events-none" />
    </button>
  );
};
```

#### B. Enhanced Preview Panel

```tsx
// New PreviewPanel Component
interface PreviewPanelProps {
  bagTypeId: string;
  dimensions: Dimensions;
  materialId: string;
  thicknessId: string;
  postProcessingOptions: string[];
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  bagTypeId,
  dimensions,
  materialId,
  thicknessId,
  postProcessingOptions
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg">製品プレビュー</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle zoom"
            >
              <Maximize2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setShowDimensions(!showDimensions)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Toggle dimensions"
            >
              <Ruler className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Image Area */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div
          className={`
            relative mx-auto transition-all duration-500
            ${isZoomed ? 'scale-150' : 'scale-100'}
          `}
          style={{ maxWidth: '480px', maxHeight: '600px' }}
        >
          <img
            src={getPreviewImage(bagTypeId)}
            alt={getBagTypeName(bagTypeId)}
            className="w-full h-full object-contain drop-shadow-2xl"
          />

          {/* Dimension Overlay */}
          {showDimensions && dimensions.width > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Width Dimension */}
              <div className="absolute top-4 left-0 right-0 flex items-center justify-center">
                <div className="bg-navy-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                  幅: {dimensions.width}mm
                </div>
              </div>

              {/* Height Dimension */}
              <div className="absolute top-0 bottom-0 left-4 flex items-center">
                <div className="bg-navy-900/80 text-white px-3 py-1 rounded-full text-sm font-medium -rotate-90">
                  高さ: {dimensions.height}mm
                </div>
              </div>

              {/* Depth Dimension (if applicable) */}
              {dimensions.depth > 0 && (
                <div className="absolute bottom-4 right-4">
                  <div className="bg-blue-900/80 text-white px-3 py-1 rounded-full text-sm font-medium">
                    マチ: {dimensions.depth}mm
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Material Badge */}
          <div className="absolute bottom-4 left-4">
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200">
              <div className="text-xs text-gray-600 mb-1">素材</div>
              <div className="text-sm font-bold text-gray-900">
                {getMaterialLabel(materialId)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications Summary */}
      <div className="px-6 py-4 bg-white border-t border-gray-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">サイズ:</span>
            <span className="ml-2 font-medium text-gray-900">
              {dimensions.width} × {dimensions.height}
              {dimensions.depth > 0 && ` × ${dimensions.depth}`} mm
            </span>
          </div>
          <div>
            <span className="text-gray-600">厚さ:</span>
            <span className="ml-2 font-medium text-gray-900">
              {getThicknessLabel(thicknessId)}
            </span>
          </div>
          {postProcessingOptions.length > 0 && (
            <div className="col-span-2">
              <span className="text-gray-600">後加工:</span>
              <span className="ml-2 font-medium text-gray-900">
                {postProcessingOptions.join(', ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

### 5. Roll Film Specific Improvements

#### A. Terminology Change

**Current** (SizeSpecification.tsx line 45):
```tsx
<label>高さ</label>
<input type="number" value={state.height} />
```

**Improved**:
```tsx
{state.bagTypeId === 'roll_film' ? (
  <>
    <label>長さ (m)</label>
    <input
      type="number"
      min="500"
      step="100"
      value={Math.round((state.height || 0) / 1000)} // Convert mm to m
      onChange={(e) => updateBasicSpecs({
        height: (parseInt(e.target.value) || 0) * 1000 // Convert m to mm
      })}
      placeholder="500"
    />
    <p className="text-xs text-gray-500 mt-1">
      最小注文単位: 500mから
    </p>
  </>
) : (
  <>
    <label>高さ (mm)</label>
    <input
      type="number"
      min="50"
      value={state.height}
      onChange={(e) => updateBasicSpecs({ height: parseInt(e.target.value) || 0 })}
      placeholder="300"
    />
  </>
)}
```

#### B. Roll Film Preview Enhancement

```tsx
// Special preview for roll film
const RollFilmPreview: React.FC<{ length: number; width: number }> = ({ length, width }) => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-32 h-32 bg-purple-100 rounded-full mb-3">
          <img
            src="/images/processing-icons/ロールフィルム.png"
            alt="ロールフィルム"
            className="w-24 h-24 object-contain"
          />
        </div>
        <h4 className="font-bold text-gray-900">ロールフィルム仕様</h4>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <span className="text-gray-700">フィルム幅</span>
          <span className="font-bold text-purple-700">{width}mm</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="text-gray-700">巻き長さ</span>
          <span className="font-bold text-blue-700">{length.toLocaleString()}m</span>
        </div>
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="text-gray-700">推定巻数</span>
          <span className="font-bold text-green-700">
            {Math.floor(length / 500)}巻
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>最小注文単位:</strong> 500mからご注文いただけます。
            建機・自動包装機での使用に最適です。
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

### 6. Spout Position Selector

#### A. Visual Position Selector Component

```tsx
// SpoutPositionSelector Component
interface SpoutPositionSelectorProps {
  value: SpoutPosition;
  onChange: (position: SpoutPosition) => void;
}

type SpoutPosition =
  | 'top-left'      // 左上
  | 'top-center'    // 上中央
  | 'top-right'     // 右上
  | 'center-left'   // 左中央
  | 'center-right'  // 右中央
  | 'bottom-left'   // 左下
  | 'bottom-center' // 下中央
  | 'bottom-right'  // 右下

const SpoutPositionSelector: React.FC<SpoutPositionSelectorProps> = ({
  value,
  onChange
}) => {
  const positions: Array<{ id: SpoutPosition; label: string; x: string; y: string }> = [
    { id: 'top-left', label: '左上', x: 'left-4', y: 'top-4' },
    { id: 'top-center', label: '上中央', x: 'left-1/2 -translate-x-1/2', y: 'top-4' },
    { id: 'top-right', label: '右上', x: 'right-4', y: 'top-4' },
    { id: 'center-left', label: '左中央', x: 'left-4', y: 'top-1/2 -translate-y-1/2' },
    { id: 'center-right', label: '右中央', x: 'right-4', y: 'top-1/2 -translate-y-1/2' },
    { id: 'bottom-left', label: '左下', x: 'left-4', y: 'bottom-4' },
    { id: 'bottom-center', label: '下中央', x: 'left-1/2 -translate-x-1/2', y: 'bottom-4' },
    { id: 'bottom-right', label: '右下', x: 'right-4', y: 'bottom-4' }
  ];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-navy-600" />
        スパウト位置の選択
      </h4>

      {/* Visual Bag Preview */}
      <div className="relative w-full aspect-[4/5] max-w-md mx-auto mb-6">
        {/* Bag Outline */}
        <div className="absolute inset-0 border-4 border-gray-300 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50">

          {/* Grid Lines (for reference) */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border border-gray-200/30" />
            ))}
          </div>

          {/* Spout Position Options */}
          {positions.map((pos) => (
            <button
              key={pos.id}
              onClick={() => onChange(pos.id)}
              className={`
                absolute w-10 h-10 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-4
                ${value === pos.id
                  ? 'bg-blue-600 border-blue-700 shadow-lg scale-110'
                  : 'bg-white border-gray-400 hover:border-blue-400 shadow-sm'
                }
              `}
              style={{
                [pos.x]: pos.x.includes('1/2') ? '50%' : parseInt(pos.x.split('-')[1]),
                transform: pos.x.includes('1/2') ? 'translateX(-50%)' : undefined,
                [pos.y]: pos.y.includes('1/2') ? '50%' : parseInt(pos.y.split('-')[1])
              }}
              aria-label={`${pos.label}にスパウトを配置`}
            >
              {/* Spout Icon */}
              <svg
                className={`w-5 h-5 ${value === pos.id ? 'text-white' : 'text-gray-600'}`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C9.243 2 7 4.243 7 7v10c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3s-3-1.346-3-3V7c0-1.654 1.346-3 3-3z"/>
              </svg>
            </button>
          ))}

          {/* Selected Position Label */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200">
            <span className="text-sm font-medium text-gray-900">
              選択: {positions.find(p => p.id === value)?.label}
            </span>
          </div>
        </div>
      </div>

      {/* Common Positions Quick Select */}
      <div>
        <h5 className="text-sm font-medium text-gray-700 mb-3">よく使われる位置</h5>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'top-center', label: '上中央', popular: true },
            { id: 'top-right', label: '右上', popular: false },
            { id: 'center-left', label: '左中央', popular: false },
            { id: 'top-left', label: '左上', popular: true }
          ].map((pos) => (
            <button
              key={pos.id}
              onClick={() => onChange(pos.id as SpoutPosition)}
              className={`
                relative px-4 py-3 rounded-lg border-2 text-left transition-all
                ${value === pos.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <div className="font-medium text-gray-900">{pos.label}</div>
              {pos.popular && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                  人気
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2 text-sm text-blue-800">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            スパウトの位置は、製品の使いやすさとデザインに大きく影響します。
            上中央が最も一般的ですが、充填時の作業性を考慮して選択してください。
          </p>
        </div>
      </div>
    </div>
  );
};
```

#### B. Integration with Quote Context

```typescript
// Add to QuoteContext state
interface QuoteState {
  // ... existing fields
  spoutPosition?: SpoutPosition;
}

// Add to QuoteContext actions
interface QuoteActions {
  // ... existing actions
  updateSpoutPosition: (position: SpoutPosition) => void;
}
```

---

### 7. Responsive Design Specifications

#### Breakpoint Strategy

```css
/* Mobile First Approach */

/* Base (Mobile < 640px) */
.quote-wizard {
  padding: 1rem;
}

.preview-panel {
  order: -1; /* Preview first on mobile */
  margin-bottom: 1rem;
}

.product-card {
  width: 140px;
  height: 140px;
}

/* Tablet (640px - 1024px) */
@media (min-width: 640px) {
  .quote-wizard {
    padding: 1.5rem;
  }

  .product-card {
    width: 180px;
    height: 180px;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .quote-wizard {
    display: grid;
    grid-template-columns: 400px 1fr;
    gap: 2rem;
    padding: 2rem;
  }

  .preview-panel {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }

  .product-card {
    width: 220px;
    height: 220px;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large Desktop (1280px+) */
@media (min-width: 1280px) {
  .product-card {
    width: 260px;
    height: 260px;
  }

  .product-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
}
```

---

### 8. Accessibility Improvements

#### A. Keyboard Navigation

```tsx
// Add keyboard shortcuts for power users
const keyboardShortcuts = {
  '1': () => setCurrentStep(0), // 基本仕様
  '2': () => setCurrentStep(1), // 数量
  '3': () => setCurrentStep(2), // 後加工
  '4': () => setCurrentStep(3), // 確認
  '5': () => setCurrentStep(4), // 完了
  'ArrowRight': () => nextStep(),
  'ArrowLeft': () => previousStep(),
  'Enter': () => submitQuote(),
  'Escape': () => openHelpModal()
};
```

#### B. Screen Reader Support

```tsx
// Add ARIA labels and live regions
<div
  role="region"
  aria-label="製品プレビュー"
  aria-live="polite"
  aria-atomic="true"
>
  <img
    src={previewImage}
    alt={`${getBagTypeName(bagTypeId)}のプレビュー。サイズは幅${dimensions.width}ミリ、高さ${dimensions.height}ミリ。`}
  />
  <div aria-label="現在の選択内容">
    {getAriaSummary(state)}
  </div>
</div>
```

#### C. Focus Management

```tsx
// Auto-focus first input on each step
useEffect(() => {
  const firstInput = document.querySelector(
    `[data-step="${currentStep}"] input:not([disabled])`
  ) as HTMLInputElement;
  firstInput?.focus();
}, [currentStep]);

// Focus trap in modals
const useFocusTrap = (isActive: boolean) => {
  useEffect(() => {
    if (!isActive) return;

    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive]);
};
```

---

### 9. Performance Optimizations

#### A. Image Optimization

```tsx
// Use Next.js Image component for automatic optimization
import Image from 'next/image';

<Image
  src={product.image}
  alt={product.nameJa}
  width={220}
  height={220}
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..." // Low-quality placeholder
  loading="lazy"
  className="object-contain"
/>
```

#### B. Lazy Loading Strategy

```tsx
// Load preview images on demand
const PreviewImage: React.FC<{ bagTypeId: string }> = ({ bagTypeId }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setImageSrc(getPreviewImage(bagTypeId));
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => observer.disconnect();
  }, [bagTypeId]);

  return (
    <div ref={imageRef} className="aspect-square">
      {imageSrc ? (
        <img src={imageSrc} alt="Preview" className="w-full h-full object-contain" />
      ) : (
        <div className="w-full h-full bg-gray-100 animate-pulse" />
      )}
    </div>
  );
};
```

#### C. Memoization

```tsx
// Memoize expensive calculations
const calculatePreviewDimensions = useMemo(() => {
  const maxWidth = 480;
  const maxHeight = 600;
  const aspectRatio = dimensions.width / dimensions.height;

  let width = maxWidth;
  let height = maxWidth / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = maxHeight * aspectRatio;
  }

  return { width, height };
}, [dimensions.width, dimensions.height]);
```

---

### 10. Implementation Priority

#### Phase 1: Critical (Week 1)
1. ✅ Increase product card images to 220x220px
2. ✅ Redesign layout with split view (preview + selection)
3. ✅ Implement roll film terminology changes
4. ✅ Add 500m minimum validation for roll film

#### Phase 2: High Priority (Week 2)
5. ✅ Implement spout position selector
6. ✅ Enhance preview panel with dimensions overlay
7. ✅ Remove delivery step, consolidate to 5-page flow
8. ✅ Add confirmation page with edit capabilities

#### Phase 3: Medium Priority (Week 3)
9. ⏳ Add zoom functionality to preview
10. ⏳ Implement keyboard shortcuts
11. ⏳ Add accessibility improvements (ARIA, focus management)
12. ⏳ Optimize image loading with Next.js Image

#### Phase 4: Enhancement (Week 4)
13. ⏳ Add animation polish (Framer Motion)
14. ⏳ Implement comparison view for multiple quantities
15. ⏳ Add export/share functionality
16. ⏳ Create mobile-optimized layouts

---

## Design System Integration

### Color Palette

```css
/* Primary Colors */
--navy-600: #1e3a5f;      /* Primary action, headers */
--navy-800: #1a2f4a;      /* Darker shade for hover */

/* Accent Colors */
--green-500: #10b981;     /* Selection confirmed */
--blue-500: #3b82f6;      /* Interactive elements */
--amber-500: #f59e0b;     /* Warnings, attention */

/* Neutral Colors */
--gray-50: #f9fafb;       /* Background light */
--gray-200: #e5e7eb;      /* Borders */
--gray-900: #111827;      /* Text primary */

/* Semantic Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

### Typography Scale

```css
/* Japanese-optimized typography */
--text-xs: 0.75rem;    /* 12px - labels, metadata */
--text-sm: 0.875rem;   /* 14px - body text */
--text-base: 1rem;     /* 16px - default */
--text-lg: 1.125rem;   /* 18px - emphasized */
--text-xl: 1.25rem;    /* 20px - section headers */
--text-2xl: 1.5rem;    /* 24px - page headers */
--text-3xl: 1.875rem;  /* 30px - display */
```

### Spacing System

```css
/* 8px baseline grid */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

---

## User Experience Principles

### 1. Progressive Disclosure
- Show only essential information first
- Reveal advanced options on demand
- Use "Show more" expanders for non-critical details

### 2. Immediate Feedback
- Real-time preview updates
- Instant price calculations
- Visual confirmation of selections

### 3. Error Prevention
- Inline validation before submission
- Clear constraints (min/max values)
- Helpful hints for common mistakes

### 4. Efficient Navigation
- Keyboard shortcuts for power users
- Clear back/forward progression
- Ability to edit previous steps

### 5. Japanese Business Context
- Polite language forms (keigo)
- Clear visual hierarchy
- Respect for precision and detail
- Professional appearance

---

## Success Metrics

### Quantitative
- **Conversion Rate**: Target 15% increase in completed quotes
- **Time to Complete**: Reduce average completion time by 30%
- **Error Rate**: Reduce validation errors by 50%
- **Mobile Usage**: Increase mobile quote completion by 25%

### Qualitative
- **User Satisfaction**: Survey score 4.5+/5.0
- **Support Tickets**: Reduce quote-related tickets by 40%
- **Customer Feedback**: Positive feedback on visual clarity

---

## Next Steps

1. **Review this design** with stakeholders
2. **Create prototype** in Figma/Adobe XD
3. **User testing** with 5-10 customers
4. **Iterate** based on feedback
5. **Development sprint** following implementation priority
6. **A/B testing** old vs new wizard
7. **Full rollout** once conversion improvement confirmed

---

## Appendix: Code References

### Files to Modify

1. **src/components/quote/ImprovedQuotingWizard.tsx**
   - Update step configuration (remove delivery)
   - Modify SpecsStep component
   - Add SpoutPositionSelector integration

2. **src/components/quote/sections/SizeSpecification.tsx**
   - Add roll film conditional logic
   - Update label for length vs height

3. **src/components/quote/EnvelopePreview.tsx**
   - Increase maxPreviewWidth from 280 to 480
   - Add dimension overlay
   - Add zoom functionality

4. **src/contexts/QuoteContext.tsx**
   - Add spoutPosition to state
   - Add updateSpoutPosition action

5. **src/types/quote.ts**
   - Add SpoutPosition type definition

### New Components to Create

1. **src/components/quote/ProductCard.tsx**
   - Enhanced product selection card

2. **src/components/quote/PreviewPanel.tsx**
   - Large preview with controls

3. **src/components/quote/SpoutPositionSelector.tsx**
   - Visual position selection interface

4. **src/components/quote/RollFilmPreview.tsx**
   - Specialized roll film display

---

**Document Version**: 1.0
**Last Updated**: 2026-01-12
**Status**: Ready for Review
