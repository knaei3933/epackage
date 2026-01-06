# Frontend UI/UX Specifications - Japanese E-Commerce Member Registration & Form Enhancements

## Document Information
- **Version**: 1.0
- **Date**: 2025-12-24
- **Project**: Epackage Lab - Japanese Market
- **Target Framework**: Next.js 16 / React 19 / TypeScript / Tailwind CSS 4

---

## 1. Overview

### 1.1 Purpose
This specification defines the frontend UI/UX requirements for enhancing the Japanese e-commerce website with:
1. Comprehensive member registration form
2. Updated samples page with Japanese name field formatting
3. Enhanced contact page with Japanese name field formatting

### 1.2 Target Audience
- Japanese business users (B2B)
- Manufacturing companies
- Product development teams
- Buyers and procurement staff

### 1.3 Design Principles
- **Mobile-First**: Responsive design optimized for Japanese mobile usage patterns
- **Accessibility**: WCAG 2.1 AA compliance with Japanese language considerations
- **Performance**: Sub-3s load time, optimized for Japanese mobile networks
- **User Experience**: Japanese business form conventions and etiquette

---

## 2. Component Structure and Hierarchy

### 2.1 Form Components Architecture

```
src/
├── components/
│   ├── forms/
│   │   ├── member/
│   │   │   ├── MemberRegistrationForm.tsx      # Main registration form
│   │   │   ├── PersonalInfoSection.tsx         # Personal info fields
│   │   │   ├── CompanyInfoSection.tsx          # Company details
│   │   │   ├── AddressSection.tsx              # Japanese address fields
│   │   │   ├── PasswordSection.tsx             # Password creation
│   │   │   ├── ConsentSection.tsx              # Privacy consent
│   │   │   └── FormProgress.tsx                # Multi-step progress indicator
│   │   ├── samples/
│   │   │   ├── SamplesFormEnhanced.tsx         # Updated samples form
│   │   │   └── JapaneseNameFields.tsx          # Reusable name input component
│   │   ├── contact/
│   │   │   ├── ContactFormEnhanced.tsx         # Updated contact form
│   │   │   └── JapaneseNameFields.tsx          # Shared name component
│   │   └── shared/
│   │       ├── JapaneseNameInput.tsx           # Kanji/Kana name inputs
│   │       ├── PostalCodeAutocomplete.tsx      # Japanese postal code API
│   │       ├── PrefectureSelect.tsx            # 47 prefectures dropdown
│   │       └── FormValidationMessage.tsx       # Error display component
│   └── ui/
│       ├── input/
│       │   ├── Input.tsx                       # Base input component
│       │   ├── InputGroup.tsx                  # Grouped inputs
│       │   ├── Label.tsx                       # Form labels
│       │   └── ErrorMessage.tsx                # Validation errors
│       ├── select/
│       │   ├── Select.tsx                      # Base select
│       │   └── MultiSelect.tsx                 # Multi-select dropdown
│       └── checkbox/
│           ├── Checkbox.tsx                    # Single checkbox
│           └── CheckboxGroup.tsx               # Checkbox groups
```

### 2.2 Page Structure

```
src/
└── app/
    ├── register/
    │   ├── page.tsx                            # Registration page
    │   └── confirm/
    │       └── page.tsx                        # Email confirmation
    ├── samples/
    │   ├── page.tsx                            # Updated samples page
    │   └── thank-you/
    │       └── page.tsx                        # Completion page
    └── contact/
        ├── page.tsx                            # Updated contact page
        └── thank-you/
            └── page.tsx                        # Completion page
```

---

## 3. Member Registration Form Specifications

### 3.1 Form Fields Specification

| Field | Type | Required | Validation | Placeholder |
|-------|------|----------|------------|-------------|
| **姓氏（漢字）** | text | Yes | 1-20 chars, Kanji | 山田 |
| **名前（漢字）** | text | Yes | 1-20 chars, Kanji | 太郎 |
| **姓氏（ひらがな）** | text | Yes | 1-20 chars, Hiragana | やまだ |
| **名前（ひらがな）** | text | Yes | 1-20 chars, Hiragana | たろう |
| **Email** | email | Yes | Valid email format | example@company.co.jp |
| **電話番号** | tel | Yes | Japanese format | 03-1234-5678 |
| **業種** | select | Yes | Industry list | 製造業 |
| **会社名** | text | Yes | 1-100 chars | 株式会社サンプル |
| **都道府県** | select | Yes | 47 prefectures | 東京都 |
| **市区町村** | text | Yes | 1-50 chars | 渋谷区 |
| **番地** | text | Yes | 1-50 chars | 道玄坂1-2-3 |
| **建物名** | text | No | 1-100 chars | ○○ビル5階 |
| **役職** | text | No | 1-50 chars | 課長 |
| **部署** | text | No | 1-50 chars | 営業部 |
| **会社URL** | url | No | Valid URL | https://example.com |
| **取扱品目** | text | Yes | 1-200 chars | 包装資材 |
| **経路** | select | Yes | Source selection | 検索エンジン |
| **受信同意** | checkbox | Yes | Must accept | Privacy policy |
| **パスワード** | password | Yes | 8+ chars, mixed | •••••••• |
| **パスワード確認** | password | Yes | Password match | •••••••• |

