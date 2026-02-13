/**
 * Member Index Page - Redirect to Dashboard
 *
 * /member にアクセスした場合、/member/dashboard にリダイレクト
 */

import { redirect } from 'next/navigation';

export default function MemberPage() {
  redirect('/member/dashboard');
}

export const dynamic = 'force-dynamic';
