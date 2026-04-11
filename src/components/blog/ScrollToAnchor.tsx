'use client';

import { useEffect } from 'react';

/**
 * ScrollToAnchor Component
 * Handles URL hash scrolling on page load and hash changes
 */
export function ScrollToAnchor() {
  useEffect(() => {
    // Function to scroll to element by id
    const scrollToHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const element = document.getElementById(hash);
        if (element) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
          }, 100);
        }
      }
    };

    // Scroll on initial load
    scrollToHash();

    // Listen for hash changes
    const handleHashChange = () => {
      scrollToHash();
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return null;
}
