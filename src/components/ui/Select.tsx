'use client'

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useFocusTrap } from '@/hooks';

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
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const selectRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const optionsRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const currentValue = value !== undefined ? value : internalValue;
    const selectedOption = options.find(option => option.value === currentValue);

    // Filter options based on search term
    const filteredOptions = options.filter(option => {
      if (searchTerm === '') return true;
      return option.label.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const enabledOptions = filteredOptions.filter(opt => !opt.disabled);

    // Focus trap for dropdown - keeps focus within dropdown when open
    useFocusTrap(optionsRef, {
      isActive: isOpen,
      returnFocusRef: triggerRef,
      autoFocus: !searchable, // Don't auto-focus search input, let the existing logic handle it
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

    // Reset focused index when dropdown opens/closes or filtered options change
    useEffect(() => {
      if (!isOpen) {
        setFocusedIndex(-1);
      } else if (enabledOptions.length > 0) {
        // Set focus to selected option or first option
        const selectedIndex = enabledOptions.findIndex(opt => opt.value === currentValue);
        setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }
    }, [isOpen, JSON.stringify(enabledOptions), currentValue]);

    // Scroll focused option into view
    useEffect(() => {
      if (isOpen && focusedIndex >= 0 && optionsRef.current) {
        const options = optionsRef.current.querySelectorAll('[role="option"]:not([aria-disabled="true"])');
        const focusedOption = options[focusedIndex] as HTMLElement;
        if (focusedOption) {
          focusedOption.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
      }
    }, [focusedIndex, isOpen]);

    // Handle keyboard navigation in dropdown
    const handleDropdownKeyDown = (e: React.KeyboardEvent) => {
      if (!isOpen) {
        // When closed, allow Enter/Space to open
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => {
            if (prev < enabledOptions.length - 1) {
              return prev + 1;
            }
            return prev; // Stay at last option
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => {
            if (prev > 0) {
              return prev - 1;
            }
            return 0; // Stay at first option
          });
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(enabledOptions.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && enabledOptions[focusedIndex]) {
            handleSelect(enabledOptions[focusedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
          break;
        case 'Tab':
          // Allow tab navigation but close dropdown
          setIsOpen(false);
          setSearchTerm('');
          break;
      }
    };

    // Get the actual option index in filteredOptions from enabledOptions index
    const getFilteredOptionIndex = (enabledIndex: number): number => {
      return filteredOptions.findIndex(opt => opt.value === enabledOptions[enabledIndex]?.value);
    };

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
            ref={triggerRef}
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
            aria-activedescendant={isOpen && focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined}
            tabIndex={disabled ? -1 : 0}
            onKeyDown={handleDropdownKeyDown}
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
            <div
              id={dropdownId}
              ref={optionsRef}
              className="absolute z-50 w-full mt-1 bg-white border border-[var(--border-light)] rounded-md shadow-lg max-h-60 overflow-hidden"
              role="listbox"
              aria-activedescendant={focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined}
              onKeyDown={handleDropdownKeyDown}
            >
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
                  <div className="p-2 text-sm text-[var(--text-tertiary)] text-center" role="status">
                    {searchTerm ? '検索結果がありません' : '選択肢がありません'}
                  </div>
                ) : (
                  filteredOptions.map((option) => {
                    const enabledIndex = enabledOptions.findIndex(opt => opt.value === option.value);
                    const isFocused = enabledIndex === focusedIndex;
                    return (
                      <div
                        key={option.value}
                        id={`${selectId}-option-${enabledIndex}`}
                        className={cn(
                          'px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between',
                          option.disabled
                            ? 'text-[var(--text-tertiary)] cursor-not-allowed'
                            : cn(
                                'text-[var(--text-primary)]',
                                isFocused && 'bg-[var(--brixa-primary-100)] text-[var(--brixa-primary-700)] outline-none',
                                !isFocused && 'hover:bg-[var(--brixa-primary-50)]'
                              ),
                          currentValue === option.value && 'bg-[var(--brixa-primary-100)] text-[var(--brixa-primary-700)]'
                        )}
                        onClick={() => handleSelect(option)}
                        role="option"
                        aria-selected={currentValue === option.value}
                        aria-disabled={option.disabled}
                        tabIndex={-1}
                      >
                        <span className="truncate">{option.label}</span>
                        {currentValue === option.value && (
                          <Check className="h-4 w-4 flex-shrink-0" />
                        )}
                      </div>
                    );
                  })
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