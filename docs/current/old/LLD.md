# Epackage Lab Homepage Rebuild - Low-Level Design (LLD) Document

**Version**: 2.1
**Date**: 2026-01-03
**Author**: Senior Frontend Developer & System Architect
**Status**: Active
**Target Implementation**: Q1 2025

---

## Changelog

### Version 2.1 (2026-01-03)
- Added Performance Modules section (API Cache, Optimized Fetch, Lazy Load)
- Added File Upload Security section with magic number validation
- Updated database schema with 28 performance indexes
- Enhanced performance optimization strategy with code splitting details
- Updated security best practices

### Version 2.0 (2025-11-30)
- Initial comprehensive LLD for Epackage Lab rebuild

---

## Executive Summary

This Low-Level Design (LLD) document provides comprehensive technical specifications for rebuilding the Epackage Lab homepage into a world-class B2B e-commerce platform. The design builds upon the existing Next.js 16 foundation while implementing the 7 core systems defined in the PRD: Product Catalog, Quote Simulation, Sample Request, Company Introduction, Case Studies, Knowledge Center, and Contact System.

The architecture emphasizes scalability, maintainability, and performance optimization for the Japanese market, with specific attention to B2B e-commerce requirements, multi-language support, and complex business logic for packaging materials.

---

## 1. Architecture Overview

### 1.1 High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Next.js 16)                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │   Pages     │  │ Components  │  │   Hooks     │  │ Context │  │
│  │   (App)     │  │ (Reusable)  │  │ (Custom)    │  │ (State) │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   API LAYER (Next.js API Routes)                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │   Product   │  │   Quote     │  │   Sample    │  │ Contact │  │
│  │   Services  │  │  Services   │  │  Services   │  │Services │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                   DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │ PostgreSQL  │  │  Supabase   │  │    Redis    │  │  Files  │  │
│  │ (Primary)   │  │ (Auth/Realtime)│  │  (Cache)   │  │ (CDN)   │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Hierarchy

```
app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Homepage
├── (marketing)/                  # Marketing pages group
│   ├── page.tsx                 # Landing page
│   ├── about/                   # Company introduction
│   ├── case-studies/           # Client success stories
│   └── knowledge-center/       # Educational content
├── (products)/                  # Product-related pages
│   ├── catalog/                # Product browsing
│   ├── products/[slug]/        # Product details
│   ├── compare/                # Product comparison
│   └── configure/              # Custom configuration
├── (commerce)/                 # Commerce flows
│   ├── quote/                  # Quote simulation
│   ├── samples/                # Sample requests
│   └── dashboard/              # User portal
├── (support)/                  # Support pages
│   ├── contact/                # Contact forms
│   ├── help/                   # Help documentation
│   └── consultation/           # Expert consultation
└── api/                        # API routes
```

### 1.3 Data Flow Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (React)    │◀────│  Routes     │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                     │
       ▼                   ▼                     ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    State    │     │ Validation  │     │   Cache     │
│  Management │     │   & Auth    │     │  (Redis)    │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 2. Page Structure & Component Breakdown

### 2.1 Homepage (`/`)

**Purpose**: Primary landing page with business overview and navigation to core features

**Component Structure**:
```tsx
app/page.tsx
├── components/layout/
│   ├── Header.tsx              # Navigation and language switcher
│   ├── Hero.tsx                # Value proposition showcase
│   ├── TrustIndicators.tsx     # Client logos and certifications
│   ├── FeaturesOverview.tsx    # 7 core systems preview
│   ├── CallToAction.tsx        # Primary conversion points
│   └── Footer.tsx              # Comprehensive footer
```

**Key Features**:
- Multi-language support (Japanese/Korean/English)
- Hero section with animated value propositions
- Trust indicators for Japanese market
- Quick access to all 7 core systems
- Performance-optimized with lazy loading

### 2.2 Product Catalog System

#### 2.2.1 Catalog Browser (`/catalog`)

**Purpose**: Browsable product catalog with advanced filtering

**Component Structure**:
```tsx
app/catalog/page.tsx
├── components/catalog/
│   ├── CatalogHeader.tsx       # Search and filter controls
│   ├── CategoryGrid.tsx        # 6 package type categories
│   ├── ProductGrid.tsx         # Filtered product listings
│   ├── ProductCard.tsx         # Individual product preview
│   ├── FilterSidebar.tsx       # Advanced filtering options
│   ├── ComparisonBar.tsx       # Product comparison feature
│   └── Pagination.tsx          # Results pagination
```

**State Management**:
```tsx
// Catalog state structure
interface CatalogState {
  products: Product[];
  filters: {
    category: string[];
    material: string[];
    size: SizeRange;
    industry: string[];
    priceRange: PriceRange;
  };
  sorting: SortOption;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  comparison: Product[];
  loading: boolean;
}
```

#### 2.2.2 Product Detail (`/products/[slug]`)

**Purpose**: Comprehensive product information and configuration

**Component Structure**:
```tsx
app/products/[slug]/page.tsx
├── components/products/
│   ├── ProductHeader.tsx       # Product title and breadcrumbs
│   ├── ProductGallery.tsx      # Image carousel with zoom
│   ├── ProductInfo.tsx         # Basic product information
│   ├── Specifications.tsx      # Technical specifications
│   ├── Compliance.tsx          # Certifications and standards
│   ├── Applications.tsx        # Use cases and industries
│   ├── Configuration.tsx       # Custom configuration tool
│   ├── RelatedProducts.tsx     # Similar products
│   └── QuoteActions.tsx        # Quote and sample CTAs
```

**Data Fetching Strategy**:
```tsx
// Server-side data fetching
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map(product => ({
    slug: product.slug
  }));
}

export async function getProductData(slug: string) {
  const product = await getProduct(slug);
  const related = await getRelatedProducts(product);
  const specifications = await getSpecifications(product.id);

  return {
    product,
    related,
    specifications
  };
}
```

### 2.3 Quote Simulation System

#### 2.3.1 Quote Builder (`/quote`)

**Purpose**: Multi-step quotation configuration wizard

**Component Structure**:
```tsx
app/quote/page.tsx
├── components/quote/
│   ├── QuoteWizard.tsx         # Multi-step wizard container
│   ├── StepIndicator.tsx       # Progress indicator
│   ├── ProductSelection.tsx    # Choose products for quote
│   ├── ConfigurationStep.tsx   # Configure product specifications
│   ├── QuantityStep.tsx        # Volume and packaging details
│   ├── ShippingStep.tsx        # Delivery and logistics
│   ├── QuoteSummary.tsx        # Complete quote preview
│   └── QuoteActions.tsx        # Save, share, submit options
```

