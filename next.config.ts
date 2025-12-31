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

  // Image optimization
  images: {
    unoptimized: true,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    minimumCacheTTL: 60,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js', 'framer-motion', 'react-hook-form', 'zod'],
  },

  // Webpack optimization
  webpack: (config, { isServer }) => {
    // SVG 최적화
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Compression
  compress: true,

  // Static optimization
  trailingSlash: true,

  // Turbopack configuration
  turbopack: {
    // Custom Turbopack rules can go here
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Security and cache optimization
  async headers() {
    const isDev = process.env.NODE_ENV === 'development';

    return [
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
