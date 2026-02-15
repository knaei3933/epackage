import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'

// Theme utilities
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme

  if (theme === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', theme)
  }

  root.classList.toggle('dark', effectiveTheme === 'dark')
}

// CSS Custom Properties utilities
export const setCSSVariable = (name: string, value: string) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty(name, value)
}

export const getCSSVariable = (name: string): string => {
  if (typeof document === 'undefined') return ''
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

// Responsive utilities
export const getBreakpoint = (width: number): string => {
  if (width < 475) return 'xs'
  if (width < 640) return 'sm'
  if (width < 768) return 'md'
  if (width < 1024) return 'lg'
  if (width < 1280) return 'xl'
  return '2xl'
}

export const useMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

// Format currency for Japanese Yen
export function formatCurrency(amount: number, currency: 'JPY' | 'KRW' | 'USD' = 'JPY'): string {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
  };

  return new Intl.NumberFormat(currency === 'JPY' ? 'ja-JP' : currency === 'KRW' ? 'ko-KR' : 'en-US', options).format(amount);
}

// Format date with locale support
export function formatDate(date: Date | string, locale: 'ja-JP' | 'ko-KR' | 'en-US' = 'ja-JP'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

// Validate Japanese postal code
export function validateJapanesePostalCode(postalCode: string): boolean {
  const cleanCode = postalCode.replace(/[〒-]/g, '');
  return /^\d{7}$/.test(cleanCode);
}

// Format Japanese postal code
export function formatJapanesePostalCode(postalCode: string): string {
  const cleanCode = postalCode.replace(/\D/g, '');
  if (cleanCode.length === 7) {
    return `〒${cleanCode.slice(0, 3)}-${cleanCode.slice(3)}`;
  }
  return postalCode;
}

// Debounce utility function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Check if value is empty (null, undefined, empty string, empty array, empty object)
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length === 0;
  return false;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Japan/Korea format)
export function isValidPhoneNumber(phone: string, locale: 'ja-JP' | 'ko-KR'): boolean {
  if (locale === 'ja-JP') {
    const cleanPhone = phone.replace(/[-０-９]/g, '');
    return /^(\d{10,11})$/.test(cleanPhone);
  } else {
    const cleanPhone = phone.replace(/[-]/g, '');
    return /^(\d{10,11})$/.test(cleanPhone);
  }
}

// Generate UUID v4 (for mock/dev mode users)
export function generateUUID(): string {
  // Use crypto.randomUUID if available (modern browsers and Node.js)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual UUID generation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}