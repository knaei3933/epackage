/**
 * BreadcrumbNav Component
 *
 * パンくずナビゲーションコンポーネント
 * - 階層構造の表示
 * - クリック可能なリンク
 */

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
}

export function BreadcrumbNav({
  items,
  homeHref = '/member/dashboard',
  className = '',
}: BreadcrumbNavProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm text-text-muted ${className}`}>
      <Link
        href={homeHref}
        className="hover:text-text-primary transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