**State Management**:
```tsx
// Quote configuration state
interface QuoteConfiguration {
  id: string;
  items: QuoteItem[];
  shipping: ShippingDetails;
  timeline: DeliveryTimeline;
  pricing: PricingBreakdown;
  status: 'draft' | 'submitted' | 'approved' | 'expired';
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2.3.2 Quote Management (`/dashboard/quotes`)

**Purpose**: User quote tracking and management

**Component Structure**:
```tsx
app/dashboard/quotes/page.tsx
├── components/quotes/
│   ├── QuoteDashboard.tsx      # Main dashboard view
│   ├── QuoteList.tsx           # Saved and active quotes
│   ├── QuoteCard.tsx           # Individual quote preview
│   ├── QuoteFilters.tsx        # Filter and search quotes
│   ├── QuoteComparison.tsx     # Side-by-side comparison
│   └── QuoteActions.tsx        # Edit, share, convert actions
```

### 2.4 Sample Request System

#### 2.4.1 Sample Builder (`/samples`)

**Purpose**: Physical sample request configuration

**Component Structure**:
```tsx
app/samples/page.tsx
├── components/samples/
│   ├── SampleWizard.tsx        # Multi-step sample request
│   ├── ProductSelector.tsx     # Choose samples
│   ├── SampleConfiguration.tsx # Sample specifications
│   ├── ShippingForm.tsx        # Delivery information
│   ├── ProjectDetails.tsx      # Use case information
│   ├── SampleSummary.tsx       # Request preview
│   └── ConsentForm.tsx         # Japanese compliance consent
```

**Business Logic**:
```tsx
// Sample request validation
const sampleRequestSchema = z.object({
  samples: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1).max(5),
    customizations: z.object({
      size: z.string().optional(),
      printing: z.string().optional(),
      material: z.string().optional()
    }).optional()
  })).max(5),
  shipping: shippingSchema,
  project: projectDetailsSchema,
  consent: z.boolean().refine(val => val === true)
});
```

### 2.5 Company Introduction (`/about`)

**Purpose**: Company story, capabilities, and trust building

**Component Structure**:
```tsx
app/about/page.tsx
├── components/about/
│   ├── CompanyHero.tsx         # Company introduction
│   ├── Timeline.tsx            # Company milestones
│   ├── Certifications.tsx      # Quality standards showcase
│   ├── Facilities.tsx          # Production facility tour
│   ├── Testimonials.tsx        # Client success stories
│   ├── Team.tsx                # Leadership team
│   └── Values.tsx              # Company values and mission
```

### 2.6 Case Studies (`/case-studies`)

**Purpose**: Social proof and industry expertise demonstration

**Component Structure**:
```tsx
app/case-studies/page.tsx
├── components/case-studies/
│   ├── CaseStudyGrid.tsx       # Case study listings
│   ├── CaseStudyCard.tsx       # Individual case preview
│   ├── IndustryFilter.tsx      # Filter by industry
│   ├── ProductFilter.tsx       # Filter by product type
│   └── CaseStudyDetail.tsx     # Full case study view
```

**Data Structure**:
```tsx
interface CaseStudy {
  id: string;
  title: {
    ja: string;
    ko: string;
    en: string;
  };
  client: {
    name: string;
    industry: string;
    logo: string;
  };
  challenge: LocalizedContent;
  solution: LocalizedContent;
  results: {
    metrics: Metric[];
    testimonial: string;
    timeline: string;
  };
  products: string[];
  gallery: CaseStudyImage[];
  tags: string[];
  publishedAt: Date;
}
```

### 2.7 Knowledge Center (`/knowledge-center`)

**Purpose**: Educational content and thought leadership

**Component Structure**:
```tsx
app/knowledge-center/page.tsx
├── components/knowledge/
│   ├── ResourceHub.tsx         # Main resource browser
│   ├── ArticleGrid.tsx         # Educational articles
│   ├── ToolLibrary.tsx         # Interactive calculators
│   ├── VideoLibrary.tsx        # Tutorial videos
│   ├── DownloadCenter.tsx      # Technical documentation
│   └── NewsletterSignup.tsx    # Content subscription
```

### 2.8 Contact System (`/contact`)

**Purpose**: Multi-channel communication and expert consultation

**Component Structure**:
```tsx
app/contact/page.tsx
├── components/contact/
│   ├── ContactHub.tsx          # Contact options overview
│   ├── ContactForm.tsx         # Detailed inquiry form
│   ├── ConsultationBooking.tsx # Meeting scheduler
│   ├── LiveChat.tsx            # Real-time support
│   ├── ContactInfo.tsx         # Contact information
│   └── ResponseTime.tsx        # Response time indicators
```

---

## 3. Component Library & Design System

### 3.1 Core Design Principles

**Visual Language**: Premium metallic aesthetic with Japanese design sensibilities
**Color Palette**: Sophisticated metallics with corporate blue accents
**Typography**: Noto Sans JP for Japanese, optimized for readability
**Spacing**: 8px base grid system for consistent rhythm
**Animations**: Subtle micro-interactions enhancing UX without distraction

### 3.2 Component Architecture

#### 3.2.1 Base Components (`src/components/ui/`)

```tsx
// Button variants using Class Variance Authority
export const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl",
        secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-gray-900 hover:bg-white/20",
        metallic: "bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-gray-900 shadow-md hover:shadow-lg border border-gray-200",
        outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base"
      }
    }
  }
);
```

#### 3.2.2 Layout Components (`src/components/layout/`)

```tsx
// Glass morphism card component
export const GlassCard = ({ children, className, variant = "default" }) => {
  const variants = {
    default: "backdrop-blur-md bg-white/70 border border-white/20 shadow-xl",
    elevated: "backdrop-blur-lg bg-white/80 border border-white/10 shadow-2xl",
    subtle: "backdrop-blur-sm bg-white/50 border border-white/30 shadow-lg"
  };

  return (
    <div className={`rounded-2xl ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Responsive grid system
export const Grid = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "gap-6",
  className
}) => {
  const gridClasses = cn(
    "grid",
    cols.sm && `grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    gap,
    className
  );

  return <div className={gridClasses}>{children}</div>;
};
```

#### 3.2.3 Form Components (`src/components/forms/`)

```tsx
// Enhanced input with validation and icons
export const FormInput = ({
  label,
  error,
  icon,
  characterCount,
  className,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [value, setValue] = useState(props.defaultValue || '');

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className={cn(
          "text-sm font-medium transition-colors",
          focused && "text-blue-600",
          error && "text-red-600"
        )}>
          {label}
        </Label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <Input
          {...props}
          className={cn(
            "transition-all duration-200",
            icon && "pl-10",
            focused && "ring-2 ring-blue-500 ring-offset-2",
            error && "border-red-500 focus:ring-red-500"
          )}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            props.onChange?.(e);
          }}
        />
        {characterCount && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
            {value.length}/{props.maxLength}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 animate-fade-in">
          {error.message}
        </p>
      )}
    </div>
  );
};
```

### 3.3 Animation System

#### 3.3.1 Framer Motion Integration

```tsx
// Page transition wrapper
export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }}
  >
    {children}
  </motion.div>
);

