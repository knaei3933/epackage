# UI Components - Agent Reference

<!-- Parent: ../AGENTS.md -->

## Purpose

Reusable UI components built with React, TypeScript, Tailwind CSS 4, and class-variance-authority (CVA). Provides a comprehensive design system with consistent variants, accessibility features, and internationalization support (Japanese/English).

## Directory Structure

```
ui/
├── Forms & Inputs
│   ├── Button.tsx              # Enhanced button with variants, loading, badges
│   ├── Input.tsx               # Text input with validation, icons, character count
│   ├── Textarea.tsx            # Multi-line text input
│   ├── Select.tsx              # Dropdown with search, keyboard nav, focus trap
│   ├── JapaneseNameInput.tsx   # Japanese name input (kanji/kana fields)
│   └── Wizard.tsx              # Multi-step wizard component
│
├── Layout & Containers
│   ├── Card.tsx                # Card with header, content, footer variants
│   ├── GlassCard.tsx           # Glass morphism card with hover effects
│   ├── Container.tsx           # Responsive container
│   ├── Grid.tsx                # CSS Grid wrapper with responsive breakpoints
│   ├── Flex.tsx                # Flexbox wrapper with alignment utilities
│   ├── dialog.tsx              # Modal dialog (Radix UI)
│   └── tabs.tsx                # Tab navigation (Radix UI)
│
├── Feedback & Status
│   ├── AlertComponent.tsx      # Alert banners (success, warning, error, info)
│   ├── Badge.tsx               # Status badges, currency badges, tags
│   ├── LoadingSpinner.tsx      # Loading indicators (dots, pulse, bars, bounce)
│   ├── LoadingState.tsx        # Loading state wrapper components
│   ├── EmptyState.tsx          # Empty state placeholder
│   ├── ProgressIndicator.tsx   # Progress bars and indicators
│   └── SkeletonLoader.tsx      # Skeleton loading placeholders
│
├── Navigation
│   ├── Accordion.tsx           # Collapsible accordion sections
│   ├── ConfirmModal.tsx        # Confirmation dialog with hooks
│   └── Wizard.tsx              # Step-by-step navigation
│
├── Animation & Effects
│   ├── MotionWrapper.tsx       # Framer Motion wrapper for animations
│   ├── PageTransition.tsx      # Page transition effects
│
├── Miscellaneous
│   ├── Avatar.tsx              # User avatar component
│   ├── OptimizedImage.tsx      # Optimized image component
│   ├── alert.tsx               # shadcn/ui alert component
│   └── index.ts                # Barrel exports
│
└── __tests__/
    └── LoadingSpinner.test.tsx # Component tests
```

## Component Patterns

### 1. Variant-Based Design System

All components use **class-variance-authority (CVA)** for type-safe variants:

```tsx
// Button variants
variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive' | 'success' | 'warning' | 'info' | 'metallic' | 'brixa-gradient'
size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'icon' | 'icon-sm' | 'icon-lg'
rounded: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
```

### 2. Accessibility Features

- **ARIA attributes**: All components include proper `aria-label`, `aria-describedby`, `aria-invalid`
- **Keyboard navigation**: Select component supports Arrow keys, Home/End, Enter/Space, Escape, Tab
- **Focus trap**: Dialog and Select use focus trap for accessibility
- **Screen reader support**: Proper semantic HTML and ARIA roles

### 3. Internationalization (i18n)

- **Japanese labels**: Component labels provided in Japanese
- **JapaneseNameInput**: Specialized component for Japanese names (kanji + kana fields)
- **Currency formatting**: Support for JPY, KRW, USD currencies

### 4. Form Integration

- **React Hook Form**: Most components provide controlled and uncontrolled modes
- **Zod validation**: Compatible with Zod schemas
- **Error states**: Built-in error display with helper text
- **Field refs**: Proper ref forwarding for form libraries

