/**
 * useFocusTrap Hook
 *
 * Focus trap hook for modals, dropdowns, and other overlay components
 * Keeps keyboard focus within a container while it's active
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * useFocusTrap(ref, isActive);
 *
 * return (
 *   <div ref={ref} tabIndex={-1}>
 *     <button>Button 1</button>
 *     <button>Button 2</button>
 *   </div>
 * );
 * ```
 */

'use client';

import { useEffect, RefObject } from 'react';

interface UseFocusTrapOptions {
  /**
   * Whether the focus trap is active
   */
  isActive: boolean;
  /**
   * Element to return focus to when trap is deactivated
   */
  returnFocusRef?: RefObject<HTMLElement | null>;
  /**
   * Whether to focus first element automatically when trap activates
   * @default true
   */
  autoFocus?: boolean;
}

/**
 * Hook to trap focus within a container element
 *
 * Features:
 * - Cycles tab focus within the container
 * - Shift+Tab cycles in reverse
 * - Focuses first focusable element on activation
 * - Returns focus to trigger element on deactivation
 * - Handles dynamic content changes
 */
export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseFocusTrapOptions
) {
  const { isActive, returnFocusRef, autoFocus = true } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;

    // Get all focusable elements within the container
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
      );
    };

    // Focus first focusable element
    if (autoFocus) {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // Small delay to ensure the container is fully rendered
        const timeoutId = setTimeout(() => {
          focusableElements[0]?.focus();
        }, 50);
        return () => clearTimeout(timeoutId);
      }
    }

    // Handle Tab key to trap focus
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If Shift+Tab and focus is on first element, move to last
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
      // If Tab and focus is on last element, move to first
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    // Handle Escape key to deactivate (optional - caller should handle this)
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isActive) {
        // Emit custom event for parent to handle
        const event = new CustomEvent('focusTrapEscape', { bubbles: true });
        container.dispatchEvent(event);
      }
    };

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Return focus to trigger element when deactivated
    const previouslyFocusedElement = document.activeElement as HTMLElement;

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);

      // Return focus to returnFocusRef or previously focused element
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      } else if (previouslyFocusedElement && document.contains(previouslyFocusedElement)) {
        previouslyFocusedElement.focus();
      }
    };
  }, [isActive, containerRef, returnFocusRef, autoFocus]);

  return containerRef;
}

/**
 * Alternative focus trap using the native FocusEvent API
 * More robust but requires more setup
 */
export function useFocusTrapStrict<T extends HTMLElement = HTMLElement>(
  containerRef: RefObject<T | null>,
  options: UseFocusTrapOptions
) {
  const { isActive, returnFocusRef, autoFocus = true } = options;

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusableElements = (): HTMLElement[] => {
      return Array.from(
        container.querySelectorAll<HTMLElement>(focusableSelectors)
      );
    };

    // Focus first element
    if (autoFocus) {
      const elements = getFocusableElements();
      const firstElement = elements[0];
      if (firstElement) {
        const timeoutId = setTimeout(() => firstElement.focus(), 50);
        return () => clearTimeout(timeoutId);
      }
    }

    const handleFocusIn = (e: FocusEvent) => {
      if (!isActive) return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // If focus leaves the container, redirect to first/last element
      if (!container.contains(e.target as Node)) {
        e.preventDefault();
        if ((e as FocusEvent).relatedTarget && container.contains((e as FocusEvent).relatedTarget as Node)) {
          // Focus is moving within container, let it happen
          return;
        }
        // Focus moved outside container, redirect
        firstElement?.focus();
      }
    };

    // Capture phase for earlier intervention
    container.addEventListener('focusin', handleFocusIn, true);

    return () => {
      container.removeEventListener('focusin', handleFocusIn, true);

      // Return focus
      if (returnFocusRef?.current) {
        returnFocusRef.current.focus();
      }
    };
  }, [isActive, containerRef, returnFocusRef, autoFocus]);

  return containerRef;
}

export default useFocusTrap;