// Staggered list animation
export const AnimatedList = ({ children, staggerDelay = 0.1 }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
```

---

## 4. State Management Strategy

### 4.1 Global State Architecture

**Approach**: React Context + useReducer for global state, local state for component-specific data

**Context Structure**:
```tsx
// contexts/AppContext.tsx
interface AppState {
  user: User | null;
  cart: CartState;
  quotes: QuoteState;
  samples: SampleState;
  ui: UIState;
  language: Language;
  theme: Theme;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'UPDATE_QUOTE'; payload: QuoteConfiguration }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_THEME'; payload: Theme };

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: { ...state.cart, items: [...state.cart.items, action.payload] }
      };
    // ... other cases
    default:
      return state;
  }
};
```

### 4.2 Feature-Specific State

#### 4.2.1 Catalog State

```tsx
// contexts/CatalogContext.tsx
interface CatalogContextType {
  products: Product[];
  filters: CatalogFilters;
  sorting: SortOption;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
  comparison: Product[];

  // Actions
  setFilters: (filters: Partial<CatalogFilters>) => void;
  setSorting: (sorting: SortOption) => void;
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  loadMore: () => void;
  resetFilters: () => void;
}

export const CatalogProvider = ({ children }) => {
  const [state, dispatch] = useReducer(catalogReducer, initialCatalogState);

  // Memoized filtered products
  const filteredProducts = useMemo(() => {
    return filterProducts(state.products, state.filters, state.sorting);
  }, [state.products, state.filters, state.sorting]);

  // API calls with loading states
  const loadProducts = useCallback(async (params: ProductQuery) => {
    dispatch({ type: 'LOADING_START' });
    try {
      const products = await productService.getProducts(params);
      dispatch({ type: 'LOAD_SUCCESS', payload: products });
    } catch (error) {
      dispatch({ type: 'LOAD_ERROR', payload: error.message });
    }
  }, []);

  return (
    <CatalogContext.Provider value={{ ...state, filteredProducts, loadProducts }}>
      {children}
    </CatalogContext.Provider>
  );
};
```

#### 4.2.2 Quote State

```tsx
// contexts/QuoteContext.tsx
interface QuoteContextType {
  currentQuote: QuoteConfiguration | null;
  savedQuotes: QuoteConfiguration[];
  pricing: PricingCalculation | null;
  loading: boolean;

  // Actions
  startQuote: () => void;
  addItem: (item: QuoteItem) => void;
  updateItem: (itemId: string, updates: Partial<QuoteItem>) => void;
  removeItem: (itemId: string) => void;
  setShipping: (shipping: ShippingDetails) => void;
  calculatePricing: () => Promise<void>;
  saveQuote: (name: string) => Promise<void>;
  loadQuote: (id: string) => Promise<void>;
  submitQuote: () => Promise<void>;
}
```

### 4.3 Data Fetching Strategy

#### 4.3.1 Server Components and Client Components

```tsx
// Server component for initial data loading
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  const related = await getRelatedProducts(product.id);

  return (
    <ProductDetailClient
      product={product}
      related={related}
    />
  );
}

