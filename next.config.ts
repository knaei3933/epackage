import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // =====================================================
  // CRITICAL FIX FOR NEXT.JS 16 + TURBOPACK BUILD HANG
  // =====================================================
  // Remove turbopack.root configuration as it may cause issues
  // with lock file handling during build
  // turbopack: {
  //   root: process.cwd(),
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
  // Turbopack is now default in Next.js 16
  // =====================================================
  serverExternalPackages: [
    '@react-pdf/renderer',
    '@fontsource/noto-sans-jp',
    '@supabase/supabase-js',
    '@supabase/ssr',
  ],
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
};

export default nextConfig;
