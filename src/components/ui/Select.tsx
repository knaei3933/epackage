'use client'

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-md border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-[var(--border-medium)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--brixa-primary-500)] focus:ring-[var(--brixa-primary-500)]',
        error: 'border-[var(--error-500)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--error-500)] focus:ring-[var(--error-500)]',
        success: 'border-[var(--success-500)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--success-500)] focus:ring-[var(--success-500)]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  onChange?: (value: string) => void;
  onSearch?: (searchTerm: string) => void;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({
    className,
    variant,
    size,
    options,
    value,
    defaultValue,
    placeholder = '選択してください...',
    label,
    error,
    helperText,
    required,
    disabled,
    searchable = false,
    clearable = false,
    onChange,
    onSearch,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [internalValue, setInternalValue] = useState(defaultValue || '');
    const selectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find(option => option.value === currentValue);

    // Filter options based on search term
    const filteredOptions = options.filter(option => {
      if (searchTerm === '') return true;
      return option.label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Handle click outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchTerm('');
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        if (!isOpen) {
          setSearchTerm('');
        }
      }
    };

    const handleSelect = (option: SelectOption) => {
      if (!option.disabled) {
        if (value !== undefined) {
          onChange?.(option.value);
        } else {
          setInternalValue(option.value);
          onChange?.(option.value);
        }
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (value !== undefined) {
        onChange?.('');
      } else {
        setInternalValue('');
        onChange?.('');
      }
      setIsOpen(false);
      setSearchTerm('');
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = e.target.value;
      setSearchTerm(newSearchTerm);
      onSearch?.(newSearchTerm);
    };

    const selectId = React.useId();
    const dropdownId = `${selectId}-dropdown`;
    const errorId = error ? `${selectId}-error` : undefined;
    const helperId = helperText ? `${selectId}-helper` : undefined;

    return (
      <div className="space-y-2" ref={ref}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-[var(--text-primary)] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
            {required && <span className="text-[var(--error-500)] ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={selectRef}>
          {/* Select Trigger */}
          <div
            id={selectId}
            className={cn(
              selectVariants({ variant, size }),
              'cursor-pointer',
              className
            )}
            onClick={handleToggle}
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={dropdownId}
            aria-invalid={!!error || undefined}
            aria-describedby={cn(errorId, helperId)}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
            {...props}
          >
            <span className={cn('truncate flex-1', !currentValue && 'text-[var(--text-tertiary)]')}>
              {currentValue ? selectedOption?.label : placeholder}
            </span>

            <div className="flex items-center gap-1">
              {clearable && currentValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-[var(--bg-secondary)] rounded-sm transition-colors"
                  aria-label="Clear selection"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="p-1">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div id={dropdownId} className="absolute z-50 w-full mt-1 bg-white border border-[var(--border-light)] rounded-md shadow-lg max-h-60 overflow-hidden" role="listbox">
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-[var(--border-light)]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="検索..."
                    className="w-full px-3 py-2 text-sm border border-[var(--border-medium)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brixa-primary-500)] focus:border-[var(--brixa-primary-500)]"
                  />
                </div>
              )}

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-sm text-[var(--text-tertiary)] text-center">
                    {searchTerm ? '検索結果がありません' : '選択肢がありません'}
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        'px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between',
                        option.disabled
                          ? 'text-[var(--text-tertiary)] cursor-not-allowed'
                          : 'text-[var(--text-primary)] hover:bg-[var(--brixa-primary-50)]',
                        currentValue === option.value && 'bg-[var(--brixa-primary-100)] text-[var(--brixa-primary-700)]'
                      )}
                      onClick={() => handleSelect(option)}
                      role="option"
                      aria-selected={currentValue === option.value}
                      aria-disabled={option.disabled}
                    >
                      <span className="truncate">{option.label}</span>
                      {currentValue === option.value && (
                        <Check className="h-4 w-4 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p id={errorId} className="text-sm text-[var(--error-500)]">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-[var(--text-tertiary)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };