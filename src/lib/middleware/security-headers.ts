/**
 * Security Headers
 */

import { NextResponse } from 'next/server';

// Security Headers
// =====================================================

export function addSecurityHeaders(response: NextResponse, pathname?: string) {
  // Prevent clickjacking - DENYはすべてのフレームをブロック
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy - より厳格なポリシー
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Content Security Policy - 強化されたバージョン
  // Next.jsの静的ファイル（/_next/）にはCSPを適用しない
  // Google Search ConsoleでCSP違反エラーが報告されるため除外
  if (!pathname || !pathname.startsWith('/_next')) {
    const isDev = process.env.NODE_ENV === 'development';

    const cspDirectives = [
      "default-src 'self' blob:",
      // React 19 and Framer Motion require unsafe-inline for hydration and animations
      // Both dev and production need 'unsafe-inline' for client-side rendering
      // Google Tag Manager, Analytics, and Ads support
      isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
      // script-src-elem for external script files (_next/static/chunks/*)
      isDev
        ? "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com"
        : "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://js.sendgrid.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://googleads.g.doubleclick.net https://www.googleadservices.com",
      isDev ? "style-src 'self' 'unsafe-inline'" : "style-src 'self' 'unsafe-inline'",
      // style-src-elem for external stylesheet files (_next/static/chunks/*)
      "style-src-elem 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob: https://www.google.com https://www.google.co.jp https://www.googleadservices.com https://googleads.g.doubleclick.net https://*.g.doubleclick.net",
      "font-src 'self' data: blob:",
      // Complete Google connectivity for GTM, GA4, and Google Ads
      "connect-src 'self' blob: https://api.sendgrid.com https://*.supabase.co wss://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.co.jp https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://www.googleadservices.com https://*.g.doubleclick.net",
      "frame-src 'self' https://www.googletagmanager.com",
      // manifest-src for site.webmanifest
      "manifest-src 'self'",
      // form-actionを'self'に制限してCSRF防御
      "form-action 'self'",
      // base-uriも制限
      "base-uri 'self'",
      // object-srcをブロック
      "object-src 'none'",
    ];

    response.headers.set('Content-Security-Policy', cspDirectives.join('; '));
  }

  // HSTS (HTTP Strict Transport Security) - production only
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Permissions policy - より制限的なポリシー
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );

  // Cross-Origin Opener Policy
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');

  // Cross-Origin Resource Policy
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return response;
}