### 3.2 Field Grouping & Layout

#### Section 1: 個人情報 (Personal Information)
- Japanese name fields (Kanji + Hiragana)
- Email address
- Phone number
- **Layout**: 2-column grid on desktop, 1-column on mobile

#### Section 2: 会社情報 (Company Information)
- Industry type (dropdown)
- Company name
- Position/Title
- Department
- Company URL
- Products handled
- **Layout**: 2-column grid on desktop, 1-column on mobile

#### Section 3: 住所 (Address)
- Prefecture (dropdown - 47 prefectures)
- City/Ward/Town/Village
- Street/Block number
- Building name (optional)
- **Layout**: Stacked vertical, postal code auto-fill integration

#### Section 4: 登録情報 (Registration)
- Password creation
- Password confirmation
- How did you hear about us (dropdown)
- Privacy consent (checkbox)
- **Layout**: Centered, focused on security and trust

### 3.3 Multi-Step Progress

```
Step 1: 個人情報 [=====>     ] 25%
Step 2: 会社情報 [=========>  ] 50%
Step 3: 住所     [===========>] 75%
Step 4: 確認     [============] 100%
```

---

## 4. Form Validation Requirements

### 4.1 Japanese Name Validation

#### Kanji Name Fields
```typescript
// Zod schema for Kanji names
const kanjiNameSchema = z.string()
  .min(1, '入力必須です')
  .max(20, '20文字以内で入力してください')
  .regex(/^[\u4E00-\u9FAF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF]+$/,
    '漢字、ひらがな、カタカナで入力してください')
```

#### Hiragana Name Fields
```typescript
// Zod schema for Hiragana names
const hiraganaNameSchema = z.string()
  .min(1, '入力必須です')
  .max(20, '20文字以内で入力してください')
  .regex(/^[\u3040-\u309F\u30FC]+$/,
    'ひらがなで入力してください')
```

### 4.2 Email Validation

```typescript
const emailSchema = z.string()
  .min(1, 'メールアドレスを入力してください')
  .email('有効なメールアドレスを入力してください')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    '正しい形式で入力してください')
  .max(254, '254文字以内で入力してください')
```

### 4.3 Phone Number Validation

```typescript
// Japanese phone formats supported:
// - 03-1234-5678 (landline)
// - 090-1234-5678 (mobile)
// - 0312345678 (no hyphens)
// - +81-3-1234-5678 (international)

const phoneSchema = z.string()
  .min(1, '電話番号を入力してください')
  .regex(/^(0\d{1,4}-?\d{1,4}-?\d{4}|\+81-\d{1,4}-\d{1,4}-\d{4})$/,
    '有効な電話番号を入力してください（例: 03-1234-5678）')
```

### 4.4 Password Validation

```typescript
const passwordSchema = z.string()
  .min(8, 'パスワードは8文字以上で入力してください')
  .max(128, 'パスワードは128文字以内で入力してください')
  .regex(/[a-z]/, '小文字アルファベットを含めてください')
  .regex(/[A-Z]/, '大文字アルファベットを含めてください')
  .regex(/[0-9]/, '数字を含めてください')
  .regex(/[^a-zA-Z0-9]/, '記号を含めてください')

const passwordConfirmSchema = z.string()
  .min(1, '確認用パスワードを入力してください')
  .refine((val, ctx) => val === ctx.parent.password,
    'パスワードが一致しません')
```

### 4.5 Address Validation

```typescript
// Prefectures list (47都道府県)
const prefectures = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県',
  '山形県', '福島県', '茨城県', '栃木県', '群馬県',
  // ... all 47 prefectures
  '沖縄県'
] as const

const addressSchema = z.object({
  prefecture: z.enum(prefectures, {
    required_error: '都道府県を選択してください'
  }),
  city: z.string()
    .min(1, '市区町村を入力してください')
    .max(50, '50文字以内で入力してください'),
  street: z.string()
    .min(1, '番地を入力してください')
    .max(50, '50文字以内で入力してください'),
  building: z.string()
    .max(100, '100文字以内で入力してください')
    .optional()
})
```

---

## 5. UI/UX Patterns for Japanese Users