// Client component for interactivity
'use client';
export function ProductDetailClient({ product, related }) {
  const [configuration, setConfiguration] = useState(product.defaultConfig);
  const { addToQuote } = useQuoteContext();

  // Client-side operations
  const handleConfigurationChange = useCallback((newConfig) => {
    setConfiguration(newConfig);
  }, []);

  return (
    <ProductDetail
      product={product}
      related={related}
      configuration={configuration}
      onConfigurationChange={handleConfigurationChange}
      onAddToQuote={addToQuote}
    />
  );
}
```

#### 4.3.2 Optimistic Updates and Error Handling

```tsx
// Custom hook for optimistic updates
export function useOptimisticMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  optimisticUpdate: (variables: V) => void
) {
  const [state, setState] = useState<{ data: T | null; loading: boolean; error: string | null }>({
    data: null,
    loading: false,
    error: null
  });

  const mutate = useCallback(async (variables: V) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    // Optimistic update
    optimisticUpdate(variables);

    try {
      const result = await mutationFn(variables);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
      // Rollback on error
      throw error;
    }
  }, [mutationFn, optimisticUpdate]);

  return { ...state, mutate };
}
```

---

## 5. API Integration Architecture

### 5.1 API Route Structure

**Next.js API Routes** with RESTful design and GraphQL-like querying capabilities

```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = parseProductQuery(searchParams);

  try {
    const products = await productService.getProducts(query);
    const pagination = await productService.getPagination(query);

    return NextResponse.json({
      success: true,
      data: products,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'PRODUCT_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}
```

### 5.2 Service Layer Architecture

#### 5.2.1 Product Service

```typescript
// lib/services/productService.ts
export class ProductService {
  private cache = new Map<string, Product[]>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getProducts(query: ProductQuery): Promise<Product[]> {
    const cacheKey = this.generateCacheKey(query);
    const cached = this.cache.get(cacheKey);

    if (cached && this.isCacheValid(cached)) {
      return cached;
    }

    const products = await this.fetchFromDatabase(query);
    this.cache.set(cacheKey, products);

    return products;
  }

  async getProduct(slug: string): Promise<Product> {
    // Implementation with caching and error handling
  }

  async getRelatedProducts(productId: string): Promise<Product[]> {
    // Smart related product recommendation
  }

  private async fetchFromDatabase(query: ProductQuery): Promise<Product[]> {
    // Database query implementation
  }
}
```

#### 5.2.2 Quote Service

```typescript
// lib/services/quoteService.ts
export class QuoteService {
  async calculateQuote(quote: QuoteConfiguration): Promise<PricingCalculation> {
    const pricing = await this.calculateBasePricing(quote);
    const shipping = await this.calculateShipping(quote.shipping);
    const taxes = await this.calculateTaxes(quote, shipping);
    const discounts = await this.applyDiscounts(quote);

    return {
      subtotal: pricing.base,
      shipping: shipping.cost,
      taxes: taxes.amount,
      discounts: discounts.total,
      total: pricing.base + shipping.cost + taxes.amount - discounts.total,
      breakdown: {
        items: pricing.items,
        shipping: shipping.breakdown,
        taxes: taxes.breakdown,
        discounts: discounts.items
      }
    };
  }

  async saveQuote(quote: QuoteConfiguration, userId: string): Promise<string> {
    const quoteId = await this.persistQuote(quote, userId);

    // Send confirmation email
    await this.emailService.sendQuoteConfirmation(quote, quoteId);

    return quoteId;
  }
}
```

### 5.3 Performance Modules Library

#### 5.3.1 API Response Cache

**Location**: `src/lib/api-cache.ts`

In-memory LRU cache with TTL support for API responses.

```typescript
// Cache management
import apiCache from '@/lib/api-cache';

// Get cached data
const products = apiCache.get<Product[]>('/api/products', { category: 'boxes' });

// Set cached data with custom TTL
apiCache.set('/api/products', products, {
  ttl: 10 * 60 * 1000  // 10 minutes
});

// Invalidate cache pattern
apiCache.invalidatePattern('/api/products.*');

// Cache decorator for API routes
export async function GET() {
  return withCache(async () => {
    const data = await fetchFromDatabase();
    return Response.json(data);
  }, '/api/quotations');
}
```

**Features**:
- Default 5-minute TTL (configurable)
- Automatic cleanup of expired entries
- Pattern-based cache invalidation
- Cache statistics and monitoring
- LRU eviction policy

**Configuration**:
```typescript
interface CacheOptions {
  ttl?: number;        // Custom TTL in milliseconds
  key?: string;        // Custom cache key
}
```

#### 5.3.2 Optimized Data Fetching

**Location**: `src/hooks/use-optimized-fetch.ts`

Enhanced SWR integration with automatic caching, deduplication, and revalidation.

```typescript
import { useOptimizedFetch } from '@/hooks/use-optimized-fetch';

// Basic usage with caching
function ProductList() {
  const { data, error, isLoading } = useOptimizedFetch<Product[]>('/api/products', {
    refreshInterval: 30000,      // Auto-refresh every 30s
    dedupingInterval: 5000,      // Deduplicate within 5s
    fallbackData: DEFAULT_PRODUCTS
  });

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorMessage error={error} />;
  return <ProductGrid products={data} />;
}

// Infinite scroll
function InfiniteCatalog() {
  const { data, isLoadingMore, isReachingEnd, setSize } = useInfiniteFetch<Product>(
    '/api/products',
    (index, previousData) => {
      if (previousData && !previousData.length) return null;
      return `/api/products?page=${index + 1}`;
    }
  );

  return (
    <div>
      {data?.flat().map(p => <ProductCard key={p.id} product={p} />)}
      {!isReachingEnd && (
        <button onClick={() => setSize(s => s + 1)}>
          {isLoadingMore ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}

// Prefetch for faster navigation
function ProductLink({ id, children }) {
  return (
    <Link
      href={`/products/${id}`}
      onMouseEnter={() => prefetchData(`/api/products/${id}`)}
    >
      {children}
    </Link>
  );
}
```

**Features**:
- Automatic request deduplication
- Stale-while-revalidate caching
- Infinite scroll support
- Batch fetching for parallel requests
- Prefetching for navigation optimization
- Timeout support for slow requests

#### 5.3.3 Lazy Loading Utilities

**Location**: `src/lib/lazy-load.tsx`

Component lazy loading with loading states and error boundaries.

```typescript
import {
  lazyWithFallback,
  createDynamicComponent,
  LazyIntersectionImage
} from '@/lib/lazy-load';

// Lazy load heavy component
const ChartComponent = lazyWithFallback(
  () => import('@/components/HeavyChart'),
  { fallback: <ChartSkeleton /> }
);

// Dynamic component with SSR control
const PdfViewer = createDynamicComponent(
  () => import('@/components/PdfViewer'),
  {
    loading: FullPageLoading,
    ssr: false  // Client-side only
  }
);

// Intersection observer for images
function ProductGallery({ images }: { images: string[] }) {
  return (
    <div>
      {images.map(src => (
        <LazyIntersectionImage
          key={src}
          src={src}
          alt="Product"
          placeholder="/images/placeholder.jpg"
          loading="lazy"
        />
      ))}
    </div>
  );
}
```

**Predefined Lazy Components**:
```typescript
import {
  LazyAdminDashboard,    // Admin dashboard
  LazyChart,             // Chart components
  LazyPdfGenerator,      // PDF generation
  LazyRichTextEditor     // Rich text editor
} from '@/lib/lazy-load';
```

**Features**:
- Intersection Observer for viewport detection
- Placeholder support for images
- Custom loading components
- SSR control per component
- Code splitting at component level
- HOC wrappers for easy integration

---

### 5.4 File Upload Security System

#### 5.4.1 Security Validator Module

**Location**: `src/lib/file-validator/security-validator.ts`

Comprehensive file upload security with magic number validation, size limits, and malicious content detection.

```typescript
import {
  validateFileSecurity,
  quickValidateFile,
  fullValidateFile
} from '@/lib/file-validator';

// Basic validation
async function handleUpload(file: File) {
  const result = await validateFileSecurity(file);

  if (!result.isValid) {
    result.errors.forEach(error => {
      console.error(`[${error.severity}] ${error.message_ja}`);
    });
    return;
  }

  await uploadFile(file);
}

// Full validation with virus scanning
async function handleSecureUpload(file: File) {
  const result = await fullValidateFile(file, {
    apiKey: process.env.VIRUS_SCAN_API_KEY
  });

  if (result.scanResults?.infected) {
    alert('ファイルにウイルスが検出されました');
    return;
  }

  if (result.isValid) {
    await uploadFile(file);
  }
}
```

**Security Layers**:

1. **File Size Limits** (10MB default)
```typescript
const result = await validateFileSecurity(file, {
  maxSize: 10 * 1024 * 1024  // 10MB
});
```

2. **Magic Number Validation**
- Detects actual file type from binary signature
- 20+ file types supported (JPEG, PNG, PDF, PSD, AI, etc.)
- Prevents extension spoofing attacks

3. **Malicious Content Detection**
- Script injection patterns (`<script>`, `javascript:`, event handlers)
- SQL injection patterns (`' OR '1'='1`, `DROP TABLE`)
- Path traversal patterns (`../../../etc/passwd`)
- Shell command patterns (`exec()`, `eval()`, `system()`)

4. **Executable File Blocking**
- Windows EXE (MZ header: 4D 5A)
- Linux ELF (7F 45 4C 46)
- macOS Mach-O (FE ED FA CF)

5. **Suspicious Extension Blocking**
```
.exe, .dll, .so, .dylib, .bat, .cmd, .sh, .ps1,
.vbs, .js, .jar, .scr, .msi, .com, .pif, .deb, .rpm, .app
```

6. **Archive File Handling**
- ZIP, RAR, 7Z detection
- Optional strict mode to reject archives

#### 5.4.2 API Route Implementation

```typescript
// app/api/upload/route.ts
import { validateFileSecurity } from '@/lib/file-validator';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Validate security
  const result = await validateFileSecurity(file, {
    maxSize: 10 * 1024 * 1024,
    requireMagicNumber: true,
    strictMode: false
  });

  if (!result.isValid) {
    return Response.json({
      error: 'File validation failed',
      details: result.errors
    }, { status: 400 });
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(`${Date.now()}-${sanitizeFilename(file.name)}`, file);

  return Response.json({ url: data.path });
}
```

#### 5.4.3 Test Coverage

**Location**: `src/lib/file-validator/__tests__/security-validator.test.ts`

Comprehensive test suite covering:
- Magic number validation for all file types
- File size limit enforcement
- Malicious pattern detection
- Executable file blocking
- Suspicious extension detection
- Archive handling
- Edge cases (empty files, tiny files, null bytes)

```bash
npm run test -- security-validator.test.ts
```

---

### 5.5 Database Integration

#### 5.5.1 Supabase Integration

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export { supabase };

// Database service layer
export class DatabaseService {
  async getProducts(filters: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        specifications (*),
        images (*),
        compliance (*)
      `);

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.material) {
      query = query.in('material', filters.material);
    }
    if (filters.priceRange) {
      query = query
        .gte('price', filters.priceRange.min)
        .lte('price', filters.priceRange.max);
    }

    const { data, error } = await query;

    if (error) throw new Error(`Database error: ${error.message}`);

    return data;
  }
}
```

#### 5.5.2 Database Schema with Performance Indexes

**Migration**: `20260103000000_add_performance_indexes.sql`

**28 Performance-Critical Indexes** added for query optimization.

##### Index Categories

**Priority 1: Core Query Patterns (5 indexes)**
```sql
-- Quotation list queries (most common)
CREATE INDEX idx_quotations_user_status_created
  ON quotations(user_id, status, created_at DESC)
  WHERE user_id IS NOT NULL AND status != 'expired';

-- Order dashboard queries
CREATE INDEX idx_orders_user_status_created
  ON orders(user_id, status, created_at DESC)
  WHERE status != 'cancelled';

-- Member recent activity
CREATE INDEX idx_quotations_created_desc
  ON quotations(created_at DESC)
  WHERE created_at > NOW() - INTERVAL '30 days';

-- Product catalog search
CREATE INDEX idx_products_category_status
  ON products(category, status)
  WHERE status = 'active';

-- Sample request tracking
CREATE INDEX idx_sample_requests_user_created
  ON sample_requests(user_id, created_at DESC);
```

**Priority 2: N+1 Query Prevention (5 indexes)**
```sql
-- Order items lookup
CREATE INDEX idx_order_items_order_id
  ON order_items(order_id);

-- Quotation items lookup
CREATE INDEX idx_quotation_items_quote_id
  ON quotation_items(quote_id);

-- Sample items lookup
CREATE INDEX idx_sample_items_request_id
  ON sample_items(request_id);

-- Production jobs lookup
CREATE INDEX idx_production_jobs_order_id
  ON production_jobs(order_id);

-- Shipment items lookup
CREATE INDEX idx_shipments_order_id
  ON shipments(order_id);
```

**Priority 3: Monitoring & Alerting (5 indexes)**
```sql
-- Status tracking
CREATE INDEX idx_quotations_status_created
  ON quotations(status, created_at DESC);

-- Time-based analytics
CREATE INDEX idx_orders_created_date
  ON orders(date(created_at));

-- User activity
CREATE INDEX idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC);

-- Performance monitoring
CREATE INDEX idx_api_logs_duration
  ON api_logs(duration_ms DESC)
  WHERE duration_ms > 1000;

-- Error tracking
CREATE INDEX idx_error_logs_created_level
  ON error_logs(created_at DESC, error_level);
```

**Priority 4: Partial Indexes (4 indexes)**
```sql
-- Active quotations only
CREATE INDEX idx_quotations_active
  ON quotations(user_id, updated_at DESC)
  WHERE status IN ('draft', 'sent', 'approved');

-- Pending orders only
CREATE INDEX idx_orders_pending
  ON orders(user_id, created_at DESC)
  WHERE status = 'pending';

-- In-production jobs only
CREATE INDEX idx_production_jobs_active
  ON production_jobs(status, started_at DESC)
  WHERE status IN ('pending', 'in_progress', 'quality_check');

-- Active shipments only
CREATE INDEX idx_shipments_active
  ON shipments(order_id, status)
  WHERE status != 'delivered';
```

**Covering Indexes (2 indexes)**
```sql
-- Admin dashboard widget
CREATE INDEX idx_orders_admin_dashboard
  ON orders(status, created_at DESC)
  INCLUDE (total_amount, order_number, user_id);

-- Product search results
CREATE INDEX idx_products_search
  ON products(category, created_at DESC)
  INCLUDE (name_ja, base_price, min_order_quantity);
```

**Full-Text Search (1 index)**
```sql
-- Product search
CREATE INDEX idx_products_name_fts
  ON products USING gin(to_tsvector('simple', name_ja || ' ' || name_en));
```

**Expected Performance Improvements**:
- 50-80% faster quotation/order list queries
- Elimination of N+1 query patterns
- Reduced database load on dashboard queries
- Faster product search and filtering

##### Schema Structure

```sql
-- Core product tables
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ja TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_ja TEXT,
  description_ko TEXT,
  description_en TEXT,
  category TEXT NOT NULL,
  material TEXT NOT NULL,
  base_price DECIMAL(10,2),
  min_order_quantity INTEGER DEFAULT 1,
  lead_time_days INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Product specifications
CREATE TABLE product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name_ja TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  name_en TEXT NOT NULL,
  value TEXT NOT NULL,
  unit TEXT,
  specification_type TEXT
);

-- Quote configurations
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  configuration JSONB NOT NULL,
  pricing JSONB NOT NULL,
  status TEXT DEFAULT 'draft',
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quote items
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2),
  customizations JSONB
);

