/**
 * Designer Login Page
 *
 * Korean Designer Correction Workflow - Phase 3
 * - Designer-specific login page
 * - Uses Supabase Google OAuth
 * - Redirects to /designer after login
 */

import { Metadata } from 'next';
import DesignerLoginForm from '@/components/designer/DesignerLoginForm';
import Link from 'next/link';

// =====================================================
// Metadata
// =====================================================

export const metadata: Metadata = {
  title: 'Designer Login | Epackage Lab',
  description: 'Korean designer login page for Epackage Lab correction workflow.',
};

// =====================================================
// Page Component
// =====================================================

export default function DesignerLoginPage() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-bg-secondary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-bold text-brand">
              Epackage Lab
            </span>
          </Link>
          <h1 className="font-heading text-2xl font-semibold text-text-primary mb-2">
            Designer Login
          </h1>
          <p className="text-text-muted">
            Korean designer portal for correction workflow
          </p>
          <p className="text-sm text-text-muted mt-2">
            / ????? ?? ??
          </p>
        </div>

        {/* Login Form - Client Component */}
        <DesignerLoginForm />

        {/* Back to main site link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-brand hover:text-brand-pressed underline-offset-4 hover:underline"
          >
            Back to Main Site
          </Link>
        </div>
      </div>
    </main>
  );
}
