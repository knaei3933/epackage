// Typography System for Epackage Lab
// Japanese and Korean typography optimization with accessibility focus

export const typography = {
  // Font families optimized for East Asian languages
  fontFamily: {
    sans: [
      '"Noto Sans JP"',
      '"Noto Sans CJK JP"',
      '"Hiragino Sans"',
      '"Yu Gothic"',
      'sans-serif'
    ],
    korean: [
      '"Noto Sans KR"',
      '"Malgun Gothic"',
      'sans-serif'
    ],
    mono: [
      '"SF Mono"',
      '"Monaco"',
      '"Cascadia Code"',
      '"Roboto Mono"',
      'monospace'
    ],
  },

  // Font sizes with accessibility focus
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],       // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],   // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],       // 16px - accessible base
    lg: ['1.125rem', { lineHeight: '1.75rem' }],   // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],     // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],  // 36px
    '5xl': ['3rem', { lineHeight: '1' }],          // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],       // 60px
    '7xl': ['4.5rem', { lineHeight: '1' }],        // 72px
    '8xl': ['6rem', { lineHeight: '1' }],          // 96px
    '9xl': ['8rem', { lineHeight: '1' }],          // 128px
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Letter spacing optimized for readability
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
    japanese: '0.02em',    // Japanese text optimization
    korean: '0.01em',      // Korean text optimization
  },

  // Line height for optimal readability
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.75',
    japanese: '1.75',      // Japanese text
    korean: '1.6',         // Korean text
  },

  // Responsive font sizes with clamp for fluid typography
  fluidFontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',      // 12px - 14px
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',        // 14px - 16px
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',        // 16px - 18px
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',       // 18px - 20px
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',        // 20px - 24px
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',       // 24px - 30px
    '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',  // 30px - 36px
    '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',        // 36px - 48px
    '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 4rem)',            // 48px - 64px
  },
};

// CSS-in-JS typography classes
export const typographyClasses = {
  // Heading classes
  h1: 'text-4xl font-bold leading-tight tracking-tight xs:text-3xl sm:text-5xl lg:text-6xl',
  h2: 'text-3xl font-bold leading-tight tracking-tight xs:text-2xl sm:text-4xl lg:text-5xl',
  h3: 'text-2xl font-semibold leading-snug tracking-normal xs:text-xl sm:text-3xl lg:text-4xl',
  h4: 'text-xl font-semibold leading-normal tracking-normal xs:text-lg sm:text-2xl lg:text-3xl',
  h5: 'text-lg font-medium leading-normal tracking-wide xs:text-base sm:text-xl lg:text-2xl',
  h6: 'text-base font-medium leading-normal tracking-wide sm:text-lg',

  // Body text classes
  body: 'text-base font-normal leading-normal tracking-normal',
  'body-lg': 'text-lg font-normal leading-relaxed tracking-normal',
  'body-sm': 'text-sm font-normal leading-normal tracking-wide',
  'body-xs': 'text-xs font-normal leading-normal tracking-wider',

  // Japanese optimized classes
  'japanese-heading': 'text-2xl font-bold leading-japanese tracking-tight japanese-text',
  'japanese-body': 'text-base font-normal leading-japanese tracking-japanese japanese-text',
  'japanese-caption': 'text-sm font-normal leading-japanese tracking-wider japanese-text',

  // Korean optimized classes
  'korean-heading': 'text-2xl font-bold leading-korean tracking-tight korean-text',
  'korean-body': 'text-base font-normal leading-korean tracking-korean korean-text',
  'korean-caption': 'text-sm font-normal leading-korean tracking-wide korean-text',

  // UI text classes
  label: 'text-sm font-medium leading-normal tracking-wide uppercase',
  caption: 'text-xs font-normal leading-normal tracking-wider',
  overline: 'text-xs font-semibold leading-normal tracking-widest uppercase',
};


// Accessibility utilities
export const getContrastColor = (backgroundColor: string): 'light' | 'dark' => {
  // Simple contrast calculation (would be more sophisticated in production)
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'dark' : 'light'
}


// Typography components mapping
export const textStyles = {
  // Headings
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    fontFamily: typography.fontFamily.sans.join(', '),
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
    letterSpacing: typography.letterSpacing.tight,
    fontFamily: typography.fontFamily.sans.join(', '),
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug,
    letterSpacing: typography.letterSpacing.normal,
    fontFamily: typography.fontFamily.sans.join(', '),
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  // Body text
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.normal,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  'body-large': {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  'body-small': {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  // Japanese optimized styles
  'japanese-heading': {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.japanese,
    letterSpacing: typography.letterSpacing.tight,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  'japanese-text': {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.japanese,
    letterSpacing: typography.letterSpacing.japanese,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  // UI elements
  caption: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans.join(', '),
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.lineHeight.normal,
    letterSpacing: typography.letterSpacing.wide,
    fontFamily: typography.fontFamily.sans.join(', '),
  },
};

// Responsive typography scale
export const responsiveText = {
  // Mobile-first responsive headings
  h1: {
    mobile: { fontSize: '2rem', lineHeight: '2.5rem' },
    tablet: { fontSize: '2.5rem', lineHeight: '3rem' },
    desktop: { fontSize: '3rem', lineHeight: '3.5rem' },
  },

  h2: {
    mobile: { fontSize: '1.5rem', lineHeight: '2rem' },
    tablet: { fontSize: '1.875rem', lineHeight: '2.25rem' },
    desktop: { fontSize: '2.25rem', lineHeight: '2.5rem' },
  },

  h3: {
    mobile: { fontSize: '1.25rem', lineHeight: '1.75rem' },
    tablet: { fontSize: '1.5rem', lineHeight: '2rem' },
    desktop: { fontSize: '1.875rem', lineHeight: '2.25rem' },
  },
};