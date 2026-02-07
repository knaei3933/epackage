# Layout Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains the core layout components that provide the structural framework for the Epackage Lab application. These components handle navigation, page structure, and consistent UI patterns across the application.

## Key Files

### Header.tsx
Main site header component with responsive navigation, authentication integration, and mobile menu support.

**Key Features:**
- Sticky header with backdrop blur
- Desktop dropdown navigation with nested support
- Mobile hamburger menu with full navigation
- Authentication-aware UI (login/register vs user menu)
- Auth gate for "お見積り" (Quote) feature
- Hydration-safe rendering with `isMounted` state
- Accessibility features (ARIA labels, skip links, keyboard navigation)

**Navigation Structure:**
- ホーム (Home)
- 製品カタログ (Product Catalog)
- サービス (Services) - with dropdown children
- 導入事例 (Case Studies/Archives)
- お見積り (Quote Simulator) - auth-gated

### Footer.tsx
Comprehensive footer with company information, privacy links, newsletter signup, and social media integration.

**Key Features:**
- Multi-column responsive layout
- Newsletter subscription form
- Social media links with platform-specific styling
- Privacy/legal links (Privacy Policy, Terms, Legal Notice, CSR)
- Back-to-top button with scroll detection
- Animated entry effects on mount
- Contact information display
- Copyright and bottom navigation bar

### Navigation.tsx
Reusable navigation components supporting multiple variants (header, sidebar, mobile).

**Components:**
- `Navigation` - Main header navigation
- `MobileNavigation` - Drawer-style mobile navigation
- `SidebarNavigation` - Collapsible sidebar with expand/collapse

**Key Features:**
- Authentication-aware filtering (`requireAuth`, `hideWhenAuth`, `showWhenAuth`)
- Icon support via Lucide React
- Badge/count support
- Nested dropdown support
- Active route highlighting
- Collapsible sidebar state management

**Default Navigation Items:**
```typescript
{
  label: 'ホーム',
  href: '/',
  icon: Home
}
// ... catalog, about, quote, contact
```

### Layout.tsx
Main layout wrapper components for page structure.

**Components:**
- `Layout` - Full layout with optional header/footer
- `SimpleLayout` - Minimal layout for auth/landing pages
- `CenteredLayout` - Centered content layout for modals/forms

**Key Features:**
- Configurable header/footer visibility
- Loading state integration with skeleton screens
- Container size customization (sm → 6xl → full)
- Skip-to-main-content accessibility link
- Responsive min-height calculations

### LoadingSkeleton.tsx
Comprehensive loading state skeleton components.

**Skeleton Types:**
- `Skeleton` - Base skeleton component
- `TextSkeleton` - Multi-line text
- `HeaderSkeleton` - Page headers
- `CardSkeleton` - Content cards with optional image
- `TableSkeleton` - Data tables
- `ListSkeleton` - List items with avatars
- `FormSkeleton` - Form fields and buttons
- `NavigationSkeleton` - Header/navigation
- `LoadingSkeleton` - Full page composition

**Animation Types:**
- `pulse` - Default pulse animation
- `wave` - Shimmer wave effect
- `none` - No animation

### index.ts
Barrel file exporting all layout components.

## For AI Agents

### Component Patterns

**Header Usage:**
```tsx
import { Header } from '@/components/layout'

// In root layout or layout wrapper
<Header />
```

**Footer Usage:**
```tsx
import { Footer } from '@/components/layout'

// In Layout.tsx or individual pages
<Footer />
```

**Navigation Configuration:**
```tsx
import { Navigation } from '@/components/layout'

const items: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    requireAuth: true,  // Only show when authenticated
    badge: 5
  },
  {
    label: 'Services',
    href: '/services',
    children: [
      { label: 'Consulting', href: '/services/consulting' }
    ]
  }
]

<Navigation items={items} variant="header" showIcons />
```

**Layout Wrapper:**
```tsx
import { Layout } from '@/components/layout'

<Layout
  showHeader={false}  // Using custom header
  showFooter={true}
  containerSize="6xl"
  withLoadingState={true}
  isLoading={loading}
>
  {children}
</Layout>
```

