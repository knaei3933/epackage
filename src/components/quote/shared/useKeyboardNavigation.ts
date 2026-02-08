'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardNavigationOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  onDismiss?: () => void;
  onConfirm?: () => void;
  isInputFocused?: () => boolean;
  canProceed?: boolean;
  canGoBack?: boolean;
}

export function useKeyboardNavigation({
  onNext,
  onPrevious,
  onDismiss,
  onConfirm,
  isInputFocused,
  canProceed = true,
  canGoBack = true,
}: KeyboardNavigationOptions) {
  const handlersRef = useRef({ onNext, onPrevious, onDismiss, onConfirm });

  useEffect(() => {
    handlersRef.current = { onNext, onPrevious, onDismiss, onConfirm };
    console.log('[useKeyboardNavigation] handlersRef updated:', {
      hasNext: !!handlersRef.current.onNext,
      hasPrevious: !!handlersRef.current.onPrevious,
      hasDismiss: !!handlersRef.current.onDismiss,
      hasConfirm: !!handlersRef.current.onConfirm
    });
  }, [onNext, onPrevious, onDismiss, onConfirm]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInInput =
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute('contenteditable') === 'true';

    if (isInputFocused?.() ?? isInInput) {
      // In input fields, only handle specific keys
      if (event.key === 'Escape' && handlersRef.current.onDismiss) {
        event.preventDefault();
        handlersRef.current.onDismiss();
        return;
      }

      // Don't handle navigation keys in input fields
      return;
    }

    switch (event.key) {
      case 'ArrowRight':
        console.log('[useKeyboardNavigation] ArrowRight pressed. canProceed:', canProceed, 'onNext exists:', !!handlersRef.current.onNext);
        if (handlersRef.current.onNext && canProceed) {
          event.preventDefault();
          console.log('[useKeyboardNavigation] Calling onNext handler');
          handlersRef.current.onNext();
        } else {
          console.log('[useKeyboardNavigation] ArrowRight blocked. canProceed:', canProceed, 'onNext exists:', !!handlersRef.current.onNext);
        }
        break;

      case 'ArrowLeft':
        if (handlersRef.current.onPrevious && canGoBack) {
          event.preventDefault();
          handlersRef.current.onPrevious();
        }
        break;

      case 'Escape':
        if (handlersRef.current.onDismiss) {
          event.preventDefault();
          handlersRef.current.onDismiss();
        }
        break;

      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          if (handlersRef.current.onConfirm && canProceed) {
            event.preventDefault();
            handlersRef.current.onConfirm();
          }
        } else {
          // Regular Enter key also works like Confirm
          if (handlersRef.current.onConfirm && canProceed) {
            event.preventDefault();
            handlersRef.current.onConfirm();
          }
        }
        break;
    }
  }, [canProceed, canGoBack, isInputFocused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