### 5.1 Form Layout Patterns

#### Pattern 1: Vertical Stack (Mobile Default)
```
┌─────────────────────────┐
│ 姓氏（漢字）            │
│ [_______________]       │
│                         │
│ 名前（漢字）            │
│ [_______________]       │
│                         │
│ 姓氏（ひらがな）        │
│ [_______________]       │
│                         │
│ 名前（ひらがな）        │
│ [_______________]       │
└─────────────────────────┘
```

#### Pattern 2: Horizontal Pair (Desktop)
```
┌──────────────┬──────────────┐
│ 姓氏（漢字）  │ 名前（漢字）  │
│ [__________] │ [__________] │
├──────────────┼──────────────┤
│ 姓氏（ひらがな）│ 名前（ひらがな）│
│ [__________] │ [__________] │
└──────────────┴──────────────┘
```

### 5.2 Input Field Specifications

```typescript
// Base input component props
interface InputProps {
  // Label
  label: string
  labelOptional?: boolean

  // Validation
  required?: boolean
  error?: string
  helperText?: string

  // Formatting
  placeholder?: string
  maxLength?: number
  showCharacterCount?: boolean

  // Japanese-specific
  inputMode?: 'text' | 'email' | 'tel' | 'url' | 'numeric'
  imeMode?: 'disabled' | 'auto'

  // Icons
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode

  // State
  disabled?: boolean
  loading?: boolean
}
```

### 5.3 Japanese Name Input Component

```typescript
interface JapaneseNameInputProps {
  // Kanji inputs
  familyNameKanji: string
  givenNameKanji: string

  // Hiragana inputs
  familyNameKana: string
  givenNameKana: string

  // Events
  onChange: (field: string, value: string) => void
  onErrors: (errors: NameErrors) => void

  // UI options
  layout?: 'vertical' | 'horizontal'
  showKanaConversion?: boolean  // Auto-convert Kanji to Kana hint
  required?: boolean
}

interface NameErrors {
  familyNameKanji?: string
  givenNameKanji?: string
  familyNameKana?: string
  givenNameKana?: string
}
```

### 5.4 Color Scheme (Japanese Market)

```css
/* Primary Colors */
--color-primary: #1a365d;      /* Navy - Trust */
--color-primary-hover: #2c5282;
--color-secondary: #d69e2e;    /* Gold - Premium */
--color-secondary-hover: #b7791f;

/* Semantic Colors */
--color-success: #38a169;      /* Green */
--color-warning: #d69e2e;      /* Yellow */
--color-error: #e53e3e;        /* Red */
--color-info: #3182ce;         /* Blue */

/* Neutral Colors */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f7fafc;
--color-bg-tertiary: #edf2f7;
--color-text-primary: #1a202c;
--color-text-secondary: #4a5568;
--color-text-disabled: #a0aec0;

/* Border Colors */
--color-border-default: #e2e8f0;
--color-border-focus: #3182ce;
--color-border-error: #e53e3e;
--color-border-success: #38a169;
```

---

## 6. Responsive Design Considerations

### 6.1 Breakpoints

```typescript
// Tailwind default breakpoints + Japanese mobile additions
const breakpoints = {
  'xs': '375px',    // iPhone SE, small Android
  'sm': '640px',    // Default mobile
  'md': '768px',    // Tablet portrait
  'lg': '1024px',   // Tablet landscape, small laptop
  'xl': '1280px',   // Desktop
  '2xl': '1536px',  // Large desktop
}
```

### 6.2 Layout Specifications

#### Mobile (< 768px)
- Single column layout
- Full-width inputs
- 16px font size minimum (iOS auto-zoom prevention)
- 44px minimum touch target size
- Sticky submit button on bottom
- Progress indicator at top

#### Tablet (768px - 1024px)
- 2-column grid for related fields
- Centered form container (max-width: 600px)
- Larger input heights (48px)
- Enhanced spacing between sections

#### Desktop (> 1024px)
- 2-3 column grid
- Centered form container (max-width: 800px)
- Side panel for help/tips
- Reduced visual clutter

### 6.3 Touch Targets

```css
/* Minimum touch target size (iOS/Android guideline) */
.min-touch-target {
  min-width: 44px;
  min-height: 44px;
}

/* Spacing between touch targets */
.touch-spacing {
  gap: 8px;  /* Minimum 8px between targets */
}
```

---

## 7. Accessibility Requirements

### 7.1 WCAG 2.1 AA Compliance

#### Color Contrast
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

#### Keyboard Navigation
```typescript
// Tab order follows visual layout
const tabOrder = {
  familyNameKanji: 1,
  givenNameKanji: 2,
  familyNameKana: 3,
  givenNameKana: 4,
  email: 5,
  phone: 6,
  // ... sequential order
}

// Skip to main content link
<SkipLink href="#main-content">
  コンテンツへスキップ
</SkipLink>
```

