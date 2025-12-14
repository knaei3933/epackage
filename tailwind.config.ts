import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Epackage Lab Brand Colors
        brixa: {
          DEFAULT: 'var(--brixa-primary)',
          50: 'var(--brixa-primary-50)',
          100: 'var(--brixa-primary-100)',
          200: 'var(--brixa-primary-200)',
          300: 'var(--brixa-primary-300)',
          400: 'var(--brixa-primary-400)',
          500: 'var(--brixa-primary-500)',
          600: 'var(--brixa-primary-600)',
          700: 'var(--brixa-primary-700)',
          800: 'var(--brixa-primary-800)',
          900: 'var(--brixa-primary-900)',
        },
        // Secondary Navy Colors
        navy: {
          DEFAULT: 'var(--brixa-secondary)',
          50: 'var(--brixa-secondary-50)',
          100: 'var(--brixa-secondary-100)',
          200: 'var(--brixa-secondary-200)',
          300: 'var(--brixa-secondary-300)',
          400: 'var(--brixa-secondary-400)',
          500: 'var(--brixa-secondary-500)',
          600: 'var(--brixa-secondary-600)',
          700: 'var(--brixa-secondary-700)',
          800: 'var(--brixa-secondary-800)',
          900: 'var(--brixa-secondary-900)',
        },
        // Metallic Colors
        metallic: {
          silver: 'var(--metallic-silver)',
          gold: 'var(--metallic-gold)',
          copper: 'var(--metallic-copper)',
          blue: 'var(--metallic-blue)',
        },
        // Semantic Colors with proper states
        success: {
          50: 'var(--success-50)',
          500: 'var(--success-500)',
          600: 'var(--success-600)',
          700: 'var(--success-700)',
        },
        warning: {
          50: 'var(--warning-50)',
          500: 'var(--warning-500)',
          600: 'var(--warning-600)',
          700: 'var(--warning-700)',
        },
        error: {
          50: 'var(--error-50)',
          500: 'var(--error-500)',
          600: 'var(--error-600)',
          700: 'var(--error-700)',
        },
        info: {
          50: 'var(--info-50)',
          500: 'var(--info-500)',
          600: 'var(--info-600)',
          700: 'var(--info-700)',
        },
        // Background Colors
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          accent: 'var(--bg-accent)',
          muted: 'var(--bg-muted)',
        },
        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          inverse: 'var(--text-inverse)',
          muted: 'var(--text-muted)',
        },
        // Border Colors
        border: {
          light: 'var(--border-light)',
          medium: 'var(--border-medium)',
          dark: 'var(--border-dark)',
          strong: 'var(--border-strong)',
        },
      },
      fontFamily: {
        sans: [
          '"Noto Sans JP"',
          '"Noto Sans CJK JP"',
          '"Hiragino Sans"',
          '"Yu Gothic"',
          'sans-serif',
        ],
        korean: [
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          '"Monaco"',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['var(--font-size-xs)', { lineHeight: '1rem' }],
        sm: ['var(--font-size-sm)', { lineHeight: '1.25rem' }],
        base: ['var(--font-size-base)', { lineHeight: '1.5rem' }],
        lg: ['var(--font-size-lg)', { lineHeight: '1.75rem' }],
        xl: ['var(--font-size-xl)', { lineHeight: '1.75rem' }],
        '2xl': ['var(--font-size-2xl)', { lineHeight: '2rem' }],
        '3xl': ['var(--font-size-3xl)', { lineHeight: '2.25rem' }],
        '4xl': ['var(--font-size-4xl)', { lineHeight: '2.5rem' }],
        '5xl': ['var(--font-size-5xl)', { lineHeight: '1' }],
        '6xl': ['var(--font-size-6xl)', { lineHeight: '1' }],
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)',
        '4xl': 'var(--space-4xl)',
        '5xl': 'var(--space-5xl)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
      },
      backgroundImage: {
        'gradient-metallic': 'var(--gradient-metallic)',
        'gradient-blue-metallic': 'var(--gradient-blue-metallic)',
        'gradient-brixa': 'var(--gradient-brixa)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        'ease-in': 'var(--ease-in)',
        'ease-out': 'var(--ease-out)',
        'ease-in-out': 'var(--ease-in-out)',
      },
      letterSpacing: {
        japanese: '0.02em',
        korean: '0.01em',
      },
      lineHeight: {
        japanese: '1.75',
        korean: '1.6',
      },
      animation: {
        'fade-in': 'fadeIn var(--duration-normal) var(--ease-out)',
        'slide-up': 'slideUp var(--duration-normal) var(--ease-out)',
        'slide-down': 'slideDown var(--duration-normal) var(--ease-out)',
        'scale-in': 'scaleIn var(--duration-normal) var(--ease-out)',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
}

export default config