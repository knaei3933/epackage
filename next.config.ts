import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
  analyzerMode: 'static',
});

const nextConfig: NextConfig = {
  // Performance optimizations
  reactCompiler: true,

  // Production source maps for better debugging (only in production)
  productionBrowserSourceMaps: false,

  // Bypass TypeScript type checking during builds (type errors still shown in IDE)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Server-only packages (ESM modules that cannot be bundled for client-side)
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@fontsource/noto-sans-jp',
  ],

  // Turbopack configuration (Next.js 16 default)
  turbopack: {
    // Enable turbopack with custom config
    rules: {
      // SVG handling for Turbopack
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Image optimization - ENABLED for performance
  images: {
    // Enable Next.js Image Optimization for automatic WebP/AVIF conversion
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    qualities: [70, 75, 80, 85, 90, 95],
    minimumCacheTTL: 60,
    // Enable sharp for faster image processing
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@supabase/supabase-js',
      'framer-motion',
      'react-hook-form',
      'zod',
      'recharts',
      'date-fns',
    ],
  },

  // Webpack optimization
  webpack: (config, { dev }) => {
    // SVG最適化
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Production optimizations
    if (!dev) {
      // Enable module concatenation for better performance
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        runtimeChunk: 'single',
        // Enable module concatenation to reduce bundle size
        concatenateModules: true,
        // Minimize bundle size
        minimize: true,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // React chunk (highest priority)
            react: {
              name: 'react',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Supabase chunk
            supabase: {
              name: 'supabase',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              priority: 35,
            },
            // Form libraries chunk
            forms: {
              name: 'forms',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              priority: 30,
            },
            // UI libraries chunk
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](framer-motion|lucide-react|@radix-ui|recharts)[\\/]/,
              priority: 28,
            },
            // Date utilities chunk
            dateUtils: {
              name: 'date-utils',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](date-fns|dayjs)[\\/]/,
              priority: 26,
            },
            // PDF generation chunk
            pdf: {
              name: 'pdf',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](jspdf|html2canvas)[\\/]/,
              priority: 24,
            },
            // Vendor chunk (remaining node_modules)
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
              minChunks: 2,
            },
          },
        },
      };
    }

    return config;
  },

  // Compression
  compress: true,

  // Security and cache optimization
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
      // Preconnect to external resources for faster loading
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: '<https://fonts.googleapis.com>; rel=preconnect, <https://fonts.gstatic.com>; rel=preconnect, <https://cdn.jsdelivr.net>; rel=preconnect',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDev
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=300',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
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
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // SEO improvements
  async redirects() {
    return [
      // B2B routes removed - now returning 404 in middleware
      // See src/middleware.ts lines 259-289 for B2B 404 handling
      // ROI Calculator to Quote Simulator - 301 Permanent Redirect
      {
        source: '/roi-calculator',
        destination: '/quote-simulator',
        permanent: true,
      },
      {
        source: '/roi-calculator/:path*',
        destination: '/quote-simulator/:path*',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      // Redirect plural to singular forms for consistency
      {
        source: '/services/:path*',
        destination: '/service/:path*',
      },
      {
        source: '/products/:path*',
        destination: '/catalog/:path*',
      },
      // Legacy URL support
      {
        source: '/about-us',
        destination: '/about',
      },
      {
        source: '/contact-us',
        destination: '/contact',
      },
      {
        source: '/get-quote',
        destination: '/quote-simulator',
      },
    ];
  },

  // Optimization for mobile
  poweredByHeader: false,

  // Enable static generation for better performance
  generateEtags: true,
};

export default withBundleAnalyzer(nextConfig);
