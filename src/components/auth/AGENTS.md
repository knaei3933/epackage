<!-- Parent: ../AGENTS.md -->

# Auth Components Directory

## Purpose

Authentication and authorization components for the B2B portal. Handles user registration, login, password management, and protected routing with Japanese language support and Supabase authentication integration.

## Key Files

| File | Purpose |
|------|---------|
| `LoginForm.tsx` | Login form with email/password, role-based redirects, cookie-based auth |
| `RegistrationForm.tsx` | 18-field registration form with Japanese name input, corporate number API integration, postal code lookup |
| `ForgotPasswordForm.tsx` | Password reset email request form |
| `ResetPasswordForm.tsx` | Password reset form with token validation |
| `AuthModal.tsx` | Modal prompting users to authenticate for member-only features |
| `ProtectedRoute.tsx` | Route wrapper requiring authentication, optional admin role check |
| `UserMenu.tsx` | Dropdown menu for authenticated users with navigation links |

## Component Patterns

### Form Components (LoginForm, RegistrationForm, ForgotPasswordForm, ResetPasswordForm)

All form components follow this pattern:

```tsx
'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Button, Card } from '@/components/ui';

// 1. Schema definition
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  // ...other fields
});

type FormData = z.infer<typeof schema>;

// 2. Props interface
export interface FormProps {
  onSuccess?: (data: FormData) => void;
  onError?: (error: string) => void;
  className?: string;
}

// 3. Component with state management
export default function Form({ onSuccess, onError, className }: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      // Handle response...
      onSuccess?.(data);
    } catch (error) {
      setServerError(error.message);
      onError?.(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 md:p-8">
      <form onSubmit={handleSubmit(onSubmit)} className={className}>
        {/* Error messages */}
        {serverError && <div className="error">{serverError}</div>}

        {/* Form fields with Input component */}
        <Input
          label="Field Label"
          error={errors.field?.message}
          {...register('field')}
        />

        {/* Submit button */}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '送信'}
        </Button>
      </form>
    </Card>
  );
}
```

### Registration-Specific Patterns

**Japanese Name Input** - Uses `JapaneseNameInputController` for kanji/kana validation:

```tsx
import { JapaneseNameInputController } from '@/components/ui/JapaneseNameInput';

<JapaneseNameInputController
  control={control}
  setValue={setValue}
  trigger={trigger}
  kanjiLastNameName="kanjiLastName"
  kanjiFirstNameName="kanjiFirstName"
  kanaLastNameName="kanaLastName"
  kanaFirstNameName="kanaFirstName"
  required
/>
```

**Corporate Number Search** - Integrates with `/api/registry/corporate-number`:

```tsx
const searchCorporateNumber = async (name: string) => {
  const response = await fetch(`/api/registry/corporate-number?name=${encodeURIComponent(name)}`);
  const data = await response.json();
  if (data.length > 0) {
    setValue('legalEntityNumber', result.corporateNumber);
    setValue('companyName', result.name);
    setValue('postalCode', result.postalCode);
    // ...auto-fill address fields
  }
};
```

**Postal Code Auto-fill** - Integrates with `/api/registry/postal-code`:

```tsx
const searchAddressByPostalCode = async (code: string) => {
  const response = await fetch(`/api/registry/postal-code?postalCode=${encodeURIComponent(code)}`);
  const data = await response.json();
  setValue('prefecture', data.prefecture);
  setValue('city', data.city);
};
```

### Protected Route Pattern

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Wrap any route that requires authentication
<ProtectedRoute requireAdmin={false}>
  <MemberDashboard />
</ProtectedRoute>

// Or use the HOC for page components
export default withProtectedRoute(DashboardPage, { requireAdmin: true });
```

## Dependencies

### External Libraries
- `react-hook-form` - Form state management and validation
- `@hookform/resolvers` - Zod schema integration
- `zod` - Schema validation
- `lucide-react` - Icons
- `next/navigation` - Next.js router

### Internal Dependencies
- `@/components/ui` - Shared UI components (Input, Button, Card)
- `@/components/ui/JapaneseNameInput` - Japanese name input with kanji/kana validation
- `@/contexts/AuthContext` - Authentication state management
- `@/types/auth` - Type definitions and Zod schemas

### API Routes Used
| Route | Purpose |
|-------|---------|
| `/api/auth/signin/` | Login endpoint (sets cookies) |
| `/api/auth/register` | Registration endpoint |
| `/api/auth/forgot-password/` | Password reset email |
| `/api/auth/reset-password/` | Password reset with token |
| `/api/registry/corporate-number` | Corporate number lookup |
| `/api/registry/postal-code` | Postal code to address lookup |

## For AI Agents

### Adding New Form Fields

1. Add field to Zod schema in `@/types/auth.ts`
2. Add validation rules if needed
3. Add `<Input>` component to form with `register` and `error` prop
4. Update form submission handler if field needs special processing

### Creating New Auth Forms

Follow the standard form pattern:
1. Define Zod schema
2. Create interface with `onSuccess`/`onError` callbacks
3. Use `useForm` with `zodResolver`
4. Handle loading states and errors
5. Use consistent styling with `Card` wrapper

### Japanese Language Support

- All user-facing text must be in Japanese
- Use `JapaneseNameInputController` for name fields
- Validation error messages are in Japanese
- Prefecture dropdown uses hardcoded JP prefectures

### Authentication Flow

1. **Login**: POST to `/api/auth/signin/` → sets httpOnly cookie → redirects based on role
2. **Registration**: POST to `/api/auth/register` → creates pending user → redirects to `/auth/pending`
3. **Protected Routes**: `ProtectedRoute` checks `AuthContext` → redirects to signin if not authenticated
4. **Role-based Access**: Use `requireAdmin` prop for admin-only routes

### Testing Auth Components

- Mock `@/contexts/AuthContext` for components that use `useAuth()`
- Mock fetch responses for API calls
- Test form validation with invalid inputs
- Test error handling for API failures
- Test redirect behavior after successful auth
