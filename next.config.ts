import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Force server mode, disable static export
  // =====================================================
  // Turbopack configuration
  // =====================================================
  turbopack: {
    // Exclude Playwright from bundling
    rules: {
      '*.node': {
        loaders: ['node-loader'],
        as: '*.js',
      },
    },
  },
  // =====================================================
  // Webpack configuration (fallback for --webpack flag)
  // =====================================================
  webpack: (config, { isServer }) => {
    // Exclude Playwright from bundling
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push('playwright', 'playwright-core');
    }
    return config;
  },
  skipTrailingSlashRedirect: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // =====================================================
  // Remove console.log in production builds
  // =====================================================
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // =====================================================
  // Bundle Optimization - Tree shaking for large packages
  // NOTE: modularizeImports disabled for Turbopack compatibility
  // Turbopack has its own tree-shaking and optimization
  // =====================================================
  // modularizeImports: {
  //   'lucide-react': {
  //     transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
  //   },
  //   'date-fns': {
  //     transform: 'date-fns/{{member}}',
  //   },
  // },
  // =====================================================
  // Rewrites to fix trailing slash redirect loops
  // =====================================================
  async rewrites() {
    return [
      {
        source: '/api/auth/session',
        destination: '/api/auth/session',
      },
      {
        source: '/api/auth/session/:path*',
        destination: '/api/auth/session/:path*',
      },
    ];
  },
  // =====================================================
  // Security Headers (applies to all routes except static files)
  // NOTE: Moved from middleware to reduce middleware CPU usage
  // Static files (_next/*) should NOT have CSP headers
  // =====================================================
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://*.supabase.co https://www.google.com https://www.google.co.jp https://www.google.co.kr https://www.google.adservicemse.com https://adservice.google.com https://adservice.google.co.jp https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
          "font-src 'self' data:",
          "connect-src 'self' https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.jp https://www.google.co.kr https://adservice.google.com https://adservice.google.co.jp https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
          "frame-src 'self' https://www.googletagmanager.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "upgrade-insecure-requests",
        ].join('; '),
      },
    ];

    const hstsHeaders = [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
    ];

    return [
      // All routes - full security headers including CSP
      // Use negative lookahead to exclude _next and images paths
      {
        source: '/:path((?!_next|images).)*',
        headers: securityHeaders,
      },
      ...(process.env.NODE_ENV === 'production' ? [
        {
          source: '/:path*',
          headers: hstsHeaders,
        },
      ] : []),
    ];
  },
  // =====================================================
  // Server external packages
  // NOTE: Turbopack requires explicit listing of transitive dependencies
  // =====================================================
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@fontsource/noto-sans-jp',
    '@supabase/supabase-js',
    '@supabase/ssr',
    'playwright',
    'playwright-core',
    // PDF generation dependencies
    'handlebars',
    'chrome-aws-lambda',
    'puppeteer-core',
    // Markdown rendering dependencies (for Turbopack)
    'remark',
    'remark-parse',
    'remark-rehype',
    'remark-gfm',
    'rehype-stringify',
    'unified',
    'mdast-util-to-string',
    'micromark',
    'unist-util-is',
    'unist-util-visit',
    'zwitch',
  ],
  images: {
    unoptimized: false,
    formats: ['image/webp'],
    deviceSizes: [640, 1080, 1920],
    imageSizes: [16, 64, 256],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Use custom loader to ensure www prefix for image optimization
    loaderFile: './src/lib/image-loader.ts',
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

export default nextConfig;
