# Epackage Lab Web - B2B Packaging Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

A comprehensive B2B packaging management system for the Japanese market, featuring customer portals, admin dashboards, and integrated quotation systems.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

## Overview

Epackage Lab Web is a modern Next.js 16 application designed for managing packaging inquiries, sample requests, and quotations in the Japanese B2B market. The system provides:

- **Customer Portal**: Product browsing, sample requests, quotation generation
- **Admin Dashboard**: Order management, production tracking, shipment coordination
- **Integrated Services**: SendGrid email, Supabase database, carrier API integration
- **Japanese Market Focus**: Localized UI, business rules, and compliance

## Features

### Customer Features
- Product catalog with search and filtering
- Sample request system (up to 5 samples per request)
- Interactive quotation calculator with PDF generation
- Real-time order tracking and status updates
- Document management (quotations, invoices, delivery slips)
- Profile management with company information

### Admin Features
- Dashboard with key metrics and pending actions
- Order management with approval workflows
- Production tracking and scheduling
- Shipment management with carrier integration
- Customer and product management
- Document generation and management

### Technical Features
- JWT-based authentication with role-based access control
- Real-time updates via Supabase subscriptions
- PDF generation for quotations and documents
- Email notifications via SendGrid
- API rate limiting and security measures
- Comprehensive error handling and logging

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form + Zod validation
- **State Management**: React Context + Zustand

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + JWT
- **API**: Next.js API Routes
- **File Storage**: Supabase Storage
- **Email**: SendGrid

### Integration
- **Carriers**: Yamato Transport, Sagawa Express, Japan Post
- **e-Signature**: DocuSign (optional)
- **Analytics**: Vercel Analytics (optional)
- **Monitoring**: Sentry (optional)

### Development
- **Testing**: Playwright (E2E), Jest (unit)
- **Linting**: ESLint, Prettier
- **Build Tools**: Turbopack
- **Deployment**: Vercel

## Quick Start

### Prerequisites

- Node.js 18.17+
- npm or yarn
- Supabase account
- SendGrid account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/epackage-lab-web.git
cd epackage-lab-web

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Configure environment variables (see below)
# Edit .env.local with your configuration

# Run development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SendGrid
SENDGRID_API_KEY=SG.your-sendgrid-api-key
ADMIN_EMAIL=admin@epackage-lab.com
FROM_EMAIL=noreply@epackage-lab.com

# Carrier APIs (Optional - for shipment tracking)
YAMATO_API_KEY=your-yamato-key
SAGAWA_API_KEY=your-sagawa-key
JP_POST_API_KEY=your-jp-post-key

# DocuSign (Optional)
DOCUSIGN_CLIENT_ID=your-docusign-client-id
DOCUSIGN_CLIENT_SECRET=your-docusign-secret
DOCUSIGN_ACCOUNT_ID=your-docusign-account-id

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your-google-analytics-id
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-vercel-id

# Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
```

See [`.env.local.example`](/.env.local.example) for a complete example.

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Analysis & Performance
npm run analyze          # Analyze bundle size
npm run build:production # Build with NODE_ENV=production
npm run lighthouse       # Run Lighthouse audit
npm run test:performance # Build + Lighthouse audit

# Testing
npx playwright test      # Run all E2E tests
npx playwright test --ui # Run tests with UI
npx playwright dev       # Development mode for test authoring
```

### Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   npx playwright test
   ```

3. **Build and verify**
   ```bash
   npm run build:production
   npm run lighthouse
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

## Testing

### E2E Testing with Playwright

```bash
# Run all tests
npx playwright test

# Run tests in UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/contact.spec.ts

# Run tests for specific viewport
npx playwright test --project="Mobile Chrome"

# Debug tests
npx playwright test --debug
```

### Performance Testing

```bash
# Build and analyze bundle
npm run analyze

# Run Lighthouse audit
npm run lighthouse

# Complete performance test
npm run test:performance
```

Performance targets:
- Lighthouse Performance: 90+
- Lighthouse Accessibility: 95+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

## Deployment

### Production Deployment to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Or use the deployment script
bash scripts/deploy-production.sh
```

### Pre-deployment Checklist

- [ ] All tests passing: `npx playwright test`
- [ ] Build successful: `npm run build:production`
- [ ] Lighthouse scores > 90: `npm run lighthouse`
- [ ] Environment variables configured in Vercel
- [ ] Supabase migrations applied
- [ ] SendGrid templates configured
- [ ] Domain DNS configured
- [ ] SSL certificates valid
- [ ] Monitoring and error tracking set up

See [docs/deployment.md](/docs/deployment.md) for detailed deployment instructions.

## Documentation

- [Architecture](/docs/architecture.md) - System architecture and design
- [API Reference](/docs/api.md) - Complete API documentation
- [Deployment Guide](/docs/deployment.md) - Production deployment instructions
- [Database Schema](/docs/database-schema.md) - Database structure and relationships
- [Contributing](/docs/contributing.md) - Contribution guidelines

## Project Structure

```
epackage-lab-web/
├── docs/                      # Documentation
├── scripts/                   # Build and deployment scripts
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth group (signin, signup)
│   │   ├── (customer)/       # Customer group (dashboard, orders)
│   │   ├── (public)/         # Public pages (home, catalog)
│   │   ├── admin/            # Admin dashboard
│   │   ├── api/              # API routes
│   │   └── layout.tsx        # Root layout
│   ├── components/           # React components
│   │   ├── ui/              # Design system components
│   │   ├── forms/           # Form components
│   │   └── layouts/         # Layout components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── lib/                 # Utility libraries
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── tests/                   # Playwright E2E tests
├── .env.local.example       # Environment template
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Support

For support, email [admin@epackage-lab.com](mailto:admin@epackage-lab.com) or open an issue on GitHub.

## License

This project is licensed under the MIT License - see the [LICENSE](/LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com/)
- Authentication powered by [Supabase](https://supabase.com/)
- Email delivery via [SendGrid](https://sendgrid.com/)
