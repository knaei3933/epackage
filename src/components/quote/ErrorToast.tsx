'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
  duration?: number;
}

interface ErrorToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ErrorToast({ toasts, onDismiss }: ErrorToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, y: -50 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'error'
                ? 'bg-red-50 border-2 border-red-200'
                : toast.type === 'success'
                ? 'bg-green-50 border-2 border-green-200'
                : 'bg-blue-50 border-2 border-blue-200'
            }`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {toast.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            )}

            <div className="flex-1">
              <p className={`text-sm font-medium ${
                toast.type === 'error'
                  ? 'text-red-800'
                  : toast.type === 'success'
                  ? 'text-green-800'
                  : 'text-blue-800'
              }`}>
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-current"
              aria-label="閉じる"
              type="button"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...message, id };

    setToasts((prev) => [...prev, newToast]);

    if (message.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, message.duration || 5000);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showError = (message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration });
  };

  const showSuccess = (message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration });
  };

  const showInfo = (message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration });
  };

  return {
    toasts,
    addToast,
    dismissToast,
    showError,
    showSuccess,
    showInfo,
  };
}
