# Enhanced Post-Processing Preview System

A comprehensive, interactive preview system for packaging post-processing options that helps customers visualize exactly how their packaging will look before and after various processing treatments.

## Features

### 🎯 Core Functionality
- **Before/After Comparisons**: Interactive slider and side-by-side comparisons
- **Visual Previews**: Real-time image previews with processing results
- **Multi-Language Support**: Full Japanese and English localization
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Performance Optimized**: Image preloading, lazy loading, and caching

### 🖼️ Preview Modes
- **Interactive Slider**: Drag to reveal before/after states
- **Side-by-Side**: Direct comparison of processed vs unprocessed
- **Animated View**: Step-by-step processing animation
- **Zoom Controls**: Zoom in/out for detailed inspection
- **Download Support**: Save preview images for reference

### 🔧 Advanced Features
- **Smart Filtering**: Filter by category, compatibility, and search
- **Batch Selection**: Select multiple options at once
- **Price Impact Calculation**: Real-time cost estimation
- **Processing Time Estimates**: Timeline for additional processing
- **Technical Specifications**: Detailed processing information

## Components

### `EnhancedPostProcessingPreview`
Main component that orchestrates the entire preview system.

```tsx
<EnhancedPostProcessingPreview
  selectedProductType="stand_up"
  selectedOptions={selectedOptions}
  onOptionsChange={setSelectedOptions}
  onPriceUpdate={setPriceMultiplier}
  language="ja"
  variant="full"
  showAdvancedFilters={true}
  enableBatchSelection={false}
/>
```

**Props:**
- `selectedProductType`: Current product type for compatibility filtering
- `selectedOptions`: Array of selected processing option IDs
- `onOptionsChange`: Callback when options change
- `onPriceUpdate`: Callback when price multiplier updates
- `language`: 'en' or 'ja'
- `variant`: 'full', 'compact', or 'minimal'
- `showAdvancedFilters`: Enable search and category filters
- `enableBatchSelection`: Allow selecting multiple options

### `BeforeAfterPreview`
Advanced before/after comparison modal with multiple viewing modes.

```tsx
<BeforeAfterPreview
  beforeImage="/images/before.png"
  afterImage="/images/after.png"
  beforeLabel="Before Processing"
  afterLabel="After Processing"
  title="Zipper Addition"
  onClose={handleClose}
  language="ja"
  showComparisonSlider={true}
  autoPlay={false}
/>
```

### `ProcessingPreviewTrigger`
Individual option card with preview functionality.

```tsx
<ProcessingPreviewTrigger
  option={processingOption}
  isSelected={isSelected}
  onToggle={handleToggle}
  onPreview={handlePreview}
  language="ja"
  variant="detailed"
  showPriceImpact={true}
  interactive={true}
/>
```

### `processingConfig.ts`
Configuration file containing all processing options, their properties, and helper functions.

**Key Functions:**
- `getProcessingOptionById(id)`: Get option by ID
- `getProcessingOptionsByCategory(category)`: Filter by category
- `getProcessingOptionsByCompatibility(productType)`: Filter by product compatibility
- `calculateProcessingImpact(selectedOptions)`: Calculate price and time impact

## Processing Options Categories

### 🔒 Closure Options
- **Resealable Zipper**: Multiple-use zipper closure
- **Standard Seal**: Single-use heat seal

### ✨ Surface Finish
- **Glossy Finish**: High-shine premium appearance
- **Matte Finish**: Non-reflective elegant surface

### 📂 Opening Features
- **Easy-Tear Notch**: Convenient tear opening
- **Top/Bottom Opening**: Strategic opening placement

### 🏪 Display Options
- **Retail Hang Hole**: Point-of-sale display compatibility
- **Standard Finish**: Clean surface without modifications

### 🏗️ Structure Options
- **Rounded Corners**: Safe, modern corner treatment
- **Square Corners**: Traditional maximum-space design
- **Degassing Valve**: One-way valve for fresh products

## Configuration

### Image Mapping
Each processing option includes before/after image mappings:

```typescript
{
  id: 'zipper-yes',
  name: 'Resealable Zipper',
  nameJa: '再利用可能なジッパー',
  beforeImage: '/images/post-processing/1.지퍼 없음.png',
  afterImage: '/images/post-processing/1.지퍼 있음.png',
  priceMultiplier: 1.15,
  // ... other properties
}
```

### Compatibility Rules
Options specify compatible product types:

```typescript
compatibleWith: ['stand_up', 'flat_3_side', 'gusset', 'flat_with_zip']
```

### Price Impact
Each option has a price multiplier that affects the final calculation:

```typescript
// Example calculation
const basePrice = 100
const zipperMultiplier = 1.15
const glossyMultiplier = 1.08
const finalPrice = basePrice * zipperMultiplier * glossyMultiplier // = 116.2
```

## Performance Optimizations

### Image Preloading
The system includes a sophisticated image preloader:

