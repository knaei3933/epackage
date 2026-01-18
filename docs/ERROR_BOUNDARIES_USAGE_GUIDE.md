# Error Boundaries - Usage Guide

Complete guide for implementing and using error boundaries in the Epackage Lab application.

## Table of Contents

1. [Overview](#overview)
2. [Components](#components)
3. [Custom Error Types](#custom-error-types)
4. [Usage Examples](#usage-examples)
5. [Best Practices](#best-practices)
6. [Testing](#testing)

## Overview

The error boundary system provides:

- **Graceful error handling** - Users see friendly error messages instead of blank screens
- **Type-safe errors** - Custom error types with Japanese messages
- **Error logging** - Automatic logging to console and optional database storage
- **Contextual UI** - Different error types show appropriate icons and actions
- **Development debugging** - Detailed error information in development mode

## Components

### 1. ErrorBoundary Component

**Location**: `src/components/error/ErrorBoundary.tsx`

A class-based React error boundary component with comprehensive features:

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  showDetails?: boolean;
}
```

**Features**:
- Catches React component errors
- Displays user-friendly Japanese error messages
- Provides retry functionality (up to 3 attempts)
- Logs errors to console and API
- Shows detailed error information in development

### 2. ErrorBoundaryWrapper

A functional wrapper for easier usage:

```typescript
<ErrorBoundaryWrapper
  enableRetry={false}
  showDetails={false}
>
  {children}
</ErrorBoundaryWrapper>
```

### 3. Global Error Handler

**Location**: `src/app/error.tsx`

Next.js App Router global error boundary that catches errors in the root layout.

### 4. Not Found Handler

**Location**: `src/app/not-found.tsx`

Custom 404 page with helpful navigation links.

## Custom Error Types

**Location**: `src/types/errors.ts`

### Available Error Types

#### Network Errors

```typescript
// Network connection error
throw new NetworkError('Failed to connect to server');

// API request error
throw new APIError('Request failed', 500, response);

// Timeout error
throw new TimeoutError(30000); // 30 second timeout
```

#### Authentication Errors

```typescript
// Authentication failed
throw new AuthenticationError('Invalid credentials');

// Authorization failed
throw new AuthorizationError('Access denied', 'admin');

// Session expired
throw new SessionExpiredError();
```

#### Validation Errors

```typescript
// Single field validation
throw new ValidationError('Invalid email format');

// Multiple field validation
throw new ValidationError('Validation failed', {
  email: ['Invalid format', 'Required'],
  password: ['Too short', 'Must contain special character']
});
```

#### Not Found Errors

```typescript
// Resource not found
throw new NotFoundError('Product', 'prod_123');

// Page not found
throw new PageNotFoundError('/some/page');
```

#### File Upload Errors

```typescript
// File size limit
throw new FileSizeLimitError(10 * 1024 * 1024); // 10MB

// Invalid file type
throw new InvalidFileTypeError(['pdf', 'jpg'], 'exe');
```

#### Database Errors

```typescript
// Database error
throw new DatabaseError('Query failed', 'SELECT * FROM...');

// Constraint violation
throw new ConstraintViolationError('unique_email');
```

### Utility Functions

```typescript
// Check if error is AppError
if (isAppError(error)) {
  console.log(error.code); // Error code
  console.log(error.getUserMessage()); // User-friendly message
}

// Convert any error to AppError
const appError = toAppError(unknownError);

// Get error type from code
const type = getErrorTypeFromCode('AUTH_ERROR'); // 'authentication'

// Serialize error for logging
const serialized = serializeError(error);
```

## Usage Examples

### 1. Basic Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary
      enableRetry={true}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      <ChildComponent />
    </ErrorBoundary>
  );
}
```

### 2. Custom Fallback UI

```typescript
<ErrorBoundary
  fallback={
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <button onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  }
>
  <ChildComponent />
</ErrorBoundary>
```

### 3. With Custom Error Handler

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to external service
    logToSentry(error, errorInfo);

    // Show custom notification
    showToast('An error occurred');
  }}
>
  <ChildComponent />
</ErrorBoundary>
```

### 4. Using Custom Error Types

```typescript
import { ValidationError, APIError } from '@/types/errors';

async function handleSubmit(data: FormData) {
  try {
    // Validate input
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    // Make API request
    const response = await fetch('/api/submit', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new APIError(
        'Submission failed',
        response.status,
        response
      );
    }

  } catch (error) {
    // Handle error
    if (error instanceof ValidationError) {
      // Show validation error
      setErrors(error.fields);
    } else {
      // Re-throw for error boundary
      throw error;
    }
  }
}
```

### 5. Manual Error Handling with Hook

```typescript
import { useErrorHandler } from '@/components/error/ErrorBoundary';

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleClick = () => {
    try {
      // Some operation
      riskyOperation();
    } catch (error) {
      handleError(error as Error, 'Additional context');
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 6. API Route Error Handling

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { ValidationError, AuthenticationError } from '@/types/errors';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    // Authenticate
    const user = await authenticate(data.token);
    if (!user) {
      throw new AuthenticationError('Invalid token');
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, fields: error.fields },
        { status: 400 }
      );
    }

    if (error instanceof AuthenticationError) {
      return NextResponse.json(
        { error: error.getUserMessage() },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Best Practices

### 1. Error Boundary Placement

- **Root level**: Use Next.js `error.tsx` for global errors
- **Layout level**: Wrap major sections (member, admin)
- **Feature level**: Wrap complex components (forms, dashboards)

### 2. Error Type Selection

Choose the appropriate error type:

- Use `ValidationError` for input validation issues
- Use `AuthenticationError` for auth problems
- Use `NetworkError` for connection issues
- Use `NotFoundError` for missing resources
- Use `AppError` as a base for custom errors

### 3. User Messages

Always provide user-friendly Japanese messages:

```typescript
// Good
throw new ValidationError(
  'Email format is invalid', // Developer message
  { email: ['有効なメールアドレスを入力してください'] } // User message
);

// Bad
throw new Error('Something went wrong'); // Not helpful
```

### 4. Error Logging

Enable database logging in production:

```bash
# .env.local
ENABLE_ERROR_LOGGING=true
```

### 5. Retry Logic

Use retries for transient errors:

```typescript
const maxRetries = 3;
let retryCount = 0;

async function fetchData() {
  try {
    return await fetch('/api/data');
  } catch (error) {
    if (retryCount < maxRetries && error instanceof NetworkError) {
      retryCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      return fetchData();
    }
    throw error;
  }
}
```

### 6. Development vs Production

```typescript
<ErrorBoundary
  enableRetry={true}
  showDetails={process.env.NODE_ENV === 'development'} // Only in dev
>
  {children}
</ErrorBoundary>
```

## Testing

### 1. Test Error Boundary

```typescript
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const ThrowError = () => {
  throw new Error('Test error');
};

test('ErrorBoundary catches errors', () => {
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText(/予期しないエラーが発生しました/)).toBeInTheDocument();
});
```

### 2. Test Custom Errors

```typescript
import { ValidationError, isAppError } from '@/types/errors';

test('ValidationError creates proper error', () => {
  const error = new ValidationError('Invalid input');

  expect(isAppError(error)).toBe(true);
  expect(error.code).toBe('VALIDATION_ERROR');
  expect(error.statusCode).toBe(400);
  expect(error.getUserMessage()).toBeDefined();
});
```

### 3. Manual Testing

To test error boundaries during development:

1. Add a temporary error throw:
```typescript
throw new Error('Test error boundary');
```

2. Or use browser DevTools to simulate errors:
```javascript
// In browser console
React.dispatchEvent(new Error('Test error'));
```

## Error Logging Setup

### Database Migration

The error logs table is created via migration:
```bash
supabase migration up
```

### Environment Variables

```bash
# Enable error logging to database
ENABLE_ERROR_LOGGING=true

# Optional: Sentry integration
SENTRY_DSN=your-sentry-dsn
```

### Viewing Error Logs

```sql
-- Recent errors
SELECT * FROM public.error_logs
ORDER BY created_at DESC
LIMIT 100;

-- Errors by type
SELECT error_name, COUNT(*) as count
FROM public.error_logs
GROUP BY error_name
ORDER BY count DESC;

-- Errors by URL
SELECT url, COUNT(*) as count
FROM public.error_logs
GROUP BY url
ORDER BY count DESC;
```

## Troubleshooting

### Error Boundary Not Catching Errors

- Ensure it's a client component (`'use client'`)
- Check that errors are thrown in React lifecycle methods
- Server component errors won't be caught by client error boundaries

### Errors Not Logging

- Check `ENABLE_ERROR_LOGGING=true` in environment
- Verify error_logs table exists in database
- Check browser console for network errors

### Japanese Text Not Displaying

- Ensure UTF-8 encoding in HTML
- Check font loading (Noto Sans JP)
- Verify locale settings

## Summary

The error boundary system provides:

- **3-level protection**: Global → Layout → Component
- **Type-safe errors**: Custom error classes with proper types
- **Japanese UI**: User-friendly error messages
- **Automatic logging**: Console and optional database
- **Development tools**: Detailed error information in dev mode
- **Flexible configuration**: Custom fallbacks, retries, and handlers

For more information, see:
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