**Loading States:**
```tsx
import { LoadingSkeleton, CardSkeleton } from '@/components/layout'

{isLoading ? (
  <LoadingSkeleton content="cards" showSidebar />
) : (
  <ActualContent />
)}
```

### Styling Conventions

- Uses Tailwind CSS with custom `brixa-*` color palette
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Dark mode support via `dark:` prefix
- Accessibility: `sr-only` for screen reader only content
- Transitions: `transition-all duration-200/300` for smooth interactions

### Key Dependencies

```typescript
// External
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

// Icons - Lucide React
import { Menu, X, ChevronDown, Home, Building2, ... } from 'lucide-react'

// Internal Contexts
import { useAuth } from '@/contexts/AuthContext'

// UI Components
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'

// Utilities
import { cn } from '@/lib/utils'
```

### State Management Patterns

**Authentication-Aware Rendering:**
```tsx
const { isAuthenticated, isLoading } = useAuth()

// Filter items based on auth state
const filteredItems = items.filter(item => {
  if (item.requireAuth && !isAuthenticated) return false
  if (item.hideWhenAuth && isAuthenticated) return false
  return true
})
```

**Dropdown State:**
```tsx
const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)

// Toggle handler
const handleDropdownToggle = (label: string) => {
  setDropdownOpen(dropdownOpen === label ? null : label)
}

// Click outside to close
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (!target.closest('[data-dropdown]')) {
      setDropdownOpen(null)
    }
  }
  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [])
```

**Mobile Menu State:**
```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false)

// Escape key to close
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isMenuOpen) {
      setIsMenuOpen(false)
    }
  }
  document.addEventListener('keydown', handleEscape)
  return () => document.removeEventListener('keydown', handleEscape)
}, [isMenuOpen])
```

### Hydration Safety

All client-side interactive components use hydration guards:

```tsx
const [isMounted, setIsMounted] = useState(false)

useEffect(() => {
  setIsMounted(true)
}, [])

// Prevent hydration mismatch
{isMounted && <ConditionalContent />}
```

### Accessibility Features

**Skip Links:**
```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute..."
>
  メインコンテンツにスキップ
</a>
```

**ARIA Labels:**
```tsx
<button
  aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
  aria-expanded={isMenuOpen}
  aria-controls="mobile-navigation"
>
```

**Role Attributes:**
```tsx
<header role="banner">
<nav role="navigation" aria-label="Main navigation">
<main role="main" tabIndex={-1}>
<footer role="contentinfo">
```

### Extending Components

**Adding Navigation Items:**
1. Update `defaultNavigationItems` in Navigation.tsx
2. Add icon import from `lucide-react`
3. Set authentication requirements as needed
4. Add badges for counts/notifications

**Custom Footer Sections:**
1. Add new link array in Footer.tsx
2. Follow `PrivacyLink` or `SocialLink` interface
3. Add icon and description
4. Render in appropriate grid column

**Skeleton Variants:**
1. Create new skeleton component following existing patterns
2. Use base `Skeleton` component with appropriate variant
3. Add to `skeletons` export object
4. Include in `LoadingSkeleton` content options

## Testing Notes

- Header: Test auth gating, mobile menu, dropdown interactions
- Footer: Test newsletter form, back-to-top button, social links
- Navigation: Test auth filtering, active states, keyboard navigation
- Layout: Test container sizes, loading states, skip links
- Skeletons: Verify animation smoothness, proper ARIA labels

## Known Patterns

**Japanese-First UI:**
All user-facing text is in Japanese. English used only for code/logic.

**Brixa Color System:**
- `brixa-50` to `brixa-900` - Primary brand color scale
- Used for accents, active states, highlights
- Gradient variants: `from-brixa-600 to-brixa-700`

**Responsive Navigation:**
- Desktop: Horizontal with dropdowns
- Tablet: Horizontal without dropdowns
- Mobile: Drawer/slide-out menu
- Breakpoint: `lg` (1024px)

**Scroll Behavior:**
- Header: Sticky with backdrop blur
- Footer: Static with back-to-top button
- Smooth scroll to top: `window.scrollTo({ top: 0, behavior: 'smooth' })`
