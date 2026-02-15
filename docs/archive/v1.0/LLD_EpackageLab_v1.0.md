# Epackage Lab ホームページ LLD

## 1. System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API)  │◄──►│   (Supabase)    │
│                 │    │                  │    │                 │
│ React 18+       │    │ Route Handlers   │    │ PostgreSQL 15   │
│ TypeScript      │    │ JWT Auth         │    │   + Functions   │
│ Tailwind CSS    │    │ Validation       │    │                 │
│ Context API     │    │ Business Logic   │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌──────────────────┐              │
         │              │   External APIs  │              │
         └──────────────►│                  │◄─────────────┘
                        │ SendGrid (Email)│
                        │ Stripe (Payment)│
                        │ Google Analytics │
                        └──────────────────┘
```

### Component Architecture
```
app/
├── layout.tsx              # Root layout with navigation
├── page.tsx                # Home page with hero section
├── globals.css             # Global styles and CSS variables
├── (pages)/
│   ├── about/page.tsx      # Company introduction
│   ├── catalog/page.tsx    # Dynamic product catalog
│   ├── archives/page.tsx   # Case studies
│   ├── contact/page.tsx    # Contact forms
│   ├── quotation/page.tsx  # Quote simulation system
│   └── layout.tsx          # Page-specific layout
├── api/
│   ├── quotation/route.ts  # Quote calculation API
│   ├── contact/route.ts    # Contact form submission
│   ├── samples/route.ts    # Sample request handling
│   └── auth/[...]/route.ts # Authentication endpoints
└── components/
    ├── ui/                 # Reusable UI components
    ├── simulation/         # Quote system components
    ├── forms/              # Form components
    └── layout/             # Layout components
```

## 2. Tech Stack

### Frontend
- **Next.js**: 16.0.3 (App Router)
- **React**: 19.2.0 (latest)
- **TypeScript**: 5.x (strict mode)
- **Tailwind CSS**: 4.x (PostCSS 4)
- **Lucide React**: 0.554.0 (icons)
- **clsx**: 2.1.1 (utility classes)
- **tailwind-merge**: 3.4.0 (class merging)

### Backend
- **Next.js API Routes**: Built-in serverless functions
- **Node.js**: 20.x LTS
- **TypeScript**: 5.x
- **Zod**: 3.x (runtime validation)
- **Jose**: 5.x (JWT handling)

### Database & External Services
- **Supabase**: PostgreSQL 15 + Edge Functions
- **PostgreSQL**: 15.x with pgVector for search
- **Redis**: Upstash for caching and sessions
- **SendGrid**: Email delivery service
- **Google Analytics 4**: Analytics tracking
- **Vercel Analytics**: Performance monitoring

## 3. Database Schema

### Core Tables
```sql
-- 見積りリクエスト
CREATE TABLE quotation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_type VARCHAR(20) NOT NULL CHECK (order_type IN ('new', 'repeat')),
  contents_type VARCHAR(20) NOT NULL CHECK (contents_type IN ('solid', 'liquid', 'powder')),
  bag_type VARCHAR(20) NOT NULL CHECK (bag_type IN ('flat_3_side', 'stand_up', 'gusset')),
  width INTEGER NOT NULL CHECK (width > 0 AND width <= 1000),
  height INTEGER NOT NULL CHECK (height > 0 AND height <= 2000),
  material_genre VARCHAR(20) CHECK (material_genre IN ('opp_al', 'pet_al', 'nylon_al')),
  surface_material VARCHAR(20) CHECK (surface_material IN ('gloss_opp', 'matte_opp')),
  material_composition VARCHAR(20) CHECK (material_composition IN ('comp_1', 'comp_2')),
  quantities INTEGER[] NOT NULL,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 見積り結果
