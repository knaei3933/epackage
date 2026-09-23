import type { ReactNode } from 'react';
import { ChatDrawerProvider } from '@/contexts/ChatDrawerContext';

export function ChatDrawerTestWrapper({ children }: { children: ReactNode }) {
  return <ChatDrawerProvider>{children}</ChatDrawerProvider>;
}