-- Sample requests
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  items JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  project_details JSONB,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Case studies
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  title_ja TEXT NOT NULL,
  title_ko TEXT NOT NULL,
  title_en TEXT NOT NULL,
  challenge_ja TEXT,
  challenge_ko TEXT,
  challenge_en TEXT,
  solution_ja TEXT,
  solution_ko TEXT,
  solution_en TEXT,
  results JSONB,
  tags TEXT[],
  published_at TIMESTAMP DEFAULT NOW()
);
```

### 5.6 External API Integration

#### 5.6.1 Shipping API Integration

```typescript
// lib/services/shippingService.ts
export class ShippingService {
  async calculateShipping(address: ShippingAddress, items: QuoteItem[]): Promise<ShippingCalculation> {
    // Japan Post API integration
    const japanPostRates = await this.fetchJapanPostRates(address, items);

    // Yamato Transport API integration
    const yamatoRates = await this.fetchYamatoRates(address, items);

    // Compare and return best rates
    return this.compareRates([japanPostRates, yamatoRates]);
  }

  async createShipment(quoteId: string, address: ShippingAddress): Promise<Shipment> {
    // Create shipment with selected carrier
  }

  private async fetchJapanPostRates(address: ShippingAddress, items: QuoteItem[]) {
    // Japan Post API implementation
  }
}
```

#### 5.6.2 Email Service Integration

```typescript
// lib/services/emailService.ts
import sendgrid from '@sendgrid/mail';

export class EmailService {
  async sendQuoteConfirmation(quote: QuoteConfiguration, quoteId: string) {
    const emailContent = await this.generateQuoteEmail(quote, quoteId);

    await sendgrid.send({
      to: quote.customerEmail,
      from: process.env.FROM_EMAIL!,
      subject: `Epackage Lab - Quote ${quoteId}`,
      html: emailContent,
      templateId: 'quote-confirmation-template'
    });
  }

  async sendSampleRequestConfirmation(sampleRequest: SampleRequest) {
    // Sample request email implementation
  }

  async sendInternalNotification(type: string, data: any) {
    // Internal notification to admin team
  }
}
```

---

## 6. Performance Optimization Strategy

### 6.1 Code Splitting and Lazy Loading

#### 6.1.1 Route-Based Code Splitting

```typescript
// Dynamic imports for heavy components
const QuoteWizard = dynamic(() => import('@/components/quote/QuoteWizard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const ProductGallery = dynamic(() => import('@/components/products/ProductGallery'), {
  loading: () => <GallerySkeleton />
});

