'use client';

import { useEffect, type ReactNode } from 'react';
import { useChatDrawer } from '@/contexts/ChatDrawerContext';

interface ChatDrawerAppShellProps {
  children: ReactNode;
}

export function ChatDrawerAppShell({ children }: ChatDrawerAppShellProps) {
  const { isOpen } = useChatDrawer();

  // Lock body scroll when mobile fullscreen chat is open
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = !window.matchMedia('(min-width: 1024px)').matches;
    if (!isMobile) return;

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <div
      className={`transition-[margin-right] duration-300 ease-in-out motion-reduce:transition-none ${
        isOpen ? 'lg:mr-[400px]' : 'mr-0'
      }`}
    >
      {children}
    </div>
  );
}
