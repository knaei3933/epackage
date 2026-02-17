import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Force server mode, disable static export
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
  // Server external packages
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
    deviceSizes: [640, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 64, 128, 256, 512],
    dangerouslyAllowSVG: false,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // =====================================================
  // Force Vercel to bypass build cache
  // =====================================================
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