```typescript
import { globalImagePreloader } from './previewUtils'

// Preload critical images
globalImagePreloader.preloadMultiple([
  '/images/post-processing/1.지퍼 있음.png',
  '/images/post-processing/2.유광.png'
])
```

### Lazy Loading
Images are loaded only when needed:

```typescript
const { src, isLoading, error } = useLazyLoading(imageSrc)
```

### Debounced Search
Search functionality is debounced for performance:

```typescript
const debouncedSearch = useDebounce((query: string) => {
  // Perform search
}, 300)
```

### Memory Management
Automatic cache clearing and memory monitoring:

```typescript
import { globalPerformanceMonitor, useMemoryMonitor } from './previewUtils'

// Monitor performance
const { startTiming, endTiming } = usePerformanceMonitor('ComponentName')

// Monitor memory usage
const memoryUsage = useMemoryMonitor()
```

## Styling and Animations

### CSS Classes
- `.comparison-slider`: Slider comparison container
- `.preview-card`: Individual preview card styling
- `.animate-fade-in`: Fade-in animation
- `.animate-scale-in`: Scale-in animation

### Responsive Design
- **Mobile**: Single column grid, simplified controls
- **Tablet**: Two-column grid, touch-optimized controls
- **Desktop**: Multi-column grid, full feature set

### Accessibility
- Full keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion support

## Testing

### Unit Tests
Comprehensive test coverage with Jest and React Testing Library:

```bash
npm test -- EnhancedPostProcessingPreview.test.tsx
```

### Performance Tests
Built-in performance monitoring utilities:

```typescript
import { globalPerformanceMonitor } from './previewUtils'

// Get performance metrics
const metrics = globalPerformanceMonitor.getMetrics()
console.log('Average render time:', metrics['component-render'].average)
```

## Integration Examples

### Basic Integration
```tsx
import { EnhancedPostProcessingPreview } from '@/components/quote'

function QuoteStep3() {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [priceMultiplier, setPriceMultiplier] = useState(1.0)

  return (
    <EnhancedPostProcessingPreview
      selectedProductType="stand_up"
      selectedOptions={selectedOptions}
      onOptionsChange={setSelectedOptions}
      onPriceUpdate={setPriceMultiplier}
    />
  )
}
```

### Advanced Integration with Custom Processing
```tsx
import {
  EnhancedPostProcessingPreview,
  getProcessingOptionsByCompatibility,
  calculateProcessingImpact
} from '@/components/quote'

function CustomQuoteSystem() {
  const [selectedOptions, setSelectedOptions] = useState([])

  const compatibleOptions = useMemo(() =>
    getProcessingOptionsByCompatibility(productType),
    [productType]
  )

  const processingImpact = useMemo(() =>
    calculateProcessingImpact(selectedOptions),
    [selectedOptions]
  )

  return (
    <div>
      <EnhancedPostProcessingPreview
        selectedProductType={productType}
        selectedOptions={selectedOptions}
        onOptionsChange={setSelectedOptions}
        onPriceUpdate={handlePriceUpdate}
        variant="compact"
      />

      <ProcessingSummary impact={processingImpact} />
    </div>
  )
}
```

## Browser Support

- **Modern Browsers**: Full support for all features
- **IE 11**: Basic functionality with reduced features
- **Mobile Browsers**: Touch-optimized interface
- **Safari**: Full compatibility including Safari-specific optimizations

## Customization

### Adding New Processing Options
1. Add option to `processingConfig.ts`
2. Include before/after images in `/images/post-processing/`
3. Update compatibility rules
4. Test with target product types

### Custom Animations
Add custom CSS animations in `globals.css`:

```css
@keyframes custom-preview-animation {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.custom-preview-class {
  animation: custom-preview-animation 0.3s ease-out;
}
```

### Theme Customization
Modify CSS variables in `globals.css`:

```css
:root {
  --brixa-primary: #your-color;
  --brixa-secondary: #your-color;
  /* ... other theme variables */
}
```

## Troubleshooting

### Common Issues

**Images Not Loading**
- Check image paths in `processingConfig.ts`
- Verify images exist in `/images/post-processing/`
- Check image file formats and sizes

**Performance Issues**
- Enable image optimization
- Reduce preview image resolutions
- Implement virtual scrolling for large lists

**Mobile Responsiveness**
- Check viewport meta tag
- Test on actual mobile devices
- Verify touch event handling

**Memory Leaks**
- Clear image cache when unmounting
- Use proper cleanup in useEffect hooks
- Monitor memory usage with built-in tools

## Future Enhancements

### Planned Features
- [ ] 3D preview visualization
- [ ] AR integration for mobile devices
- [ ] Advanced material simulation
- [ ] Custom processing workflow designer
- [ ] API integration for real-time pricing

### Performance Improvements
- [ ] WebAssembly image processing
- [ ] Service worker caching
- [ ] Predictive image preloading
- [ ] Server-side rendering support

## Support

For issues, questions, or feature requests:
- Check existing issues and documentation
- Provide detailed reproduction steps
- Include browser and device information
- Attach relevant error messages or screenshots