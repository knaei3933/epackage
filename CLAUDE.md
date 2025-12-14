# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Epackage Lab Web is a Next.js 16 application for managing product inquiries and sample requests for Epackage Lab. It's a Japanese-market focused system with comprehensive contact forms, product catalog, and quotation capabilities.

### Core Features
- Contact inquiry system with Japanese business rules
- Sample request management (max 5 samples)
- Product catalog with search and filtering
- PDF quotation generation
- Performance-optimized with Japanese SEO

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start development server (localhost:3000)
npm run build                 # Production build
npm run start                 # Start production server
npm run lint                  # Run ESLint

# Analysis & Performance
npm run analyze               # Bundle size analysis (ANALYZE=true)
npm run build:production      # Production build with NODE_ENV=production
npm run lighthouse            # Run Lighthouse audit
npm run test:performance      # Build + Lighthouse audit
npm run test:lighthouse       # Build + server + Lighthouse testing

# Testing (Playwright E2E)
npx playwright test           # Run all E2E tests
npx playwright test --ui     # Run tests with UI
npx playwright dev            # Development mode for test authoring
```

### Development Server Ports
- Main development: 3000
- Playwright testing: 3006 (automatically configured)

## Architecture Overview

### Next.js 16 App Router Structure
```
src/
├── app/                      # App Router pages and layouts
│   ├── api/                 # API routes
│   │   ├── contact/         # Contact form processing
│   │   ├── samples/         # Sample request processing
│   │   ├── quotation/       # PDF generation and calculation
│   │   ├── robots/          # Dynamic robots.txt
│   │   └── sitemap/         # Dynamic sitemap.xml
│   ├── catalog/            # Product catalog pages
│   ├── contact/            # Contact form pages
│   └── samples/            # Sample request pages
├── components/             # Reusable React components
│   ├── catalog/           # Catalog-specific components
│   ├── contact/           # Contact form components
│   ├── layout/            # Layout and structural components
│   └── ui/                # Design system components
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

### Key Technologies
- **Framework**: Next.js 16 with App Router
- **UI**: React 19 + TypeScript + Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **Email**: SendGrid Node.js SDK
- **Database**: Supabase (configured but not fully implemented)
- **PDF**: jsPDF + html2canvas for quotation generation
- **Testing**: Playwright for E2E testing
- **Performance**: Bundle analyzer, Lighthouse, Web Vitals

## Environment Configuration

### Required Environment Variables
Copy `.env.local.example` to `.env.local` and configure:

```bash
# SendGrid (Required for email functionality)
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Supabase (Ready for implementation)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Email System Setup
1. Configure SendGrid API key with send permissions
2. Authenticate sender email/domain in SendGrid dashboard
3. Set `ADMIN_EMAIL` to receive notifications
4. Test email functionality through contact forms

## Form Systems

### Contact Form (`/contact`)
- Japanese business form validation
- Multiple inquiry types (general, technical, sales, support)
- Urgency levels and preferred contact methods
- Real-time validation with Japanese error messages
- Auto-confirmation emails to customers

### Sample Request Form (`/samples`)
- Request up to 5 product samples
- Product catalog integration
- Project detail collection
- Personal information consent (Japanese compliance)
- Admin notification for sample requests

### Quotation System
- Dynamic price calculation via `/api/quotation/calculate`
- PDF generation with `/api/quotation/pdf`
- Japanese business quotation format
- Email delivery integration

## Design System

### UI Components (`src/components/ui/`)
Built with Tailwind CSS 4 and class-variance-authority:
- **Button**: Multiple variants (primary, secondary, metallic, etc.)
- **Input**: Icon support, validation states, character counting
- **Card**: Flexible layouts with hover and loading states
- **Grid/Flex**: Responsive layout utilities
- **Theme**: Dark mode support with system detection

### Theme Configuration
- Metallic design language for premium feel
- Japanese and Korean typography optimization
- CSS custom properties for flexible theming
- Dark mode via `class` strategy

## Performance Optimizations

### Implemented Features
- **Image Optimization**: WebP/AVIF support with Next.js Image
- **Bundle Analysis**: @next/bundle-analyzer with `npm run analyze`
- **Code Splitting**: Dynamic imports for heavy components
- **Caching**: Service Worker, HTTP headers, static assets
- **Web Vitals**: Real user monitoring
- **SEO**: Japanese market optimization, structured data

### Performance Budgets
- JS Bundle: < 250KB
- CSS: < 50KB
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

### Monitoring
- Web Vitals console output
- Performance dashboard (floating button)
- Bundle analyzer at `/_next/analyze` when ANALYZE=true

## API Architecture

### Form Processing APIs
- `POST /api/contact`: Validate, email, store contact submissions
- `POST /api/samples`: Process sample requests with inventory checks
- `POST /api/quotation/calculate`: Dynamic price calculation
- `POST /api/quotation/pdf`: Generate PDF quotations

### SEO APIs
- `GET /api/robots`: Dynamic robots.txt generation
- `GET /api/sitemap`: Dynamic sitemap.xml generation

### Data Flow
1. Form submission → API route validation
2. Email notifications (SendGrid)
3. Database storage (Supabase - prepared)
4. Customer confirmation emails
5. Admin notifications

## Testing Strategy

### E2E Testing with Playwright
- Configuration in `playwright.config.ts`
- Test server on port 3006
- Tests in `/tests` directory
- Coverage of contact forms, sample requests, catalog interactions

### Running Tests
```bash
npx playwright test           # All tests
npx playwright test --ui     # Interactive mode
npx playwright test tests/contact.spec.ts  # Specific test file
```

## Japanese Market Specifics

### Language & Typography
- Primary language: Japanese (ja)
- Noto Sans JP font optimization
- Japanese business email etiquette
- Compliance with Japanese privacy laws

### SEO & Performance
- Japanese keyword optimization
- Tokyo CDN edge targeting
- Mobile network optimization for Japan
- hreflang tags for internationalization

### Business Rules
- Japanese form validation patterns
- Business day calculations
- Sample request limits (max 5)
- Privacy consent requirements

## Database Integration (Supabase)

### Configuration
Tables are designed but not fully implemented:
- `contact_submissions`: Contact form data
- `sample_requests`: Sample request tracking
- `quotations`: Quotation history
- `products`: Product catalog data

### Implementation Status
- Environment variables configured
- Type definitions in `types/`
- API routes prepared for database integration
- Ready for implementation when needed

## Development Notes

### Code Style
- TypeScript strict mode enabled
- ESLint with Next.js configuration
- Path aliases: `@/*` maps to `./src/*`
- Component co-location with index.ts exports

### Performance Development
- Use `npm run analyze` to monitor bundle size
- Check Lighthouse scores with `npm run lighthouse`
- Monitor Web Vitals in browser console
- Test on mobile networks for Japanese market

### Email Development
- Test SendGrid integration early
- Verify sender authentication
- Check Japanese email rendering
- Test both customer and admin emails

### Common Development Tasks
1. **Adding new form fields**: Update Zod schemas, add to form components
2. **New API endpoints**: Add to `src/app/api/` following existing patterns
3. **UI components**: Use design system variants in `src/components/ui/`
4. **Performance updates**: Check bundle impact with `npm run analyze`

## Deployment Considerations

### Environment Variables (Production)
Set these in your deployment platform:
- All SendGrid variables
- Supabase configuration
- `NEXT_PUBLIC_APP_URL` for proper links

### Performance Targets
- Lighthouse score: 90+ across all categories
- Core Web Vitals: All green
- Bundle size: Monitor with analyzer
- Japanese network performance: < 2s load on 3G

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