#### Screen Reader Support
```tsx
// Proper ARIA labels
<input
  id="family-name-kanji"
  aria-label="姓氏（漢字）"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby="family-name-kanji-error"
/>
<span id="family-name-kanji-error" role="alert">
  {errorMessage}
</span>

// Live regions for validation
<div aria-live="polite" aria-atomic="true">
  {formStatus}
</div>
```

### 7.2 Japanese Language Support

```html
<!-- Proper lang attribute -->
<html lang="ja">

<!-- Ruby text support for names -->
<ruby>
  山田<rp>(</rp><rt>やまだ</rt><rp>)</rp>
</ruby>

<!-- Input mode for mobile keyboards -->
<input inputmode="text" />        <!-- Default -->
<input inputmode="email" />       <!-- Email -->
<input inputmode="tel" />         <!-- Phone -->
<input inputmode="numeric" />     <!-- Numbers -->
<input inputmode="url" />         <!-- URL -->
```

### 7.3 Error Handling

```typescript
interface AccessibilityErrorProps {
  id: string
  message: string
  type: 'error' | 'warning' | 'info'
}

function AccessibilityError({ id, message, type }: AccessibilityErrorProps) {
  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-center gap-2',
        type === 'error' && 'text-red-600',
        type === 'warning' && 'text-yellow-600',
        type === 'info' && 'text-blue-600'
      )}
    >
      <AlertCircle className="w-4 h-4" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}
```

---

## 8. State Management

### 8.1 Form State Structure

```typescript
// Using React Hook Form + Zod
interface MemberRegistrationState {
  // Personal Information
  personal: {
    familyNameKanji: string
    givenNameKanji: string
    familyNameKana: string
    givenNameKana: string
    email: string
    phone: string
  }

  // Company Information
  company: {
    industry: string
    companyName: string
    position: string
    department: string
    companyUrl: string
    products: string
  }

  // Address
  address: {
    postalCode: string
    prefecture: string
    city: string
    street: string
    building: string
  }

  // Registration
  registration: {
    password: string
    passwordConfirm: string
    source: string
    consent: boolean
  }

  // UI State
  ui: {
    currentStep: number
    isSubmitting: boolean
    errors: Record<string, string>
    touched: Record<string, boolean>
  }
}
```

### 8.2 Context Structure

```typescript
// Member Registration Context
interface MemberRegistrationContextValue {
  // State
  state: MemberRegistrationState

  // Actions
  updateField: (section: string, field: string, value: any) => void
  validateField: (section: string, field: string) => Promise<boolean>
  validateStep: (step: number) => Promise<boolean>
  nextStep: () => void
  prevStep: () => void
  submitForm: () => Promise<void>

  // Computed
  canProceed: boolean
  stepErrors: string[]
  progress: number
}

const MemberRegistrationContext = createContext<MemberRegistrationContextValue | null>(null)

// Provider
export function MemberRegistrationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MemberRegistrationState>(initialState)

  // Implementation...

  return (
    <MemberRegistrationContext.Provider value={{ /* ... */ }}>
      {children}
    </MemberRegistrationContext.Provider>
  )
}
```

### 8.3 Custom Hooks

```typescript
// Japanese name validation hook
function useJapaneseNameValidation() {
  const [errors, setErrors] = useState<NameErrors>({})

  const validateKanji = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, kanji: '入力必須です' }))
      return false
    }
    if (!/^[\u4E00-\u9FAF\u3040-\u309F\u30A0-\u30FF]+$/.test(value)) {
      setErrors(prev => ({ ...prev, kanji: '漢字で入力してください' }))
      return false
    }
    setErrors(prev => ({ ...prev, kanji: undefined }))
    return true
  }

  const validateHiragana = (value: string): boolean => {
    if (!value) {
      setErrors(prev => ({ ...prev, hiragana: '入力必須です' }))
      return false
    }
    if (!/^[\u3040-\u309F\u30FC]+$/.test(value)) {
      setErrors(prev => ({ ...prev, hiragana: 'ひらがなで入力してください' }))
      return false
    }
    setErrors(prev => ({ ...prev, hiragana: undefined }))
    return true
  }

  return { errors, validateKanji, validateHiragana }
}

// Postal code autocomplete hook
function usePostalCodeAutocomplete() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const lookupAddress = async (postalCode: string): Promise<Address | null> => {
    setLoading(true)
    setError(undefined)

    try {
      // Japanese postal code API (example)
      const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`)
      const data = await response.json()

      if (data.results) {
        return {
          prefecture: data.results[0].address1,
          city: data.results[0].address2,
          street: data.results[0].address3,
        }
      }
      return null
    } catch (err) {
      setError('住所の取得に失敗しました')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { lookupAddress, loading, error }
}

