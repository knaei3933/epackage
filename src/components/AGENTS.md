<!-- Parent: ../AGENTS.md -->
# src/components/ Directory

## Purpose

React components organized by feature area. This is the main component library for the Epackage Lab B2B packaging platform, providing reusable UI components and feature-specific modules.

## Directory Structure

```
components/
├── admin/           # Admin dashboard components
├── archives/        # Case study/archive components
├── auth/            # Authentication UI components
├── b2b/             # B2B workflow components
├── catalog/         # Product catalog components
├── comparison/      # Product comparison features
├── contact/         # Contact form components
├── dashboard/       # Member dashboard components
├── error/           # Error handling UI
├── forms/           # Form components
├── home/            # Homepage sections
├── industries/      # Industry-specific content
├── inquiry/         # Inquiry form components
├── layout/          # Layout components (Header, Footer, etc.)
├── member/          # Member portal components
├── orders/          # Order management components
├── performance/     # Performance monitoring
├── premium-content/ # Premium content features
├── quote/           # Quote simulator components (large module)
├── quote-simulator/ # Quote simulator features
├── roi/             # ROI calculator components
├── screenshot/      # Screenshot utilities
├── seo/             # SEO components
├── service/         # Service page components
├── shared/          # Shared/common components
├── theme/           # Theme configuration
└── ui/              # Base UI component library
```

## Key Files

### Root Level Components
- **SignatureCanvas.tsx** - Canvas component for signature capture
- **PerformanceMonitor.tsx** - Performance monitoring utilities
- **CaseStudySection.tsx** - Case study display section
- **CertificationBadges.tsx** - ISO/certification badge display
- **ComplianceSection.tsx** - Compliance information display
- **JapanBusinessSupport.tsx** - Japan business support section
- **ProductLineupSection.tsx** - Product lineup display
- **QualitySection.tsx** - Quality assurance section
- **TrustSignalsSection.tsx** - Trust signals/testimonials
- **WhyKoreaSection.tsx** - Why Korea manufacturing section

### Export Index Files
Most subdirectories have `index.ts` files for clean imports:
- `ui/index.ts` - Base UI components (Button, Card, Form, etc.)
- `quote/index.ts` - Quote system exports
- `catalog/index.ts` - Catalog components
- `orders/index.ts` - Order management exports
- `admin/index.ts` - Admin dashboard exports
- `home/index.ts` - Homepage section exports

## Subdirectory Details

### `ui/` - Base Component Library
Reusable UI primitives with consistent styling:

**Form Components:**
- Button, Input, Textarea, Select
- Checkbox, Radio, Slider
- Form validation utilities

**Layout Components:**
- Container, Grid, Flex
- Card (with variants)
- Badge, Avatar, Tabs

**Feedback Components:**
- Alert, Toast, Modal, Dialog
- LoadingSpinner, EmptyState
- Wizard, Accordion

**Animations:**
- MotionWrapper, PageTransition
- Animation variants

### `quote/` - Quote System (Large Module)
Comprehensive quoting system with 40+ components:

**Core Wizard:**
- `ImprovedQuotingWizard.tsx` - Main quote wizard
- `UnifiedQuoteSystem.tsx` - Unified quote logic
- `QuoteWizard.tsx` - Alternative wizard implementation

**Steps:**
- `SKUSelectionStep.tsx` - SKU selection
- `MultiQuantityStep.tsx` - Multi-quantity input
- `UnifiedSKUQuantityStep.tsx` - Combined SKU/quantity
- `ConfigurationPanel.tsx` - Configuration options

**Post-Processing:**
- `EnhancedPostProcessingSelector.tsx` - Enhanced selector
- `PostProcessingGroups.tsx` - Grouped options
- `PostProcessingComparisonTable.tsx` - Comparison view

**Preview:**
- `RealTimePreviewEngine.tsx` - Real-time preview
- `EnvelopePreview.tsx` - Envelope visualization
- `MobilePostProcessingSelector.tsx` - Mobile-optimized selector

**Results:**
- `PriceBreakdown.tsx` - Cost breakdown
- `OrderSummarySection.tsx` - Order summary
- `MultiQuantityComparisonTable.tsx` - Quantity comparison

**Utilities:**
- `ErrorToast.tsx` - Error handling
- `BankInfoCard.tsx` - Payment info display
- `InvoiceDownloadButton.tsx` - Invoice generation

### `catalog/` - Product Catalog
Product browsing and filtering:

- `ProductCard.tsx` - Basic product card
- `EnhancedProductCard.tsx` - Enhanced with animations
- `ProductListItem.tsx` - List view variant
- `CatalogGrid.tsx` - Grid layout
- `CatalogFilters.tsx` - Filter controls
- `AdvancedFilters.tsx` - Advanced filtering
- `ProductDetailModal.tsx` - Product details modal
- `DownloadButton.tsx` - Catalog download

### `admin/` - Admin Dashboard
Admin-specific components:

**Production:**
- `ProductionProgressVisualizer.tsx` - Progress tracking
- `ProductionStatusUpdateButton.tsx` - Status updates
- `StageDetailPanel.tsx` - Stage details

**Shipments:**
- `ShipmentCard.tsx` - Shipment display
- `ShipmentCreateModal.tsx` - Create shipment
- `CarrierSelector.tsx` - Carrier selection
- `TrackingTimeline.tsx` - Tracking view

