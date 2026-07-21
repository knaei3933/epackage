/**
 * NotFound Back Button (Client Component)
 *
 * not-found.tsx を Server Component 化するため、
 * window.history.back() を使うボタンだけを切り出した Client Component。
 */

'use client';

import { Button } from '@/components/ui/Button';

export function NotFoundBackButton() {
  return (
    <Button
      onClick={() => window.history.back()}
      variant="outline"
      className="w-full sm:w-auto"
    >
      前のページに戻る
    </Button>
  );
}