// Form progress hook
function useFormProgress(totalSteps: number) {
  const [currentStep, setCurrentStep] = useState(1)
  const progress = useMemo(() =>
    Math.round((currentStep / totalSteps) * 100),
    [currentStep, totalSteps]
  )

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  }, [totalSteps])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps))
  }, [totalSteps])

  return { currentStep, progress, nextStep, prevStep, goToStep }
}
```

---

## 9. Samples Page Enhancements

### 9.1 Changes from Current Implementation

#### Name Field Restructuring
```tsx
// BEFORE: Single name field
<input {...register('name')} placeholder="山田 太郎" />

// AFTER: Separate Kanji/Kana fields
<div className="grid grid-cols-2 gap-4">
  <div>
    <label>姓氏（漢字） *</label>
    <input {...register('familyNameKanji')} placeholder="山田" />
  </div>
  <div>
    <label>名前（漢字） *</label>
    <input {...register('givenNameKanji')} placeholder="太郎" />
  </div>
  <div>
    <label>姓氏（ひらがな） *</label>
    <input {...register('familyNameKana')} placeholder="やまだ" />
  </div>
  <div>
    <label>名前（ひらがな） *</label>
    <input {...register('givenNameKana')} placeholder="たろう" />
  </div>
</div>
```

#### Remove Pouch Sample Selection Section
The current implementation includes pouch type selection (flat_3_side, stand_up). This section will be removed and replaced with a simpler product interest indication.

```tsx
// REMOVED: Pouch type selection with quantities
<div className="bg-brixa-50 rounded-lg p-6">
  <h2>パウチサンプル選択</h2>
  {/* Pouch type dropdowns, quantity inputs, size selection */}
</div>

// REPLACED WITH: Simple product interest checkbox
<div className="bg-gray-50 rounded-lg p-4">
  <label className="flex items-center">
    <input type="checkbox" {...register('interestInSamples')} />
    <span>パウチサンプルを希望する</span>
  </label>
</div>
```

### 9.2 Updated Zod Schema for Samples Form

```typescript
const samplesFormSchema = z.object({
  // Name fields - restructured
  familyNameKanji: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u4E00-\u9FAF]+$/, '漢字で入力してください'),
  givenNameKanji: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u4E00-\u9FAF]+$/, '漢字で入力してください'),
  familyNameKana: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u3040-\u309F\u30FC]+$/, 'ひらがなで入力してください'),
  givenNameKana: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u3040-\u309F\u30FC]+$/, 'ひらがなで入力してください'),

  // Contact info - unchanged
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/),

  // Address - unchanged
  postalCode: z.string().regex(/^\d{3}-\d{4}$/),
  prefecture: z.string(),
  city: z.string(),
  street: z.string(),
  building: z.string().optional(),

  // Simplified sample request
  interestInSamples: z.boolean().optional(),
  message: z.string().min(10).max(500),

  // Consent
  consent: z.boolean().refine(val => val === true)
})

type SamplesFormData = z.infer<typeof samplesFormSchema>
```

### 9.3 Component Props

```typescript
interface SamplesFormEnhancedProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
  showSampleInterest?: boolean  // Show/hide sample interest checkbox
  defaultValues?: Partial<SamplesFormData>
}
```

---

## 10. Contact Page Enhancements

### 10.1 Changes from Current Implementation

The contact page will receive the same name field restructuring as the samples page:

```tsx
// BEFORE: Single name field
<div className="space-y-2">
  <label>お名前 *</label>
  <input {...register('name')} placeholder="山田 太郎" />
</div>

// AFTER: Japanese name structure
<div className="grid grid-cols-2 gap-4">
  <div>
    <label>姓氏（漢字） *</label>
    <input {...register('familyNameKanji')} placeholder="山田" />
  </div>
  <div>
    <label>名前（漢字） *</label>
    <input {...register('givenNameKanji')} placeholder="太郎" />
  </div>
  <div>
    <label>姓氏（ひらがな） *</label>
    <input {...register('familyNameKana')} placeholder="やまだ" />
  </div>
  <div>
    <label>名前（ひらがな） *</label>
    <input {...register('givenNameKana')} placeholder="たろう" />
  </div>