## Key Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "class-variance-authority": "^0.7.0",
    "framer-motion": "^11.0.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-tabs": "^1.0.0",
    "lucide-react": "^0.400.0",
    "react-hook-form": "^7.0.0"
  },
  "utilities": {
    "@/lib/utils": "cn() utility for class merging",
    "@/lib/i18n": "Internationalization utilities",
    "@/hooks": "Custom hooks (useFocusTrap, useLoadingState)"
  }
}
```

## Component API Patterns

### Button Component

```tsx
<Button
  variant="primary"          // Visual style
  size="md"                  // xs|sm|md|lg|xl|2xl|icon
  fullWidth={false}         // Width behavior
  rounded="md"              // Border radius
  loading={false}           // Show loading spinner
  loadingText="処理中..."    // Text while loading
  icon={<Icon />}           // Icon element
  iconPosition="left"       // left|right
  badge={<Badge />}         // Badge overlay
  badgePosition="top-right" // Badge position
  disabled={false}
  onClick={handler}
>
  Button Text
</Button>
```

### Card Component

```tsx
<Card
  variant="default"          // default|elevated|outlined|ghost|metallic|interactive|glass
  size="md"                  // xs|sm|md|lg|xl|2xl|none (padding)
  rounded="lg"              // Border radius
  shadow="none"             // none|sm|md|lg|xl|2xl
  hover={false}             // Hover effect
  loading={false}           // Loading overlay
  overlay={<div />}         // Overlay content
>
  <CardHeader title="Title" description="Description" action={<Button />} />
  <CardContent>Content</CardContent>
  <CardFooter justify="end">Actions</CardFooter>
</Card>
```

### Input Component

```tsx
<Input
  variant="default"          // default|error|success|warning|ghost|filled|metallic
  size="md"                  // xs|sm|md|lg|xl
  rounded="md"              // Border radius
  label="Label"             // Field label
  error="Error message"     // Error state
  helperText="Help text"    // Helper text
  required={true}           // Required indicator
  leftIcon={<Icon />}       // Left icon
  rightIcon={<Icon />}      // Right icon
  leftElement={<div />}     // Left element (custom)
  rightElement={<div />}    // Right element (custom)
  labelPosition="top"       // top|left|right
  showCharCount={true}      // Show character count
  maxLength={100}           // Max length
  loading={false}           // Loading state
  value={value}
  onChange={handler}
/>
```

### Select Component

```tsx
<Select
  options={[{ value, label, disabled }]}
  value={value}              // Controlled value
  defaultValue="default"     // Default value
  placeholder="選択してください..."
  label="Label"
  error="Error"
  helperText="Help"
  required={true}
  disabled={false}
  searchable={true}          // Enable search
  clearable={true}           // Show clear button
  variant="default"          // default|error|success
  size="md"                  // sm|md|lg
  onChange={(value) => {}}
  onSearch={(term) => {}}
/>
```

### Alert Component

```tsx
<Alert
  variant="info"             // default|destructive|warning|info|success
  title="Title"
  icon={<Icon />}            // Custom icon (defaults by variant)
  dismissible={true}         // Show close button
  onDismiss={() => {}}
>
  Alert message
</Alert>

// Pre-configured alerts
<InfoAlert title="Info">Message</InfoAlert>
<SuccessAlert title="Success">Message</SuccessAlert>
<WarningAlert title="Warning">Message</WarningAlert>
<DestructiveAlert title="Error">Message</DestructiveAlert>
```

### Badge Component

```tsx
<Badge
  variant="default"          // default|secondary|success|warning|error|info|outline|metallic
  size="md"                  // sm|md|lg
  dot={true}                // Show colored dot
  removable={true}           // Show remove button
  onRemove={() => {}}
>
  Badge Text
</Badge>

// Specialized badges
<StatusBadge.New>New</StatusBadge.New>
<StatusBadge.Processing>処理中</StatusBadge.Processing>
<StatusBadge.Completed>完了</StatusBadge.Completed>
<CurrencyBadge amount={1000} currency="JPY" />
<TagBadge removable onRemove={handler}>Tag</TagBadge>
```

### LoadingSpinner Component

```tsx
<LoadingSpinner
  size="md"                  // xs|sm|md|lg|xl
  variant="default"          // default|dots|pulse|bars|bounce
  color="primary"            // primary|secondary|white|current
  label="読み込み中..."
  center={true}              // Center in container
  overlay={true}             // Full screen overlay
/>

// Pre-configured spinners
<PageSpinner label="Loading..." />
<ButtonSpinner />
<CardSpinner />
<FullPageSpinner label="Loading..." />
```

### Dialog Component

```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    Content
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Tabs Component

