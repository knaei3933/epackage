'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSystemTheme, cn, type Theme } from '@/lib/utils';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  resolvedTheme: 'light' | 'dark';
  isSystemTheme: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  attribute?: 'class' | 'data-theme';
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'epackage-theme',
  enableSystem = true,
  attribute = 'class',
}: ThemeProviderProps) {
  const getEffectiveTheme = (themeValue: Theme): 'light' | 'dark' => {
    if (themeValue === 'system' && enableSystem) {
      return getSystemTheme();
    }
    return themeValue as 'light' | 'dark';
  };

  // Get initial theme from localStorage or use default
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      try {
        const storedTheme = localStorage.getItem(storageKey) as Theme;
        return storedTheme || defaultTheme;
      } catch {
        return defaultTheme;
      }
    }
    return defaultTheme;
  };

  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getEffectiveTheme(getInitialTheme()));

  // Set theme and update DOM
  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);

      const effectiveTheme = getEffectiveTheme(newTheme);
      setResolvedTheme(effectiveTheme);

      // Apply theme to DOM
      const root = window.document.documentElement;

      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(effectiveTheme);
      } else {
        root.setAttribute('data-theme', effectiveTheme);
      }

    } catch (error) {
      console.warn('Error setting theme:', error);
    }
  };

  // Toggle between light and dark (or system)
  const toggleTheme = () => {
    if (enableSystem && theme === 'system') {
      setTheme('light');
    } else if (enableSystem && theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme(enableSystem ? 'system' : 'light');
    } else {
      setTheme('dark');
    }
  };

  // Apply initial theme to DOM on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    } else {
      root.setAttribute('data-theme', resolvedTheme);
    }
  }, [resolvedTheme, attribute]);

  // Listen for system theme changes when using system theme
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(newResolvedTheme);

      const root = window.document.documentElement;
      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(newResolvedTheme);
      } else {
        root.setAttribute('data-theme', newResolvedTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem, attribute]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    toggleTheme,
    resolvedTheme,
    isSystemTheme: theme === 'system',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// Theme toggle component for easy usage
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme, resolvedTheme } = useTheme();

  const getIcon = () => {
    if (theme === 'system') {
      return resolvedTheme === 'dark' ? (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    }

    return theme === 'dark' ? (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to light mode';
      case 'system':
        return `Switch to manual mode (currently ${resolvedTheme})`;
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-accent transition-colors duration-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brixa-500 focus-visible:ring-offset-2',
        className
      )}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
}

// Theme selector component for dropdown
export function ThemeSelector({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as Theme, label: 'Light', icon: '☀️' },
    { value: 'dark' as Theme, label: 'Dark', icon: '🌙' },
    { value: 'system' as Theme, label: 'System', icon: '💻' },
  ];

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as Theme)}
      className={cn(
        'px-3 py-2 rounded-md border border-border-medium bg-bg-primary text-text-primary',
        'focus:outline-none focus:ring-2 focus:ring-brixa-500 focus:border-transparent',
        'transition-colors duration-fast cursor-pointer',
        className
      )}
      aria-label="Select theme"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.icon} {option.label}
        </option>
      ))}
    </select>
  );
}