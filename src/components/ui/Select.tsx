'use client'

import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react';
import { useFocusTrap } from '@/hooks';

const selectVariants = cva(
  'flex w-full items-center justify-between rounded-md border transition-colors duration-fast focus:outline-none focus-visible:ring-2 aria-disabled:cursor-not-allowed disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'border-border-strong bg-bg-primary text-text-primary focus-visible:border-brand focus-visible:ring-brand',
        error: 'border-error bg-bg-primary text-text-primary focus-visible:border-error focus-visible:ring-error',
        success: 'border-success bg-bg-primary text-text-primary focus-visible:border-success focus-visible:ring-success',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-3 py-2 text-sm max-sm:h-11',
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
            className="text-sm font-medium text-text-primary leading-none"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={selectRef}>
          {/* Select Trigger */}
          <div
            ref={triggerRef}
            id={selectId}
            className={cn(
              selectVariants({ variant, size }),
              disabled ? 'cursor-not-allowed bg-bg-muted text-text-disabled' : 'cursor-pointer',
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
            <span className={cn('truncate flex-1', !currentValue && 'text-text-muted')}>
              {currentValue ? selectedOption?.label : placeholder}
            </span>

            <div className="flex items-center gap-1">
              {clearable && currentValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 hover:bg-bg-secondary rounded-inner transition-colors"
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
              className="absolute z-50 w-full mt-1 bg-bg-primary border border-border-medium rounded-container shadow-med max-h-60 overflow-hidden"
              role="listbox"
              aria-activedescendant={focusedIndex >= 0 ? `${selectId}-option-${focusedIndex}` : undefined}
              onKeyDown={handleDropdownKeyDown}
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-border-medium">
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="検索..."
                    autoComplete="off"
                    className="w-full px-3 py-2 text-sm border border-border-strong rounded-md focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand bg-bg-primary text-text-primary placeholder:text-text-muted"
                  />
                </div>
              )}

              {/* Options List */}
              <div className="max-h-48 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-2 text-sm text-text-muted text-center" role="status">
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
                            ? 'text-text-disabled cursor-not-allowed'
                            : cn(
                                'text-text-primary',
                                isFocused && 'bg-brand-muted text-on-brand-muted outline-none',
                                !isFocused && 'hover:bg-brand-subtle'
                              ),
                          currentValue === option.value && 'bg-brand-muted text-on-brand-muted'
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
          <p id={errorId} className="flex items-start gap-1.5 text-sm text-error" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="text-sm text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select, selectVariants };