```tsx
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>
```

### JapaneseNameInput Component

```tsx
<JapaneseNameInput
  label="氏名"
  required={true}
  size="md"
  // Kanji fields
  kanjiLastName=""
  kanjiFirstName=""
  onKanjiLastNameChange={(val) => {}}
  onKanjiFirstNameChange={(val) => {}}
  // Kana fields
  kanaLastName=""
  kanaFirstName=""
  onKanaLastNameChange={(val) => {}}
  onKanaFirstNameChange={(val) => {}}
  // Validation
  kanjiLastNameError=""
  kanjiFirstNameError=""
  kanaLastNameError=""
  kanaFirstNameError=""
/>

// React Hook Form integration
<JapaneseNameInputController
  control={control}
  setValue={setValue}
  kanjiLastNameName="kanjiLastName"
  kanjiFirstNameName="kanjiFirstName"
  kanaLastNameName="kanaLastName"
  kanaFirstNameName="kanaFirstName"
  required
/>
```

## For AI Agents

### When Working with UI Components:

1. **Import from barrel file**: Use `@/components/ui` for cleaner imports
   ```tsx
   import { Button, Card, Input } from '@/components/ui';
   ```

2. **Use variants for consistency**: Prefer variant props over custom className
   ```tsx
   // Good
   <Button variant="primary" size="lg" />

   // Avoid unless necessary
   <Button className="bg-blue-500 px-6" />
   ```

3. **Follow accessibility patterns**:
   - Always provide `aria-label` for icon-only buttons
   - Use `error` prop for validation states (not just styling)
   - Ensure keyboard navigation works for custom components

4. **Internationalization**:
   - Provide Japanese labels for user-facing text
   - Use `formatCurrency()` from utils for currency display
   - Consider `JapaneseNameInput` for name fields in Japanese contexts

5. **Form validation**:
   - Use `error` prop for validation errors
   - Provide `helperText` for additional guidance
   - Use `required` prop for required indicators
   - Leverage React Hook Form controllers for complex inputs

6. **Loading states**:
   - Use `loading` prop on Button/Input components
   - Use `LoadingSpinner` or `LoadingState` for section loading
   - Use `SkeletonLoader` for initial page load

7. **Responsive design**:
   - Use `size` props appropriately (sm on mobile, md/lg on desktop)
   - Leverage Grid/Flex responsive breakpoints
   - Test component behavior at different screen sizes

8. **Component composition**:
   - Use Card subcomponents (CardHeader, CardContent, CardFooter)
   - Use Alert subcomponents (AlertTitle, AlertDescription)
   - Compose Badge with StatusBadge for consistent status display

### Common Patterns:

```tsx
// Form with validation
<Card>
  <CardHeader title="フォーム" />
  <CardContent className="space-y-4">
    <Input label="名前" required error={errors.name} />
    <Select label="選択" options={options} error={errors.select} />
  </CardContent>
  <CardFooter justify="end">
    <Button onClick={handleSubmit} loading={isSubmitting}>
      送信
    </Button>
  </CardFooter>
</Card>

// Status display
<div className="flex items-center gap-2">
  <StatusBadge.Processing>処理中</StatusBadge.Processing>
  <span>2分前</span>
</div>

// Loading state
{isLoading ? (
  <LoadingSpinner label="読み込み中..." center />
) : (
  <Content />
)}
```

## Testing

- Component tests located in `__tests__/` directory
- Use `@testing-library/react` for component testing
- Test accessibility with `@testing-library/jest-dom`
- Example: `LoadingSpinner.test.tsx`

## Design Tokens

Components use CSS custom properties for theming:

```css
/* Colors */
--brixa-primary-500, --brixa-primary-700
--bg-primary, --bg-secondary, --bg-accent
--text-primary, --text-secondary, --text-tertiary
--border-light, --border-medium, --border-dark
--success-*, --warning-*, --error-*, --info-*
--metallic-silver, --metallic-gold

/* Gradients */
--gradient-metallic, --gradient-brixa
```

## Migration Notes

- Components migrated from shadcn/ui with custom enhancements
- Framer Motion added for animations
- Japanese-specific components added for i18n support
- Glass morphism effects for modern UI
- All components use `'use client'` directive for Next.js App Router
