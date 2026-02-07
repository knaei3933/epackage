# Catalog Directory - AI Agents Guide

<!-- Parent: ../../AGENTS.md -->

## Purpose

Product catalog pages for Epackage Lab - displaying 6 types of pouch products with filtering, search, and detailed product information. Supports both Japanese and international customers.

## Directory Structure

```
catalog/
├── page.tsx                    # Main catalog listing page
├── CatalogClient.tsx           # Client-side catalog with filtering
├── [slug]/
│   ├── page.tsx               # Dynamic product detail page
│   └── ProductDetailClient.tsx # Client-side product detail
└── AGENTS.md                   # This file
```

## Key Files

### page.tsx
- **Type**: Server Component
- **Purpose**: Catalog landing page with SEO metadata
- **Exports**: `CatalogClient` component wrapped in `CartProvider`
- **Metadata**: Japanese SEO with OpenGraph, Twitter cards, canonical URLs

### CatalogClient.tsx
- **Type**: Client Component ('use client')
- **Purpose**: Main catalog interface with product filtering and display
- **Key Features**:
  - Grid/List view toggle
  - Client-side and database filtering
  - Search functionality
  - Category filtering
  - Material, feature, and application filters
  - Price range filtering
  - Sort by name, lead time, or price
  - Product detail modal

### [slug]/page.tsx
- **Type**: Server Component with dynamic routing
- **Purpose**: Individual product detail pages
- **Features**:
  - Static generation for all products (`generateStaticParams`)
  - Dynamic metadata per product
  - 404 handling with `notFound()`

### [slug]/ProductDetailClient.tsx
- **Type**: Client Component
- **Purpose**: Product detail page with tabs and structured data
- **Tabs**: Overview, Specifications, Applications, Pricing, FAQ, Downloads, Cases, Certifications
- **SEO**: Structured data (ProductSchema) for rich snippets

## Product Data Structure

Products are defined in `@/lib/product-data.ts`:

```typescript
interface Product {
  id: string                  // Unique identifier (slug)
  category: ProductCategory   // flat_3_side, gassho, stand_up, box, spout_pouch, roll_film
  name_ja: string            // Japanese name
  name_en: string            // English name
  description_ja: string     // Japanese description
  description_en: string     // English description
  specifications: object     // Technical specs (width, height, thickness, materials)
  materials: string[]        // Available materials
  pricing_formula: object    // Base cost, per-unit cost, min quantity
  min_order_quantity: number // Minimum order quantity
  lead_time_days: number     // Production lead time
  sort_order: number         // Display order
  is_active: boolean         // Active status
  tags: string[]            // Product tags (localized)
  applications: string[]    // Use cases (localized)
  features: string[]        // Key features (localized)
  // Phase 1 extensions:
  faq?: FAQ[]               // Frequently asked questions
  downloads?: Download[]    // Downloadable resources
  related_case_studies?: string[]  // Related archive IDs
  certifications?: Certification[]  // Product certifications
}
```

## Product Categories

| Category | Japanese | English | Icon |
|----------|----------|---------|------|
| `flat_3_side` | 平袋 | Three-Side Seal Bag | package |
| `gassho` | 合掌袋 | Pillow Pouch | box |
| `stand_up` | スタンドパウチ | Stand Pouch | shopping-bag |
| `box` | BOX型パウチ | Box Pouch | package |
| `spout_pouch` | スパウトパウチ | Spout Pouch | package-2 |
| `roll_film` | ロールフィルム | Roll Film | archive |

## Dependencies

### Internal Dependencies
- `@/lib/product-data` - Product data source (`getAllProducts`, `PRODUCT_CATEGORIES`)
- `@/lib/products` - Product utilities
- `@/components/catalog/*` - Catalog-specific components
- `@/components/ui/*` - UI components (Button, Card, Badge, Grid, Container)
- `@/components/ui/MotionWrapper` - Animation wrapper
- `@/components/ui/LoadingState` - Loading state component
- `@/contexts/CartContext` - Shopping cart context
- `@/types/database` - Product types