**Inventory:**
- `InventoryUpdateButton.tsx` - Stock updates
- `EntryRecordingButton.tsx` - Entry recording

**Contracts:**
- `ContractSignatureRequestButton.tsx` - Signature requests
- `ContractDownloadButton.tsx` - Contract download

**Navigation:**
- `AdminNavigation.tsx` - Admin nav menu

**Notifications:**
- `Notifications/` subdirectory with notification center

### `orders/` - Order Management
Order workflow components:

- `OrderManagementButtons.tsx` - Action buttons
- `OrderCancelButton.tsx` - Cancellation
- `OrderModifyButton.tsx` - Modification
- `ReorderButton.tsx` - Quick reorder
- `OrderStatusTimeline.tsx` - Status visualization
- `OrderCommentsSection.tsx` - Comments/discussion
- `OrderStatusBadge.tsx` - Status badges
- `OrderHistoryPDFButton.tsx` - PDF export

### `layout/` - Layout Components
Page layout structure:

- `Header.tsx` - Site header with navigation
- `Footer.tsx` - Site footer
- `Navigation.tsx` - Main navigation
- `PageTransition.tsx` - Page transition wrapper

### `home/` - Homepage Sections
Homepage-specific sections:

- `HeroSection.tsx` - Hero banner
- `IndustryShowcase.tsx` - Industry display
- `ProductShowcaseSection.tsx` - Featured products
- `CTASection.tsx` - Call-to-action
- `QuoteSimulator.tsx` - Homepage quote widget
- `EnhancedQuoteSimulator.tsx` - Enhanced version

### `auth/` - Authentication
User authentication UI:

- `LoginForm.tsx` - Login form
- `RegistrationForm.tsx` - Registration form
- `PendingApprovalMessage.tsx` - Pending state message

### `contact/` - Contact Forms
Contact and inquiry forms:

- `ContactForm.tsx` - Main contact form
- `CustomerInfoSection.tsx` - Customer details
- `MessageSection.tsx` - Message input
- `SampleItemsSection.tsx` - Sample request items

### `dashboard/` - Member Dashboard
Member portal dashboard:

- `DeliveryAddressForm.tsx` - Address management
- `menuItems.ts` - Dashboard navigation config

## For AI Agents

### Component Patterns

**State Management:**
- Most components use React hooks (useState, useEffect)
- Quote system uses `QuoteContext` for global state
- Auth uses `AuthContext`
- Catalog uses `CatalogContext`

**Styling:**
- Tailwind CSS utility classes
- Consistent color tokens: `brixa-*`, `navy-*`, `success-*`, `error-*`
- Variant-based components (Button variants, Card variants)
- Responsive design with `md:`, `lg:` breakpoints

**Type Safety:**
- TypeScript with strict mode
- Interface definitions for props
- Type exports from `@/types/`

**Internationalization:**
- Japanese as primary language
- Labels defined in constants files
- Conditional rendering for EN/JA variants

### Common Dependencies

```typescript
// UI Components
import { Button, Card, Modal } from '@/components/ui'

// Contexts
import { useAuth } from '@/contexts/AuthContext'
import { useQuote } from '@/contexts/QuoteContext'
import { useCatalog } from '@/contexts/CatalogContext'

// Utilities
import { cn } from '@/lib/utils'  // className merge utility
import { safeMap } from '@/lib/array-helpers'

// Types
import type { PackageProduct } from '@/types/catalog'
import type { QuoteState } from '@/types/quote'
```

### Component Creation Guidelines

1. **Use existing UI components** from `ui/` directory as building blocks
2. **Follow naming convention:** PascalCase for components, kebab-case for files
3. **Export via index.ts** for cleaner imports
4. **Add TypeScript interfaces** for all props
5. **Include Japanese labels** in constants files, not components
6. **Use Tailwind variants** for consistent styling
7. **Handle loading/error states** appropriately
8. **Make responsive** with mobile-first approach

### Quote System Architecture

The quote system is complex with multiple steps:

1. **SizeSpecification** - Bag dimensions
2. **ContentsStep** - Product contents (4 fields)
3. **PostProcessingStep** - Post-processing options
4. **DeliveryStep** - Delivery options
5. **ResultStep** - Quote results with PDF

Key files:
- `ImprovedQuotingWizard.tsx` - Main orchestrator
- `sections/` subdirectory - Individual step components
- `useQuoteCalculation.ts` - Pricing logic hook

### Adding New Components

When adding new components:

1. Create component file in appropriate subdirectory
2. Add TypeScript interfaces
3. Export from subdirectory's `index.ts`
4. Follow existing patterns for state, styling, and i18n
5. Add documentation comments
6. Consider accessibility (ARIA labels, keyboard navigation)

## Dependencies

### Internal
- `@/contexts/*` - React contexts for state management
- `@/lib/*` - Utility functions
- `@/types/*` - TypeScript type definitions
- `@/constants/*` - Constant values and labels

### External
- `next/image` - Image optimization
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react` - React core
- `@supabase/supabase-js` - Database client

## Related Files

- **../contexts/** - React contexts for component state
- **../lib/** - Shared utilities used by components
- **../types/** - TypeScript definitions
- **../app/** - Next.js pages that use these components
