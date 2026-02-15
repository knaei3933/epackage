'use client';

import React from 'react';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsHintProps {
  className?: string;
}

export function KeyboardShortcutsHint({ className = '' }: KeyboardShortcutsHintProps) {
  return (
    <div
      className={`hidden lg:flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 ${className}`}
      role="complementary"
      aria-label="キーボードショートカット"
    >
      <Keyboard className="w-4 h-4" aria-hidden="true" />
      <span className="font-medium">キーボードショートカット:</span>
      <div className="flex items-center gap-3">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded">
          ← →
        </kbd>
        <span>ステップ移動</span>
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded">
          Ctrl + Enter
        </kbd>
        <span>次へ</span>
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded">
          Esc
        </kbd>
        <span>閉じる</span>
      </div>
    </div>
  );
}