// Page-level code splitting
const CaseStudyDetail = dynamic(() => import('@/app/case-studies/[slug]/page'));
```

#### 6.1.2 Component-Level Optimization

```typescript
// Heavy component with intersection observer
export function LazyComponent({ children, threshold = 0.1 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div ref={ref}>
      {isVisible ? children : <ComponentSkeleton />}
    </div>
  );
}
```

### 6.2 Image Optimization Strategy

```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['cdn.epackage-lab.com', 'images.unsplash.com'],
    minimumCacheTTL: 60,
  },
};

// Optimized image component
export const OptimizedImage = ({
  src,
  alt,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => (
  <Image
    src={src}
    alt={alt}
    fill
    sizes={sizes}
    priority={priority}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
    className="object-cover transition-transform duration-300 group-hover:scale-105"
  />
);
```

### 6.3 Caching Strategy

#### 6.3.1 Data Caching

```typescript
// lib/cache/cacheManager.ts
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttl || this.defaultTTL)
    });
  }

  // Cache invalidation strategies
  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
}

// Usage with data fetching
export function useCachedQuery<T>(key: string, queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const cache = useMemo(() => new CacheManager(), []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Try cache first
      const cached = await cache.get<T>(key);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const fresh = await queryFn();
      await cache.set(key, fresh);
      setData(fresh);
      setLoading(false);
    };

    fetchData();
  }, [key, queryFn, cache]);

  return { data, loading };
}
```

#### 6.3.2 Browser Caching

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Cache static assets
  if (request.nextUrl.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg|ico|woff|woff2)$/)) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }

  // Cache API responses
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  }

  return response;
}
```

### 6.4 Performance Monitoring

#### 6.4.1 Web Vitals Tracking

```typescript
// lib/performance/webVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals() {
  getCLS(console.log);
  getFID(console.log);
  getFCP(console.log);
  getLCP(console.log);
  getTTFB(console.log);
}

// Enhanced performance tracking
export function trackPerformance() {
  // Navigation timing
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const timing = performance.timing;
      const loadTime = timing.loadEventEnd - timing.navigationStart;

      // Send to analytics
      analytics.track('page_load_time', {
        loadTime,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime
      });
    });
  }
}
```

---

## 7. SEO & Accessibility Implementation

### 7.1 SEO Strategy

#### 7.1.1 Meta Tags Optimization

```typescript
// lib/seo/seoMetadata.ts
export const generateSEOMetadata = (page: PageMetadata): Metadata => {
  return {
    title: {
      default: page.title.default,
      template: `%s | ${page.title.template}`
    },
    description: page.description,
    keywords: page.keywords,
    authors: [{ name: 'Epackage Lab' }],
    openGraph: {
      title: page.title.default,
      description: page.description,
      url: page.url,
      siteName: 'Epackage Lab',
      images: page.images,
      locale: page.locale,
      type: page.type
    },
    twitter: {
      card: 'summary_large_image',
      title: page.title.default,
      description: page.description,
      images: page.images
    },
    alternates: {
      canonical: page.url,
      languages: {
        'ja': '/ja' + page.url,
        'ko': '/ko' + page.url,
        'en': '/en' + page.url
      }
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noFollow,
      googleBot: {
        index: !page.noIndex,
        follow: !page.noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
};
```

#### 7.1.2 Structured Data

```typescript
// lib/seo/structuredData.ts
export const generateProductStructuredData = (product: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name.ja,
  description: product.description.ja,
  image: product.images.map(img => img.url),
  brand: {
    '@type': 'Brand',
    name: 'Epackage Lab'
  },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'JPY',
    price: product.basePrice,
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: 'Epackage Lab'
    }
  },
  additionalProperty: product.specifications.map(spec => ({
    '@type': 'PropertyValue',
    name: spec.name.ja,
    value: spec.value,
    unitCode: spec.unit
  }))
});

export const generateOrganizationStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Epackage Lab',
  url: 'https://epackage-lab.com',
  logo: 'https://epackage-lab.com/logo.png',
  description: 'Korean packaging materials supplier for Japanese market',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'JP',
    addressLocality: 'Tokyo'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+81-3-1234-5678',
    contactType: 'customer service',
    availableLanguage: ['Japanese', 'Korean', 'English']
  }
});
```

#### 7.1.3 XML Sitemaps

```typescript
// app/api/sitemap/route.ts
export async function GET() {
  const [products, caseStudies, pages] = await Promise.all([
    getProductsForSitemap(),
    getCaseStudiesForSitemap(),
    getStaticPages()
  ]);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(page => `
        <url>
          <loc>${page.url}</loc>
          <lastmod>${page.lastmod}</lastmod>
          <changefreq>${page.changefreq}</changefreq>
          <priority>${page.priority}</priority>
        </url>
      `).join('')}
      ${products.map(product => `
        <url>
          <loc>https://epackage-lab.com/products/${product.slug}</loc>
          <lastmod>${product.updatedAt}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}
```

### 7.2 Accessibility Implementation

#### 7.2.1 WCAG 2.1 AA Compliance

```typescript
// components/ui/AccessibleButton.tsx
interface AccessibleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const AccessibleButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  onClick,
  type = 'button',
  ...props
}: AccessibleButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      className={buttonVariants({ variant, size, disabled })}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      onClick={onClick}
      {...props}
    >
      <span className="focus:absolute focus:inset-0 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg" />
      {children}
    </button>
  );
};
```

#### 7.2.2 Screen Reader Support

```typescript
// components/ui/SkipLink.tsx
export const SkipLink = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    メインコンテンツにスキップ
  </a>
);