</div>
```

### 10.2 Updated Zod Schema for Contact Form

```typescript
const contactFormSchema = z.object({
  // Name fields - restructured
  familyNameKanji: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u4E00-\u9FAF]+$/, '漢字で入力してください'),
  givenNameKanji: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u4E00-\u9FAF]+$/, '漢字で入力してください'),
  familyNameKana: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u3040-\u309F\u30FC]+$/, 'ひらがなで入力してください'),
  givenNameKana: z.string()
    .min(1, '入力必須です')
    .max(20, '20文字以内')
    .regex(/^[\u3040-\u309F\u30FC]+$/, 'ひらがなで入力してください'),

  // Company info - unchanged
  company: z.string().max(100).optional(),

  // Contact - unchanged
  email: z.string().email('有効なメールアドレスを入力してください'),
  phone: z.string().regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})$/),
  fax: z.string().regex(/^(0\d{1,4}-\d{1,4}-\d{4}|0\d{9,10})?$/).optional(),

  // Address - unchanged
  postalCode: z.string().regex(/^\d{3}-\d{4}$/).optional(),
  address: z.string().max(200).optional(),

  // Pouch type - unchanged
  pouchType: z.enum(['flat_3_side', 'stand_up', 'box', 'box_with_valve', 'spout_pouch', 'roll_film']),

  // Message - unchanged
  message: z.string().min(10).max(800)
})

type ContactFormData = z.infer<typeof contactFormSchema>
```

---

## 11. Shared Components

### 11.1 Japanese Name Input Component (Reusable)

```tsx
// src/components/forms/shared/JapaneseNameInput.tsx
interface JapaneseNameInputProps {
  // Values
  familyNameKanji: string
  givenNameKanji: string
  familyNameKana: string
  givenNameKana: string

  // Registration from react-hook-form
  register: UseFormRegister<any>

  // Errors
  errors?: {
    familyNameKanji?: FieldError
    givenNameKanji?: FieldError
    familyNameKana?: FieldError
    givenNameKana?: FieldError
  }

  // Options
  layout?: 'vertical' | 'horizontal'
  required?: boolean
  showHelperText?: boolean
}