### External Dependencies
- `next/navigation` - Next.js routing (`notFound`, Link)
- `framer-motion` - Animations (`motion`, `AnimatePresence`)
- `lucide-react` - Icons

## For AI Agents

### When Adding New Products

1. **Update product-data.ts**:
   ```typescript
   {
     id: 'new-product-001',
     category: 'stand_up' as const,
     name_ja: '新产品名',
     name_en: 'New Product Name',
     // ... required fields
     sort_order: 7,  // Increment for new products
   }
   ```

2. **Product images** go in `/public/images/` or `/public/images/products/`

3. **Static generation** automatically includes new products via `generateStaticParams()`

### When Modifying Filters

**CatalogClient.tsx** filtering logic:
- Client-side: `applyClientSideFilters()` function
- Database: `/api/products/filter` endpoint
- Filter state: `FilterState` interface

**Filter categories**:
- Category (product type)
- Materials (product.materials array)
- Features (product.features array)
- Applications (product.applications array)
- Tags (product.tags array)
- Price range (pricing_formula.base_cost)
- Lead time (lead_time_days)

### When Adding Tabs to Product Detail

**ProductDetailClient.tsx** tab structure:
```typescript
const tabs = [
  { id: 'overview', label: '概要', icon: Info },
  { id: 'specifications', label: '仕様', icon: Ruler },
  // Add new tabs here
]
```

Each tab needs:
1. Tab button configuration in array
2. Content rendering section in JSX
3. Optional component in `/components/catalog/` for complex tabs

### SEO Considerations

**page.tsx** metadata:
- Japanese title and description
- OpenGraph for social sharing
- Twitter card support
- Canonical URLs
- Language alternates (ja, en, ko)

**ProductDetailClient.tsx**:
- Structured data with `ProductSchema` component
- Breadcrumb navigation
- Product-related internal linking

### Localization

- **Primary language**: Japanese
- **Secondary**: English (name_en, description_en fields)
- **Product data**: `getAllProducts(null, 'ja')` for Japanese content
- Extend to Korean (name_ko) as needed

### Common Patterns

**Product listing**:
```typescript
const products = getAllProducts(null, 'ja')
filteredProducts.map(product => (
  <EnhancedProductCard key={product.id} product={product} />
))
```

**Category filtering**:
```typescript
const categoryInfo = PRODUCT_CATEGORIES[product.category]
```

**Modal pattern**:
```typescript
const [selectedProduct, setSelectedProduct] = useState(null)
// In modal:
<AnimatePresence>
  {selectedProduct && <ProductDetailModal product={selectedProduct} />}
</AnimatePresence>
```

### Performance Notes

- **Static generation**: All product pages pre-rendered at build time
- **Client-side filtering**: Fast, no server calls for basic filters
- **Database filtering**: Available via `/api/products/filter`
- **Image optimization**: Use Next.js Image component for product images
- **Loading states**: Skeleton screens during data fetch

### Common Tasks

| Task | Location |
|------|----------|
| Add new product | `src/lib/product-data.ts` |
| Change filter logic | `CatalogClient.tsx` - `applyClientSideFilters()` |
| Modify product card | `EnhancedProductCard.tsx` |
| Update SEO metadata | `page.tsx` - `generateMetadata()` |
| Add product tab | `ProductDetailClient.tsx` - tabs array |
| Change sort options | `CatalogClient.tsx` - sortBy switch statement |

## Related Files

- `/src/lib/product-data.ts` - Product data definitions
- `/src/components/catalog/` - Catalog-specific components
- `/src/components/seo/StructuredData.tsx` - Product schema markup
- `/src/types/database.ts` - Product type definitions
- `/public/images/products/` - Product images directory

## API Endpoints

- `GET /api/products` - Fetch all products from database
- `POST /api/products/filter` - Filter products server-side

## Testing Considerations

- Product data completeness (all required fields)
- Filter combinations (category + material + price)
- Search functionality (Japanese and English)
- Responsive design (mobile grid/list views)
- Static generation (all products generate pages)
- Metadata accuracy (SEO tags)
- Modal open/close interactions
