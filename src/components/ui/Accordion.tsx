'use client';

import React, { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
  required?: boolean;
}

export function AccordionItem({
  id,
  title,
  description,
  children,
  defaultOpen = false,
  icon,
  required = false
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border-medium rounded-lg mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-bg-primary hover:bg-bg-secondary transition-colors"
        aria-expanded={isOpen}
        aria-controls={`accordion-${id}`}
      >
        <div className="flex items-center gap-3">
          {icon && <div className="text-brand">{icon}</div>}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary">{title}</h3>
              {required && <span className="text-error">*</span>}
            </div>
            {description && (
              <p className="text-sm text-text-muted mt-1">{description}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </button>
      <div
        id={`accordion-${id}`}
        className={cn(
          'transition-all duration-200 ease-in-out',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        )}
      >
        <div className="px-6 py-4 bg-bg-secondary">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface AccordionSectionProps {
  items: AccordionItemProps[];
  allowMultipleOpen?: boolean;
}

export function AccordionSection({ items, allowMultipleOpen = false }: AccordionSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter((_, i) => items[i].defaultOpen).map((item) => item.id))
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev);
      if (allowMultipleOpen) {
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        if (newSet.has(id)) {
          newSet.clear();
        } else {
          newSet.clear();
          newSet.add(id);
        }
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="border border-border-medium rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            className="w-full px-6 py-4 flex items-center justify-between bg-bg-primary hover:bg-bg-secondary transition-colors"
            aria-expanded={openItems.has(item.id)}
            aria-controls={`accordion-${item.id}`}
          >
            <div className="flex items-center gap-3">
              {item.icon && <div className="text-brand">{item.icon}</div>}
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">{item.title}</h3>
                  {item.required && <span className="text-error">*</span>}
                </div>
                {item.description && (
                  <p className="text-sm text-text-muted mt-1">{item.description}</p>
                )}
              </div>
            </div>
            {openItems.has(item.id) ? (
              <ChevronUp className="w-5 h-5 text-text-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-text-muted" />
            )}
          </button>
          <div
            id={`accordion-${item.id}`}
            className={cn(
              'transition-all duration-200 ease-in-out',
              openItems.has(item.id) ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            )}
          >
            <div className="px-6 py-4 bg-bg-secondary">
              {item.children}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default AccordionSection;