export function JapaneseNameInput({
  familyNameKanji,
  givenNameKanji,
  familyNameKana,
  givenNameKana,
  register,
  errors,
  layout = 'vertical',
  required = true,
  showHelperText = true
}: JapaneseNameInputProps) {
  const gridClass = layout === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2'

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {/* Family Name Kanji */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          姓氏（漢字）
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          {...register('familyNameKanji')}
          type="text"
          placeholder="山田"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          inputMode="text"
        />
        {errors?.familyNameKanji && (
          <p className="text-red-600 text-sm mt-1">{errors.familyNameKanji.message}</p>
        )}
      </div>

      {/* Given Name Kanji */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          名前（漢字）
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          {...register('givenNameKanji')}
          type="text"
          placeholder="太郎"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          inputMode="text"
        />
        {errors?.givenNameKanji && (
          <p className="text-red-600 text-sm mt-1">{errors.givenNameKanji.message}</p>
        )}
      </div>

      {/* Family Name Kana */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          姓氏（ひらがな）
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          {...register('familyNameKana')}
          type="text"
          placeholder="やまだ"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          inputMode="text"
        />
        {errors?.familyNameKana && (
          <p className="text-red-600 text-sm mt-1">{errors.familyNameKana.message}</p>
        )}
      </div>

      {/* Given Name Kana */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700">
          名前（ひらがな）
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          {...register('givenNameKana')}
          type="text"
          placeholder="たろう"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent"
          inputMode="text"
        />
        {errors?.givenNameKana && (
          <p className="text-red-600 text-sm mt-1">{errors.givenNameKana.message}</p>
        )}
      </div>

      {showHelperText && (
        <p className="col-span-full text-xs text-gray-500">
          漢字とひらがなの両方を入力してください
        </p>
      )}
    </div>
  )
}
```

### 11.2 Prefecture Select Component

```tsx
// src/components/forms/shared/PrefectureSelect.tsx
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
] as const

interface PrefectureSelectProps {
  value: string
  onChange: (value: string) => void
  error?: string
  required?: boolean
  disabled?: boolean
}

export function PrefectureSelect({
  value,
  onChange,
  error,
  required = true,
  disabled = false
}: PrefectureSelectProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-medium text-gray-700">
        都道府県
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brixa-600 focus:border-transparent",
          error && "border-red-500",
          disabled && "bg-gray-100 cursor-not-allowed"
        )}
      >
        <option value="">都道府県を選択してください</option>
        {PREFECTURES.map(prefecture => (
          <option key={prefecture} value={prefecture}>
            {prefecture}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
}
```

---

## 12. Performance Requirements

### 12.1 Load Time Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint (FCP) | < 1.5s | Lighthouse |
| Largest Contentful Paint (LCP) | < 2.5s | Lighthouse |
| Time to Interactive (TTI) | < 3.0s | Lighthouse |
| Cumulative Layout Shift (CLS) | < 0.1 | Lighthouse |
| First Input Delay (FID) | < 100ms | Lighthouse |

### 12.2 Bundle Size Targets

```json
{
  "bundles": [
    {
      "name": "main",
      "maxSize": "250KB",
      "description": "Main application bundle"
    },
    {
      "name": "forms",
      "maxSize": "100KB",
      "description": "Form components (lazy loaded)"
    },
    {
      "name": "vendor",
      "maxSize": "150KB",
      "description": "Third-party dependencies"
    },
    {
      "name": "css",
      "maxSize": "50KB",
      "description": "Stylesheets (critical)"
    }
  ]
}
```

### 12.3 Code Splitting Strategy

```typescript
// Dynamic imports for form components
const MemberRegistrationForm = dynamic(
  () => import('@/components/forms/member/MemberRegistrationForm'),
  {
    loading: () => <FormSkeleton />,
    ssr: false  // Client-side only for forms
  }
)

const SamplesForm = dynamic(
  () => import('@/components/forms/samples/SamplesFormEnhanced'),
  { loading: () => <FormSkeleton /> }
)

const ContactForm = dynamic(
  () => import('@/components/forms/contact/ContactFormEnhanced'),
  { loading: () => <FormSkeleton /> }
)
```

---

## 13. Testing Requirements

### 13.1 Unit Tests

```typescript
// JapaneseNameInput.test.tsx
describe('JapaneseNameInput', () => {
  it('validates Kanji names correctly', () => {
    const validKanji = '山田太郎'
    expect(validateKanji(validKanji)).toBe(true)
  })

  it('rejects non-Kanji characters', () => {
    const invalidKanji = 'Yamada'
    expect(validateKanji(invalidKanji)).toBe(false)
  })

  it('validates Hiragana names correctly', () => {
    const validKana = 'やまだたろう'
    expect(validateHiragana(validKana)).toBe(true)
  })

  it('rejects non-Hiragana characters', () => {
    const invalidKana = '山田'
    expect(validateHiragana(invalidKana)).toBe(false)
  })
})
```

### 13.2 Integration Tests

```typescript
// MemberRegistrationForm.integration.test.tsx
describe('MemberRegistrationForm Integration', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<MemberRegistrationForm />)

    await user.type(screen.getByLabelText(/姓氏（漢字）/), '山田')
    await user.type(screen.getByLabelText(/名前（漢字）/), '太郎')
    await user.type(screen.getByLabelText(/姓氏（ひらがな）/), 'やまだ')
    await user.type(screen.getByLabelText(/名前（ひらがな）/), 'たろう')
    // ... fill other fields

    await user.click(screen.getByRole('button', { name: /送信/ }))

    await waitFor(() => {
      expect(screen.getByText('送信完了')).toBeInTheDocument()
    })
  })
})
```

### 13.3 E2E Tests (Playwright)

```typescript
// member-registration.spec.ts
test('complete member registration flow', async ({ page }) => {
  await page.goto('/register')

  // Fill personal info
  await page.fill('[name="familyNameKanji"]', '山田')
  await page.fill('[name="givenNameKanji"]', '太郎')
  await page.fill('[name="familyNameKana"]', 'やまだ')
  await page.fill('[name="givenNameKana"]', 'たろう')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="phone"]', '03-1234-5678')

  // Navigate to company info
  await page.click('[data-testid="next-step"]')

  // Fill company info
  await page.selectOption('[name="industry"]', 'manufacturing')
  await page.fill('[name="companyName"]', 'テスト株式会社')
  // ... fill remaining fields

  // Submit form
  await page.click('[data-testid="submit-form"]')

  // Verify success
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
})
```

---

## 14. Data Types

### 14.1 TypeScript Interfaces

```typescript
// src/types/forms/member-registration.ts
export interface MemberRegistrationData {
  // Personal Information
  familyNameKanji: string
  givenNameKanji: string
  familyNameKana: string
  givenNameKana: string
  email: string
  phone: string

  // Company Information
  industry: Industry
  companyName: string
  position?: string
  department?: string
  companyUrl?: string
  products: string

  // Address
  postalCode: string
  prefecture: Prefecture
  city: string
  street: string
  building?: string

  // Registration
  password: string
  passwordConfirm: string
  source: Source
  consent: boolean
}

export type Industry =
  | 'food'          // 食品製造業
  | 'cosmetics'     // 化粧品製造業
  | 'pharmaceutical' // 医薬品製造業
  | 'electronics'   // 電気機器製造業
  | 'other'         // その他

export type Prefecture = typeof PREFECTURES[number]

