'use client';

/**
 * Global Toast Notification System
 *
 * Lightweight toast context provider that wraps the existing ErrorToast
 * visual component but exposes a stable imperative API (showError/showSuccess/showInfo)
 * usable anywhere in the app without per-component state wiring.
 *
 * Usage:
 *   const { showError } = useToastContext();
 *   showError('操作に失敗しました');
 */

import React, { createContext, useCallback, useContext, useState } from 'react';
import { ErrorToast, type ToastMessage } from '@/components/quote/shared/ErrorToast';

interface ToastContextValue {
  showError: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastMessage['type'], message: string, duration?: number) => {
    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration !== 0) {
      setTimeout(() => dismiss(id), duration ?? 4000);
    }
  }, [dismiss]);

  const showError = useCallback((m: string, d?: number) => add('error', m, d), [add]);
  const showSuccess = useCallback((m: string, d?: number) => add('success', m, d), [add]);
  const showInfo = useCallback((m: string, d?: number) => add('info', m, d), [add]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess, showInfo }}>
      {children}
      <ErrorToast toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Graceful fallback: if used outside provider, degrade to console + alert
    return {
      showError: (m) => { console.error(m); alert(m); },
      showSuccess: (m) => { console.info(m); },
      showInfo: (m) => { console.info(m); },
    };
  }
  return ctx;
}
