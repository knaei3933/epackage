'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ChatDrawerContextValue {
  readonly isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const ChatDrawerContext = createContext<ChatDrawerContextValue | null>(null);

export function ChatDrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle],
  );

  return (
    <ChatDrawerContext.Provider value={value}>
      {children}
    </ChatDrawerContext.Provider>
  );
}

export function useChatDrawer(): ChatDrawerContextValue {
  const ctx = useContext(ChatDrawerContext);
  if (!ctx) {
    throw new Error('useChatDrawer must be used within ChatDrawerProvider');
  }
  return ctx;
}
