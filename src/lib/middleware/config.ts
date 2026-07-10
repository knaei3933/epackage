/**
 * Middleware Configuration
 *
 * Route protection rules, CSRF configuration, and allowed origins.
 */

// =====================================================
// CSRF Protection Configuration
// =====================================================

// 許可されたオリジンリスト (本番環境では実際のドメインで設定)
export const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3004', // Dev server might use port 3004
  'http://localhost:3005', // Dev server might use port 3005
  'https://www.package-lab.com',
  'https://package-lab.com',
  // 本番環境で実際のドメイン追加
  // ...(process.env.ALLOWED_ORIGINS?.split(',') || []),
];

// CSRF検証が必要なAPIパス
export const CSRF_PROTECTED_API_PATHS = [
  '/api/contact',
  '/api/samples',
  '/api/b2b',
  '/api/quotation',
];

// CSRF検証から除外するAPIパス (公開API)
export const CSRF_EXEMPT_API_PATHS = [
  '/api/robots',
  '/api/sitemap',
  '/api/auth',
  '/api/auth/session', // Explicitly exempt session endpoint
  '/api/config', // Public config API for maintenance mode and settings
  '/api/products', // Public catalog API
  '/api/categories', // Public categories API
  '/api/member', // Member API - handles its own auth via SSR
  '/api/comparison', // Comparison API - handles client-side data
  '/api/upload', // Phase 4: Token-based designer upload API (public, token-based auth)
  '/api/chat', // Chatbot API - public customer support chat (LM Studio via Cloudflare Tunnel)
  '/api/health', // Health check API - public LM Studio availability check
  '/api/test-knowledge', // Test API for knowledge base debugging
  '/api/pricing/settings', // Public pricing settings API for quotation calculation
];

// =====================================================
// Protected Routes Configuration
// =====================================================

export const PROTECTED_ROUTES = {
  member: ['/member'],
  admin: ['/admin'],
  designer: ['/designer'],  // NEW: Designer routes (Phase 3 - Korean Designer Workflow)
};

export const PUBLIC_ROUTES = [
  '/about',
  '/contact',
  '/catalog',
  '/samples',
  '/print',
  '/guide',
  '/smart-quote',
  '/quote-simulator', // 誰でもアクセス可能（ステップ1で認証チェック）
  '/industry',
  '/news',
  '/premium-content',
  '/archives',
  '/blog', // ブログページ（公開）
  '/inquiry',
  '/compare',
  '/service',
  '/cart',
  '/pricing',
  '/legal',
  '/csr',
  '/privacy',
  '/terms',
  '/design-system',
  '/flow', // 製造工程ページ（公開）
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/pending', // Public page shown after registration
  '/auth/suspended', // Public page for suspended accounts
  '/designer/login', // Phase 3: Designer login page (public)
  '/upload', // Phase 4: Token-based designer upload (public, no auth required)
  '/designer-order', // Phase 5: Token-based designer order access (no auth required)
  '/sitemap.xml', // SEO: Search engine sitemap access
  '/rss.xml', // SEO: RSS feed access
  '/robots.txt', // SEO: Crawler instructions access
  '/site.webmanifest', // PWA manifest
  '/favicon.ico', // Favicon
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/logo.svg',
  '/apple-touch-icon.png',
];

