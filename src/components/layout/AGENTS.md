# Layout Components Directory

> **見た目の正本は `src/styles/DESIGN_STANDARD.md`（Epackage UI 基準 v1）。** 色は `className` に 16 進数や `brixa-*` を直接書かず、トークンのクラス（`bg-brand` `text-brand` `bg-bg-secondary` `border-brand-soft` など）を使う。基準色 `#3A827B` = ヘッダーの「会員登録」「今すぐ相談」ボタン。

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains the core layout components that provide the structural framework for the Epackage Lab application. These components handle navigation, page structure, and consistent UI patterns across the application.

## Key Files

### Header.tsx
Main site header component with responsive navigation, authentication integration, and mobile menu support.

**Key Features:**
- Sticky header: 高さ 64px、白の単色 + 下に細い枠線（`border-border-medium`）。影・`backdrop-blur` なし（基準書 8 章）
- ボタンの色は `Button` が決める（`ghost` ログイン / `primary` 会員登録・今すぐ相談）。ヘッダー側で色・影を上書きしない
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
Flat, link-first footer。トークンのみ: 面 `bg-bg-secondary`（Mist）、文字 `text-text-primary`、リンク・アイコン `text-brand`、細線 `border-brand-soft`、角 `rounded-md`、影・グラデーションなし。

**Key Features:**
- lg: 4 columns (company info / サービス・コンテンツ / ご利用案内 / SNS), md: 2 columns, mobile: 1 column with 44px-high links
- Company info: logo, description, email, phone, address
- Bottom row: copyright on the left, サイトマップ・個人情報保護方針・利用規約 on the right
- SNS: five 44px outline icon buttons (`border-border-emphasized`、hover = `border-brand` + `text-brand`)
- Back-to-top button: shown after 400px scroll, 44px `bg-brand text-on-brand hover:bg-brand-hover`, placed above the chat widget (`bottom-24 right-6`)
- No newsletter form, privacy cards, background pattern or mount animation (removed)
- Only state: `showBackToTop` (scroll listener)

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

- Uses Tailwind CSS with the **UI standard v1 tokens** (`bg-brand` / `text-brand` / `bg-bg-secondary` / `border-border-medium` ...). `brixa-*` と 16 進数の直接指定は使わない
- Responsive breakpoints: `sm`, `md`, `lg`, `xl`
- Dark mode: トークンが `.dark` に対応済み。`dark:` で色を上書きしない
- Accessibility: `sr-only` for screen reader only content
- Transitions: 色の変化のみ（`transition-colors`）。拡大・光る動きなし

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
1. Add a new `FooterLink[]` array in Footer.tsx
2. Render it as a `<nav>` with a 14px `font-medium` heading in the grid
3. Reuse `linkClass` (15px, Fjord, underline on hover)

**Skeleton Variants:**
1. Create new skeleton component following existing patterns
2. Use base `Skeleton` component with appropriate variant
3. Add to `skeletons` export object
4. Include in `LoadingSkeleton` content options

## Testing Notes

- Header: Test auth gating, mobile menu, dropdown interactions
- Footer: Test back-to-top button, social links, link targets
- Navigation: Test auth filtering, active states, keyboard navigation
- Layout: Test container sizes, loading states, skip links
- Skeletons: Verify animation smoothness, proper ARIA labels

## Known Patterns

**Japanese-First UI:**
All user-facing text is in Japanese. English used only for code/logic.

**Color tokens (UI standard v1):**
- 塗り `bg-brand`（#3A827B）/ ホバー `bg-brand-hover` / 文字・リンク `text-brand`
- 淡い面 `bg-brand-subtle` `bg-brand-muted`、装飾の細線 `border-brand-soft`
- グラデーション・色つきの影は使わない。詳細は `src/styles/DESIGN_STANDARD.md`

**Responsive Navigation:**
- Desktop: Horizontal with dropdowns
- Tablet: Horizontal without dropdowns
- Mobile: Drawer/slide-out menu
- Breakpoint: `lg` (1024px)

**Scroll Behavior:**
- Header: Sticky, flat white (no blur / shadow)
- Footer: Static with back-to-top button
- Smooth scroll to top: `window.scrollTo({ top: 0, behavior: 'smooth' })`
