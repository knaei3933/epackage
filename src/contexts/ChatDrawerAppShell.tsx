'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useChatDrawer } from '@/contexts/ChatDrawerContext';

interface ChatDrawerAppShellProps {
  children: ReactNode;
}

export function ChatDrawerAppShell({ children }: ChatDrawerAppShellProps) {
  const { isOpen } = useChatDrawer();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWide, setIsWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // 1536px 以上のときだけ本文を押す。それより狭いときはチャットを重ねて出す
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1536px)');
    setIsWide(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsWide(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Lock body scroll when mobile fullscreen chat is open
  useEffect(() => {
    if (!isOpen || isDesktop) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen, isDesktop]);

  const shouldPush = isOpen && isWide;

  return (
    <div
      style={{
        marginRight: shouldPush ? '400px' : '0px',
        transition: 'margin-right 300ms ease-in-out',
      }}
    >
      {children}
    </div>
  );
}
