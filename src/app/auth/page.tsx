/**
 * Auth Index Page - Redirect to Sign In
 *
 * /auth にアクセスした場合、/auth/signin にリダイレクト
 */

import { redirect } from 'next/navigation';

export default function AuthPage() {
  redirect('/auth/signin');
}

export const dynamic = 'force-dynamic';
