<!-- Parent: ../AGENTS.md -->
# Catalog Components

**Purpose**: Product catalog display and filtering components for packaging products.

## Directory Structure

```
catalog/
├── ProductCard.tsx              # Standard product card with quick actions
├── EnhancedProductCard.tsx      # Feature-rich card with animations
├── ProductListItem.tsx          # List-style product display
├── ProductDetailModal.tsx       # Full product detail modal
├── CatalogGrid.tsx              # Product grid layout container
├── CatalogFilters.tsx           # Filter and search controls
├── AdvancedFilters.tsx          # Extended filtering options
├── DownloadButton.tsx           # Template download with loading states
├── ProductCardSkeleton.tsx     # Loading skeleton
├── ProductFAQ.tsx               # Product FAQ section
├── ProductDownloads.tsx         # Download resources section
├── ProductRelatedCases.tsx      # Related use cases display
├── ProductCertifications.tsx   # Certification badges
└── index.ts                     # Public exports
```

## Key Components

### ProductCard
Standard product display card with:
- Image with hover zoom effect
- Status badges (new, featured)
- Quick actions (sample request, template download)
- Feature tags (waterproof, recyclable, child-safe)
- Pricing display with minimum order quantity
- Material tags display

**Props**: `product: PackageProduct, onClick?: () => void`

### EnhancedProductCard
Advanced card with enhanced UX:
- Framer Motion animations (staggered entry, hover effects)
- Trust indicators (ISO certification, quality badges)
- Quick view modal on hover
- Favorite functionality
- Enhanced feature badges with icons
- Responsive 4-column action buttons
- Image fallback handling

**Props**: `product: Product, index: number, onSelect: (product) => void, className?: string`

### ProductDetailModal
Full product detail view with:
- Image gallery with navigation and thumbnails
- Complete specifications (dimensions, weight, capacity)
- Material tags
- Feature matrix (8 binary features)
- Industry applications with examples
- Contact actions (inquiry, detailed consultation)
- Japanese UI labels

**Uses**: `useCatalog()` context for state management

### CatalogGrid
Grid container with:
- Loading state with spinner
- Empty state with localized message
- Product sorting by popularity
- Results count display
- Responsive grid (1/2/3 columns)

**Uses**: `useCatalog()` for filtered products

### CatalogFilters
Filter controls with:
- Search input
- Package type dropdown (6 types)
- Sort options (relevance, price, popularity)
- Expandable advanced filters
- Material, size, industry filters
- Price range inputs
- Active filter badges
- Filter count indicator
- Reset filters button

### DownloadButton
Template download with:
- API integration (`/api/download/templates/{category}`)
- Loading state with progress bar
- Success feedback
- Single template direct download
- Multiple template dropdown
- Disabled state when no templates
- File type icons (AI, PDF, EPS)

**Props**: `productCategory: string, className?: string, size?: 'sm' | 'md', showText?: boolean`

## State Management

Uses `CatalogContext` (`@/contexts/CatalogContext.tsx`):
```typescript
interface CatalogContextType {
  products: PackageProduct[]
  filteredProducts: PackageProduct[]
  filters: CatalogFilters
  sort: SortOption
  isLoading: boolean
  selectedProduct: PackageProduct | null
  modalOpen: boolean
  currentImageIndex: number
  updateFilters: (filters: Partial<CatalogFilters>) => void
  updateSort: (sort: SortOption) => void
  openModal: (product: PackageProduct, imageIndex?: number) => void
  closeModal: () => void
  resetFilters: () => void
}
```

## Type Definitions

Located in `@/types/catalog.ts`:
- `PackageType`: 'standard' | 'premium' | 'eco' | 'luxury' | 'industrial' | 'custom'
- `PackageProduct`: Full product structure with specs, features, pricing, images
- `CatalogFilters`: Filter options (search, type, materials, sizes, industries, priceRange, features)
- `SortOption`: Sort configuration (key: 'relevance' | 'price' | 'popularity' | 'name', order: 'asc' | 'desc')

## Dependencies

### UI Components
- `@/components/ui/Card`, `Badge`, `Button`, `Input`, `Select`
- `@/components/ui/Grid`, `Flex`, `Container`
- `@/components/ui/MotionWrapper`

### External Libraries
- `framer-motion`: Animations (EnhancedProductCard)
- `lucide-react`: Icons
- `next/image`: Optimized images

### Contexts
- `@/contexts/CatalogContext`: Catalog state management
- `@/contexts/LanguageContext`: i18n translations

### Utilities
- `@/lib/array-helpers`: `safeMap()` for null-safe iteration
- `@/lib/utils`: `cn()` for className merging
- `@/lib/product-data`: `PRODUCT_CATEGORIES` mapping

## For AI Agents

### When Modifying Catalog Components

1. **Preserve Japanese UI labels** - All user-facing text should remain in Japanese
2. **Maintain responsive design** - Use grid-cols responsive classes
3. **Handle missing data** - Use optional chaining and fallbacks for optional fields
4. **Test image loading** - Include onError handlers with fallback icons
5. **Respect existing animations** - Keep Framer Motion transitions consistent

### Component Patterns

**Card Components**:
- Use `group` class for hover effects on children
- Include `line-clamp` for text truncation
- Add `safeMap()` for array iteration
- Use `aspect-[4/3]` for product images
- Include loading/error states

**Modal Components**:
- Fixed position overlay with `z-50`
- Max height with `overflow-y-auto`
- Close button in header
- Image gallery with thumbnail navigation

**Filter Components**:
- Debounce URL updates (300ms)
- Parse/query string for URL sync
- Active filter count badge
- Reset button appears only when filters active

### Common Patterns

```typescript
// Safe array iteration
{safeMap(product.tags.slice(0, 3), (tag, index) => (
  <TagBadge key={index} size="sm">{tag}</TagBadge>
))}

// Image with fallback
<img
  src={product.image}
  onError={(e) => {
    e.currentTarget.style.display = 'none'
    e.currentTarget.nextElementSibling?.classList.remove('hidden')
  }}
/>
<Package className="hidden" />

// Modal state
const [showModal, setShowModal] = useState(false)
<AnimatePresence>
  {showModal && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

### Adding New Products

1. Add to `@/data/catalogData.ts` (catalogProducts array)
2. Include all required fields: id, name, type, category, specs, features, pricing
3. Add images to `public/images/catalog/`
4. Update product categories in `@/lib/product-data.ts` if new category

### Translation Keys

Catalog components use `@/locales/index.ts`:
- `catalog.searchPlaceholder`: Search input placeholder
- `catalog.packageTypes.*`: Package type labels
- `catalog.sortBy*`: Sort option labels
- `common.loading`, `common.noResults`, `common.filter`, `common.reset`: Common UI text

## Testing Considerations

- Test with products missing optional fields (images, materials)
- Verify filter combinations return correct results
- Check URL sync when filters change
- Test image gallery navigation
- Verify download button states (loading, success, error)
- Test responsive breakpoints (mobile, tablet, desktop)
- Check Japanese text display (no encoding issues)
