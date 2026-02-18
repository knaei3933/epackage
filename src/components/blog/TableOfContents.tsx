/**
 * TableOfContents Component
 * Auto-generated table of contents from blog post headings
 */

'use client';

import { useState, useEffect } from 'react';
import { List } from 'lucide-react';
import { Heading } from '@/lib/blog/markdown';

interface TableOfContentsProps {
  headings: Heading[];
  activeId?: string;
}

export function TableOfContents({ headings, activeId }: TableOfContentsProps) {
  const [currentActiveId, setCurrentActiveId] = useState<string>(activeId || '');

  // Scroll spy effect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrentActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  // If no headings, don't render
  if (headings.length === 0) {
    return null;
  }

  // Scroll to heading
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Header height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      setCurrentActiveId(id);
    }
  };

  return (
    <div className="sticky top-24 bg-white rounded-lg shadow-md p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4">
        <List className="w-5 h-5" />
        目次
      </h3>

      <nav aria-label="Table of contents">
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <TableOfContentsItem
                heading={heading}
                isActive={currentActiveId === heading.id}
                onClick={() => scrollToHeading(heading.id)}
              />
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

interface TableOfContentsItemProps {
  heading: Heading;
  isActive: boolean;
  onClick: () => void;
}

function TableOfContentsItem({ heading, isActive, onClick }: TableOfContentsItemProps) {
  const paddingLeft = (heading.level - 2) * 16; // H2 = 0, H3 = 16px, etc.

  return (
    <div>
      <button
        onClick={onClick}
        className={`
          block w-full text-left py-1 px-2 rounded text-sm transition-colors
          ${isActive
            ? 'bg-blue-100 text-blue-700 font-medium'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }
        `}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
      >
        {heading.text}
      </button>

      {/* Render children recursively */}
      {heading.children && heading.children.length > 0 && (
        <ul className="mt-1 space-y-1">
          {heading.children.map((child) => (
            <li key={child.id}>
              <TableOfContentsItem
                heading={child}
                isActive={isActive}
                onClick={onClick}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// =====================================================
// Mini Table of Contents (for mobile)
// =====================================================

interface MiniTableOfContentsProps {
  headings: Heading[];
}

export function MiniTableOfContents({ headings }: MiniTableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md"
      >
        <span className="font-medium text-gray-900">目次</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul className="mt-2 space-y-1 pl-4">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className="block py-2 text-sm text-gray-600 hover:text-blue-600"
                onClick={() => setIsOpen(false)}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