CREATE TABLE quotation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES quotation_requests(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  discount_factor DECIMAL(3,2) DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 問い合わせ
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  inquiry_type VARCHAR(50) NOT NULL,
  product_interest VARCHAR(200),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- サンプル請求
CREATE TABLE sample_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT NOT NULL,
  product_types TEXT[] NOT NULL,
  shipping_status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indexes
```sql
-- パフォーマンス用インデックス
CREATE INDEX idx_quotation_requests_created_at ON quotation_requests(created_at DESC);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_sample_requests_shipping_status ON sample_requests(shipping_status);
CREATE INDEX idx_quotation_results_request_id ON quotation_results(request_id);
```

## 4. API Specification

### 見積り計算 API
```typescript
// POST /api/quotation/calculate
Request: {
  orderType: 'new' | 'repeat';
  contentsType: 'solid' | 'liquid' | 'powder';
  bagType: 'flat_3_side' | 'stand_up' | 'gusset';
  width: number; // mm
  height: number; // mm
  materialGenre: 'opp_al' | 'pet_al' | 'nylon_al';
  surfaceMaterial?: 'gloss_opp' | 'matte_opp';
  materialComposition?: 'comp_1' | 'comp_2';
  quantities: number[]; // max 5 patterns
  deliveryDate?: string; // ISO date
}

Response (200): {
  success: true;
  data: {
    requestId: string;
    results: Array<{
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      discountFactor: number;
    }>;
    calculation: {
      baseFee: number;
      materialCost: number;
      processingFee: number;
      totalBeforeDiscount: number;
    };
  };
}

Error (400): {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'CALCULATION_ERROR';
    message: string;
    details?: Record<string, any>;
  };
}
```

### 問い合わせ API
```typescript
// POST /api/contact
Request: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  inquiryType: string;
  productInterest?: string;
  message: string;
  privacyConsent: boolean;
  newsletterConsent?: boolean;
}

Response (200): {
  success: true;
  data: {
    contactId: string;
    message: "お問い合わせを受け付けました";
  };
}

Error (400): {
  success: false;
  error: {
    code: 'VALIDATION_ERROR' | 'EMAIL_SEND_FAILED';
    message: string;
  };
}
```

### PDF見積書生成 API
```typescript
// POST /api/quotation/pdf
Request: {
  requestId: string;
  companyInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

Response (200): {
  success: true;
  data: {
    pdfUrl: string;
    downloadLink: string;
    validUntil: string; // ISO date
  };
}
```

## 5. Security

### Authentication & Authorization
- **Method**: JWT-based authentication (for admin panel)
- **Token Validity**: 24 hours for refresh, 15 minutes for access
- **Storage**: HttpOnly cookies + localStorage fallback
- **Secret Management**: Vercel Environment Variables

### Data Protection
- **Encryption**: TLS 1.3 for all communications
- **Input Validation**: Zod schemas for all API inputs
- **SQL Injection Prevention**: Prepared statements (Supabase)
- **XSS Prevention**: Content Security Policy headers
- **CSRF Protection**: SameSite cookies, CSRF tokens

### API Security
```typescript
// Rate limiting middleware
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};

// CORS configuration
const corsConfig = {
  origin: ['https://epackage-lab.com', 'https://www.epackage-lab.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
};
```

## 6. Performance

### Frontend Performance Targets
- **FCP (First Contentful Paint)**: < 1.5 seconds
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100 milliseconds
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Bundle Size**: Main bundle < 250KB gzipped

### Backend Performance Targets
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms average
- **Quote Calculation**: < 100ms for 5 patterns
- **PDF Generation**: < 3 seconds

### Optimization Strategies
```typescript
// React optimization
const QuoteCalculator = memo(function QuoteCalculator({
  configuration
}: QuoteCalculatorProps) {
  const [results, setResults] = useState<QuoteResult[]>([]);

  const calculateQuote = useCallback(
    debounce(async (params: QuoteParams) => {
      const response = await fetch('/api/quotation/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await response.json();
      setResults(data.results);
    }, 300),
    []
  );

  return (
    <div>
      {/* Quote calculation UI */}
    </div>
  );
});

// Database optimization
const quotationQuery = `
  SELECT
    qr.*,
    array_agg(
      json_build_object(
        'quantity', qres.quantity,
        'unitPrice', qres.unit_price,
        'totalPrice', qres.total_price
      )
      ORDER BY qres.quantity
    ) as results
  FROM quotation_requests qr
  LEFT JOIN quotation_results qres ON qr.id = qres.request_id
  WHERE qr.created_at >= NOW() - INTERVAL '30 days'
  GROUP BY qr.id
  ORDER BY qr.created_at DESC
  LIMIT 50
`;
```

## 7. Deployment Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Vercel Edge   │    │   Vercel Edge    │    │   Supabase      │
│   (Frontend)    │    │   (API)          │    │   (Database)    │
│                 │    │                  │    │                 │
│ Global CDN      │    │ Serverless       │    │ Multi-region    │
│ ISR Support     │    │ Functions        │    │ PostgreSQL      │
│ Image Optimization│  │ Edge Functions   │    │ + Functions     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌──────────────────┐
                    │  Vercel KV       │
                    │  (Caching/Session)│
                    └──────────────────┘
```

### CI/CD Pipeline
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

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

      - name: Lint code
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 8. Monitoring & Logging

### Monitoring Setup
- **Frontend**: Vercel Analytics + Web Vitals
- **Backend**: Vercel Logs + Custom monitoring
- **Database**: Supabase Dashboard + Query performance
- **External APIs**: SendGrid analytics, custom webhook tracking

### Logging Strategy
```typescript
// Structured logging
const logger = {
  info: (message: string, meta?: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  },

  error: (message: string, error?: Error, meta?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      timestamp: new Date().toISOString(),
      ...meta
    }));
  }
};

// API request logging
export async function POST(request: Request) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    logger.info('Quote calculation started', { requestId });

    const body = await request.json();
    const result = await calculateQuote(body);

    const duration = Date.now() - startTime;
    logger.info('Quote calculation completed', {
      requestId,
      duration,
      patternCount: body.quantities.length
    });

    return Response.json(result);
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Quote calculation failed', error as Error, {
      requestId,
      duration
    });

    return Response.json(
      { success: false, error: 'Calculation failed' },
      { status: 500 }
    );
  }
}
```

### Alerting Conditions
- **Error Rate**: > 1% for 5 minutes
- **Response Time**: > 2 seconds for 95th percentile
- **Database Connections**: > 80% utilization
- **Failed Quote Calculations**: > 5 per minute

### Backup Strategy
- **Database**: Daily automated backups (Supabase)
- **Point-in-time Recovery**: 7 days retention
- **Application**: Git version control with semantic releases
- **Static Assets**: Vercel CDN with edge caching

---

**Document Version**: 1.0
**Created**: 2025-11-22
**Next Review**: 2025-12-22
**Technical Review**: System Architect