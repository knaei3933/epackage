<!-- Parent: ../AGENTS.md -->

# Home Components

**Purpose**: Homepage-specific components for landing page, hero sections, and quote simulators.

## Directory Structure

```
home/
├── HeroSection.tsx           # Main hero with animated CTAs
├── QuoteSimulator.tsx        # Basic 3-step quote wizard
├── EnhancedQuoteSimulator.tsx # Advanced 5-step wizard with ROI
├── index.ts                  # Public exports
└── animations.ts             # Framer Motion variants (exported)
```

## Key Components

### HeroSection.tsx
- **Role**: Landing page hero with value propositions
- **Features**:
  - Multi-layer background with gradient overlays
  - Floating product images with parallax effects
  - Animated stats (500+ types, 10-day delivery, 100+ companies)
  - CTA buttons with Google Analytics tracking
  - Trust indicators (quality, delivery, cost)
- **Key Images**: `/images/main/main15.png`, `/images/products/granola-standpouch-real.jpg`
- **Dependencies**: `framer-motion`, `next/image`, `lucide-react`

### QuoteSimulator.tsx
- **Role**: Simple 3-step quote calculator
- **Steps**:
  1. Basic specs (product type, quantity, size)
  2. Details (printing, material, timeline, contact info)
  3. Post-processing (optional)
  4. Results with recommendations
- **State**: Uses local state for form data and calculation
- **Features**:
  - Progress bar indicator
  - Real-time price estimation
  - Cost-saving recommendations
  - Multi-language support (Japanese)

### EnhancedQuoteSimulator.tsx
- **Role**: Advanced 5-step wizard with ROI analysis
- **Additional Features**:
  - React Hook Form + Zod validation
  - Material/printing options with detailed specs
  - ROI analysis (payback period, annual savings)
  - Template download section
  - Guest quotation API integration
- **API**: POST to `/api/quotations/guest-save`

## Animation Patterns

All components use `framer-motion` with these variant patterns:

```typescript
import { heroVariants, statVariants, ctaVariants, numberVariants } from './animations'
```

- `heroVariants`: Section-level fade/slide
- `statVariants`: Stat card animations with hover
- `ctaVariants`: Button entrance animations
- `numberVariants`: Pulse animation for numbers

## AI Agent Guidelines

### When Working Here

1. **Hero Changes**:
   - Maintain GA tracking on CTAs
   - Preserve WebP optimization with blur placeholders
   - Keep gradient overlay hierarchy
   - Test responsive breakpoints (md/lg)

2. **Quote Wizards**:
   - Keep step progression logic intact
   - Preserve form validation schemas
   - Maintain calculator state consistency
   - Test post-processing multiplier chain

3. **Animation Performance**:
   - Use `useInView` with `once: true` for hero
   - Keep hover effects on stat cards only
   - Avoid layout thrashing in number animations

### Common Patterns

```typescript
// Product type selection
const productTypes = [
  { value: 'stand_up', label: 'スタンディングパウチ', description: '...' },
  // ... 7 types total
]

// Price calculation formula
const unitPrice = basePrice * sizeMultiplier * printingMultiplier *
                  materialMultiplier * timelineMultiplier *
                  postProcessingMultiplier

// CTA with tracking
<Button
  onClick={() => {
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'cta_button',
        event_label: 'catalog_hero'
      })
    }
  }}
>
```

### Dependencies

```json
{
  "framer-motion": "Animation library",
  "next/image": "Optimized images",
  "lucide-react": "Icon set",
  "react-hook-form": "Form validation (Enhanced only)",
  "zod": "Schema validation (Enhanced only)",
  "@/components/ui/*": "Shared UI components",
  "@/components/quote/PostProcessingPreview": "Shared quote logic"
}
```

## Related Files

- `src/app/page.tsx` - Homepage entry point
- `src/components/quote/` - Shared quote calculation logic
- `src/lib/animations.tsx` - Global animation utilities
- `public/images/main/` - Hero background images
- `public/images/products/` - Product showcase images

## Testing Notes

- Hero section tested for viewport animations
- Quote calculator validates price accuracy
- Form submission tested with guest API
- Responsive layout verified on mobile/tablet/desktop
