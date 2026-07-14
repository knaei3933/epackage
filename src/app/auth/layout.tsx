/**
 * Auth Layout
 *
 * 認証ページ（signin/signout/register 等）共通レイアウト。
 * 認証ページは検索エンジンにインデックスさせない（noindex,nofollow）。
 */

import type { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
