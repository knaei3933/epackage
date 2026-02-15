# System Architecture

## Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Technology Stack](#technology-stack)
- [Component Organization](#component-organization)
- [Security Architecture](#security-architecture)
- [Performance Architecture](#performance-architecture)

## Overview

Epackage Lab Web is built on a modern, scalable architecture designed for the Japanese B2B market. The system follows a three-tier architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 16 + React 19 + TypeScript + Tailwind CSS 4)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       Application Layer                      │
│              (Next.js API Routes + Middleware)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
│        (Supabase PostgreSQL + Storage + Auth)               │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Next.js App Router Structure

The application uses Next.js 16's App Router for optimal performance and SEO:

```
src/app/
├── (auth)/                    # Auth route group
│   ├── signin/
│   │   └── page.tsx          # Sign-in page
│   ├── signup/
│   │   └── page.tsx          # Sign-up page
│   └── layout.tsx            # Auth layout
│
├── (customer)/                # Customer route group
│   ├── dashboard/
│   │   └── page.tsx          # Customer dashboard
│   ├── orders/
│   │   ├── page.tsx          # Orders list
│   │   └── [id]/
│   │       └── page.tsx      # Order details
│   ├── quotations/
│   │   ├── page.tsx          # Quotations list
│   │   └── [id]/
│   │       └── page.tsx      # Quotation details
│   ├── documents/
│   │   └── page.tsx          # Document management
│   └── profile/
│       └── page.tsx          # Profile settings
│
├── (public)/                  # Public route group
│   ├── page.tsx              # Homepage
│   ├── catalog/
│   │   └── page.tsx          # Product catalog
│   ├── about/
│   │   └── page.tsx          # About page
│   ├── contact/
│   │   ├── page.tsx          # Contact form
│   │   └── thank-you/
│   │       └── page.tsx      # Thank you page
│   └── samples/
│       ├── page.tsx          # Sample request form
│       └── thank-you/
│           └── page.tsx      # Thank you page
│
├── admin/                     # Admin routes
│   ├── page.tsx              # Admin dashboard
│   ├── approvals/
│   │   └── page.tsx          # Order approvals
│   ├── production/
│   │   └── page.tsx          # Production tracking
│   ├── shipments/
│   │   └── page.tsx          # Shipment management
│   └── documents/
│       └── page.tsx          # Document generation
│
├── api/                       # API routes
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts      # NextAuth configuration
│   ├── contact/
│   │   └── route.ts          # Contact form processing
│   ├── samples/
│   │   └── route.ts          # Sample request processing
│   ├── quotation/
│   │   ├── calculate/
│   │   │   └── route.ts      # Price calculation
│   │   └── pdf/
│   │       └── route.ts      # PDF generation
│   ├── orders/
│   │   └── route.ts          # Order CRUD operations
│   ├── productions/
│   │   └── route.ts          # Production order management
│   ├── shipments/
│   │   └── route.ts          # Shipment tracking
│   └── webhooks/
│       ├── sendgrid/
│       │   └── route.ts      # SendGrid webhooks
│       └── docusign/
│           └── route.ts      # DocuSign webhooks
│
├── layout.tsx                 # Root layout
├── globals.css                # Global styles
└── error.tsx                  # Error boundary
```

### Component Architecture

The application follows a component-based architecture with clear separation:

```
src/components/
├── ui/                        # Design system components
│   ├── button.tsx            # Button component
│   ├── input.tsx             # Input component
│   ├── card.tsx              # Card component
│   ├── select.tsx            # Select component
│   ├── dialog.tsx            # Dialog component
│   ├── table.tsx             # Table component
│   └── index.ts              # Component exports
│
├── forms/                     # Form components
│   ├── ContactForm.tsx       # Contact form
│   ├── SampleRequestForm.tsx # Sample request form
│   ├── QuotationWizard.tsx   # Quotation wizard
│   └── index.ts              # Form exports
│
├── layouts/                   # Layout components
│   ├── Header.tsx            # Site header
│   ├── Footer.tsx            # Site footer
│   ├── Navigation.tsx        # Navigation menu
│   ├── Sidebar.tsx           # Admin sidebar
│   └── index.ts              # Layout exports
│
├── quote/                     # Quotation components
│   ├── RealTimePreview.tsx   # Real-time preview
│   ├── EnvelopePreview.tsx   # Envelope preview
│   ├── PostProcessingSelector.tsx # Post-processing options
│   └── index.ts              # Quote exports
│
└── admin/                     # Admin components
    ├── Dashboard.tsx         # Admin dashboard
    ├── OrderTable.tsx        # Order management table
    ├── ProductionTracker.tsx # Production tracking
    └── index.ts              # Admin exports
```

### State Management

The application uses a hybrid state management approach:

```
┌────────────────────────────────────────────────────────────┐
│                    Client State                            │
│  - React Context: Auth, Theme, UI                          │
│  - Zustand: Complex form state, shopping cart              │
│  - React Hook Form: Form validation and state              │
└────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│                   Server State                             │
│  - Supabase: Persistent data, real-time subscriptions      │
│  - Next.js Cache: API response caching                     │
│  - Session Cookies: Authentication tokens                  │
└────────────────────────────────────────────────────────────┘
```

## Backend Architecture

### API Routing Structure

All API routes follow RESTful conventions:

```
/api
├── auth/                      # Authentication endpoints
│   ├── POST   /signin         # Sign in
│   ├── POST   /signup         # Sign up
│   ├── POST   /signout        # Sign out
│   ├── POST   /refresh        # Refresh token
│   └── GET    /session        # Get current session
│
├── contact/                   # Contact form endpoints
│   └── POST   /submit         # Submit contact form
│
├── samples/                   # Sample request endpoints
│   ├── POST   /request        # Submit sample request
│   ├── GET    /[id]           # Get sample request details
│   └── GET    /list           # List sample requests
│
├── quotation/                 # Quotation endpoints
│   ├── POST   /calculate      # Calculate quotation price
│   ├── POST   /pdf            # Generate PDF quotation
│   ├── GET    /[id]           # Get quotation details
│   └── GET    /list           # List quotations
│
├── orders/                    # Order management endpoints
│   ├── POST   /create         # Create order
│   ├── GET    /list           # List orders (with filters)
│   ├── GET    /[id]           # Get order details
│   ├── PUT    /[id]           # Update order
│   ├── DELETE /[id]           # Delete order
│   └── POST   /[id]/approve   # Approve order
│
├── production/                # Production endpoints
│   ├── POST   /create         # Create production order
│   ├── GET    /list           # List production orders
│   ├── GET    /[id]           # Get production order details
│   ├── PUT    /[id]           # Update production order
│   └── POST   /[id]/complete  # Mark production complete
│
├── shipments/                 # Shipment endpoints
│   ├── POST   /create         # Create shipment
│   ├── GET    /list           # List shipments
│   ├── GET    /[id]           # Get shipment details
│   ├── PUT    /[id]           # Update shipment
│   ├── POST   /[id]/track     # Track shipment status
│   └── POST   /[id]/notify    # Send shipment notification
│
├── documents/                 # Document endpoints
│   ├── POST   /generate       # Generate document
│   ├── GET    /[id]           # Get document
│   ├── GET    /[id]/download  # Download document
│   └── POST   /[id]/sign      # Request signature
│
└── webhooks/                  # Webhook endpoints
    ├── POST   /sendgrid       # SendGrid events
    └── POST   /docusign       # DocuSign events
```

### Middleware Architecture

Request processing pipeline:

```
Incoming Request
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│                    Middleware Chain                        │
│  1. CORS Headers                                           │
│  2. Rate Limiting (10 req/min per IP)                      │
│  3. Authentication (JWT validation)                        │
│  4. Authorization (Role-based access control)              │
│  5. Request Validation (Zod schemas)                       │
│  6. Error Handling                                         │
└────────────────────────────────────────────────────────────┘
        │
        ▼
API Route Handler
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│                    Response Processing                     │
│  1. Data Transformation                                    │
│  2. Response Formatting                                    │
│  3. Cache Headers                                          │
│  4. Security Headers                                       │
└────────────────────────────────────────────────────────────┘
        │
        ▼
Response to Client
```

## Data Flow

### Authentication Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │ Next.js  │                 │ Supabase │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │ POST /api/auth/signin       │                            │
     ├───────────────────────────>│                            │
     │                            │ Validate credentials       │
     │                            ├──────────────────────────>│
     │                            │                            │
     │                            │ Return user + tokens       │
     │                            │<──────────────────────────┤
     │                            │                            │
     │ Set HTTP-only cookies      │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Redirect to dashboard      │                            │
     ├───────────────────────────>│                            │
```

### Order Creation Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │ Next.js  │                 │ Supabase │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │ POST /api/orders            │                            │
     ├───────────────────────────>│                            │
     │                            │ Validate request            │
     │                            │ Check inventory             │
     │                            ├──────────────────────────>│
     │                            │                            │
     │                            │ Create order                │
     │                            ├──────────────────────────>│
     │                            │                            │
     │                            │ Generate PDF                │
     │                            ├──────────────────────────>│
     │                            │    (Storage)               │
     │                            │                            │
     │                            │ Send email notification     │
     │                            ├──────────────────────────>│
     │                            │    (SendGrid)              │
     │                            │                            │
     │ Return order + PDF URL     │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Real-time subscription     │                            │
     │ (order status updates)     │                            │
     │<═══════════════════════════╡                            │
```

### Real-time Update Flow

```
┌──────────┐                 ┌──────────┐                 ┌──────────┐
│  Client  │                 │ Next.js  │                 │ Supabase │
└────┬─────┘                 └────┬─────┘                 └────┬─────┘
     │                            │                            │
     │ Subscribe to orders         │                            │
     ├───────────────────────────>│                            │
     │                            │ Subscribe channel           │
     │                            ├──────────────────────────>│
     │                            │                            │
     │                            │                            │ Order updated
     │                            │                            │ (by admin/worker)
     │                            │                            │
     │                            │ Broadcast update            │
     │                            │<──────────────────────────┤
     │                            │                            │
     │ WebSocket push             │                            │
     │<───────────────────────────┤                            │
     │                            │                            │
     │ Update UI                  │                            │
     ├───────────────────────────>│                            │
```

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | React framework with App Router |
| React | 19 | UI library |
| TypeScript | 5.0+ | Type safety |
| Tailwind CSS | 4 | Styling |
| React Hook Form | Latest | Form management |
| Zod | Latest | Schema validation |
| Zustand | Latest | State management |
| jsPDF | Latest | PDF generation |

### Backend Stack

| Technology | Purpose |
|-----------|---------|
| Next.js API Routes | Serverless API |
| Supabase Auth | Authentication |
| Supabase Database | PostgreSQL database |
| Supabase Storage | File storage |
| Supabase Realtime | WebSocket subscriptions |
| SendGrid | Email delivery |

### DevOps Stack

| Technology | Purpose |
|-----------|---------|
| Vercel | Hosting/CDN |
| Playwright | E2E testing |
| Jest | Unit testing |
| ESLint | Linting |
| Prettier | Code formatting |
| TypeScript | Type checking |
| Turbopack | Build tool |

## Component Organization

### Design System Components

Located in `src/components/ui/`, these components form the design system:

```typescript
// Example: Button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

// Usage
<Button variant="primary" size="md" onClick={handleClick}>
  Submit
</Button>
```

### Page Components

Each page in the application is composed of:

1. **Page Component** (`page.tsx`): Main page logic
2. **Layout Component** (`layout.tsx`): Page layout and structure
3. **Loading Component** (`loading.tsx`): Loading state
4. **Error Component** (`error.tsx`): Error boundary
5. **Not Found Component** (`not-found.tsx`): 404 page

### Shared Components

Reusable components across the application:

- **Forms**: ContactForm, SampleRequestForm, QuotationWizard
- **Tables**: OrderTable, ProductionTable, ShipmentTable
- **Cards**: ProductCard, OrderCard, DocumentCard
- **Modals**: ConfirmDialog, FormDialog, PreviewDialog

## Security Architecture

### Authentication

```
┌────────────────────────────────────────────────────────────┐
│                    Authentication Layer                    │
│                                                             │
│  1. User credentials → Supabase Auth                       │
│  2. JWT tokens (access + refresh)                          │
│  3. HTTP-only cookies for token storage                    │
│  4. Token refresh on expiry                                │
│  5. Session management with middleware                     │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Authorization

Role-based access control (RBAC):

```typescript
enum Role {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  PRODUCTION = 'production',
  SHIPMENT = 'shipment',
}

// Permission matrix
const permissions = {
  customer: ['read:own', 'create:order', 'update:own'],
  admin: ['*'], // All permissions
  production: ['read:order', 'update:production'],
  shipment: ['read:order', 'update:shipment'],
};
```

### Data Security

- **Row Level Security (RLS)**: Supabase RLS policies
- **API Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **XSS Prevention**: React's built-in escaping
- **CSRF Protection**: SameSite cookies

## Performance Architecture

### Caching Strategy

```
┌────────────────────────────────────────────────────────────┐
│                       Caching Layers                       │
│                                                             │
│  1. CDN Cache (Vercel Edge Network)                        │
│     - Static assets (images, fonts, JS, CSS)               │
│     - Cache duration: 1 year                               │
│                                                             │
│  2. Next.js Cache                                          │
│     - API responses                                        │
│     - Page data                                            │
│     - Cache duration: 5 minutes (revalidated)              │
│                                                             │
│  3. Browser Cache                                          │
│     - Static resources                                     │
│     - API responses (Cache-Control headers)                │
│     - Cache duration: 1 hour                               │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Code Splitting

Automatic code splitting with Next.js:

```
┌────────────────────────────────────────────────────────────┐
│                    Bundle Structure                        │
│                                                             │
│  pages/                                                     │
│  ├── _app.tsx                  # Main app chunk            │
│  ├── dashboard/                # Dashboard chunk (lazy)    │
│  ├── orders/                   # Orders chunk (lazy)       │
│  ├── admin/                    # Admin chunk (lazy)        │
│  └── ...                       # Other routes (lazy)       │
│                                                             │
│  components/                                                │
│  ├── ui/                       # UI components (shared)     │
│  ├── forms/                    # Forms (lazy)              │
│  └── admin/                    # Admin components (lazy)   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Performance Optimization

- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Font Optimization**: Next.js Font with self-hosting
- **Bundle Size**: Tree-shaking, code splitting, dynamic imports
- **Server Components**: Leverage React Server Components
- **Streaming**: Progressive rendering with Suspense
- **Edge Functions**: Vercel Edge Functions for global performance

## Monitoring and Observability

### Application Monitoring

- **Vercel Analytics**: Page views, Core Web Vitals
- **Sentry**: Error tracking and performance monitoring
- **Supabase Logs**: Database query logs
- **SendGrid Events**: Email delivery status

### Performance Metrics

Tracked metrics:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)
- Bundle size
- API response time

### Logging

Structured logging with contextual information:

```typescript
logger.info('Order created', {
  orderId: order.id,
  customerId: order.customer_id,
  amount: order.total_amount,
  timestamp: new Date().toISOString(),
});
```

## Deployment Architecture

### Production Environment

```
┌────────────────────────────────────────────────────────────┐
│                      Vercel Edge                           │
│                  (Global CDN)                              │
└────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────┐
│                   Vercel Serverless                        │
│              (Next.js Application)                         │
└────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Supabase    │    │  SendGrid    │    │  DocuSign    │
│  (Database)  │    │  (Email)     │    │  (Signing)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### CI/CD Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Push   │ -> │   Test   │ -> │  Build   │ -> │ Deploy   │
│   Code   │    │          │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │               │               │
                     ▼               ▼               ▼
                Playwright      TypeScript      Vercel
                E2E Tests      Compiler        Preview
                               ESLint
```

## Scalability Considerations

### Horizontal Scaling

- **Serverless**: Auto-scaling with Vercel
- **Database**: Supabase connection pooling
- **Storage**: Supabase Storage with CDN

### Vertical Scaling

- **Optimized Queries**: Database indexing
- **Efficient Caching**: Multiple cache layers
- **Code Splitting**: Reduce bundle size

### Future Enhancements

- **Queue System**: Background job processing
- **Microservices**: Separate services for heavy operations
- **Database Replication**: Read replicas for performance
- **GraphQL**: Alternative to REST for complex queries
