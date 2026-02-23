/**
 * Designer Order Index Page
 *
 * Redirects to invalid token page when accessing /designer-order without token
 * This prevents RSC 404 errors when Next.js tries to prefetch the route
 */

import { redirect } from 'next/navigation';

export default function DesignerOrderIndexPage() {
  // Redirect to invalid token page
  redirect('/designer-order/invalid');
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