export type Source =
  | 'search'        // 検索エンジン
  | 'social'        // SNS
  | 'referral'      // 紹介
  | 'advertisement' // 広告
  | 'other'         // その他
```

---

## 15. Implementation Checklist

### 15.1 Member Registration Form
- [ ] Create base form structure with React Hook Form
- [ ] Implement Japanese name input component
- [ ] Add Kanji validation regex patterns
- [ ] Add Hiragana validation regex patterns
- [ ] Implement prefecture dropdown (47 prefectures)
- [ ] Add postal code autocomplete API integration
- [ ] Create password strength indicator
- [ ] Implement multi-step progress indicator
- [ ] Add form validation with Zod schemas
- [ ] Create error message components (Japanese)
- [ ] Add accessibility attributes (ARIA)
- [ ] Implement responsive layout (mobile/tablet/desktop)
- [ ] Add loading states for submission
- [ ] Create success/completion view

### 15.2 Samples Page Updates
- [ ] Replace single name field with Japanese name structure
- [ ] Update Zod schema for new name fields
- [ ] Remove pouch sample selection section
- [ ] Add simple sample interest checkbox
- [ ] Update form submission handler
- [ ] Update success redirect logic
- [ ] Test validation flow

### 15.3 Contact Page Updates
- [ ] Replace single name field with Japanese name structure
- [ ] Update Zod schema for new name fields
- [ ] Update EmailJS template parameters
- [ ] Update form submission handler
- [ ] Test validation flow
- [ ] Update success redirect logic

### 15.4 Shared Components
- [ ] Extract Japanese name input to reusable component
- [ ] Create prefecture select component
- [ ] Create form validation message component
- [ ] Create character count component
- [ ] Create postal code autocomplete component

### 15.5 Testing
- [ ] Unit tests for validation functions
- [ ] Integration tests for form flows
- [ ] E2E tests with Playwright
- [ ] Accessibility testing (axe-core)
- [ ] Performance testing (Lighthouse)
- [ ] Cross-browser testing
- [ ] Mobile device testing

---

## 16. API Integration

### 16.1 Endpoints

```typescript
// Registration endpoint
POST /api/auth/register
Request: MemberRegistrationData
Response: { success: boolean; message: string; userId?: string }

// Email confirmation
GET /api/auth/confirm?token=xxx
Response: { success: boolean; message: string }

// Postal code lookup (external)
GET https://zipcloud.ibsnet.co.jp/api/search?zipcode={postalCode}
Response: { results: [{ address1, address2, address3 }] }
```

### 16.2 Error Responses

```typescript
interface ApiError {
  success: false
  error: string
  code: string
  details?: Record<string, string[]>
}

// Example validation error
{
  "success": false,
  "error": "入力内容を確認してください",
  "code": "VALIDATION_ERROR",
  "details": {
    "familyNameKanji": ["漢字で入力してください"],
    "email": ["有効なメールアドレスを入力してください"]
  }
}
```

---

## 17. Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Full support |
| Safari | 14+ | iOS Safari 14+ |
| Firefox | 88+ | Full support |
| Edge | 90+ | Chromium-based |
| Android Browser | Latest | WebView 90+ |

---

## 18. Security Considerations

### 18.1 Password Requirements
- Minimum 8 characters
- Must include: uppercase, lowercase, number, special character
- Password hashing: bcrypt with salt rounds >= 10
- No common passwords (check against breach list)

### 18.2 Data Protection
- HTTPS only for all form submissions
- No sensitive data in URL parameters
- CSRF tokens for all POST requests
- Rate limiting on registration endpoint
- Email verification before account activation

### 18.3 Privacy Compliance
- Clear privacy policy consent checkbox
- Data retention policy documentation
- User data export functionality
- Account deletion capability

---

## 19. Success Metrics

### 19.1 Form Completion Metrics
- Registration completion rate: Target > 60%
- Average time to complete: < 3 minutes
- Field-level drop-off tracking
- Error rate by field

### 19.2 User Experience Metrics
- Form accessibility score: WCAG AA
- Mobile usability score: > 90
- Page load time: < 2s (3G network)
- Form submission success rate: > 95%

---

## 20. Maintenance & Updates

### 20.1 Content Updates
- Industry list should be reviewable
- Prefecture list is static (Japan standard)
- Source channel list should be reviewable
- Validation messages should be in separate i18n files

### 20.2 Code Organization
- Keep form-specific validation in separate files
- Reusable components in /components/forms/shared/
- Type definitions in /types/forms/
- Validation schemas in /lib/schemas/

---

**End of Document**

For implementation questions or clarifications, please refer to:
- Project README: `/README.md`
- Task Manager: `.taskmaster/tasks/tasks.json`
- Design System: `/src/app/design-system/`