// components/ui/LiveRegion.tsx
export const LiveRegion = ({ announcements }: { announcements: string[] }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcements.map((announcement, index) => (
        <div key={index}>{announcement}</div>
      ))}
    </div>
  );
};
```

#### 7.2.3 Keyboard Navigation

```typescript
// hooks/useKeyboardNavigation.ts
export function useKeyboardNavigation(
  items: HTMLElement[],
  onSelect?: (index: number) => void
) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          setFocusedIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect?.(focusedIndex);
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, focusedIndex, onSelect]);

  useEffect(() => {
    if (focusedIndex >= 0 && items[focusedIndex]) {
      items[focusedIndex].focus();
    }
  }, [focusedIndex, items]);

  return { focusedIndex, setFocusedIndex };
}
```

#### 7.2.4 Color Contrast and High Contrast Mode

```css
/* styles/accessibility.css */
@media (prefers-contrast: high) {
  .glass-card {
    background: rgba(255, 255, 255, 0.95);
    border: 2px solid #000;
  }

  .text-gray-600 {
    color: #000;
  }

  button {
    border: 2px solid currentColor;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Development Standards & Best Practices

### 8.1 Code Organization

#### 8.1.1 File Structure Standards

```
src/
├── app/                          # Next.js App Router pages
│   ├── (marketing)/             # Route groups for organization
│   ├── (products)/              # Product-related routes
│   ├── (commerce)/              # Commerce functionality
│   └── api/                     # API routes
├── components/                  # React components
│   ├── ui/                      # Base UI components
│   ├── layout/                  # Layout components
│   ├── forms/                   # Form components
│   └── [feature]/               # Feature-specific components
├── lib/                         # Utility libraries
│   ├── services/                # Business logic services
│   ├── utils/                   # Helper functions
│   ├── hooks/                   # Custom React hooks
│   └── config/                  # Configuration files
├── types/                       # TypeScript type definitions
├── styles/                      # Global styles
└── constants/                   # Application constants
```

#### 8.1.2 Naming Conventions

```typescript
// File naming: PascalCase for components, camelCase for utilities
// Component files
ProductCard.tsx
ProductList.module.css

// Utility files
dateUtils.ts
apiClient.ts

// Type files
productTypes.ts
apiTypes.ts

// Constants
apiEndpoints.ts
appConfig.ts

// Component naming
export const ProductCard = () => { ... }; // PascalCase
export const useProductData = () => { ... }; // camelCase for hooks
export const PRODUCT_CATEGORIES = [...]; // UPPER_SNAKE_CASE for constants
```

#### 8.1.3 TypeScript Standards

```typescript
// Strict type definitions
interface Product {
  readonly id: string;
  readonly slug: string;
  readonly name: LocalizedString;
  readonly description: LocalizedString;
  readonly category: ProductCategory;
  readonly specifications: ProductSpecification[];
  readonly pricing: PricingInfo;
  readonly images: ProductImage[];
  readonly status: ProductStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Discriminated unions
type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code: string };

// Utility types
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Generic utility functions
const createSafeAsyncAction = <T, A extends any[]>(
  action: (...args: A) => Promise<T>
) => {
  return async (...args: A): Promise<{ data?: T; error?: string }> => {
    try {
      const data = await action(...args);
      return { data };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };
};
```

### 8.2 Testing Strategy

#### 8.2.1 Unit Testing with Vitest

```typescript
// __tests__/components/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProduct } from '@/__mocks__/product.mock';

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText(mockProduct.name.ja)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description.ja)).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.name.ja)).toBeInTheDocument();
  });

  it('handles add to quote action', () => {
    const onAddToQuote = jest.fn();
    render(<ProductCard product={mockProduct} onAddToQuote={onAddToQuote} />);

    fireEvent.click(screen.getByRole('button', { name: /見積りに追加/i }));

    expect(onAddToQuote).toHaveBeenCalledWith(mockProduct);
  });

  it('displays loading state correctly', () => {
    render(<ProductCard product={mockProduct} loading />);

    expect(screen.getByTestId('product-card-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(mockProduct.name.ja)).not.toBeInTheDocument();
  });
});
```

#### 8.2.2 Integration Testing

```typescript
// __tests__/integration/quoteFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuoteWizard } from '@/components/quote/QuoteWizard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

describe('Quote Flow Integration', () => {
  it('completes full quote flow successfully', async () => {
    const queryClient = createTestQueryClient();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <QuoteWizard />
      </QueryClientProvider>
    );

    // Step 1: Select products
    await user.click(screen.getByText('ダンボールを選択'));
    await user.click(screen.getByText('次へ'));

    // Step 2: Configure specifications
    await user.type(screen.getByLabelText('サイズ'), '300x200x100');
    await user.click(screen.getByText('次へ'));

    // Step 3: Set quantity
    await user.type(screen.getByLabelText('数量'), '1000');
    await user.click(screen.getByText('次へ'));

    // Step 4: Shipping details
    await user.type(screen.getByLabelText('郵便番号'), '100-0001');
    await user.click(screen.getByText('見積りを計算'));

    // Verify quote summary
    await waitFor(() => {
      expect(screen.getByText('見積りサマリー')).toBeInTheDocument();
      expect(screen.getByText('¥100,000')).toBeInTheDocument();
    });
  });
});
```

#### 8.2.3 E2E Testing with Playwright

```typescript
// tests/e2e/quote.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quote Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quote');
  });

  test('should generate quote with selected products', async ({ page }) => {
    // Select product category
    await page.click('[data-testid="category-danball"]');
    await page.click('[data-testid="next-step"]');

    // Configure product
    await page.fill('[data-testid="size-input"]', '300x200x100');
    await page.click('[data-testid="next-step"]');

    // Set quantity
    await page.fill('[data-testid="quantity-input"]', '1000');
    await page.click('[data-testid="next-step"]');

    // Enter shipping details
    await page.fill('[data-testid="postal-code"]', '100-0001');
    await page.fill('[data-testid="address"]', '東京都千代田区千代田1-1');
    await page.click('[data-testid="calculate-quote"]');

    // Verify quote generation
    await expect(page.locator('[data-testid="quote-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-price"]')).toContainText('¥');
  });

  test('should handle quote saving and loading', async ({ page }) => {
    // Generate a quote
    await generateTestQuote(page);

    // Save quote
    await page.click('[data-testid="save-quote"]');
    await page.fill('[data-testid="quote-name"]', 'テスト見積り');
    await page.click('[data-testid="confirm-save"]');

    // Navigate to quotes dashboard
    await page.goto('/dashboard/quotes');

    // Verify saved quote
    await expect(page.locator('text=テスト見積り')).toBeVisible();
    await page.click('text=テスト見積り');

    // Verify quote loads correctly
    await expect(page.locator('[data-testid="quote-summary"]')).toBeVisible();
  });
});
```

### 8.3 Performance Standards

#### 8.3.1 Bundle Size Monitoring

```typescript
// scripts/analyze-bundle.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUDGET_LIMITS = {
  javascript: 250 * 1024, // 250KB
  css: 50 * 1024,         // 50KB
  images: 500 * 1024      // 500KB
};

function analyzeBundleSize() {
  const buildOutput = execSync('npm run build', { encoding: 'utf8' });
  const bundleAnalysis = extractBundleSizes(buildOutput);

  const violations = [];

  Object.entries(bundleAnalysis).forEach(([type, size]) => {
    if (size > BUDGET_LIMITS[type]) {
      violations.push({
        type,
        size: formatBytes(size),
        limit: formatBytes(BUDGET_LIMITS[type]),
        overage: formatBytes(size - BUDGET_LIMITS[type])
      });
    }
  });

  if (violations.length > 0) {
    console.error('Bundle size violations detected:');
    violations.forEach(v => {
      console.error(`- ${v.type}: ${v.size} (limit: ${v.limit}, over by ${v.overage})`);
    });
    process.exit(1);
  }

  console.log('✅ Bundle sizes within budget limits');
}
```

#### 8.3.2 Performance Monitoring in Development

```typescript
// lib/performance/devMonitoring.ts
export function setupPerformanceMonitoring() {
  if (process.env.NODE_ENV === 'development') {
    // Monitor component render times
    const originalUseEffect = React.useEffect;

    React.useEffect = (...args) => {
      const start = performance.now();
      const result = originalUseEffect(...args);
      const end = performance.now();

      if (end - start > 100) {
        console.warn(`Slow effect detected: ${end - start}ms`);
      }

      return result;
    };

    // Monitor API response times
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const start = performance.now();
      const response = await originalFetch(...args);
      const end = performance.now();

      console.log(`API call: ${args[0]} - ${end - start}ms`);

      if (end - start > 1000) {
        console.warn(`Slow API call: ${args[0]} - ${end - start}ms`);
      }

      return response;
    };
  }
}
```

---

## 9. Security & Compliance

### 9.1 Data Protection

#### 9.1.1 Input Validation and Sanitization

```typescript
// lib/security/inputValidation.ts
import { z } from 'zod';

// Comprehensive validation schemas
const contactFormSchema = z.object({
  name: z.string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください')
    .regex(/^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEFa-zA-Z\s]+$/, '有効な名前を入力してください'),

  email: z.string()
    .email('有効なメールアドレスを入力してください')
    .max(255, 'メールアドレスは255文字以内で入力してください'),

  phone: z.string()
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, '有効な電話番号を入力してください')
    .optional(),

  message: z.string()
    .min(10, 'メッセージは10文字以上で入力してください')
    .max(5000, 'メッセージは5000文字以内で入力してください')
    .transform(val => DOMPurify.sanitize(val))
});

// SQL injection prevention
export const createSafeQuery = (template: TemplateStringsArray, ...values: any[]) => {
  return template.reduce((result, part, index) => {
    const value = values[index];
    const safeValue = typeof value === 'string' ? escapeSql(value) : value;
    return result + part + safeValue;
  }, '');
};

// XSS prevention
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
};
```

#### 9.1.2 Authentication and Authorization

```typescript
// lib/auth/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  permissions: string[];
}

export const verifyJWT = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authenticate = (request: NextRequest): JWTPayload => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authentication required');
  }

  return verifyJWT(token);
};

export const authorize = (user: JWTPayload, requiredPermissions: string[]) => {
  const hasPermission = requiredPermissions.every(permission =>
    user.permissions.includes(permission)
  );

  if (!hasPermission) {
    throw new Error('Insufficient permissions');
  }
};
```

### 9.2 Japanese Compliance

#### 9.2.1 APPI Compliance

```typescript
// lib/compliance/appiCompliance.ts
export const APPILanguage = 'ja';

export const privacySettings = {
  // Personal information protection
  dataRetention: {
    contactForms: 365 * 3, // 3 years
    quotes: 365 * 7,       // 7 years
    samples: 365 * 5,      // 5 years
    analytics: 365 * 2     // 2 years
  },

  // Consent management
  consent: {
    required: true,
    language: 'ja',
    withdrawal: 'always'
  },

  // Data processing transparency
  disclosure: {
    purposes: [
      '見積り作成',
      'サンプル送付',
      '製品情報提供',
      '品質管理',
      '法規制対応'
    ],
    thirdParties: [
      '配送業者',
      '決済代行会社',
      'クラウドサービスプロバイダー'
    ]
  }
};

// Consent management component
export const ConsentManager = () => {
  const [consent, setConsent] = useState<Record<string, boolean>>({});

  const handleConsent = (category: string, granted: boolean) => {
    setConsent(prev => ({ ...prev, [category]: granted }));

    // Store consent with timestamp
    localStorage.setItem(`consent_${category}`, JSON.stringify({
      granted,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
  };

  // Implementation for consent UI
};
```

---

## 10. Deployment & DevOps

### 10.1 Build Process

#### 10.1.1 Production Build Configuration

```typescript
// next.config.ts
const nextConfig = {
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Compression
  compress: true,

  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    return config;
  },

  // Environment-specific configurations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  },
};
```

#### 10.1.2 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_APP_URL: ${{ secrets.NEXT_PUBLIC_APP_URL }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

      - name: Run Lighthouse audit
        run: npm run lighthouse

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: .next/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deployment script
          echo "Deploying to production..."
          # AWS S3 upload, CloudFront invalidation, etc.
```

### 10.2 Monitoring and Analytics

#### 10.2.1 Application Monitoring

```typescript
// lib/monitoring/appMonitoring.ts
export class ApplicationMonitor {
  private static instance: ApplicationMonitor;

  static getInstance(): ApplicationMonitor {
    if (!ApplicationMonitor.instance) {
      ApplicationMonitor.instance = new ApplicationMonitor();
    }
    return ApplicationMonitor.instance;
  }

  // Error tracking
  trackError(error: Error, context?: Record<string, any>) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    // Send to error tracking service
    this.sendToErrorTracking(error, context);
  }

  // Performance monitoring
  trackPerformance(metric: string, value: number, context?: Record<string, any>) {
    const data = {
      metric,
      value,
      context,
      timestamp: new Date().toISOString()
    };

    console.log('Performance Metric:', data);
    this.sendToAnalytics(data);
  }

  // User behavior tracking
  trackEvent(eventName: string, properties?: Record<string, any>) {
    const data = {
      event: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId()
    };

    this.sendToAnalytics(data);
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }
}
```

---

## Implementation Timeline & Milestones

### Phase 1: Foundation (Weeks 1-4)
- Architecture setup and component library
- Basic layout and navigation
- Product catalog infrastructure
- SEO and accessibility foundation

### Phase 2: Core Features (Weeks 5-12)
- Quote simulation system
- Sample request workflow
- Company introduction pages
- Basic case study functionality

### Phase 3: Advanced Features (Weeks 13-20)
- Knowledge center
- Advanced contact features
- User dashboard and account management
- Performance optimization

### Phase 4: Launch Preparation (Weeks 21-24)
- Testing and quality assurance
- Performance optimization
- SEO implementation
- Launch deployment

---

## Conclusion

This Low-Level Design document provides comprehensive technical specifications for rebuilding the Epackage Lab homepage into a world-class B2B e-commerce platform. The architecture emphasizes scalability, performance, and maintainability while meeting the complex requirements of the Japanese market.

Key strengths of this design:

1. **Scalable Architecture**: Component-based design with clear separation of concerns
2. **Performance Optimization**: Comprehensive caching, code splitting, and optimization strategies
3. **Accessibility Excellence**: WCAG 2.1 AA compliance with Japanese market considerations
4. **SEO Best Practices**: Structured data, meta optimization, and performance-driven SEO
5. **Security & Compliance**: Robust security measures with Japanese APPI compliance
6. **Developer Experience**: Comprehensive testing, documentation, and development standards

The implementation plan spans 24 weeks with clear milestones, ensuring a systematic approach to delivering a high-quality, production-ready platform that serves the needs of Japanese businesses seeking Korean packaging materials.

---

**Document Status**: Active (Version 2.1)
**Next Steps**: Continue implementation, monitor performance metrics, iterate on optimizations
**Dependencies**: Database migration applied, performance modules deployed, security validation enabled

**Recent Updates (2026-01-03)**:
1. ✅ Performance modules deployed (API Cache, Optimized Fetch, Lazy Load)
2. ✅ File upload security implemented (Magic number validation, 10MB limit, virus scan ready)
3. ✅ Database performance indexes applied (28 indexes for 50-80% query improvement)
4. ✅ Code splitting enhanced (7 chunks: React, Supabase, Forms, UI, DateUtils, PDF, Vendor)
5. ✅ Image optimization enabled (WebP/AVIF auto-conversion)
6. ✅ Documentation updated (API docs, Security best practices, LLD v2.1)